import { MarketDataResponse, SectorData, StockData, FundFlowData, NewsItem } from '@/types';

/**
 * ==========================================================================================
 * 🔍 数据收集Agent (Data Collector Agent)
 * ==========================================================================================
 *
 * 工作原理说明：
 *
 * 1️⃣ 数据收集Agent是整个分析流程的第一步
 * 2️⃣ 负责采集多维度的市场数据
 * 3️⃣ 为后续Agent提供基础数据支持
 *
 * 数据收集维度：
 * - 板块行情数据
 * - 个股行情数据
 * - 资金流向数据
 * - 市场新闻数据
 *
 * 工作流程：
 * 1. 初始化采集任务
 * 2. 采集板块行情
 * 3. 采集个股行情
 * 4. 采集资金流向
 * 5. 采集市场新闻
 * 6. 整合所有数据
 * 7. 输出结构化数据
 *
 * ==========================================================================================
 */

/**
 * 数据采集进度
 */
export interface DataCollectionProgress {
  currentStep: string;
  stepDescription: string;
  progressPercent: number;
}

/**
 * 数据收集Agent类
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
   * 1️⃣ 采集板块行情数据
   * ========================================================================================
   *
   * 功能说明：
   * - 收集主要热门板块的涨跌、成交量、龙头股等信息
   *
   * 数据字段：
   * - id: 板块唯一标识
   * - name: 板块名称
   * - changePercent: 涨跌幅
   * - volume: 成交量
   * - leaderStocks: 龙头股代码列表
   */
  private async collectSectorData(): Promise<SectorData[]> {
    this.updateProgress('板块数据', '正在采集板块行情...', 15);

    // 模拟：实际项目中，这里会调用真实的股票API
    // 比如：东方财富、同花顺、雪球等数据源
    
    const sectors: SectorData[] = [
      {
        id: 'ai',
        name: '人工智能',
        changePercent: 5.8,
        volume: 158000000000,
        leaderStocks: ['300223', '300418', '002230']
      },
      {
        id: 'newenergy',
        name: '新能源',
        changePercent: 3.2,
        volume: 98000000000,
        leaderStocks: ['300750', '002594', '000333']
      },
      {
        id: 'consumerelec',
        name: '消费电子',
        changePercent: 2.5,
        volume: 76000000000,
        leaderStocks: ['002475', '300136', '002241']
      },
      {
        id: 'medicine',
        name: '生物医药',
        changePercent: 1.8,
        volume: 65000000000,
        leaderStocks: ['300142', '600276', '000661']
      },
      {
        id: 'finance',
        name: '金融',
        changePercent: -0.5,
        volume: 52000000000,
        leaderStocks: ['601318', '600036', '601166']
      },
      {
        id: 'realestate',
        name: '房地产',
        changePercent: -1.2,
        volume: 38000000000,
        leaderStocks: ['000002', '600048', '000656']
      }
    ];

    this.updateProgress('板块数据', '板块行情采集完成', 25);
    return sectors;
  }

  /**
   * ========================================================================================
   * 2️⃣ 采集个股行情数据
   * ========================================================================================
   *
   * 功能说明：
   * - 关注热门股票的价格、涨跌幅、成交量等信息
   */
  private async collectStockData(): Promise<StockData[]> {
    this.updateProgress('个股数据', '正在采集个股行情...', 30);

    const stocks: StockData[] = [
      {
        id: '1',
        code: '300223',
        name: '寒武纪',
        price: 245.80,
        changePercent: 12.5,
        volume: 1250000000,
        isLeader: true,
        sectorId: 'ai'
      },
      {
        id: '2',
        code: '300418',
        name: '昆仑万维',
        price: 42.35,
        changePercent: 8.9,
        volume: 980000000,
        isLeader: true,
        sectorId: 'ai'
      },
      {
        id: '3',
        code: '002230',
        name: '科大讯飞',
        price: 58.60,
        changePercent: 6.7,
        volume: 750000000,
        isLeader: true,
        sectorId: 'ai'
      },
      {
        id: '4',
        code: '300750',
        name: '宁德时代',
        price: 185.50,
        changePercent: 4.2,
        volume: 1200000000,
        isLeader: true,
        sectorId: 'newenergy'
      },
      {
        id: '5',
        code: '002594',
        name: '比亚迪',
        price: 268.90,
        changePercent: 3.8,
        volume: 890000000,
        isLeader: true,
        sectorId: 'newenergy'
      },
      {
        id: '6',
        code: '002475',
        name: '立讯精密',
        price: 32.80,
        changePercent: 3.1,
        volume: 520000000,
        isLeader: true,
        sectorId: 'consumerelec'
      },
      {
        id: '7',
        code: '300142',
        name: '沃森生物',
        price: 48.50,
        changePercent: 2.3,
        volume: 480000000,
        isLeader: true,
        sectorId: 'medicine'
      }
    ];

    this.updateProgress('个股数据', '个股行情采集完成', 40);
    return stocks;
  }

  /**
   * ========================================================================================
   * 3️⃣ 采集资金流向数据
   * ========================================================================================
   *
   * 功能说明：
   * - 主力资金、北向资金、板块资金流向
   */
  private async collectFundFlowData(): Promise<FundFlowData> {
    this.updateProgress('资金流向', '正在采集资金流向...', 50);

    const fundFlow: FundFlowData = {
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
    };

    this.updateProgress('资金流向', '资金流向采集完成', 60);
    return fundFlow;
  }

  /**
   * ========================================================================================
   * 4️⃣ 采集市场新闻数据
   * ========================================================================================
   *
   * 功能说明：
   * - 最新市场热点新闻，利好利空消息
   */
  private async collectNewsData(): Promise<NewsItem[]> {
    this.updateProgress('市场新闻', '正在采集市场新闻...', 70);

    const news: NewsItem[] = [
      {
        id: 'n1',
        title: 'AI大模型应用落地加速，产业链持续受益',
        content: '多家上市公司宣布AI大模型应用落地，行业景气度持续提升，相关龙头公司订单饱满，产能利用率高',
        source: '证券时报',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        tags: ['AI', '大模型', '利好']
      },
      {
        id: 'n2',
        title: '新能源汽车销量再创新高',
        content: '5月份新能源汽车销量同比增长超60%，产业链需求旺盛，上游原材料价格企稳回升',
        source: '第一财经',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        tags: ['新能源', '销量', '数据']
      },
      {
        id: 'n3',
        title: '消费电子迎来传统旺季',
        content: '下半年消费电子传统旺季临近，产业链备货积极性提升，相关公司订单改善',
        source: '上海证券报',
        timestamp: new Date(Date.now() - 10800000).toISOString(),
        tags: ['消费电子', '旺季', '需求']
      }
    ];

    this.updateProgress('市场新闻', '市场新闻采集完成', 85);
    return news;
  }

  /**
   * ========================================================================================
   * 5️⃣ 整合所有数据
   * ========================================================================================
   *
   * 功能说明：
   * - 将所有采集的数据整合为结构化数据
   */
  private integrateData(
    sectors: SectorData[],
    stocks: StockData[],
    fundFlow: FundFlowData,
    news: NewsItem[]
  ): MarketDataResponse {
    this.updateProgress('数据整合', '正在整合数据...', 90);

    const result: MarketDataResponse = {
      sectors,
      stocks,
      fundFlow,
      news,
      timestamp: new Date().toISOString()
    };

    this.updateProgress('完成', '数据采集完成', 100);
    return result;
  }

  /**
   * ========================================================================================
   * 🚀 主执行方法
   * ========================================================================================
   *
   * 完整的数据收集流程
   */
  public async collectMarketData(): Promise<MarketDataResponse> {
    this.updateProgress('初始化', '数据收集Agent启动...', 5);

    // 模拟：实际项目中，这里可以并行采集提高效率
    // 为了演示，我们按顺序执行

    const [sectors, stocks, fundFlow, news] = await Promise.all([
      this.collectSectorData(),
      this.collectStockData(),
      this.collectFundFlowData(),
      this.collectNewsData()
    ]);

    // 整合数据
    const result = this.integrateData(sectors, stocks, fundFlow, news);

    return result;
  }

  /**
   * ========================================================================================
   * 📊 数据质量检查
   * ========================================================================================
   *
   * 简单的数据校验和预处理
   */
  public validateData(data: MarketDataResponse): boolean {
    // 检查必要字段是否存在
    if (!data.sectors || data.sectors.length === 0) {
      console.warn('[DataCollector] 警告：板块数据为空');
      return false;
    }

    if (!data.stocks || data.stocks.length === 0) {
      console.warn('[DataCollector] 警告：股票数据为空');
      return false;
    }

    return true;
  }

  /**
   * ========================================================================================
   * 🔄 快速测试模式
   * ========================================================================================
   *
   * 生成快速测试数据
   */
  public static quickTest(): MarketDataResponse {
    const agent = new DataCollectorAgent();
    // 这里不使用回调，同步返回
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
          'realestate': -800000000,
        }
      },
      news: [
        { id: 'n1', title: 'AI大模型应用落地加速，产业链持续受益', content: '多家上市公司宣布AI大模型应用落地，行业景气度持续提升...', source: '证券时报', timestamp: new Date(Date.now() - 3600000).toISOString(), tags: ['AI', '大模型', '利好'] },
        { id: 'n2', title: '新能源汽车销量再创新高', content: '5月份新能源汽车销量同比增长超60%，产业链需求旺盛...', source: '第一财经', timestamp: new Date(Date.now() - 7200000).toISOString(), tags: ['新能源', '销量', '数据'] },
        { id: 'n3', title: '消费电子迎来传统旺季', content: '下半年消费电子传统旺季临近，产业链备货积极性提升...', source: '上海证券报', timestamp: new Date(Date.now() - 10800000).toISOString(), tags: ['消费电子', '旺季', '需求'] },
      ],
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * ========================================================================================
 * 📋 数据收集Agent的核心原理总结
 * ========================================================================================
 *
 * 1. 设计理念：
 *    - 单一职责原则：只负责数据收集，不做分析
 *    - 模块化设计：每个数据源独立采集
 *    - 进度反馈：实时上报采集进度
 *
 * 2. 数据维度：
 *    - 板块行情：板块涨跌、成交量、龙头股
 *    - 个股行情：价格、涨跌幅、成交量
 *    - 资金流向：主力、北向、板块资金
 *    - 市场新闻：最新资讯
 *
 * 3. 扩展性：
 *    - 可以轻松添加新的数据源
 *    - 可以替换为真实API调用
 *    - 支持数据缓存和增量更新
 *
 * ========================================================================================
 */
export default DataCollectorAgent;
