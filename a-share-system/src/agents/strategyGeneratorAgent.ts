import {
  MarketSnapshot,
  AnalysisResponse,
  RiskResponse,
  StrategyResponse,
  Candidate,
  EntryPoint,
  StopLoss,
  PositionAllocation,
  MarketRegime,
  StrategyMode,
  OpportunityScore,
  RiskMapping,
  SubStrategy,
  StrategyReport
} from '@/types';

// 策略生成器配置
export interface StrategyGeneratorConfig {
  maxCandidates: number;
  positionLimitPerStock: number;
  maxTotalPosition: number;
  minRiskRewardRatio: number;
  stopLossRange: [number, number];
  takeProfitRange: [number, number];
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

// 内部状态存储
interface IngestedData {
  snapshot: MarketSnapshot;
  analysis: AnalysisResponse;
  riskAssessment: RiskResponse;
}

export class StrategyGeneratorAgent {
  private config: StrategyGeneratorConfig;
  private onProgress?: (progress: StrategyGeneratorProgress) => void;
  private ingestedData?: IngestedData;

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
  ): Promise<StrategyReport> {
    console.log('[StrategyGenerator] 深度优化策略生成开始...');
    
    const totalSteps = 8;

    // 步骤 1: 摄入市场分析数据
    this.updateProgress(1, totalSteps, 'ingestMarketAnalysis', '摄入市场分析和风险评估数据...');
    this.ingestMarketAnalysis(snapshot, analysis, riskAssessment);

    // 步骤 2: 摄入风险报告
    this.updateProgress(2, totalSteps, 'ingestRiskReport', '解析风险报告并进行风险映射...');
    const riskMapping = this.ingestRiskReport(riskAssessment);

    // 步骤 3: 检测市场阶段
    this.updateProgress(3, totalSteps, 'detectMarketRegime', '分析市场阶段与热点趋势...');
    const { marketRegime, marketRegimeDescription } = this.detectMarketRegime(snapshot, analysis, riskAssessment);

    // 步骤 4: 事件链因果映射
    this.updateProgress(4, totalSteps, 'mapEventChainToStrategy', '构建事件链对策略的因果影响...');
    const eventChainMap = this.mapEventChainToStrategy(snapshot, analysis);

    // 步骤 5: 计算多维度机会评分
    this.updateProgress(5, totalSteps, 'calculateOpportunityScores', '计算多维度机会评分...');
    const opportunityScores = this.calculateOpportunityScores(analysis, snapshot);

    // 步骤 6: 生成动态仓位规划
    this.updateProgress(6, totalSteps, 'generateDynamicPositionPlan', '基于风险映射生成动态仓位规划...');
    const candidates = this.selectCandidates(snapshot, analysis, riskAssessment, opportunityScores);
    const dynamicPositionPlan = this.generateDynamicPositionPlan(candidates, riskMapping);

    // 步骤 7: 策略优先级排序
    this.updateProgress(7, totalSteps, 'prioritizeStrategies', '进行多策略优先级排序...');
    const { dominantStrategy, secondaryStrategies } = this.prioritizeStrategies(
      marketRegime,
      riskMapping,
      opportunityScores,
      analysis
    );

    // 步骤 8: 生成深度结构化策略报告
    this.updateProgress(8, totalSteps, 'generateStrategyReport', '生成深度结构化策略报告...');
    const strategyReport = this.generateStrategyReport(
      dominantStrategy,
      secondaryStrategies,
      marketRegime,
      marketRegimeDescription,
      riskMapping,
      opportunityScores,
      eventChainMap,
      dynamicPositionPlan,
      snapshot,
      analysis,
      candidates
    );

    console.log('[StrategyGenerator] 深度优化策略生成完成！');
    return strategyReport;
  }

