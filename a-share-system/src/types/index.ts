// Agent状态类型
export type AgentStatus = 'idle' | 'working' | 'completed' | 'error';

// Agent名称类型
export type AgentName = 
  | 'dataCollector' 
  | 'marketAnalyst' 
  | 'riskAssessor' 
  | 'strategyGenerator' 
  | 'coordinator';

// Agent信息接口
export interface Agent {
  id: AgentName;
  name: string;
  description: string;
  status: AgentStatus;
  progress: number;
  lastUpdate: string;
  icon: string;
}

// 板块数据
export interface SectorData {
  id: string;
  name: string;
  changePercent: number;
  volume: number;
  leaderStocks: string[];
}

// 股票数据
export interface StockData {
  id: string;
  code: string;
  name: string;
  price: number;
  changePercent: number;
  volume: number;
  isLeader: boolean;
  sectorId: string;
}

// 资金流向数据
export interface FundFlowData {
  mainFlow: number;
  northFlow: number;
  sectorFlows: Record<string, number>;
}

// 新闻数据
export interface NewsItem {
  id: string;
  title: string;
  content: string;
  source: string;
  timestamp: string;
  tags: string[];
}

// 市场数据响应
export interface MarketDataResponse {
  sectors: SectorData[];
  stocks: StockData[];
  fundFlow: FundFlowData;
  news: NewsItem[];
  timestamp: string;
}

// 原始数据
export interface RawMarketData {
  sectors: any[];
  stocks: any[];
  fundFlow: any;
  news: any[];
}

// 标准化数据
export interface NormalizedMarketData {
  sectors: SectorData[];
  stocks: StockData[];
  fundFlow: FundFlowData;
  news: NewsItem[];
}

// 市场特征
export interface MarketFeature {
  id: string;
  name: string;
  value: number;
  type: 'momentum' | 'volatility' | 'liquidity' | 'sentiment';
  description: string;
}

// 市场事件
export interface MarketEvent {
  id: string;
  type: 'hotspot_emergence' | 'volume_spike' | 'price_breakout' | 'news_trigger' | 'sector_rotation';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  relatedStocks: string[];
  timestamp: string;
}

// 事件严重程度
export type EventSeverity = 'low' | 'medium' | 'high' | 'critical';

// 事件优先级
export type EventPriority = 'low' | 'normal' | 'high' | 'urgent';

// 实时市场事件
export interface RealtimeMarketEvent {
  id: string;
  type: string;
  subType?: string;
  title: string;
  description: string;
  severity: EventSeverity;
  priority: EventPriority;
  timestamp: string;
  source: string;
  relatedAssets?: string[];
  metadata?: Record<string, any>;
}

// 事件流订阅
export interface EventStreamSubscription {
  id: string;
  eventTypes?: string[];
  callback: (event: RealtimeMarketEvent) => void;
}

// 数据源配置
export interface DataSourceMetadata {
  name: string;
  updateFrequency: 'realtime' | 'intraday' | 'daily' | 'weekly';
  dataFreshness: number; // 理想新鲜度（小时）
  lastUpdate: string;
}

// 数据新鲜度报告
export interface DataFreshnessReport {
  collectionTime: string;
  systemTime: string;
  dataSources: DataSourceMetadata[];
  staleDataFiltered: {
    totalItems: number;
    staleItems: number;
  };
  warnings: string[];
}

// 市场快照 - 最终输出（增强版）
export interface MarketSnapshot {
  // 基础信息
  id: string;
  timestamp: string;
  version: string;
  
  // 原始数据
  rawData: MarketDataResponse;
  
  // 市场特征
  features: MarketFeature[];
  
  // 市场事件
  events: MarketEvent[];
  
  // 实时事件流
  realtimeEvents?: RealtimeMarketEvent[];
  
  // 数据源信息
  collectionTime: string;
  dataSource: string;
  activeDataSource?: string;
  allDataSources?: { name: string; priority: number; isAvailable: boolean }[];
  dataFreshnessReport?: DataFreshnessReport;
  
