import {
  MarketSnapshot,
  AnalysisResponse,
  RiskResponse,
  RiskFactor,
  Alert
} from '@/types';

// 风险评估配置
export interface RiskAssessorConfig {
  volatilityThreshold: {
    low: number;
    medium: number;
    high: number;
  };
  concentrationThreshold: number;
  liquidityThreshold: number;
  valuationThreshold: number;
  maxRiskFactors: number;
  maxAlerts: number;
}

// 进度回调
export interface RiskAssessorProgress {
  progressPercent: number;
  currentStep: string;
  stepDescription: string;
}

// 默认配置
const DEFAULT_CONFIG: RiskAssessorConfig = {
  volatilityThreshold: { low: 30, medium: 60, high: 80 },
  concentrationThreshold: 40,
  liquidityThreshold: 50,
  valuationThreshold: 70,
  maxRiskFactors: 5,
  maxAlerts: 3
};

// 风险因子类型
type RiskType = 'volatility' | 'concentration' | 'liquidity' | 'valuation' | 'macro' | 'sentiment';

// 详细风险因子
interface DetailedRiskFactor {
  type: RiskType;
  name: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  score: number;
}

export class RiskAssessorAgent {
  private config: RiskAssessorConfig;
  private onProgress?: (progress: RiskAssessorProgress) => void;

