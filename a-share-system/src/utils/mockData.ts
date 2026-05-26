import {
  MarketDataResponse,
  AnalysisResponse,
  RiskResponse,
  StrategyResponse,
  TradingDecision
} from '@/types';

// 生成模拟市场数据
export const generateMockMarketData = (): MarketDataResponse => {
  const sectors = [
    { id: 'ai', name: '人工智能', changePercent: 5.8, volume: 158000000000, leaderStocks: ['300223', '300418', '002230'] },
    { id: 'newenergy', name: '新能源', changePercent: 3.2, volume: 98000000000, leaderStocks: ['300750', '002594', '000333'] },
    { id: 'consumerelec', name: '消费电子', changePercent: 2.5, volume: 76000000000, leaderStocks: ['002475', '300136', '002241'] },
    { id: 'medicine', name: '生物医药', changePercent: 1.8, volume: 65000000000, leaderStocks: ['300142', '600276', '000661'] },
    { id: 'finance', name: '金融', changePercent: -0.5, volume: 52000000000, leaderStocks: ['601318', '600036', '601166'] },
    { id: 'realestate', name: '房地产', changePercent: -1.2, volume: 38000000000, leaderStocks: ['000002', '600048', '000656'] },
  ];

  const stocks = [
    { id: '1', code: '300223', name: '寒武纪', price: 245.80, changePercent: 12.5, volume: 1250000000, isLeader: true, sectorId: 'ai' },
    { id: '2', code: '300418', name: '昆仑万维', price: 42.35, changePercent: 8.9, volume: 980000000, isLeader: true, sectorId: 'ai' },
    { id: '3', code: '002230', name: '科大讯飞', price: 58.60, changePercent: 6.7, volume: 750000000, isLeader: true, sectorId: 'ai' },
    { id: '4', code: '300750', name: '宁德时代', price: 185.50, changePercent: 4.2, volume: 1200000000, isLeader: true, sectorId: 'newenergy' },
    { id: '5', code: '002594', name: '比亚迪', price: 268.90, changePercent: 3.8, volume: 890000000, isLeader: true, sectorId: 'newenergy' },
    { id: '6', code: '002475', name: '立讯精密', price: 32.80, changePercent: 3.1, volume: 520000000, isLeader: true, sectorId: 'consumerelec' },
    { id: '7', code: '300142', name: '沃森生物', price: 48.50, changePercent: 2.3, volume: 480000000, isLeader: true, sectorId: 'medicine' },
  ];

  const fundFlow = {
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

  const news = [
    {
      id: 'n1',
      title: 'AI大模型应用落地加速，产业链持续受益',
      content: '多家上市公司宣布AI大模型应用落地，行业景气度持续提升...',
      source: '证券时报',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      tags: ['AI', '大模型', '利好']
    },
    {
      id: 'n2',
      title: '新能源汽车销量再创新高',
      content: '5月份新能源汽车销量同比增长超60%，产业链需求旺盛...',
      source: '第一财经',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      tags: ['新能源', '销量', '数据']
    },
    {
      id: 'n3',
      title: '消费电子迎来传统旺季',
      content: '下半年消费电子传统旺季临近，产业链备货积极性提升...',
      source: '上海证券报',
      timestamp: new Date(Date.now() - 10800000).toISOString(),
      tags: ['消费电子', '旺季', '需求']
    }
  ];

  return {
    sectors,
    stocks,
    fundFlow,
    news,
    timestamp: new Date().toISOString()
  };
};

// 生成模拟分析结果
export const generateMockAnalysis = (): AnalysisResponse => {
  return {
    hotSpots: [
      {
        name: '人工智能',
        strength: 88,
        reasoning: 'AI大模型应用加速落地，资金持续流入，龙头股表现强劲',
        sustainabilityScore: 75
      },
      {
        name: '新能源',
        strength: 72,
        reasoning: '销量数据超预期，政策支持力度大，产业链景气度高',
        sustainabilityScore: 68
      },
      {
        name: '消费电子',
        strength: 65,
        reasoning: '传统旺季临近，订单改善预期增强',
        sustainabilityScore: 60
      }
    ],
    sentimentScore: 68,
    leaderStocks: [
      { code: '300223', name: '寒武纪', changePercent: 12.5, leadingScore: 92 },
      { code: '300418', name: '昆仑万维', changePercent: 8.9, leadingScore: 85 },
      { code: '300750', name: '宁德时代', changePercent: 4.2, leadingScore: 78 }
    ],
    observations: [
      '市场情绪偏乐观，成交活跃',
      'AI板块仍为主线，资金聚焦明显',
      '新能源板块估值修复中',
      '需警惕板块轮动加速风险'
    ]
  };
};

// 生成模拟风险评估
export const generateMockRiskAssessment = (): RiskResponse => {
  return {
    riskLevel: 'medium',
    volatilityScore: 62,
    riskFactors: [
      '板块轮动速度加快，追高风险增大',
      '部分AI概念股估值偏高',
      '北向资金波动加剧',
      '临近月底资金面偏紧'
    ],
    alerts: [
      {
        id: 'a1',
        type: 'warning',
        title: '板块轮动风险',
        message: '近期板块轮动速度加快，建议避免追高',
        timestamp: new Date().toISOString()
      },
      {
        id: 'a2',
        type: 'info',
        title: '市场情绪监测',
        message: '当前市场情绪偏乐观，但需保持理性',
        timestamp: new Date().toISOString()
      }
    ]
  };
};

// 生成模拟策略建议
export const generateMockStrategy = (): StrategyResponse => {
  return {
    recommendedStrategy: '聚焦AI主线，逢低布局新能源，严格控制仓位',
    candidates: [
      {
        code: '300223',
        name: '寒武纪',
        sector: '人工智能',
        score: 90,
        rationale: 'AI芯片龙头，技术壁垒高，受益于大模型需求'
      },
      {
        code: '300418',
        name: '昆仑万维',
        sector: '人工智能',
        score: 85,
        rationale: '大模型应用布局领先，商业化进展顺利'
      },
      {
        code: '300750',
        name: '宁德时代',
        sector: '新能源',
        score: 80,
        rationale: '全球动力电池龙头，估值回归合理区间'
      }
    ],
    entryPoints: [
      {
        type: 'aggressive',
        price: 245.80,
        description: '现价直接介入，适合风险承受能力较强的投资者'
      },
      {
        type: 'moderate',
        price: 235.00,
        description: '回调至235元附近介入，性价比更高'
      },
      {
        type: 'conservative',
        price: 220.00,
        description: '等待较大幅度回调后再介入，安全性更高'
      }
    ],
    stopLoss: [
      {
        stopLossPrice: 210.00,
        takeProfitPrice: 295.00,
        description: '止损-14.5%，止盈+20%，盈亏比合理'
      }
    ]
  };
};

// 生成最终决策
export const generateMockDecision = (): TradingDecision => {
  return {
    marketMainLine: 'AI人工智能主线明确，资金聚焦效应显著',
    coreHotSpots: ['人工智能', '新能源', '消费电子'],
    hotSustainabilityScore: 72,
    marketSentimentScore: 68,
    riskLevel: 'medium',
    recommendedStrategy: '聚焦AI主线，逢低布局新能源，仓位控制在50%以内',
    candidateDirections: ['AI芯片', '大模型应用', '新能源上游材料'],
    areasToAvoid: ['高估值题材股', '前期炒作出货的板块', '基本面恶化的个股'],
    timestamp: new Date().toISOString()
  };
};
