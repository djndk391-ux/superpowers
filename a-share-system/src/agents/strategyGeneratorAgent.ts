
import {
  MarketSnapshot,
  AnalysisResponse,
  RiskResponse,
  StrategyResponse,
  Candidate,
  EntryPoint,
  StopLoss,
  PositionAllocation
} from '@/types';

// 策略生成器配置
export interface StrategyGeneratorConfig {
  maxCandidates: number;              // 最大候选标的数
  positionLimitPerStock: number;      // 单只股票最大仓位
  maxTotalPosition: number;           // 最大总仓位
  minRiskRewardRatio: number;         // 最小盈亏比
  stopLossRange: [number, number];   // 止损幅度范围
  takeProfitRange: [number, number]; // 止盈幅度范围
}

// 进度回调
export interface StrategyGeneratorProgress {
  progressPercent: number;
  currentStep: string;
  stepDescription: string;
}

const DEFAULT_CONFIG: StrategyGeneratorConfig = {
  maxCandidates: 5,
  positionLimitPerStock: 20,
  maxTotalPosition: 80,
  minRiskRewardRatio: 2,
  stopLossRange: [5, 15],
  takeProfitRange: [10, 30]
};

export class StrategyGeneratorAgent {
  private config: StrategyGeneratorConfig;
  private onProgress?: (progress: StrategyGeneratorProgress) => void;

