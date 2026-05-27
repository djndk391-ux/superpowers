import { 
  MarketDataResponse, 
  SectorData, 
  StockData, 
  FundFlowData, 
  NewsItem,
  RawMarketData,
  NormalizedMarketData,
  MarketFeature,
  MarketEvent,
  MarketSnapshot,
  RealtimeMarketEvent,
  DataSourceMetadata,
  DataFreshnessReport
} from '@/types';
import { dataSourceManager } from './dataSources';

/**
 * ==========================================================================================
 * 🔍 数据收集 Agent（Data Collector Agent）
 * ==========================================================================================
 * 
 * 核心职责：不是简单抓取市场数据，而是将原始市场数据转化为结构化市场状态
 * 
 * 工作流（必须严格执行）：
 * 1. collectRawData() - 采集市场原始数据
 * 2. normalizeData() - 标准化数据
 * 3. extractFeatures() - 提取市场特征
 * 4. detectMarketEvents() - 检测市场事件
 * 5. generateMarketSnapshot() - 生成市场快照
 * 6. publishEventStream() - 发布实时事件流（新增）
 * 
 * 数据源：东方财富 > 同花顺 > 模拟数据（自动降级）
 * ==========================================================================================
 */

/**
 * 数据收集进度
 */
export interface DataCollectionProgress {
  currentStep: string;
  stepDescription: string;
  progressPercent: number;
}

/**
 * 数据收集 Agent 类
 */
export class DataCollectorAgent {
  private progressCallback?: (progress: DataCollectionProgress) => void;
  private eventSubscriptions: Map<string, { callback: (event: RealtimeMarketEvent) => void, eventTypes?: string[] }> = new Map();
  private recentEvents: RealtimeMarketEvent[] = [];
  private readonly MAX_RECENT_EVENTS = 50;
  
  // 目标股票代码
  private readonly targetStockCodes = ['300223', '300418', '002230', '300750', '002594', '002475', '300142'];
  
  constructor(progressCallback?: (progress: DataCollectionProgress) => void) {
    this.progressCallback = progressCallback;
  }

  /**
   * 更新进度
   */
  private updateProgress(step: string, description: string, percent: number): void {
    if (this.progressCallback) {
      this.progressCallback({
        currentStep: step,
        stepDescription: description,
        progressPercent: percent
      });
    }
  }

  /**
   * ========================================================================================
   * 第 1 步：采集市场原始数据 (collectRawData)
   * ========================================================================================
   */
  private async collectRawData(): Promise<{ rawData: RawMarketData, dataSourceName: string, collectionTime: string, validations: any[] }> {
    this.updateProgress('collectRawData', '正在选择数据源...', 5);
    
    // 获取可用的数据源
    const adapter = await dataSourceManager.getAvailableAdapter();
    const dataSourceName = adapter.name;
    
    this.updateProgress('collectRawData', `使用数据源: ${dataSourceName}，正在采集原始数据...`, 10);
    
    const collectionTime = new Date().toISOString();
    const validations: any[] = [];
    
    try {
      // 并行采集所有数据
      const [sectors, stocks, fundFlow, news] = await Promise.all([
        adapter.getMarketSectors(),
        adapter.getStockQuotes(this.targetStockCodes),
        adapter.getFundFlows(),
        adapter.getMarketNews()
      ]);
      
      // 为数据添加时间戳和验证
      const rawData: RawMarketData = {
        sectors: sectors.map((s, i) => ({
          ...s,
          timestamp: s.timestamp || collectionTime
        })),
        stocks: stocks.map((s, i) => ({
          ...s,
          timestamp: s.timestamp || collectionTime
        })),
        fundFlow: {
          ...fundFlow,
          timestamp: fundFlow.timestamp || collectionTime
        },
        news: news.map((n, i) => ({
          ...n,
          timestamp: n.time || n.timestamp || collectionTime
        }))
      };
      
      // 验证数据时效性
      rawData.sectors.forEach((s: any, idx: number) => {
        const validation = this.validateDataFreshness(s.timestamp || collectionTime);
        validations.push({
          type: 'sector',
          id: s.id,
          ...validation
        });
      });
      
      rawData.news = rawData.news.filter((n: any) => {
        const validation = this.validateDataFreshness(n.timestamp || n.time);
        validations.push({
          type: 'news',
          id: n.id,
          ...validation
        });
        return validation.isValid; // 过滤过期新闻
      });
      
      await new Promise(resolve => setTimeout(resolve, 100));
      this.updateProgress('collectRawData', `原始数据采集完成 (${dataSourceName})`, 20);
      
      return { rawData, dataSourceName, collectionTime, validations };
      
    } catch (error) {
      console.error('[DataCollectorAgent] 数据采集失败:', error);
      throw error;
    }
  }