  // 步骤 1: 摄入市场分析数据
  private ingestMarketAnalysis(
    snapshot: MarketSnapshot,
    analysis: AnalysisResponse,
    riskAssessment: RiskResponse
  ): void {
    this.ingestedData = {
      snapshot,
      analysis,
      riskAssessment
    };
    console.log('[StrategyGenerator] 市场分析数据摄入完成');
  }

  // 步骤 2: 摄入风险报告并进行风险映射
  private ingestRiskReport(riskAssessment: RiskResponse): RiskMapping {
    // 根据风险级别进行风险映射
    const riskMappings: Record<string, RiskMapping> = {
      low: {
        riskLevel: 'low',
        maxPosition: 85,
        singleStockMaxPosition: 25,
        stopLossPercentage: 12,
        takeProfitMultiple: 2.5,
        recommendedMode: 'trend',
        riskBudget: 30
      },
      medium: {
        riskLevel: 'medium',
        maxPosition: 60,
        singleStockMaxPosition: 18,
        stopLossPercentage: 8,
        takeProfitMultiple: 2.0,
        recommendedMode: 'relay',
        riskBudget: 20
      },
      high: {
        riskLevel: 'high',
        maxPosition: 40,
        singleStockMaxPosition: 12,
        stopLossPercentage: 5,
        takeProfitMultiple: 1.5,
        recommendedMode: 'defensive',
        riskBudget: 10
      }
    };

    const mapping = riskMappings[riskAssessment.riskLevel] || riskMappings.medium;
    console.log('[StrategyGenerator] 风险映射完成:', mapping);
    return mapping;
  }

  // 步骤 3: 检测市场阶段
  private detectMarketRegime(
    snapshot: MarketSnapshot,
    analysis: AnalysisResponse,
    riskAssessment: RiskResponse
  ): { marketRegime: MarketRegime; marketRegimeDescription: string } {
    const sentimentScore = analysis.sentimentScore;
    const volatility = riskAssessment.volatilityScore;
    const hasHotspots = analysis.hotSpots.filter(h => h.strength >= 60).length;

    let regime: MarketRegime = 'consolidation';
    let description = '';

    if (sentimentScore >= 70 && hasHotspots >= 2) {
      regime = 'trending_bullish';
      description = '市场处于趋势上涨阶段，情绪乐观，热点明确';
    } else if (sentimentScore <= 30 && volatility >= 60) {
      regime = 'trending_bearish';
      description = '市场处于趋势下跌阶段，情绪悲观，波动加剧';
    } else if (sentimentScore >= 60 && sentimentScore < 70) {
      regime = 'rally';
      description = '市场处于反弹阶段，情绪修复，关注持续性';
    } else if (sentimentScore >= 40 && sentimentScore < 60 && volatility < 50) {
      regime = 'consolidation';
      description = '市场处于震荡整理阶段，多空平衡，等待方向选择';
    } else if (sentimentScore >= 30 && sentimentScore < 50) {
      regime = 'correction';
      description = '市场处于回调阶段，关注低吸机会';
    } else if (volatility >= 70) {
      regime = 'volatile';
      description = '市场处于高波动阶段，谨慎操作，控制仓位';
    } else {
      regime = 'low_activity';
      description = '市场活跃度较低，观望为主';
    }

    console.log('[StrategyGenerator] 市场阶段检测:', regime);
    return { marketRegime: regime, marketRegimeDescription: description };
  }

