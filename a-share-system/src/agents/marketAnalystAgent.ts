
import {
  MarketSnapshot,
  AnalysisResponse,
  HotSpot,
  LeaderStock,
  SectorData,
  StockData,
  FundFlowData,
  NewsItem
} from '@/types';

export interface AnalystProgress {
  step: number;
  totalSteps: number;
  currentStep: string;
  progressPercent: number;
  stepDescription: string;
}

export interface MarketAnalystConfig {
  minHotspotStrength: number;
  maxHotspotSustainabilityThreshold: number;
  sentimentWeightings: {
    priceChange: number;
    volume: number;
    fundFlow: number;
    news: number;
  };
}

const DEFAULT_CONFIG: MarketAnalystConfig = {
  minHotspotStrength: 30,
  maxHotspotSustainabilityThreshold: 60,
  sentimentWeightings: {
    priceChange: 0.4,
    volume: 0.3,
    fundFlow: 0.2,
    news: 0.1
  }
};

export class MarketAnalystAgent {
  private config: MarketAnalystConfig;
  private onProgress?: (progress: AnalystProgress) => void;

  constructor(
    config: Partial<MarketAnalystConfig> = {},
    onProgress?: (progress: AnalystProgress) => void
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
        step,
        totalSteps,
        currentStep,
        progressPercent,
        stepDescription
      });
    }
  }

  async analyzeMarket(snapshot: MarketSnapshot): Promise<AnalysisResponse> {
    console.log('[MarketAnalyst] Starting market analysis...');
    
    const totalSteps = 5;

    this.updateProgress(1, totalSteps, 'analyzing_sectors', '正在分析热门板块...');
    await this.delay(300);

    const hotSpots = this.identifyHotSpots(snapshot.rawData.sectors, snapshot.rawData.fundFlow);

    this.updateProgress(2, totalSteps, 'analyzing_sentiment', '正在计算市场情绪...');
    await this.delay(300);

    const sentimentScore = this.calculateSentimentScore(
      snapshot.rawData.sectors,
      snapshot.rawData.fundFlow,
      snapshot.rawData.news
    );

    this.updateProgress(3, totalSteps, 'identifying_leaders', '正在识别龙头个股...');
    await this.delay(300);

    const leaderStocks = this.identifyLeaderStocks(snapshot.rawData.stocks, hotSpots);

    this.updateProgress(4, totalSteps, 'generating_observations', '正在生成观察结论...');
    await this.delay(300);

    const observations = this.generateObservations(hotSpots, sentimentScore, leaderStocks);

    this.updateProgress(5, totalSteps, 'complete', '分析完成！');
    await this.delay(200);

    const response: AnalysisResponse = {
      hotSpots,
      sentimentScore,
      leaderStocks,
      observations
    };

    console.log('[MarketAnalyst] Analysis complete:', response);
    return response;
  }

  private identifyHotSpots(
    sectors: SectorData[],
    fundFlow: FundFlowData
  ): HotSpot[] {
    const hotSpots: HotSpot[] = [];

    sectors.forEach(sector => {
      const changeStrength = this.calculateHotspotStrength(sector, fundFlow);
      const sustainability = this.calculateSustainability(sector);
      
      const reasoning = this.generateHotspotReasoning(sector, changeStrength, sustainability);

      if (changeStrength >= this.config.minHotspotStrength) {
        hotSpots.push({
          name: sector.name,
          strength: Math.min(changeStrength, 100),
          reasoning: reasoning,
          sustainabilityScore: sustainability
        });
      }
    });

    hotSpots.sort((a, b) => b.strength - a.strength);
    return hotSpots.slice(0, 5);
  }

  private calculateHotspotStrength(
    sector: SectorData, fundFlow: FundFlowData): number {
    let score = 0;
    const changeAbs = Math.abs(sector.changePercent);

    score += Math.min(changeAbs * 5, 40);
    score += Math.min(sector.volume / 100000000000 * 20, 20);

    const sectorFlow = fundFlow.sectorFlows[sector.id] || 0;
    if (sectorFlow > 0) {
      score += Math.min(sectorFlow / 1000000000 * 10, 20);
    }

    if (sector.leaderStocks.length > 0) {
      score += 10;
    }

    return Math.min(score, 100);
  }

  private calculateSustainability(sector: SectorData): number {
    let score = 50;
    const changeAbs = Math.abs(sector.changePercent);
    
    if (changeAbs > 0 && changeAbs < 5) {
      score += 20;
    } else if (changeAbs >= 5) {
      score -= 10;
    }

    if (sector.volume > 500000000000) {
      score += 20;
    }

    if (sector.leaderStocks.length >= 3) {
      score += 10;
    }

    return Math.min(Math.max(score, 0), 100);
  }

  private generateHotspotReasoning(sector: SectorData, strength: number, sustainability: number): string {
    const parts: string[] = [];
    const isPositive = sector.changePercent >= 0;

    if (isPositive) {
      parts.push(`${sector.name}板块今日表现强势，涨幅${sector.changePercent.toFixed(2)}%`);
    } else {
      parts.push(`${sector.name}板块今日出现调整，跌幅${Math.abs(sector.changePercent).toFixed(2)}%`);
    }

    if (sector.volume > 500000000000) {
      parts.push('成交活跃，资金关注度高');
    }

    if (strength >= 70) {
      parts.push('市场热度较高，建议重点关注');
    } else if (strength >= 40) {
      parts.push('有一定市场关注度');
    }

    return parts.join('；');
  }

  private calculateSentimentScore(
    sectors: SectorData[],
    fundFlow: FundFlowData,
    news: NewsItem[]
  ): number {
    let score = 50;
    const weights = this.config.sentimentWeightings;

    const avgChange = sectors.reduce((sum, s) => sum + s.changePercent, 0) / sectors.length;
    const priceScore = Math.max(0, Math.min(100, 50 + avgChange * 5));

    const volumeScore = fundFlow.mainFlow > 0 ? 60 : 40;

    const netFlow = fundFlow.mainFlow + fundFlow.northFlow;
    const flowScore = netFlow > 0 ? 55 : 45;

    const positiveNews = news.filter(n => n.tags?.some(t => ['利好', '增长', '创新'].includes(t)) || false);
    const newsScore = 40 + (positiveNews.length / Math.max(news.length, 1)) * 20;

    score = priceScore * weights.priceChange + 
            volumeScore * weights.volume + 
            flowScore * weights.fundFlow + 
            newsScore * weights.news;

    return Math.round(Math.max(0, Math.min(100, score)));
  }

  private identifyLeaderStocks(
    stocks: StockData[],
    hotSpots: HotSpot[]
  ): LeaderStock[] {
    const leaders: LeaderStock[] = stocks
      .filter(stock => stock.isLeader)
      .sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent))
      .slice(0, 5)
      .map(stock => ({
        code: stock.code,
        name: stock.name,
        changePercent: stock.changePercent,
        leadingScore: this.calculateLeadingScore(stock, hotSpots)
      }));

    leaders.sort((a, b) => b.leadingScore - a.leadingScore);
    return leaders;
  }

  private calculateLeadingScore(stock: StockData, hotSpots: HotSpot[]): number {
    let score = 50;
    const changeAbs = Math.abs(stock.changePercent);

    score += Math.min(changeAbs * 8, 40);
    score += Math.min(stock.volume / 1000000000 * 5, 20);

    return Math.min(score, 100);
  }

  private generateObservations(
    hotSpots: HotSpot[],
    sentimentScore: number,
    leaderStocks: LeaderStock[]
  ): string[] {
    const observations: string[] = [];

    if (sentimentScore >= 60) {
      observations.push('市场情绪整体偏乐观，做多氛围较浓');
    } else if (sentimentScore < 40) {
      observations.push('市场情绪偏谨慎，风险偏好较低');
    } else {
      observations.push('市场情绪中性，多空博弈较为均衡');
    }

    if (hotSpots.length > 0) {
      const topHotspot = hotSpots[0];
      observations.push(`${topHotspot.name}是当前市场主线，强度${topHotspot.strength.toFixed(0)}分`);
    }

    if (hotSpots.length > 1) {
      observations.push('市场存在多个热点，板块轮动效应明显');
    }

    if (leaderStocks.length > 0) {
      const topLeader = leaderStocks[0];
      observations.push(`${topLeader.name}表现强势，领涨效应显著');
    }

    const highSustainability = hotSpots.filter(h => h.sustainabilityScore >= 70);
    if (highSustainability.length > 0) {
      observations.push(`${highSustainability.length}个板块可持续性较强，或可重点关注');
    }

    return observations.slice(0, 5);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