  constructor(
    config: Partial<RiskAssessorConfig> = {},
    onProgress?: (progress: RiskAssessorProgress) => void
  ) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.onProgress = onProgress;
  }

  private updateProgress(step: number, totalSteps: number, stepName: string, description: string) {
    if (this.onProgress) {
      this.onProgress({
        progressPercent: Math.round((step / totalSteps) * 100),
        currentStep: stepName,
        stepDescription: description
      });
    }
  }

  async assessRisk(
    snapshot: MarketSnapshot,
    analysis: AnalysisResponse
  ): Promise<RiskResponse> {
    console.log('[RiskAssessor] 开始风险评估...');
    this.updateProgress(1, 5, 'analyzing_volatility', '正在评估市场波动率...');

    // 步骤1: 评估市场波动率
    const volatilityScore = this.assessVolatility(snapshot);
    this.updateProgress(2, 5, 'analyzing_concentration', '正在评估板块集中度风险...');

    // 步骤2: 评估板块集中度风险
    const concentrationRisk = this.assessConcentration(snapshot, analysis);
    this.updateProgress(3, 5, 'analyzing_liquidity', '正在评估流动性风险...');

    // 步骤3: 评估流动性风险
    const liquidityRisk = this.assessLiquidity(snapshot);
    this.updateProgress(4, 5, 'identifying_factors', '正在识别风险因子...');

    // 步骤4: 综合评估所有风险因子
    const allRiskFactors = this.identifyRiskFactors(
      snapshot,
      analysis,
      volatilityScore,
      concentrationRisk,
      liquidityRisk
    );
    this.updateProgress(5, 5, 'generating_alerts', '正在生成风险预警...');

    // 步骤5: 生成风险预警和最终评估
    const riskLevel = this.calculateOverallRiskLevel(
      volatilityScore,
      allRiskFactors
    );
    const alerts = this.generateAlerts(allRiskFactors, analysis);

    console.log('[RiskAssessor] 风险评估完成:', { riskLevel, volatilityScore });

    return {
      riskLevel,
      volatilityScore,
      riskFactors: allRiskFactors.slice(0, this.config.maxRiskFactors).map(f => f.description),
      alerts: alerts.slice(0, this.config.maxAlerts)
    };
  }

  // 评估市场波动率
  private assessVolatility(snapshot: MarketSnapshot): number {
    const { rawData, summary } = snapshot;
    let score = 0;

    // 1. 基于板块涨跌幅离散度计算波动率
    if (rawData.sectors && rawData.sectors.length > 0) {
      const changes = rawData.sectors.map(s => Math.abs(s.changePercent));
      const avgChange = changes.reduce((a, b) => a + b, 0) / changes.length;
      const variance = changes.reduce((sum, change) => sum + Math.pow(change - avgChange, 2), 0) / changes.length;
      const stdDev = Math.sqrt(variance);
      
      // 标准化到0-100
      score += Math.min(stdDev * 8, 40);
    }

    // 2. 基于快照中的波动率评分
    if (summary.volatilityScore) {
      score += summary.volatilityScore * 0.4;
    }

    // 3. 基于市场事件数量
    if (snapshot.events && snapshot.events.length > 0) {
      const highSeverityEvents = snapshot.events.filter(e => e.severity === 'high').length;
      score += highSeverityEvents * 10;
    }

    return Math.min(Math.max(score, 0), 100);
  }

  // 评估板块集中度风险
  private assessConcentration(snapshot: MarketSnapshot, analysis: AnalysisResponse): number {
    let score = 0;

    // 1. 检查热点板块强度分布
    if (analysis.hotSpots && analysis.hotSpots.length > 0) {
      const topStrength = analysis.hotSpots[0].strength;
      const secondStrength = analysis.hotSpots.length > 1 ? analysis.hotSpots[1].strength : 0;
      const gap = topStrength - secondStrength;
      
      // 如果第一名远超第二名，说明集中度高，风险大
      if (gap > 20) {
        score += 30;
      } else if (gap > 10) {
        score += 15;
      }
    }

    // 2. 检查资金流向集中度
    if (snapshot.rawData.fundFlow && snapshot.rawData.fundFlow.sectorFlows) {
      const flows = Object.values(snapshot.rawData.fundFlow.sectorFlows);
      const maxFlow = Math.max(...flows.map(Math.abs));
      const totalFlow = flows.reduce((sum, f) => sum + Math.abs(f), 0);
      
      if (totalFlow > 0) {
        const concentrationRatio = (maxFlow / totalFlow) * 100;
        if (concentrationRatio > this.config.concentrationThreshold) {
          score += 20;
        }
      }
    }

    return Math.min(score, 50);
  }

  // 评估流动性风险
  private assessLiquidity(snapshot: MarketSnapshot): number {
    let score = 0;

    if (snapshot.rawData.stocks && snapshot.rawData.stocks.length > 0) {
      // 1. 检查成交量是否异常低
      const volumes = snapshot.rawData.stocks.map(s => s.volume);
      const avgVolume = volumes.reduce((a, b) => a + b, 0) / volumes.length;
      
      // 假设基准成交量，这里简化处理
      const benchmarkVolume = 500000000; // 5亿
      if (avgVolume < benchmarkVolume * 0.5) {
        score += 30;
      } else if (avgVolume < benchmarkVolume * 0.8) {
        score += 15;
      }
    }

    // 2. 检查北向资金流向
    if (snapshot.rawData.fundFlow && snapshot.rawData.fundFlow.northFlow !== undefined) {
      const northFlow = snapshot.rawData.fundFlow.northFlow;
      if (northFlow < -5000000000) { // 净流出超过50亿
        score += 20;
      } else if (northFlow < -2000000000) { // 净流出超过20亿
        score += 10;
      }
    }

    return Math.min(score, 50);
  }

  // 识别所有风险因子
  private identifyRiskFactors(
    snapshot: MarketSnapshot,
    analysis: AnalysisResponse,
    volatilityScore: number,
    concentrationRisk: number,
    liquidityRisk: number
  ): DetailedRiskFactor[] {
    const factors: DetailedRiskFactor[] = [];

    // 1. 波动率风险
    if (volatilityScore >= this.config.volatilityThreshold.high) {
      factors.push({
        type: 'volatility',
        name: '高波动率风险',
        description: '市场波动剧烈，追高风险较大',
        severity: 'high',
        score: volatilityScore
      });
    } else if (volatilityScore >= this.config.volatilityThreshold.medium) {
      factors.push({
        type: 'volatility',
        name: '中等波动率风险',
        description: '市场存在一定波动，需注意风险控制',
        severity: 'medium',
        score: volatilityScore
      });
    }

    // 2. 集中度风险
    if (concentrationRisk >= 30) {
      factors.push({
        type: 'concentration',
        name: '板块集中度风险',
        description: '资金过度集中于少数板块，轮动风险加剧',
        severity: 'high',
        score: concentrationRisk
      });
    } else if (concentrationRisk >= 15) {
      factors.push({
        type: 'concentration',
        name: '板块轻度集中',
        description: '板块轮动速度加快，避免追高',
        severity: 'medium',
        score: concentrationRisk
      });
    }

    // 3. 流动性风险
    if (liquidityRisk >= 30) {
      factors.push({
        type: 'liquidity',
        name: '流动性风险',
        description: '市场流动性不足，成交清淡',
        severity: 'high',
        score: liquidityRisk
      });
    } else if (liquidityRisk >= 15) {
      factors.push({
        type: 'liquidity',
        name: '轻度流动性压力',
        description: '北向资金流出，需关注资金面变化',
        severity: 'medium',
        score: liquidityRisk
      });
    }

    // 4. 估值风险（基于热点板块可持续性）
    if (analysis.hotSpots && analysis.hotSpots.length > 0) {
      const lowSustainabilitySpots = analysis.hotSpots.filter(s => s.sustainabilityScore < 50);
      if (lowSustainabilitySpots.length > 0) {
        factors.push({
          type: 'valuation',
          name: '估值风险',
          description: `部分热点板块持续性较差：${lowSustainabilitySpots.map(s => s.name).join('、')}`,
          severity: lowSustainabilitySpots.length >= 2 ? 'high' : 'medium',
          score: 60
        });
      }
    }

    // 5. 情绪风险
    if (analysis.sentimentScore > 80) {
      factors.push({
        type: 'sentiment',
        name: '情绪过热风险',
        description: '市场情绪过于乐观，需警惕回调风险',
        severity: 'high',
        score: 75
      });
    } else if (analysis.sentimentScore < 30) {
      factors.push({
        type: 'sentiment',
        name: '情绪低迷风险',
        description: '市场情绪低迷，观望氛围浓厚',
        severity: 'medium',
        score: 55
      });
    }

    // 6. 新闻风险因子
    if (snapshot.rawData.news && snapshot.rawData.news.length > 0) {
      const negativeNews = snapshot.rawData.news.filter(n => 
        n.tags?.some(t => ['风险', '下跌', '利空', '警告'].includes(t))
      );
      if (negativeNews.length > 0) {
        factors.push({
          type: 'macro',
          name: '消息面风险',
          description: `存在负面消息：${negativeNews[0].title}`,
          severity: 'medium',
          score: 45
        });
      }
    }

    // 按严重程度和分数排序
    return factors.sort((a, b) => {
      const severityOrder = { high: 3, medium: 2, low: 1 };
      const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
      if (severityDiff !== 0) return severityDiff;
      return b.score - a.score;
    });
  }

  // 计算整体风险等级
  private calculateOverallRiskLevel(
    volatilityScore: number,
    riskFactors: DetailedRiskFactor[]
  ): 'low' | 'medium' | 'high' {
    let score = volatilityScore * 0.5;

    // 加上风险因子的贡献
    riskFactors.forEach(factor => {
      const weight = factor.severity === 'high' ? 0.3 : factor.severity === 'medium' ? 0.15 : 0.05;
      score += factor.score * weight;
    });

    if (score >= 70) return 'high';
    if (score >= 40) return 'medium';
    return 'low';
  }

  // 生成风险预警
  private generateAlerts(
    riskFactors: DetailedRiskFactor[],
    analysis: AnalysisResponse
  ): Alert[] {
    const alerts: Alert[] = [];
    let alertId = 1;

    // 高风险因子生成预警
    riskFactors.filter(f => f.severity === 'high').forEach(factor => {
      alerts.push({
        id: `a${alertId++}`,
        type: 'danger',
        title: factor.name,
        message: factor.description,
        timestamp: new Date().toISOString()
      });
    });

    // 中等风险因子生成提示
    riskFactors.filter(f => f.severity === 'medium').slice(0, 2).forEach(factor => {
      alerts.push({
        id: `a${alertId++}`,
        type: 'warning',
        title: factor.name,
        message: factor.description,
        timestamp: new Date().toISOString()
      });
    });

    // 补充市场情绪提示
    if (analysis.sentimentScore > 70) {
      alerts.push({
        id: `a${alertId++}`,
        type: 'info',
        title: '市场情绪监测',
        message: '当前市场情绪偏乐观，但需保持理性，避免追高',
        timestamp: new Date().toISOString()
      });
    } else if (analysis.sentimentScore < 40) {
      alerts.push({
        id: `a${alertId++}`,
        type: 'info',
        title: '市场情绪监测',
        message: '当前市场情绪偏谨慎，可耐心等待机会',
        timestamp: new Date().toISOString()
      });
    }

    return alerts;
  }
}