  // 步骤 4: 事件链因果映射
  private mapEventChainToStrategy(snapshot: MarketSnapshot, analysis: AnalysisResponse): StrategyReport['eventChainMap'] {
    const eventChainMap: StrategyReport['eventChainMap'] = {};
    const allEvents = [
      ...(snapshot.events || []),
      ...(snapshot.realtimeEvents || [])
    ];

    // 事件影响映射
    const eventTypeImpacts: Record<string, { impact: 'positive' | 'negative' | 'neutral'; action: any }> = {
      hotspot_emergence: { impact: 'positive', action: 'accumulate' },
      volume_spike: { impact: 'positive', action: 'hold' },
      price_breakout: { impact: 'positive', action: 'hold' },
      news_trigger: { impact: 'neutral', action: 'hold' },
      sector_rotation: { impact: 'positive', action: 'accumulate' }
    };

    allEvents.forEach(event => {
      const eventType = event.type;
      if (!eventChainMap[eventType]) {
        eventChainMap[eventType] = [];
      }

      const impactedSectors = analysis.hotSpots.map(h => h.name).slice(0, 3);
      const impactConfig = eventTypeImpacts[eventType] || { impact: 'neutral', action: 'hold' };

      eventChainMap[eventType].push({
        impact: impactConfig.impact,
        affectedSectors: impactedSectors,
        recommendedAction: impactConfig.action
      });
    });

    console.log('[StrategyGenerator] 事件链因果映射完成');
    return eventChainMap;
  }

  // 步骤 5: 计算多维度机会评分
  private calculateOpportunityScores(
    analysis: AnalysisResponse,
    snapshot: MarketSnapshot
  ): OpportunityScore[] {
    const opportunityScores: OpportunityScore[] = [];

    analysis.hotSpots.forEach(hotspot => {
      // 事件共振评分
      const eventResonanceScore = hotspot.relatedEvents && hotspot.relatedEvents.length > 0 
        ? Math.min(100, 50 + hotspot.relatedEvents.length * 10)
        : 50;

      // 资金活跃度评分
      const capitalActivityScore = hotspot.capitalActivity || 60;

      // 热点持续性评分
      const sustainabilityScore = hotspot.sustainabilityScore || 50;

      // 板块强度评分
      const sectorStrengthScore = hotspot.strength;

      // 估值评分（简化版）
      const valuationScore = hotspot.momentumScore && hotspot.momentumScore > 70 
        ? Math.max(40, 80 - (hotspot.momentumScore - 70))
        : 60;

      // 综合评分
      const totalScore = Math.round(
        eventResonanceScore * 0.25 +
        capitalActivityScore * 0.20 +
        sustainabilityScore * 0.25 +
        sectorStrengthScore * 0.20 +
        valuationScore * 0.10
      );

      // 盈亏比估算
      const riskRewardRatio = sustainabilityScore >= 70 ? 2.5 : sustainabilityScore >= 50 ? 2.0 : 1.5;

      opportunityScores.push({
        sectorName: hotspot.name,
        totalScore,
        eventResonanceScore,
        capitalActivityScore,
        sustainabilityScore,
        sectorStrengthScore,
        valuationScore,
        riskRewardRatio
      });
    });

    // 按总分排序
    opportunityScores.sort((a, b) => b.totalScore - a.totalScore);
    console.log('[StrategyGenerator] 多维度机会评分完成');
    return opportunityScores;
  }

  // 步骤 6: 生成动态仓位规划
  private generateDynamicPositionPlan(
    candidates: Candidate[],
    riskMapping: RiskMapping
  ): PositionAllocation & { reasoning: string; contingencyPlan: string } {
    const totalScore = candidates.reduce((sum, c) => sum + (c.score || 50), 0);
    const totalPosition = riskMapping.maxPosition;
    const individualAllocations: { [code: string]: number } = {};
    const sectorAllocations: { [sector: string]: number } = {};

    candidates.forEach(candidate => {
      const weight = (candidate.score || 50) / totalScore;
      const allocation = Math.min(
        riskMapping.singleStockMaxPosition,
        Math.round((totalPosition * weight) * 100) / 100
      );
      
      candidate.allocation = allocation;
      individualAllocations[candidate.code] = allocation;
      sectorAllocations[candidate.sector] = (sectorAllocations[candidate.sector] || 0) + allocation;
    });

    const cashReserve = 100 - totalPosition;

    const reasoning = `基于${riskMapping.riskLevel}风险等级，总仓位控制在${totalPosition}%，单票仓位不超过${riskMapping.singleStockMaxPosition}%。`;
    
    const contingencyPlan = `若市场波动加剧，风险等级提升，总仓位降低至${Math.max(20, totalPosition - 20)}%；若热点持续性超预期，可适当加仓至${Math.min(100, totalPosition + 10)}%。`;

    console.log('[StrategyGenerator] 动态仓位规划生成完成');
    return {
      totalPosition,
      sectorAllocations,
      individualAllocations,
      cashReserve,
      reasoning,
      contingencyPlan
    };
  }