  // 市场状态摘要
  summary: {
    marketDirection: 'bullish' | 'bearish' | 'neutral';
    dominantSector: string;
    hotStocks: string[];
    sentimentScore: number;
    volatilityScore: number;
    liquidityScore?: number;
  };
}

// 热点板块（增强版）
export interface HotSpot {
  name: string;
  strength: number;
  reasoning: string;
  sustainabilityScore: number;
  // 新增多维度分析
  momentumScore?: number;      // 动量分数
  concentrationScore?: number; // 龙头股集中度
  capitalActivity?: number;    // 资金活跃度
  eventBoost?: number;         // 事件驱动强度
  relatedEvents?: string[];    // 关联事件
}

// 龙头股
export interface LeaderStock {
  code: string;
  name: string;
  changePercent: number;
  leadingScore: number;
}

// 市场分析响应（增强版）
export interface AnalysisResponse {
  hotSpots: HotSpot[];
  sentimentScore: number;
  leaderStocks: LeaderStock[];
  observations: string[];
  // 新增结构化分析
  sectorRotation?: {
    strongSectors: string[];      // 强势板块
    weakSectors: string[];        // 弱势板块
    potentialHotspots: string[];  // 潜在热点
    rotationTrend: string;        // 轮动趋势描述
  };
  sentimentDetails?: {
    limitUpCount: number;         // 涨停数量
    limitDownCount: number;       // 跌停数量
    consecutiveBoardCount: number;// 连板数量
    friedBoardRate: number;       // 炸板率
    concentrationRatio: number;   // 成交集中度
  };
  eventCorrelations?: {
    [sectorName: string]: {
      events: string[];
      impact: 'positive' | 'negative' | 'neutral';
      intensity: number;
    }[];
  };
}

// 风险因子
export interface RiskFactor {
  type: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
}

// 预警信息
export interface Alert {
  id: string;
  type: 'warning' | 'danger' | 'info';
  title: string;
  message: string;
  timestamp: string;
}

// 风险评估响应
export interface RiskResponse {
  riskLevel: 'low' | 'medium' | 'high';
  volatilityScore: number;
  riskFactors: string[];
  alerts: Alert[];
}

// 候选标的
export interface Candidate {
  code: string;
  name: string;
  sector: string;
  score: number;
  rationale: string;
  // 新增字段
  momentumScore?: number;         // 动量评分
  valuationScore?: number;        // 估值评分
  riskScore?: number;             // 风险评分
  leaderScore?: number;           // 龙头评分
  allocation?: number;            // 建议配置比例(%)
}

// 入场点
export interface EntryPoint {
  type: 'aggressive' | 'moderate' | 'conservative';
  price: number;
  description: string;
  // 新增字段
  targetStock?: string;           // 目标股票
  positionSize?: number;          // 仓位大小(%)
  confidence?: number;            // 置信度(0-100)
}

// 止损止盈
export interface StopLoss {
  stopLossPrice: number;
  takeProfitPrice: number;
  description: string;
  // 新增字段
  targetStock?: string;           // 目标股票
  stopLossPercent?: number;       // 止损幅度(%)
  takeProfitPercent?: number;     // 止盈幅度(%)
  riskRewardRatio?: number;       // 盈亏比
}

// 仓位配置
export interface PositionAllocation {
  totalPosition: number;          // 总仓位(%)
  sectorAllocations: {
    [sector: string]: number;     // 各板块配置比例
  };
  individualAllocations: {
    [code: string]: number;       // 个股配置比例
  };
  cashReserve: number;            // 现金储备(%)
}

// 策略响应（增强版）
export interface StrategyResponse {
  recommendedStrategy: string;
  strategyType: 'aggressive' | 'moderate' | 'conservative';
  candidates: Candidate[];
  entryPoints: EntryPoint[];
  stopLoss: StopLoss[];
  // 新增字段
  positionAllocation?: PositionAllocation;  // 仓位配置
  marketView?: string;                       // 市场观点
  riskControls?: string[];                   // 风控措施
  timingIndicators?: {                      // 择时指标
    marketTiming: number;     // 市场择时评分
    sectorTiming: { [sector: string]: number };  // 板块择时评分
  };
}