  constructor(
    config: Partial<StrategyGeneratorConfig> = {},
    onProgress?: (progress: StrategyGeneratorProgress) => void
  ) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.onProgress = onProgress;
  }

  private updateProgress(
    step: number,
    totalSteps: number,
    currentStep: string,
    stepDescription: string
  ): void {
    const progressPercent = Math.round((step / totalSteps) * 100);
    if (this.onProgress) {
      this.onProgress({
        progressPercent,
        currentStep,
        stepDescription
      });
    }
  }

  async generateStrategy(
    snapshot: MarketSnapshot,
    analysis: AnalysisResponse,
    riskAssessment: RiskResponse
  ): Promise<StrategyResponse> {
    console.log('[StrategyGenerator] 开始生成交易策略...');
    
    const totalSteps = 6;

    this.updateProgress(1, totalSteps, 'analyze_inputs', '正在分析市场分析和风险评估数据...');
    const strategyType = this.determineStrategyType(riskAssessment);

    this.updateProgress(2, totalSteps, 'select_candidates', '正在筛选优质候选标的...');
    const candidates = this.selectCandidates(snapshot, analysis, riskAssessment);

    this.updateProgress(3, totalSteps, 'calculate_entry_points', '正在计算入场点位...');
    const entryPoints = this.calculateEntryPoints(candidates, snapshot, strategyType);

    this.updateProgress(4, totalSteps, 'set_stop_loss', '正在设置止损止盈策略...');
    const stopLossStrategies = this.setStopLossTakeProfit(candidates, snapshot, strategyType);

    this.updateProgress(5, totalSteps, 'allocate_positions', '正在进行仓位配置...');
    const positionAllocation = this.allocatePositions(
      candidates,
      riskAssessment,
      strategyType
    );

    this.updateProgress(6, totalSteps, 'finalize_strategy', '正在生成最终策略...');
    const strategy = this.finalizeStrategy(
      analysis,
      riskAssessment,
      strategyType,
      candidates,
      entryPoints,
      stopLossStrategies,
      positionAllocation
    );

    console.log('[StrategyGenerator] 策略生成完成:', strategy);
    return strategy;
  }

  // 根据风险评估确定策略类型
  private determineStrategyType(riskAssessment: RiskResponse): 'aggressive' | 'moderate' | 'conservative' {
    switch (riskAssessment.riskLevel) {
      case 'low':
        return 'aggressive';
      case 'medium':
        return 'moderate';
      case 'high':
        return 'conservative';
      default:
        return 'moderate';
    }
  }

  // 筛选和评分候选标的
  private selectCandidates(
    snapshot: MarketSnapshot,
    analysis: AnalysisResponse,
    riskAssessment: RiskResponse
  ): Candidate[] {
    const { stocks } = snapshot.rawData;
    const { hotSpots, leaderStocks } = analysis;

    // 建立板块评分映射
    const sectorScores = new Map<string, number>();
    hotSpots.forEach(spot => {
      sectorScores.set(spot.name, spot.strength);
    });

    // 筛选和评分候选股票
    const candidates: Candidate[] = [];
    
    // 首先优先处理龙头股
    leaderStocks.forEach(leader => {
      const stock = stocks.find(s => s.code === leader.code);
      if (stock) {
        const score = this.calculateCandidateScore(stock, analysis, riskAssessment, sectorScores);
        candidates.push({
          code: stock.code,
          name: stock.name,
          sector: this.findSectorForStock(stock, snapshot),
          score,
          rationale: this.generateCandidateRationale(stock, analysis, score),
          momentumScore: Math.max(0, Math.min(100, 50 + stock.changePercent * 5)),
          valuationScore: this.calculateValuationScore(stock),
          riskScore: this.calculateRiskScore(stock, riskAssessment),
          leaderScore: leader.leadingScore
        });
      }
    });

    // 补充其他优质股票
    stocks.filter(s => s.isLeader || s.changePercent > 3).forEach(stock => {
      if (!candidates.find(c => c.code === stock.code)) {
        const score = this.calculateCandidateScore(stock, analysis, riskAssessment, sectorScores);
        if (score >= 50) {
          candidates.push({
            code: stock.code,
            name: stock.name,
            sector: this.findSectorForStock(stock, snapshot),
            score,
            rationale: this.generateCandidateRationale(stock, analysis, score),
            momentumScore: Math.max(0, Math.min(100, 50 + stock.changePercent * 5)),
            valuationScore: this.calculateValuationScore(stock),
            riskScore: this.calculateRiskScore(stock, riskAssessment),
            leaderScore: stock.isLeader ? 70 : 50
          });
        }
      }
    });

    // 按分数排序，取前N个
    candidates.sort((a, b) => b.score - a.score);
    return candidates.slice(0, this.config.maxCandidates);
  }

  // 计算候选标的综合评分
  private calculateCandidateScore(
    stock: any,
    analysis: AnalysisResponse,
    riskAssessment: RiskResponse,
    sectorScores: Map<string, number>
  ): number {
    let score = 0;
    
    // 1. 价格变动评分 (30%)
    const changeScore = Math.max(0, Math.min(100, 50 + stock.changePercent * 3));
    score += changeScore * 0.3;

    // 2. 板块强度评分 (30%)
    const sector = this.findSectorForStock(stock, { rawData: { sectors: analysis.hotSpots.map(h => ({ name: h.name, changePercent: 0, volume: 0, leaderStocks: [] })) } } as any);
    const sectorScore = sectorScores.get(sector) || 50;
    score += sectorScore * 0.3;

    // 3. 龙头评分 (20%)
    if (stock.isLeader) {
      const leader = analysis.leaderStocks.find(l => l.code === stock.code);
      score += (leader?.leadingScore || 70) * 0.2;
    } else {
      score += 50 * 0.2;
    }

    // 4. 风险调整 (20%)
    const riskAdjustment = riskAssessment.riskLevel === 'high' ? -10 : riskAssessment.riskLevel === 'medium' ? 0 : 5;
    score += (50 + riskAdjustment) * 0.2;

    return Math.round(Math.max(0, Math.min(100, score)));
  }

  // 计算估值评分
  private calculateValuationScore(stock: any): number {
    let score = 50;
    // 简化估值逻辑，基于价格变动判断
    if (stock.changePercent > 0 && stock.changePercent < 5) {
      score += 20; // 温和上涨，估值相对合理
    } else if (stock.changePercent > 8) {
      score -= 10; // 短期涨幅过大，估值可能偏高
    }
    return Math.max(0, Math.min(100, score));
  }

  // 计算风险评分
  private calculateRiskScore(stock: any, riskAssessment: RiskResponse): number {
    let score = 50;
    const volatility = riskAssessment.volatilityScore;
    
    if (volatility > 70) {
      score -= 15; // 高波动环境，风险增加
    } else if (volatility < 40) {
      score += 10; // 低波动环境，风险降低
    }

    if (Math.abs(stock.changePercent) > 7) {
      score -= 10; // 大幅波动，风险较高
    }

    return Math.max(0, Math.min(100, score));
  }

  // 查找股票所属板块
  private findSectorForStock(stock: any, snapshot: MarketSnapshot): string {
    if (stock.sectorId) {
      const sector = snapshot.rawData.sectors.find(s => s.id === stock.sectorId);
      if (sector) return sector.name;
    }
    return '其他';
  }

  // 生成候选标的理由
  private generateCandidateRationale(stock: any, analysis: AnalysisResponse, score: number): string {
    const parts: string[] = [];
    
    if (stock.isLeader) {
      const leader = analysis.leaderStocks.find(l => l.code === stock.code);
      parts.push(`${stock.name}是${this.findSectorForStock(stock, { rawData: { sectors: analysis.hotSpots.map(h => ({ name: h.name, changePercent: 0, volume: 0, leaderStocks: [] })) } } as any)}板块龙头`);
    }
    
    if (stock.changePercent > 0) {
      parts.push(`今日强势上涨${stock.changePercent.toFixed(2)}%`);
    } else {
      parts.push(`今日调整${Math.abs(stock.changePercent).toFixed(2)}%`);
    }
    
    if (score >= 80) {
      parts.push('综合评分优秀，建议重点关注');
    } else if (score >= 60) {
      parts.push('综合评分良好，可适当关注');
    }
    
    return parts.join('；');
  }

  // 计算入场点位
  private calculateEntryPoints(
    candidates: Candidate[],
    snapshot: MarketSnapshot,
    strategyType: 'aggressive' | 'moderate' | 'conservative'
  ): EntryPoint[] {
    const entryPoints: EntryPoint[] = [];
    const { stocks } = snapshot.rawData;

    candidates.forEach(candidate => {
      const stock = stocks.find(s => s.code === candidate.code);
      if (!stock) return;

      const basePrice = stock.price;
      
      // 激进型入场点
      entryPoints.push({
        type: 'aggressive',
        targetStock: candidate.code,
        price: basePrice,
        positionSize: strategyType === 'aggressive' ? 15 : strategyType === 'moderate' ? 10 : 5,
        confidence: candidate.score,
        description: `${candidate.name}现价直接介入，适合风险承受能力较强的投资者`
      });

      // 稳健型入场点
      const moderatePrice = basePrice * (1 - 0.03);
      entryPoints.push({
        type: 'moderate',
        targetStock: candidate.code,
        price: Math.round(moderatePrice * 100) / 100,
        positionSize: strategyType === 'aggressive' ? 12 : strategyType === 'moderate' ? 15 : 10,
        confidence: Math.min(100, candidate.score + 5),
        description: `${candidate.name}回调3%至${Math.round(moderatePrice * 100) / 100}元附近介入，性价比更高`
      });

      // 保守型入场点
      const conservativePrice = basePrice * (1 - 0.07);
      entryPoints.push({
        type: 'conservative',
        targetStock: candidate.code,
        price: Math.round(conservativePrice * 100) / 100,
        positionSize: strategyType === 'aggressive' ? 8 : strategyType === 'moderate' ? 10 : 15,
        confidence: Math.min(100, candidate.score + 10),
        description: `${candidate.name}等待7%左右回调后介入，安全性更高`
      });
    });

    return entryPoints;
  }

  // 设置止损止盈策略
  private setStopLossTakeProfit(
    candidates: Candidate[],
    snapshot: MarketSnapshot,
    strategyType: 'aggressive' | 'moderate' | 'conservative'
  ): StopLoss[] {
    const stopLossStrategies: StopLoss[] = [];
    const { stocks } = snapshot.rawData;

    // 根据策略类型调整止损止盈幅度
    const stopLossPercent = strategyType === 'aggressive' ? 12 : strategyType === 'moderate' ? 8 : 5;
    const takeProfitPercent = strategyType === 'aggressive' ? 25 : strategyType === 'moderate' ? 18 : 12;

    candidates.forEach(candidate => {
      const stock = stocks.find(s => s.code === candidate.code);
      if (!stock) return;

      const stopLossPrice = stock.price * (1 - stopLossPercent / 100);
      const takeProfitPrice = stock.price * (1 + takeProfitPercent / 100);
      const riskRewardRatio = takeProfitPercent / stopLossPercent;

      stopLossStrategies.push({
        targetStock: candidate.code,
        stopLossPrice: Math.round(stopLossPrice * 100) / 100,
        stopLossPercent,
        takeProfitPrice: Math.round(takeProfitPrice * 100) / 100,
        takeProfitPercent,
        riskRewardRatio: Math.round(riskRewardRatio * 100) / 100,
        description: `${candidate.name}：止损${stopLossPercent}%至${Math.round(stopLossPrice * 100) / 100}元，止盈${takeProfitPercent}%至${Math.round(takeProfitPrice * 100) / 100}元，盈亏比${riskRewardRatio.toFixed(2)}:1`
      });
    });

    return stopLossStrategies;
  }

  // 配置仓位
  private allocatePositions(
    candidates: Candidate[],
    riskAssessment: RiskResponse,
    strategyType: 'aggressive' | 'moderate' | 'conservative'
  ): PositionAllocation {
    const totalScore = candidates.reduce((sum, c) => sum + c.score, 0);
    
    // 根据风险级别确定总仓位
    let totalPosition: number;
    switch (riskAssessment.riskLevel) {
      case 'low':
        totalPosition = Math.min(this.config.maxTotalPosition, 75);
        break;
      case 'medium':
        totalPosition = Math.min(this.config.maxTotalPosition, 55);
        break;
      case 'high':
        totalPosition = Math.min(this.config.maxTotalPosition, 35);
        break;
      default:
        totalPosition = 50;
    }

    // 根据策略类型调整
    if (strategyType === 'aggressive') totalPosition = Math.min(100, totalPosition + 10);
    if (strategyType === 'conservative') totalPosition = Math.max(20, totalPosition - 15);

    const sectorAllocations: { [sector: string]: number } = {};
    const individualAllocations: { [code: string]: number } = {};

    candidates.forEach((candidate, index) => {
      const weight = candidate.score / totalScore;
      const allocation = Math.min(
        this.config.positionLimitPerStock,
        Math.round((totalPosition * weight) * 100) / 100
      );
      
      candidate.allocation = allocation;
      individualAllocations[candidate.code] = allocation;

      sectorAllocations[candidate.sector] = (sectorAllocations[candidate.sector] || 0) + allocation;
    });

    const cashReserve = 100 - totalPosition;

    return {
      totalPosition: Math.round(totalPosition * 100) / 100,
      sectorAllocations,
      individualAllocations,
      cashReserve: Math.round(cashReserve * 100) / 100
    };
  }

  // 整合最终策略
  private finalizeStrategy(
    analysis: AnalysisResponse,
    riskAssessment: RiskResponse,
    strategyType: 'aggressive' | 'moderate' | 'conservative',
    candidates: Candidate[],
    entryPoints: EntryPoint[],
    stopLossStrategies: StopLoss[],
    positionAllocation: PositionAllocation
  ): StrategyResponse {
    // 生成市场观点
    const marketView = this.generateMarketView(analysis, riskAssessment);
    
    // 生成风控措施
    const riskControls = this.generateRiskControls(riskAssessment, strategyType);
    
    // 生成择时指标
    const timingIndicators = this.generateTimingIndicators(analysis, riskAssessment);

    let strategyDescription = '';
    switch (strategyType) {
      case 'aggressive':
        strategyDescription = '积极进取型策略：精选优质龙头，把握主升浪机会，仓位偏积极';
        break;
      case 'moderate':
        strategyDescription = '稳健平衡型策略：均衡配置，控制风险，追求稳健收益';
        break;
      case 'conservative':
        strategyDescription = '保守防御型策略：精选低风险标的，严格控制仓位，安全第一';
        break;
    }

    if (analysis.hotSpots.length > 0) {
      const topSectors = analysis.hotSpots.slice(0, 2).map(s => s.name).join('和');
      strategyDescription += `，重点关注${topSectors}等强势板块`;
    }

    return {
      recommendedStrategy: strategyDescription,
      strategyType,
      candidates,
      entryPoints,
      stopLoss: stopLossStrategies,
      positionAllocation,
      marketView,
      riskControls,
      timingIndicators
    };
  }

  // 生成市场观点
  private generateMarketView(analysis: AnalysisResponse, riskAssessment: RiskResponse): string {
    const views: string[] = [];
    
    if (analysis.sentimentScore >= 70) {
      views.push('市场情绪偏乐观，资金活跃度较高');
    } else if (analysis.sentimentScore >= 50) {
      views.push('市场情绪中性，多空博弈均衡');
    } else {
      views.push('市场情绪偏谨慎，风险偏好降低');
    }

    if (analysis.hotSpots.length > 0) {
      views.push(`${analysis.hotSpots[0].name}是当前市场主线，持续性评分${analysis.hotSpots[0].sustainabilityScore}`);
    }

    if (riskAssessment.riskLevel === 'high') {
      views.push('市场风险较高，建议降低仓位，控制风险');
    } else if (riskAssessment.riskLevel === 'medium') {
      views.push('市场存在一定风险，需保持谨慎，控制仓位');
    }

    return views.join('；');
  }

  // 生成风控措施
  private generateRiskControls(
    riskAssessment: RiskResponse,
    strategyType: 'aggressive' | 'moderate' | 'conservative'
  ): string[] {
    const controls: string[] = [];

    controls.push('严格执行止损纪律，跌破止损位果断离场');
    controls.push('单只股票仓位不超过20%，避免过度集中');
    
    if (riskAssessment.riskLevel === 'high') {
      controls.push('总仓位控制在40%以内，保持较多现金储备');
      controls.push('避免追高，等待合理回调机会');
    } else if (riskAssessment.riskLevel === 'medium') {
      controls.push('总仓位控制在60%以内，攻守兼备');
    } else {
      controls.push('可适当积极布局，但仍需保持风控意识');
    }

    if (riskAssessment.alerts.length > 0) {
      controls.push('关注风险预警信号，及时调整策略');
    }

    return controls;
  }

  // 生成择时指标
  private generateTimingIndicators(
    analysis: AnalysisResponse,
    riskAssessment: RiskResponse
  ): { marketTiming: number; sectorTiming: { [sector: string]: number } } {
    let marketTiming = 50;
    
    // 基于情绪评分
    marketTiming += (analysis.sentimentScore - 50) * 0.4;
    
    // 基于风险评分
    const riskAdjustment = riskAssessment.riskLevel === 'low' ? 10 : riskAssessment.riskLevel === 'high' ? -15 : 0;
    marketTiming += riskAdjustment;

    const sectorTiming: { [sector: string]: number } = {};
    analysis.hotSpots.forEach(spot => {
      sectorTiming[spot.name] = Math.round(
        spot.strength * 0.6 + spot.sustainabilityScore * 0.4
      );
    });

    return {
      marketTiming: Math.max(0, Math.min(100, Math.round(marketTiming))),
      sectorTiming
    };
  }
}