  // 步骤 7: 策略优先级排序（实现5种策略模式）
  private prioritizeStrategies(
    marketRegime: MarketRegime,
    riskMapping: RiskMapping,
    opportunityScores: OpportunityScore[],
    analysis: AnalysisResponse
  ): { dominantStrategy: SubStrategy; secondaryStrategies: SubStrategy[] } {
    const allStrategies: SubStrategy[] = [];

    // 策略模式配置
    const strategyConfigs: Record<StrategyMode, { name: string; description: string }> = {
      trend: {
        name: '趋势策略',
        description: '追踪强势板块龙头，顺势而为，持有为主'
      },
      relay: {
        name: '接力策略',
        description: '在板块轮动中捕捉接力机会，灵活切换'
      },
      rotation_low_suction: {
        name: '低吸轮动策略',
        description: '等待回调机会，轮动布局，波段操作'
      },
      defensive: {
        name: '防守策略',
        description: '控制仓位，精选低风险标的，安全第一'
      },
      observation: {
        name: '观察策略',
        description: '轻仓或空仓观望，等待明确信号'
      }
    };

    // 根据市场阶段和风险等级计算各策略的适用性得分
    Object.keys(strategyConfigs).forEach(modeStr => {
      const mode = modeStr as StrategyMode;
      let baseScore = 50;
      let suitability: 'high' | 'medium' | 'low' = 'medium';

      // 根据市场阶段调整得分
      switch (marketRegime) {
        case 'trending_bullish':
          if (mode === 'trend') { baseScore += 30; suitability = 'high'; }
          if (mode === 'relay') { baseScore += 15; suitability = 'medium'; }
          if (mode === 'defensive') { baseScore -= 20; suitability = 'low'; }
          break;
        case 'rally':
          if (mode === 'relay') { baseScore += 25; suitability = 'high'; }
          if (mode === 'rotation_low_suction') { baseScore += 20; suitability = 'medium'; }
          break;
        case 'consolidation':
          if (mode === 'rotation_low_suction') { baseScore += 25; suitability = 'high'; }
          if (mode === 'relay') { baseScore += 15; suitability = 'medium'; }
          break;
        case 'trending_bearish':
        case 'volatile':
          if (mode === 'defensive') { baseScore += 30; suitability = 'high'; }
          if (mode === 'observation') { baseScore += 20; suitability = 'medium'; }
          break;
        default:
          if (mode === 'observation') { baseScore += 15; suitability = 'medium'; }
      }

      // 根据风险等级调整
      if (riskMapping.riskLevel === 'low' && (mode === 'trend' || mode === 'relay')) {
        baseScore += 15;
      }
      if (riskMapping.riskLevel === 'high' && (mode === 'defensive' || mode === 'observation')) {
        baseScore += 15;
      }

      allStrategies.push({
        id: mode,
        mode,
        name: strategyConfigs[mode].name,
        description: strategyConfigs[mode].description,
        priority: 0,
        score: Math.max(0, Math.min(100, baseScore)),
        rationale: this.generateStrategyRationale(mode, marketRegime, riskMapping),
        suitability
      });
    });

    // 排序并分配优先级
    allStrategies.sort((a, b) => b.score - a.score);
    allStrategies.forEach((strategy, index) => {
      strategy.priority = index + 1;
    });

    const dominantStrategy = allStrategies[0];
    const secondaryStrategies = allStrategies.slice(1, 4);

    console.log('[StrategyGenerator] 策略优先级排序完成');
    return { dominantStrategy, secondaryStrategies };
  }