// 最终交易决策
export interface TradingDecision {
  marketMainLine: string;
  coreHotSpots: string[];
  hotSustainabilityScore: number;
  marketSentimentScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  recommendedStrategy: string;
  candidateDirections: string[];
  areasToAvoid: string[];
  timestamp: string;
}

// 完整分析流程状态
export interface AnalysisState {
  step: number;
  totalSteps: number;
  currentAgent: AgentName | null;
  marketData: MarketDataResponse | null;
  analysis: AnalysisResponse | null;
  riskAssessment: RiskResponse | null;
  strategy: StrategyResponse | null;
  decision: TradingDecision | null;
  isAnalyzing: boolean;
}

// ==================== 深度优化新增类型定义 ====================

// 市场阶段类型
export type MarketRegime = 
  | 'trending_bullish'      // 趋势上涨
  | 'trending_bearish'      // 趋势下跌
  | 'rally'                 // 反弹
  | 'consolidation'         // 震荡整理
  | 'correction'            // 回调
  | 'volatile'              // 高波动
  | 'low_activity';         // 低活跃度

// 策略模式类型
export type StrategyMode = 
  | 'trend'                 // 趋势策略
  | 'relay'                 // 接力策略
  | 'rotation_low_suction'  // 低吸轮动策略
  | 'defensive'             // 防守策略
  | 'observation';          // 观察策略

// 机会评分维度
export interface OpportunityScore {
  sectorName: string;
  totalScore: number;
  eventResonanceScore: number;   // 事件共振评分
  capitalActivityScore: number;  // 资金活跃度评分
  sustainabilityScore: number;   // 热点持续性评分
  sectorStrengthScore: number;   // 板块强度评分
  valuationScore: number;        // 估值评分
  riskRewardRatio: number;       // 盈亏比
}

// 风险映射
export interface RiskMapping {
  riskLevel: 'low' | 'medium' | 'high';
  maxPosition: number;
  singleStockMaxPosition: number;
  stopLossPercentage: number;
  takeProfitMultiple: number;
  recommendedMode: StrategyMode;
  riskBudget: number;
}

// 子策略
export interface SubStrategy {
  id: string;
  mode: StrategyMode;
  name: string;
  description: string;
  priority: number;
  score: number;
  rationale: string;
  suitability: 'high' | 'medium' | 'low';
}

// 深度策略报告
export interface StrategyReport {
  // 主策略
  dominantStrategy: SubStrategy;
  
  // 备选策略
  secondaryStrategies: SubStrategy[];
  
  // 市场阶段判断
  marketRegime: MarketRegime;
  marketRegimeDescription: string;
  
  // 风险映射
  riskMapping: RiskMapping;
  
  // 机会评分
  opportunityScores: OpportunityScore[];
  
  // 事件因果映射
  eventChainMap: {
    [eventType: string]: {
      impact: 'positive' | 'negative' | 'neutral';
      affectedSectors: string[];
      recommendedAction: 'hold' | 'accumulate' | 'reduce' | 'avoid';
    }[];
  };
  
  // 动态仓位规划
  dynamicPositionPlan: PositionAllocation & {
    reasoning: string;
    contingencyPlan: string;
  };
  
  // 策略说明
  strategyExplanation: {
    marketCausalityUnderstanding: string;
    riskControlLogic: string;
    opportunityRationale: string;
    strategySwitchingRules: string;
  };
  
  // 基础策略响应（保持兼容）
  recommendedStrategy: string;
  strategyType: 'aggressive' | 'moderate' | 'conservative';
  candidates: Candidate[];
  entryPoints: EntryPoint[];
  stopLoss: StopLoss[];
  positionAllocation?: PositionAllocation;
  marketView?: string;
  riskControls?: string[];
  timingIndicators?: {
    marketTiming: number;
    sectorTiming: { [sector: string]: number };
  };
}
