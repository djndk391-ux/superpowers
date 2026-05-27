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
  MarketSnapshot
} from '@/types';

/**
 * ==========================================================================================
 * 🔍 数据收集 Agent（Data Collector Agent）
 * ==========================================================================================
 * 
 * 核心职责：不是简单抓取市场数据，而是将原始市场数据转化为结构化市场状态（Market State）
 * 
 * 工作流（必须严格执行）：
 * 1. collectRawData() - 采集市场原始数据
 * 2. normalizeData() - 标准化数据
 * 3. extractFeatures() - 提取市场特征
 * 4. detectMarketEvents() - 检测市场事件
 * 5. generateMarketSnapshot() - 生成市场快照
 * 
 * 最终输出：可供后续 Agent 消费的结构化 Market Snapshot
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
  
  constructor(progressCallback?: (progress: DataCollectionProgress) => void) {
    this.progressCallback = progressCallback;
  }

  /**
   * 更新进度
   */
  private updateProgress(step: string, description: string, percent: number) {
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
   * 
   * 功能：从各数据源获取原始市场数据
   */
  private async collectRawData(): Promise<RawMarketData> {
    this.updateProgress('collectRawData', '正在采集市场原始数据...', 10);

    // 模拟：实际项目中，这里会调用真实的股票API
    // 比如：东方财富、同花顺、雪球等数据源
    
    const rawData: RawMarketData = {
      sectors: [
        { id: 'ai', name: '人工智能', change: 5.8, vol: 158000000000, leaders: ['300223', '300418', '002230'] },
        { id: 'newenergy', name: '新能源', change: 3.2, vol: 98000000000, leaders: ['300750', '002594', '000333'] },
        { id: 'consumerelec', name: '消费电子', change: 2.5, vol: 76000000000, leaders: ['002475', '300136', '002241'] },
        { id: 'medicine', name: '生物医药', change: 1.8, vol: 65000000000, leaders: ['300142', '600276', '000661'] },
        { id: 'finance', name: '金融', change: -0.5, vol: 52000000000, leaders: ['601318', '600036', '601166'] },
        { id: 'realestate', name: '房地产', change: -1.2, vol: 38000000000, leaders: ['000002', '600048', '000656'] },
      ],
      stocks: [
        { id: '1', code: '300223', name: '寒武纪', price: 245.80, change: 12.5, vol: 1250000000, leader: true, sector: 'ai' },
        { id: '2', code: '300418', name: '昆仑万维', price: 42.35, change: 8.9, vol: 980000000, leader: true, sector: 'ai' },
        { id: '3', code: '002230', name: '科大讯飞', price: 58.60, change: 6.7, vol: 750000000, leader: true, sector: 'ai' },
        { id: '4', code: '300750', name: '宁德时代', price: 185.50, change: 4.2, vol: 1200000000, leader: true, sector: 'newenergy' },
        { id: '5', code: '002594', name: '比亚迪', price: 268.90, change: 3.8, vol: 890000000, leader: true, sector: 'newenergy' },
        { id: '6', code: '002475', name: '立讯精密', price: 32.80, change: 3.1, vol: 520000000, leader: true, sector: 'consumerelec' },
        { id: '7', code: '300142', name: '沃森生物', price: 48.50, change: 2.3, vol: 480000000, leader: true, sector: 'medicine' },
      ],
      fundFlow: {
        main: 8500000000,
        north: 3200000000,
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
        { id: 'n1', title: 'AI大模型应用落地加速', content: '多家上市公司宣布AI大模型应用落地，行业景气度持续提升', source: '证券时报', time: new Date(Date.now() - 3600000).toISOString(), tags: ['AI', '大模型', '利好'] },
        { id: 'n2', title: '新能源汽车销量再创新高', content: '5月份新能源汽车销量同比增长超60%，产业链需求旺盛', source: '第一财经', time: new Date(Date.now() - 7200000).toISOString(), tags: ['新能源', '销量', '数据'] },
        { id: 'n3', title: '消费电子迎来传统旺季', content: '下半年消费电子传统旺季临近，产业链备货积极性提升', source: '上海证券报', time: new Date(Date.now() - 10800000).toISOString(), tags: ['消费电子', '旺季', '需求'] },
      ]
    };

    await new Promise(resolve => setTimeout(resolve, 200));
    this.updateProgress('collectRawData', '原始数据采集完成', 20);
    
    return rawData;
  }

  /**
   * ========================================================================================
   * 第 2 步：标准化数据 (normalizeData)
   * ========================================================================================
   * 
   * 功能：将原始数据统一转换为标准格式
   */
  private async normalizeData(rawData: RawMarketData): Promise<NormalizedMarketData> {
    this.updateProgress('normalizeData', '正在标准化数据...', 25);

    const sectors: SectorData[] = rawData.sectors.map((s: any) => ({
      id: s.id,
      name: s.name,
      changePercent: s.change,
      volume: s.vol,
      leaderStocks: s.leaders
    }));

    const stocks: StockData[] = rawData.stocks.map((s: any) => ({
      id: s.id,
      code: s.code,
      name: s.name,
      price: s.price,
      changePercent: s.change,
      volume: s.vol,
      isLeader: s.leader,
      sectorId: s.sector
    }));

    const fundFlow: FundFlowData = {
      mainFlow: rawData.fundFlow.main,
      northFlow: rawData.fundFlow.north,
      sectorFlows: rawData.fundFlow.sectorFlows
    };

    const news: NewsItem[] = rawData.news.map((n: any) => ({
      id: n.id,
      title: n.title,
      content: n.content,
      source: n.source,
      timestamp: n.time,
      tags: n.tags
    }));

    await new Promise(resolve => setTimeout(resolve, 200));
    this.updateProgress('normalizeData', '数据标准化完成', 40);

    return {
      sectors,
      stocks,
      fundFlow,
      news
    };
  }

  /**
   * ========================================================================================
   * 第 3 步：提取市场特征 (extractFeatures)
   * ========================================================================================
   * 
   * 功能：从标准化数据中提取关键市场特征
   */
  private async extractFeatures(normalizedData: NormalizedMarketData): Promise<MarketFeature[]> {
    this.updateProgress('extractFeatures', '正在提取市场特征...', 45);

    const features: MarketFeature[] = [];

    // 1. 动量特征
    const avgChange = normalizedData.sectors.reduce((sum, s) => sum + s.changePercent, 0) / normalizedData.sectors.length;
    features.push({
      id: 'market_momentum',
      name: '市场动量',
      value: avgChange,
      type: 'momentum',
      description: `市场平均涨跌幅: ${avgChange.toFixed(2)}%`
    });

    // 2. 领涨板块动量
    const topSector = normalizedData.sectors.reduce((top, s) => s.changePercent > top.changePercent ? s : top);
    features.push({
      id: 'leading_sector_momentum',
      name: '领涨板块动量',
      value: topSector.changePercent,
      type: 'momentum',
      description: `${topSector.name}板块领涨: ${topSector.changePercent}%`
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

    // 4. 流动性特征 - 基于成交量
    const totalVolume = normalizedData.sectors.reduce((sum, s) => sum + s.volume, 0);
    features.push({
      id: 'market_liquidity',
      name: '市场流动性',
      value: totalVolume / 100000000, // 以亿为单位
      type: 'liquidity',
      description: `市场总成交额: ${(totalVolume / 100000000).toFixed(0)}亿元`
    });

    // 5. 情绪特征 - 基于涨跌数量
    const upCount = normalizedData.sectors.filter(s => s.changePercent > 0).length;
    const sentimentScore = (upCount / normalizedData.sectors.length) * 100;
    features.push({
      id: 'market_sentiment',
      name: '市场情绪',
      value: sentimentScore,
      type: 'sentiment',
      description: `上涨板块占比: ${sentimentScore.toFixed(0)}%`
    });

    // 6. 北向资金影响
    const northFlowValue = normalizedData.fundFlow.northFlow;
    features.push({
      id: 'north_bound_flow',
      name: '北向资金',
      value: northFlowValue / 100000000,
      type: 'liquidity',
      description: `北向资金净流入: ${northFlowValue >= 0 ? '+' : ''}${(northFlowValue / 100000000).toFixed(0)}亿元`
    });

    await new Promise(resolve => setTimeout(resolve, 200));
    this.updateProgress('extractFeatures', '市场特征提取完成', 60);

    return features;
  }

  /**
   * ========================================================================================
   * 第 4 步：检测市场事件 (detectMarketEvents)
   * ========================================================================================
   * 
   * 功能：识别市场中发生的重要事件
   */
  private async detectMarketEvents(normalizedData: NormalizedMarketData): Promise<MarketEvent[]> {
    this.updateProgress('detectMarketEvents', '正在检测市场事件...', 65);

    const events: MarketEvent[] = [];
    const now = new Date().toISOString();

    // 1. 热点板块出现
    const hotSectors = normalizedData.sectors.filter(s => s.changePercent > 3);
    if (hotSectors.length > 0) {
      const topHot = hotSectors[0];
      events.push({
        id: 'hotspot_001',
        type: 'hotspot_emergence',
        title: '新热点板块出现',
        description: `${topHot.name}板块强势上涨${topHot.changePercent}%，成为市场热点`,
        severity: 'high',
        relatedStocks: topHot.leaderStocks,
        timestamp: now
      });
    }

    // 2. 成交量异常
    const volumeSpikeStocks = normalizedData.stocks.filter(s => s.volume > 1000000000); // 超过10亿
    if (volumeSpikeStocks.length > 0) {
      events.push({
        id: 'volume_001',
        type: 'volume_spike',
        title: '多只股票成交量放大',
        description: `${volumeSpikeStocks.length}只股票成交量超过10亿元，资金关注度提升`,
        severity: 'medium',
        relatedStocks: volumeSpikeStocks.map(s => s.code),
        timestamp: now
      });
    }

    // 3. 价格突破
    const breakoutStocks = normalizedData.stocks.filter(s => s.changePercent > 10);
    if (breakoutStocks.length > 0) {
      events.push({
        id: 'breakout_001',
        type: 'price_breakout',
        title: '股票强势突破',
        description: `${breakoutStocks.map(s => s.name).join('、')}等${breakoutStocks.length}只股票涨幅超过10%`,
        severity: 'high',
        relatedStocks: breakoutStocks.map(s => s.code),
        timestamp: now
      });
    }

    // 4. 新闻驱动事件
    if (normalizedData.news.length > 0) {
      const topNews = normalizedData.news[0];
      events.push({
        id: 'news_001',
        type: 'news_trigger',
        title: '重要市场新闻',
        description: `${topNews.source}: ${topNews.title}`,
        severity: topNews.tags.includes('利好') ? 'high' : 'medium',
        relatedStocks: [],
        timestamp: topNews.timestamp
      });
    }

    // 5. 板块轮动检测
    const downSectors = normalizedData.sectors.filter(s => s.changePercent < 0);
    if (hotSectors.length > 0 && downSectors.length > 0) {
      events.push({
        id: 'rotation_001',
        type: 'sector_rotation',
        title: '板块轮动迹象',
        description: `市场呈现分化，${hotSectors[0].name}等板块上涨，${downSectors[0].name}等板块下跌`,
        severity: 'medium',
        relatedStocks: [...hotSectors[0].leaderStocks],
        timestamp: now
      });
    }

    await new Promise(resolve => setTimeout(resolve, 200));
    this.updateProgress('detectMarketEvents', '市场事件检测完成', 80);

    return events;
  }

  /**
   * ========================================================================================
   * 第 5 步：生成市场快照 (generateMarketSnapshot)
   * ========================================================================================
   * 
   * 功能：将所有处理结果整合成最终的MarketSnapshot
   */
  private async generateMarketSnapshot(
    rawData: RawMarketData,
    normalizedData: NormalizedMarketData,
    features: MarketFeature[],
    events: MarketEvent[]
  ): Promise<MarketSnapshot> {
    this.updateProgress('generateMarketSnapshot', '正在生成市场快照...', 85);

    // 构建原始数据响应格式
    const marketDataResponse: MarketDataResponse = {
      sectors: normalizedData.sectors,
      stocks: normalizedData.stocks,
      fundFlow: normalizedData.fundFlow,
      news: normalizedData.news,
      timestamp: new Date().toISOString()
    };

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

    // 找出主导板块
    const dominantSector = normalizedData.sectors.reduce((top, s) => s.changePercent > top.changePercent ? s : top);

    // 找出热门股票
    const hotStocks = normalizedData.stocks
      .sort((a, b) => b.changePercent - a.changePercent)
      .slice(0, 5)
      .map(s => s.code);

    // 获取情绪分数和波动率分数
    const sentimentScore = sentimentFeature?.value ?? 50;
    const volatilityFeature = features.find(f => f.id === 'sector_volatility');
    const volatilityScore = volatilityFeature?.value ?? 10;

    const snapshot: MarketSnapshot = {
      id: `snapshot_${Date.now()}`,
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      rawData: marketDataResponse,
      features,
      events,
      summary: {
        marketDirection,
        dominantSector: dominantSector.name,
        hotStocks,
        sentimentScore,
        volatilityScore
      }
    };

    await new Promise(resolve => setTimeout(resolve, 200));
    this.updateProgress('generateMarketSnapshot', '市场快照生成完成', 100);

    return snapshot;
  }

  /**
   * ========================================================================================
   * 🚀 主执行方法
   * ========================================================================================
   * 
   * 完整的 5 步数据收集与处理流程
   */
  public async collectMarketData(): Promise<MarketSnapshot> {
    console.log('[DataCollectorAgent] 开始执行 5 步工作流...');

    // 第 1 步：采集原始数据
    const rawData = await this.collectRawData();
    console.log('[DataCollectorAgent] 第 1 步完成：原始数据采集');

    // 第 2 步：标准化数据
    const normalizedData = await this.normalizeData(rawData);
    console.log('[DataCollectorAgent] 第 2 步完成：数据标准化');

    // 第 3 步：提取特征
    const features = await this.extractFeatures(normalizedData);
    console.log('[DataCollectorAgent] 第 3 步完成：特征提取');

    // 第 4 步：检测事件
    const events = await this.detectMarketEvents(normalizedData);
    console.log('[DataCollectorAgent] 第 4 步完成：事件检测');

    // 第 5 步：生成快照
    const snapshot = await this.generateMarketSnapshot(rawData, normalizedData, features, events);
    console.log('[DataCollectorAgent] 第 5 步完成：快照生成');

    console.log('[DataCollectorAgent] 完整工作流执行完成！');
    return snapshot;
  }

  /**
   * ========================================================================================
   * 📊 快速测试模式 - 返回 MarketSnapshot
   * ========================================================================================
   */
  public static async quickTest(): Promise<MarketSnapshot> {
    const agent = new DataCollectorAgent();
    return await agent.collectMarketData();
  }

  /**
   * ========================================================================================
   * 🔧 兼容性方法 - 用于向后兼容，返回旧格式
   * ========================================================================================
   */
  public static quickTestLegacy(): MarketDataResponse {
    return {
      sectors: [
        { id: 'ai', name: '人工智能', changePercent: 5.8, volume: 158000000000, leaderStocks: ['300223', '300418', '002230'] },
        { id: 'newenergy', name: '新能源', changePercent: 3.2, volume: 98000000000, leaderStocks: ['300750', '002594', '000333'] },
        { id: 'consumerelec', name: '消费电子', changePercent: 2.5, volume: 76000000000, leaderStocks: ['002475', '300136', '002241'] },
        { id: 'medicine', name: '生物医药', changePercent: 1.8, volume: 65000000000, leaderStocks: ['300142', '600276', '000661'] },
        { id: 'finance', name: '金融', changePercent: -0.5, volume: 52000000000, leaderStocks: ['601318', '600036', '601166'] },
        { id: 'realestate', name: '房地产', changePercent: -1.2, volume: 38000000000, leaderStocks: ['000002', '600048', '000656'] },
      ],
      stocks: [
        { id: '1', code: '300223', name: '寒武纪', price: 245.80, changePercent: 12.5, volume: 1250000000, isLeader: true, sectorId: 'ai' },
        { id: '2', code: '300418', name: '昆仑万维', price: 42.35, changePercent: 8.9, volume: 980000000, isLeader: true, sectorId: 'ai' },
        { id: '3', code: '002230', name: '科大讯飞', price: 58.60, changePercent: 6.7, volume: 750000000, isLeader: true, sectorId: 'ai' },
        { id: '4', code: '300750', name: '宁德时代', price: 185.50, changePercent: 4.2, volume: 1200000000, isLeader: true, sectorId: 'newenergy' },
        { id: '5', code: '002594', name: '比亚迪', price: 268.90, changePercent: 3.8, volume: 890000000, isLeader: true, sectorId: 'newenergy' },
        { id: '6', code: '002475', name: '立讯精密', price: 32.80, changePercent: 3.1, volume: 520000000, isLeader: true, sectorId: 'consumerelec' },
        { id: '7', code: '300142', name: '沃森生物', price: 48.50, changePercent: 2.3, volume: 480000000, isLeader: true, sectorId: 'medicine' },
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
        { id: 'n1', title: 'AI大模型应用落地加速，产业链持续受益', content: '多家上市公司宣布AI大模型应用落地，行业景气度持续提升', source: '证券时报', timestamp: new Date(Date.now() - 3600000).toISOString(), tags: ['AI', '大模型', '利好'] },
        { id: 'n2', title: '新能源汽车销量再创新高', content: '5月份新能源汽车销量同比增长超60%，产业链需求旺盛', source: '第一财经', timestamp: new Date(Date.now() - 7200000).toISOString(), tags: ['新能源', '销量', '数据'] },
        { id: 'n3', title: '消费电子迎来传统旺季', content: '下半年消费电子传统旺季临近，产业链备货积极性提升', source: '上海证券报', timestamp: new Date(Date.now() - 10800000).toISOString(), tags: ['消费电子', '旺季', '需求'] },
      ],
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * ========================================================================================
 * 📋 工作流总结
 * ========================================================================================
 * 
 * collectRawData() → 采集原始数据 (10% → 20%)
 *     ↓
 * normalizeData() → 标准化数据 (25% → 40%)
 *     ↓
 * extractFeatures() → 提取市场特征 (45% → 60%)
 *     ↓
 * detectMarketEvents() → 检测市场事件 (65% → 80%)
 *     ↓
 * generateMarketSnapshot() → 生成市场快照 (85% → 100%)
 * 
 * 最终输出：完整的 MarketSnapshot，包含原始数据、特征、事件和市场摘要
 * ========================================================================================
 */
export default DataCollectorAgent;