  // 生成策略合理性说明
  private generateStrategyRationale(
    mode: StrategyMode,
    marketRegime: MarketRegime,
    riskMapping: RiskMapping
  ): string {
    const rationales: Record<StrategyMode, string> = {
      trend: `当前${this.getRegimeDescription(marketRegime)}，风险等级${riskMapping.riskLevel}，适合顺势而为，把握主升浪机会。`,
      relay: `市场存在轮动特征，通过接力策略捕捉板块切换机会，提高资金效率。`,
      rotation_low_suction: `震荡市场环境下，避免追高，等待回调机会进行轮动布局。`,
      defensive: `考虑到市场风险较高，优先控制风险，精选低波动标的，稳健为主。`,
      observation: `市场方向不明，保持观望，等待更明确的信号出现再行动。`
    };
    return rationales[mode];
  }

  private getRegimeDescription(regime: MarketRegime): string {
    const descriptions: Record<MarketRegime, string> = {
      trending_bullish: '趋势上涨',
      trending_bearish: '趋势下跌',
      rally: '反弹',
      consolidation: '震荡整理',
      correction: '回调',
      volatile: '高波动',
      low_activity: '低活跃度'
    };
    return descriptions[regime];
  }

  // 步骤 8: 生成深度结构化策略报告
  private generateStrategyReport(
    dominantStrategy: SubStrategy,
    secondaryStrategies: SubStrategy[],
    marketRegime: MarketRegime,
    marketRegimeDescription: string,
    riskMapping: RiskMapping,
    opportunityScores: OpportunityScore[],
    eventChainMap: StrategyReport['eventChainMap'],
    dynamicPositionPlan: PositionAllocation & { reasoning: string; contingencyPlan: string },
    snapshot: MarketSnapshot,
    analysis: AnalysisResponse,
    candidates: Candidate[]
  ): StrategyReport {
    // 生成兼容的基础策略响应
    const basicStrategy = this.generateBasicStrategyResponse(
      analysis,
      { riskLevel: riskMapping.riskLevel, volatilityScore: riskMapping.riskBudget },
      candidates,
      snapshot,
      dominantStrategy.mode
    );

    // 策略说明
    const strategyExplanation = {
      marketCausalityUnderstanding: this.generateMarketCausalityUnderstanding(analysis, marketRegime, eventChainMap),
      riskControlLogic: this.generateRiskControlLogic(riskMapping, dynamicPositionPlan),
      opportunityRationale: this.generateOpportunityRationale(opportunityScores),
      strategySwitchingRules: this.generateStrategySwitchingRules(dominantStrategy, secondaryStrategies)
    };

    console.log('[StrategyGenerator] 深度策略报告生成完成');
    return {
      dominantStrategy,
      secondaryStrategies,
      marketRegime,
      marketRegimeDescription,
      riskMapping,
      opportunityScores,
      eventChainMap,
      dynamicPositionPlan,
      strategyExplanation,
      // 兼容基础响应
      ...basicStrategy
    };
  }

  // 生成市场因果理解
  private generateMarketCausalityUnderstanding(
    analysis: AnalysisResponse,
    marketRegime: MarketRegime,
    eventChainMap: StrategyReport['eventChainMap']
  ): string {
    const mainHotspot = analysis.hotSpots[0];
    const eventCount = Object.keys(eventChainMap).length;
    
    let understanding = `当前市场处于${this.getRegimeDescription(marketRegime)}阶段。`;
    if (mainHotspot) {
      understanding += `${mainHotspot.name}是主线热点，强度${mainHotspot.strength}分，持续性${mainHotspot.sustainabilityScore}分。`;
    }
    if (eventCount > 0) {
      understanding += `${eventCount}个事件驱动市场，关注事件共振效应。`;
    }
    return understanding;
  }