  /**
   * ========================================================================================
   * 第 2 步：标准化数据 (normalizeData)
   * ========================================================================================
   */
  private async normalizeData(rawData: RawMarketData): Promise<NormalizedMarketData> {
    this.updateProgress('normalizeData', '正在标准化数据...', 25);
    
    const sectors: SectorData[] = rawData.sectors.map((s: any) => ({
      id: s.id,
      name: s.name,
      changePercent: s.changePercent !== undefined ? s.changePercent : s.change,
      volume: s.volume !== undefined ? s.volume : s.vol,
      leaderStocks: s.leaderStocks || s.leaders || []
    }));
    
    const stocks: StockData[] = rawData.stocks.map((s: any) => ({
      id: s.id,
      code: s.code,
      name: s.name,
      price: s.price,
      changePercent: s.changePercent !== undefined ? s.changePercent : s.change,
      volume: s.volume !== undefined ? s.volume : s.vol,
      isLeader: s.isLeader !== undefined ? s.isLeader : s.leader,
      sectorId: s.sectorId || s.sector || 'unknown'
    }));
    
    const fundFlow: FundFlowData = {
      mainFlow: rawData.fundFlow.mainFlow !== undefined ? rawData.fundFlow.mainFlow : rawData.fundFlow.main,
      northFlow: rawData.fundFlow.northFlow !== undefined ? rawData.fundFlow.northFlow : rawData.fundFlow.north,
      sectorFlows: rawData.fundFlow.sectorFlows
    };
    
    const news: NewsItem[] = rawData.news.map((n: any) => ({
      id: n.id,
      title: n.title,
      content: n.content,
      source: n.source,
      timestamp: n.timestamp || n.time,
      tags: n.tags || []
    }));
    
    await new Promise(resolve => setTimeout(resolve, 50));
    this.updateProgress('normalizeData', '数据标准化完成', 40);

    return { sectors, stocks, fundFlow, news };
  }

