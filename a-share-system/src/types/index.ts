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

// 市场快照 - 最终输出
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
  
  // 市场状态摘要
  summary: {
    marketDirection: 'bullish' | 'bearish' | 'neutral';
    dominantSector: string;
    hotStocks: string[];
    sentimentScore: number;
    volatilityScore: number;
  };
}

// 热点板块
export interface HotSpot {
  name: string;
  strength: number;
  reasoning: string;
  sustainabilityScore: number;
}

// 龙头股
export interface LeaderStock {
  code: string;
  name: string;
  changePercent: number;
  leadingScore: number;
}

// 市场分析响应
export interface AnalysisResponse {
  hotSpots: HotSpot[];
  sentimentScore: number;
  leaderStocks: LeaderStock[];
  observations: string[];
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
}

// 入场点
export interface EntryPoint {
  type: 'aggressive' | 'moderate' | 'conservative';
  price: number;
  description: string;
}

// 止损止盈
export interface StopLoss {
  stopLossPrice: number;
  takeProfitPrice: number;
  description: string;
}

// 策略响应
export interface StrategyResponse {
  recommendedStrategy: string;
  candidates: Candidate[];
  entryPoints: EntryPoint[];
  stopLoss: StopLoss[];
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