  // 生成风险控制逻辑
  private generateRiskControlLogic(
    riskMapping: RiskMapping,
    dynamicPositionPlan: PositionAllocation & { reasoning: string; contingencyPlan: string }
  ): string {
    return `风险等级${riskMapping.riskLevel}，总仓位控制在${riskMapping.maxPosition}%，单票仓位不超过${riskMapping.singleStockMaxPosition}%，止损幅度${riskMapping.stopLossPercentage}%。${dynamicPositionPlan.reasoning}应急预案：${dynamicPositionPlan.contingencyPlan}`;
  }

  // 生成机会原理
  private generateOpportunityRationale(opportunityScores: OpportunityScore[]): string {
    const topOpportunity = opportunityScores[0];
    if (!topOpportunity) return '暂无明确机会';
    
    return `${topOpportunity.sectorName}综合机会评分${topOpportunity.totalScore}分，其中事件共振${topOpportunity.eventResonanceScore}分，资金活跃${topOpportunity.capitalActivityScore}分，持续性${topOpportunity.sustainabilityScore}分，板块强度${topOpportunity.sectorStrengthScore}分，估值${topOpportunity.valuationScore}分，盈亏比${topOpportunity.riskRewardRatio}:1。`;
  }

  // 生成策略切换规则
  private generateStrategySwitchingRules(
    dominantStrategy: SubStrategy,
    secondaryStrategies: SubStrategy[]
  ): string {
    return `当前主策略：${dominantStrategy.name}。切换条件：1) 若热点持续性下降超过20分，切换至${secondaryStrategies[0]?.name || '防守策略'}；2) 若风险等级提升，切换至防御策略；3) 若市场出现新的强势热点，灵活调整。`;
  }