  /**
   * ========================================================================================
   * 第 3 步：提取市场特征 (extractFeatures)
   * ========================================================================================
   */
  private async extractFeatures(normalizedData: NormalizedMarketData): Promise<MarketFeature[]> {
    this.updateProgress('extractFeatures', '正在提取市场特征...', 45);

    const features: MarketFeature[] = [];

    // 1. 市场动量特征
    const avgChange = normalizedData.sectors.reduce((sum, s) => sum + s.changePercent, 0) / normalizedData.sectors.length;
    features.push({
      id: 'market_momentum',
      name: '市场动量',
      value: avgChange,
      type: 'momentum',
      description: `市场平均涨跌幅: ${avgChange.toFixed(2)}%`
    });

    // 2. 领涨板块动量特征
    const topSector = normalizedData.sectors.reduce((top, s) => s.changePercent > top.changePercent ? s : top);
    features.push({
      id: 'leading_sector_momentum',
      name: '领涨板块动量',
      value: topSector.changePercent,
      type: 'momentum',
      description: `${topSector.name}板块领涨: ${topSector.changePercent.toFixed(2)}%`
    });

    // 3. 波动性特征
    const changeVariance = normalizedData.sectors.reduce((sum, s) => sum + Math.pow(s.changePercent - avgChange, 2), 0) / normalizedData.sectors.length;
    const volatility = Math.sqrt(changeVariance);
    features.push({
      id: 'sector_volatility',
      name: '板块波动率',
      value: volatility,
      type: 'volatility',
      description: `板块间涨跌幅标准差: ${volatility.toFixed(2)}`
    });

    // 4. 流动性特征
    const totalVolume = normalizedData.sectors.reduce((sum, s) => sum + s.volume, 0);
    features.push({
      id: 'market_liquidity',
      name: '市场流动性',
      value: totalVolume / 100000000,
      type: 'liquidity',
      description: `市场总成交额: ${(totalVolume / 100000000).toFixed(0)}亿元`
    });

    // 5. 市场情绪特征
    const upCount = normalizedData.sectors.filter(s => s.changePercent > 0).length;
    const sentimentScore = (upCount / normalizedData.sectors.length) * 100;
    features.push({
      id: 'market_sentiment',
      name: '市场情绪',
      value: sentimentScore,
      type: 'sentiment',
      description: `上涨板块占比: ${sentimentScore.toFixed(0)}%`
    });

    // 6. 北向资金特征
    const northFlowValue = normalizedData.fundFlow.northFlow;
    features.push({
      id: 'north_bound_flow',
      name: '北向资金',
      value: northFlowValue / 100000000,
      type: 'liquidity',
      description: `北向资金净流入: ${northFlowValue >= 0 ? '+' : ''}${(northFlowValue / 100000000).toFixed(0)}亿元`
    });

    // 7. 成交集中度特征
    const top3Volume = normalizedData.sectors
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 3)
      .reduce((sum, s) => sum + s.volume, 0);
    const concentrationRatio = top3Volume / totalVolume;
    features.push({
      id: 'volume_concentration',
      name: '成交集中度',
      value: concentrationRatio * 100,
      type: 'liquidity',
      description: `前3板块成交额占比: ${(concentrationRatio * 100).toFixed(1)}%`
    });

    // 8. 龙头股效应特征
    const leaderStocks = normalizedData.stocks.filter(s => s.isLeader);
    const avgLeaderChange = leaderStocks.reduce((sum, s) => sum + s.changePercent, 0) / leaderStocks.length;
    features.push({
      id: 'leader_stock_effect',
      name: '龙头股效应',
      value: avgLeaderChange,
      type: 'momentum',
      description: `龙头股平均涨跌幅: ${avgLeaderChange.toFixed(2)}%`
    });

    await new Promise(resolve => setTimeout(resolve, 150));
    this.updateProgress('extractFeatures', '市场特征提取完成', 60);

    return features;
  }

  /**
   * ========================================================================================
   * 第 4 步：检测市场事件 (detectMarketEvents)
   * ========================================================================================
   */
  private async detectMarketEvents(normalizedData: NormalizedMarketData): Promise<{ marketEvents: MarketEvent[], realtimeEvents: RealtimeMarketEvent[] }> {
    this.updateProgress('detectMarketEvents', '正在检测高频市场事件...', 65);

    const marketEvents: MarketEvent[] = [];
    const realtimeEvents: RealtimeMarketEvent[] = [];
    const now = new Date().toISOString();

    // 1. 热点板块出现事件
    const hotSectors = normalizedData.sectors.filter(s => s.changePercent > 3);
    if (hotSectors.length > 0) {
      const topHot = hotSectors[0];
      const severity = topHot.changePercent > 5 ? 'high' : topHot.changePercent > 3 ? 'medium' : 'low';
      
      marketEvents.push({
        id: 'hotspot_emergence',
        type: 'hotspot_emergence',
        title: '新热点板块出现',
        description: `${topHot.name}板块强势上涨${topHot.changePercent.toFixed(2)}%，成为市场热点`,
        severity,
        relatedStocks: topHot.leaderStocks,
        timestamp: now
      });
      
      realtimeEvents.push({
        id: `realtime_hotspot_${Date.now()}`,
        type: 'SECTOR_HOTSPOT',
        subType: 'EMERGING',
        title: `${topHot.name}板块强势上涨`,
        description: `${topHot.name}板块涨幅${topHot.changePercent.toFixed(2)}%，领涨市场`,
        severity,
        priority: severity === 'high' ? 'high' : 'normal',
        timestamp: now,
        source: 'data_collector',
        relatedAssets: topHot.leaderStocks,
        metadata: { changePercent: topHot.changePercent, sectorId: topHot.id }
      });
    }

    // 2. 成交量异常放大事件（个股级高频检测）
    const volumeSpikeStocks = normalizedData.stocks.filter(s => s.volume > 1000000000);
    if (volumeSpikeStocks.length > 0) {
      marketEvents.push({
        id: 'volume_spike',
        type: 'volume_spike',
        title: '多只股票成交量放大',
        description: `${volumeSpikeStocks.length}只股票成交量超过10亿元，资金关注度提升`,
        severity: 'medium',
        relatedStocks: volumeSpikeStocks.map(s => s.code),
        timestamp: now
      });
      
      volumeSpikeStocks.forEach(stock => {
        const severity = stock.volume > 2000000000 ? 'high' : 'medium';
        realtimeEvents.push({
          id: `realtime_volume_${stock.code}_${Date.now()}`,
          type: 'VOLUME_SPIKE',
          subType: 'HIGH_VOLUME',
          title: `${stock.name}成交量放大`,
          description: `${stock.name}成交量达${(stock.volume / 100000000).toFixed(1)}亿元`,
          severity,
          priority: severity === 'high' ? 'urgent' : 'normal',
          timestamp: now,
          source: 'data_collector',
          relatedAssets: [stock.code],
          metadata: { volume: stock.volume, price: stock.price }
        });
      });
    }

    // 3. 价格突破事件（个股级高频检测）
    const breakoutStocks = normalizedData.stocks.filter(s => s.changePercent > 10);
    if (breakoutStocks.length > 0) {
      marketEvents.push({
        id: 'price_breakout',
        type: 'price_breakout',
        title: '股票强势突破',
        description: `${breakoutStocks.map(s => s.name).join('、')}等${breakoutStocks.length}只股票涨幅超过10%`,
        severity: 'high',
        relatedStocks: breakoutStocks.map(s => s.code),
        timestamp: now
      });
      
      breakoutStocks.forEach(stock => {
        const severity = stock.changePercent > 15 ? 'critical' : 'high';
        realtimeEvents.push({
          id: `realtime_breakout_${stock.code}_${Date.now()}`,
          type: 'PRICE_BREAKOUT',
          subType: 'UPWARD',
          title: `${stock.name}强势上涨${stock.changePercent.toFixed(2)}%`,
          description: `${stock.name}当前价格${stock.price.toFixed(2)}元，涨幅${stock.changePercent.toFixed(2)}%`,
          severity,
          priority: severity === 'critical' ? 'urgent' : 'high',
          timestamp: now,
          source: 'data_collector',
          relatedAssets: [stock.code],
          metadata: { price: stock.price, changePercent: stock.changePercent }
        });
      });
    }

    // 4. 新闻驱动事件
    if (normalizedData.news.length > 0) {
      const topNews = normalizedData.news[0];
      const hasPositiveNews = topNews.tags.some(tag => 
        ['利好', '增长', '突破', '创新', '新高'].includes(tag)
      );
      const severity = hasPositiveNews ? 'high' : 'medium';
      
      marketEvents.push({
        id: 'news_trigger',
        type: 'news_trigger',
        title: '重要市场新闻',
        description: `${topNews.source}: ${topNews.title}`,
        severity,
        relatedStocks: [],
        timestamp: topNews.timestamp
      });
      
      realtimeEvents.push({
        id: `realtime_news_${Date.now()}`,
        type: 'NEWS',
        subType: hasPositiveNews ? 'POSITIVE' : 'NEUTRAL',
        title: topNews.title,
        description: topNews.content,
        severity,
        priority: 'normal',
        timestamp: topNews.timestamp,
        source: topNews.source,
        relatedAssets: [],
        metadata: { tags: topNews.tags }
      });
    }

    // 5. 板块轮动事件
    const downSectors = normalizedData.sectors.filter(s => s.changePercent < 0);
    if (hotSectors.length > 0 && downSectors.length > 0) {
      marketEvents.push({
        id: 'sector_rotation',
        type: 'sector_rotation',
        title: '板块轮动迹象',
        description: `市场呈现分化，${hotSectors[0].name}等板块上涨，${downSectors[0].name}等板块下跌`,
        severity: 'medium',
        relatedStocks: [...hotSectors[0].leaderStocks],
        timestamp: now
      });
      
      realtimeEvents.push({
        id: `realtime_rotation_${Date.now()}`,
        type: 'SECTOR_ROTATION',
        subType: 'DIVERGENCE',
        title: '板块分化明显',
        description: `${hotSectors[0].name}领涨，${downSectors[0].name}领跌`,
        severity: 'medium',
        priority: 'normal',
        timestamp: now,
        source: 'data_collector',
        relatedAssets: [...hotSectors[0].leaderStocks],
        metadata: { leadingSector: hotSectors[0].name, laggingSector: downSectors[0].name }
      });
    }

    // 6. 北向资金异动事件
    const northFlowValue = normalizedData.fundFlow.northFlow;
    if (Math.abs(northFlowValue) > 2000000000) {
      const flowDirection = northFlowValue > 0 ? '净流入' : '净流出';
      const severity = Math.abs(northFlowValue) > 5000000000 ? 'critical' : Math.abs(northFlowValue) > 3000000000 ? 'high' : 'medium';
      
      realtimeEvents.push({
        id: `realtime_northbound_${Date.now()}`,
        type: 'FUND_FLOW',
        subType: 'NORTHBOUND',
        title: `北向资金大幅${flowDirection}`,
        description: `北向资金${flowDirection}${Math.abs(northFlowValue / 1000000000).toFixed(1)}亿元`,
        severity,
        priority: severity === 'critical' ? 'urgent' : 'high',
        timestamp: now,
        source: 'data_collector',
        relatedAssets: [],
        metadata: { flowAmount: northFlowValue }
      });
    }

    await new Promise(resolve => setTimeout(resolve, 150));
    this.updateProgress('detectMarketEvents', '市场事件检测完成', 80);

    return { marketEvents, realtimeEvents };
  }

  /**
   * ========================================================================================
   * 第 5 步：生成市场快照 (generateMarketSnapshot)
   * ========================================================================================
   */
  private async generateMarketSnapshot(
    rawDataResponse: MarketDataResponse,
    normalizedData: NormalizedMarketData,
    features: MarketFeature[],
    marketEvents: MarketEvent[],
    realtimeEvents: RealtimeMarketEvent[],
    dataSourceName: string,
    collectionTime: string,
    dataValidations: any[]
  ): Promise<MarketSnapshot> {
    this.updateProgress('generateMarketSnapshot', '正在生成市场快照...', 85);

    // 计算市场方向
    const sentimentFeature = features.find(f => f.id === 'market_sentiment');
    const momentumFeature = features.find(f => f.id === 'market_momentum');
    
    let marketDirection: 'bullish' | 'bearish' | 'neutral' = 'neutral';
    if (sentimentFeature && momentumFeature) {
      if (sentimentFeature.value > 60 && momentumFeature.value > 1) {
        marketDirection = 'bullish';
      } else if (sentimentFeature.value < 40 && momentumFeature.value < -1) {
        marketDirection = 'bearish';
      }
    }

    // 找主导板块和热门股票
    const dominantSector = normalizedData.sectors.reduce((top, s) => s.changePercent > top.changePercent ? s : top);
    const hotStocks = normalizedData.stocks
      .sort((a, b) => b.changePercent - a.changePercent)
      .slice(0, 5)
      .map(s => s.code);
    
    const sentimentScore = sentimentFeature?.value ?? 50;
    const volatilityFeature = features.find(f => f.id === 'sector_volatility');
    const volatilityScore = volatilityFeature?.value ?? 10;
    const liquidityFeature = features.find(f => f.id === 'market_liquidity');
    const liquidityScore = liquidityFeature?.value ?? 0;

    // 生成数据新鲜度报告
    const dataFreshnessReport: DataFreshnessReport = {
      collectionTime,
      systemTime: new Date().toISOString(),
      dataSources: [{
        name: dataSourceName,
        updateFrequency: 'intraday',
        dataFreshness: 1,
        lastUpdate: collectionTime
      }],
      staleDataFiltered: {
        totalItems: dataValidations.length,
        staleItems: dataValidations.filter(v => !v.isValid).length
      },
      warnings: dataValidations.filter(v => !v.isValid).map(v => 
        `⚠️ ${v.type}数据可能过期: ${v.hoursAge.toFixed(1)}小时前`
      )
    };

    const snapshot: MarketSnapshot = {
      id: `snapshot_${Date.now()}`,
      timestamp: new Date().toISOString(),
      version: '2.0.0',
      rawData: rawDataResponse,
      features,
      events: marketEvents,
      realtimeEvents,
      collectionTime,
      dataSource: dataSourceName,
      activeDataSource: dataSourceName,
      allDataSources: dataSourceManager.getAllDataSources(),
      dataFreshnessReport,
      summary: {
        marketDirection,
        dominantSector: dominantSector.name,
        hotStocks,
        sentimentScore,
        volatilityScore,
        liquidityScore
      }
    };

    await new Promise(resolve => setTimeout(resolve, 100));
    this.updateProgress('generateMarketSnapshot', '市场快照生成完成', 90);

    return snapshot;
  }

  /**
   * ========================================================================================
   * 第 6 步：发布事件流 (publishEventStream)
   * ========================================================================================
   */
  private async publishEventStream(events: RealtimeMarketEvent[]): Promise<void> {
    this.updateProgress('publishEventStream', '正在发布实时事件流...', 92);

    // 更新最近事件列表
    this.recentEvents = [...this.recentEvents, ...events]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, this.MAX_RECENT_EVENTS);

    // 通知所有订阅者
    for (const event of events) {
      for (const [subscriptionId, subscription] of this.eventSubscriptions) {
        try {
          // 如果指定了事件类型，则只通知对应类型
          if (!subscription.eventTypes || subscription.eventTypes.includes(event.type)) {
            subscription.callback(event);
          }
        } catch (error) {
          console.error('[DataCollectorAgent] 事件回调错误:', error);
        }
      }
    }

    await new Promise(resolve => setTimeout(resolve, 100));
    this.updateProgress('publishEventStream', '实时事件流发布完成', 95);
  }

  /**
   * ========================================================================================
   * 数据时效性验证
   * ========================================================================================
   */
  private validateDataFreshness(timestamp: string, maxAgeHours: number = 720): { 
    isValid: boolean, 
    hoursAge: number, 
    daysAge: number, 
    isStale: boolean 
  } {
    const dataTime = new Date(timestamp).getTime();
    const currentTime = Date.now();
    const hoursAge = (currentTime - dataTime) / (1000 * 60 * 60);
    const daysAge = hoursAge / 24;
    const isStale = hoursAge > maxAgeHours;
    const isValid = !isStale;
    
    return { isValid, hoursAge, daysAge, isStale };
  }

  /**
   * ========================================================================================
   * 🚀 主执行方法 - 完整的 6 步工作流
   * ========================================================================================
   */
  public async collectMarketData(): Promise<MarketSnapshot> {
    console.log('[DataCollectorAgent] 开始执行 6 步工作流...');

    try {
      // 第 1 步：采集原始数据
      const { rawData, dataSourceName, collectionTime, validations } = await this.collectRawData();
      console.log('[DataCollectorAgent] 第 1 步完成：原始数据采集');

      // 第 2 步：标准化数据
      const normalizedData = await this.normalizeData(rawData);
      console.log('[DataCollectorAgent] 第 2 步完成：数据标准化');

      // 构建向后兼容的 MarketDataResponse
      const rawDataResponse: MarketDataResponse = {
        sectors: normalizedData.sectors,
        stocks: normalizedData.stocks,
        fundFlow: normalizedData.fundFlow,
        news: normalizedData.news,
        timestamp: collectionTime
      };

      // 第 3 步：提取特征
      const features = await this.extractFeatures(normalizedData);
      console.log('[DataCollectorAgent] 第 3 步完成：特征提取');

      // 第 4 步：检测事件
      const { marketEvents, realtimeEvents } = await this.detectMarketEvents(normalizedData);
      console.log('[DataCollectorAgent] 第 4 步完成：事件检测');

      // 第 5 步：生成快照
      const snapshot = await this.generateMarketSnapshot(
        rawDataResponse,
        normalizedData,
        features,
        marketEvents,
        realtimeEvents,
        dataSourceName,
        collectionTime,
        validations
      );
      console.log('[DataCollectorAgent] 第 5 步完成：快照生成');

      // 第 6 步：发布事件流
      await this.publishEventStream(realtimeEvents);
      console.log('[DataCollectorAgent] 第 6 步完成：事件流发布');

      this.updateProgress('complete', '数据收集Agent工作完成', 100);
      console.log('[DataCollectorAgent] 完整 6 步工作流执行完成！');

      return snapshot;
      
    } catch (error) {
      console.error('[DataCollectorAgent] 工作流执行失败:', error);
      throw error;
    }
  }

  /**
   * ========================================================================================
   * 事件流订阅管理
   * ========================================================================================
   */
  public subscribeToEvents(subscriptionId: string, callback: (event: RealtimeMarketEvent) => void, eventTypes?: string[]): void {
    this.eventSubscriptions.set(subscriptionId, { callback, eventTypes });
    console.log(`[DataCollectorAgent] 事件流订阅: ${subscriptionId}`);
  }

  public unsubscribeFromEvents(subscriptionId: string): void {
    this.eventSubscriptions.delete(subscriptionId);
    console.log(`[DataCollectorAgent] 事件流取消订阅: ${subscriptionId}`);
  }

  public getRecentEvents(limit: number = 10): RealtimeMarketEvent[] {
    return this.recentEvents.slice(0, limit);
  }

  /**
   * ========================================================================================
   * 📊 快速测试模式
   * ========================================================================================
   */
  public static async quickTest(): Promise<MarketSnapshot> {
    const agent = new DataCollectorAgent();
    return await agent.collectMarketData();
  }

  /**
   * ========================================================================================
   * 🔧 兼容性方法 - 用于向后兼容
   * ========================================================================================
   */
  public static quickTestLegacy(): MarketDataResponse {
    const today = new Date().toISOString();
    return {
      sectors: [
        { id: 'ai', name: '人工智能', changePercent: 5.8, volume: 158000000000, leaderStocks: ['300223', '300418', '002230'] },
        { id: 'newenergy', name: '新能源', changePercent: 3.2, volume: 98000000000, leaderStocks: ['300750', '002594', '000333'] },
        { id: 'consumerelec', name: '消费电子', changePercent: 2.5, volume: 76000000000, leaderStocks: ['002475', '300136', '002241'] },
        { id: 'medicine', name: '生物医药', changePercent: 1.8, volume: 65000000000, leaderStocks: ['300142', '600276', '000661'] },
        { id: 'finance', name: '金融', changePercent: -0.5, volume: 52000000000, leaderStocks: ['601318', '600036', '601166'] },
        { id: 'realestate', name: '房地产', changePercent: -1.2, volume: 38000000000, leaderStocks: ['000002', '600048', '000656'] }
      ],
      stocks: [
        { id: '1', code: '300223', name: '寒武纪', price: 245.80, changePercent: 12.5, volume: 1250000000, isLeader: true, sectorId: 'ai' },
        { id: '2', code: '300418', name: '昆仑万维', price: 42.35, changePercent: 8.9, volume: 980000000, isLeader: true, sectorId: 'ai' },
        { id: '3', code: '002230', name: '科大讯飞', price: 58.60, changePercent: 6.7, volume: 750000000, isLeader: true, sectorId: 'ai' },
        { id: '4', code: '300750', name: '宁德时代', price: 185.50, changePercent: 4.2, volume: 1200000000, isLeader: true, sectorId: 'newenergy' },
        { id: '5', code: '002594', name: '比亚迪', price: 268.90, changePercent: 3.8, volume: 890000000, isLeader: true, sectorId: 'newenergy' },
        { id: '6', code: '002475', name: '立讯精密', price: 32.80, changePercent: 3.1, volume: 520000000, isLeader: true, sectorId: 'consumerelec' },
        { id: '7', code: '300142', name: '沃森生物', price: 48.50, changePercent: 2.3, volume: 480000000, isLeader: true, sectorId: 'medicine' }
      ],
      fundFlow: {
        mainFlow: 8500000000,
        northFlow: 3200000000,
        sectorFlows: {
          'ai': 4200000000,
          'newenergy': 2100000000,
          'consumerelec': 1200000000,
          'medicine': 800000000,
          'finance': -500000000,
          'realestate': -800000000
        }
      },
      news: [
        { id: 'n1', title: 'AI大模型应用落地加速，产业链持续受益', content: '多家上市公司宣布AI大模型应用落地，行业景气度持续提升', source: '证券时报', timestamp: today, tags: ['AI', '大模型', '利好'] },
        { id: 'n2', title: '新能源汽车销量再创新高', content: '5月份新能源汽车销量同比增长超60%，产业链需求旺盛', source: '第一财经', timestamp: today, tags: ['新能源', '销量', '数据'] },
        { id: 'n3', title: '消费电子迎来传统旺季', content: '下半年消费电子传统旺季临近，产业链备货积极性提升', source: '上海证券报', timestamp: today, tags: ['消费电子', '旺季', '需求'] }
      ],
      timestamp: today
    };
  }
}

/**
 * ========================================================================================
 * 📋 工作流总结
 * ========================================================================================
 * 
 * collectRawData() → 采集原始数据 (5% → 20%) - 支持东方财富/同花顺API，自动降级
 *     ↓
 * normalizeData() → 标准化数据 (25% → 40%)
 *     ↓
 * extractFeatures() → 提取市场特征 (45% → 60%)
 *     ↓
 * detectMarketEvents() → 检测高频市场事件 (65% → 80%)
 *     ↓
 * generateMarketSnapshot() → 生成市场快照 (85% → 90%)
 *     ↓
 * publishEventStream() → 发布实时事件流 (92% → 95%)
 * 
 * 数据时效性：自动过滤超过30天的数据，实时验证数据新鲜度
 * 数据源优先级：东方财富 > 同花顺 > 模拟数据（自动降级）
 * ========================================================================================
 */
export default DataCollectorAgent;