  // 生成兼容的基础策略响应
  private generateBasicStrategyResponse(
    analysis: AnalysisResponse,
    riskAssessment: { riskLevel: 'low' | 'medium' | 'high'; volatilityScore: number },
    candidates: Candidate[],
    snapshot: MarketSnapshot,
    strategyMode: StrategyMode
  ): StrategyResponse {
    // 策略类型映射
    const strategyTypeMap: Record<StrategyMode, 'aggressive' | 'moderate' | 'conservative'> = {
      trend: 'aggressive',
      relay: 'moderate',
      rotation_low_suction: 'moderate',
      defensive: 'conservative',
      observation: 'conservative'
    };

    const strategyType = strategyTypeMap[strategyMode];
    
    // 生成入场点
    const entryPoints = this.calculateEntryPoints(candidates, snapshot, strategyType);
    
    // 生成止损止盈
    const stopLoss = this.setStopLossTakeProfit(candidates, snapshot, strategyType);
    
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
      stopLoss,
      positionAllocation: {
        totalPosition: candidates.reduce((sum, c) => sum + (c.allocation || 0), 0),
        sectorAllocations: {},
        individualAllocations: candidates.reduce((acc, c) => { acc[c.code] = c.allocation || 0; return acc; }, {}),
        cashReserve: 100 - candidates.reduce((sum, c) => sum + (c.allocation || 0), 0)
      },
      marketView,
      riskControls,
      timingIndicators
    };
  }

  // 辅助方法：选择候选标的（结合机会评分）
  private selectCandidates(
    snapshot: MarketSnapshot,
    analysis: AnalysisResponse,
    riskAssessment: RiskResponse,
    opportunityScores: OpportunityScore[]
  ): Candidate[] {
    const { stocks } = snapshot.rawData;
    const { hotSpots, leaderStocks } = analysis;

    // 建立板块机会评分映射
    const sectorOpportunityMap = new Map(
      opportunityScores.map(os => [os.sectorName, os])
    );

    const candidates: Candidate[] = [];

    // 首先优先处理龙头股
    leaderStocks.forEach(leader => {
      const stock = stocks.find(s => s.code === leader.code);
      if (stock) {
        const sectorName = this.findSectorForStock(stock, snapshot);
        const sectorOpportunity = sectorOpportunityMap.get(sectorName);
        
        const score = Math.round(
          (sectorOpportunity?.totalScore || 50) * 0.6 +
          (leader.leadingScore || 50) * 0.4
        );

        candidates.push({
          code: stock.code,
          name: stock.name,
          sector: sectorName,
          score,
          rationale: `${stock.name}是${sectorName}板块龙头，综合机会评分${score}分`,
          momentumScore: Math.max(0, Math.min(100, 50 + stock.changePercent * 5)),
          valuationScore: sectorOpportunity?.valuationScore || 60,
          riskScore: this.calculateRiskScore(stock, riskAssessment),
          leaderScore: leader.leadingScore
        });
      }
    });

    // 补充其他优质股票
    stocks.filter(s => s.isLeader || s.changePercent > 3).forEach(stock => {
      if (!candidates.find(c => c.code === stock.code)) {
        const sectorName = this.findSectorForStock(stock, snapshot);
        const sectorOpportunity = sectorOpportunityMap.get(sectorName);
        const score = sectorOpportunity ? Math.round(sectorOpportunity.totalScore * 0.8) : 50;
        
        if (score >= 45) {
          candidates.push({
            code: stock.code,
            name: stock.name,
            sector: sectorName,
            score,
            rationale: `${stock.name}来自${sectorName}板块，综合评分${score}分`,
            momentumScore: Math.max(0, Math.min(100, 50 + stock.changePercent * 5)),
            valuationScore: sectorOpportunity?.valuationScore || 60,
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

  // 辅助方法：查找股票所属板块
  private findSectorForStock(stock: any, snapshot: MarketSnapshot): string {
    if (stock.sectorId) {
      const sector = snapshot.rawData.sectors.find(s => s.id === stock.sectorId);
      if (sector) return sector.name;
    }
    return '其他';
  }

  // 辅助方法：计算风险评分
  private calculateRiskScore(stock: any, riskAssessment: { riskLevel: 'low' | 'medium' | 'high'; volatilityScore: number }): number {
    let score = 50;
    const volatility = riskAssessment.volatilityScore;
    
    if (volatility > 70) {
      score -= 15;
    } else if (volatility < 40) {
      score += 10;
    }

    if (Math.abs(stock.changePercent) > 7) {
      score -= 10;
    }

    return Math.max(0, Math.min(100, score));
  }

  // 辅助方法：计算入场点
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

  // 辅助方法：设置止损止盈
  private setStopLossTakeProfit(
    candidates: Candidate[],
    snapshot: MarketSnapshot,
    strategyType: 'aggressive' | 'moderate' | 'conservative'
  ): StopLoss[] {
    const stopLossStrategies: StopLoss[] = [];
    const { stocks } = snapshot.rawData;

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

  // 辅助方法：生成市场观点
  private generateMarketView(analysis: AnalysisResponse, riskAssessment: { riskLevel: 'low' | 'medium' | 'high'; volatilityScore: number }): string {
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

  // 辅助方法：生成风控措施
  private generateRiskControls(
    riskAssessment: { riskLevel: 'low' | 'medium' | 'high'; volatilityScore: number },
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

    controls.push('关注事件驱动因素，及时调整策略');

    return controls;
  }

  // 辅助方法：生成择时指标
  private generateTimingIndicators(
    analysis: AnalysisResponse,
    riskAssessment: { riskLevel: 'low' | 'medium' | 'high'; volatilityScore: number }
  ): { marketTiming: number; sectorTiming: { [sector: string]: number } } {
    let marketTiming = 50;
    
    marketTiming += (analysis.sentimentScore - 50) * 0.4;
    
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
