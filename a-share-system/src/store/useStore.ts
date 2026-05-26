import { create } from 'zustand';
import { 
  Agent, 
  AgentName, 
  AgentStatus, 
  AnalysisState,
  MarketDataResponse,
  AnalysisResponse,
  RiskResponse,
  StrategyResponse,
  TradingDecision
} from '@/types';

interface AppState {
  // Agents
  agents: Agent[];
  updateAgent: (id: AgentName, updates: Partial<Agent>) => void;
  resetAgents: () => void;
  
  // Analysis
  analysisState: AnalysisState;
  setAnalysisState: (state: Partial<AnalysisState>) => void;
  startAnalysis: () => void;
  completeStep: (agentName: AgentName, data: any) => void;
  resetAnalysis: () => void;
  
  // Data
  marketData: MarketDataResponse | null;
  analysis: AnalysisResponse | null;
  riskAssessment: RiskResponse | null;
  strategy: StrategyResponse | null;
  decision: TradingDecision | null;
  setMarketData: (data: MarketDataResponse) => void;
  setAnalysis: (data: AnalysisResponse) => void;
  setRiskAssessment: (data: RiskResponse) => void;
  setStrategy: (data: StrategyResponse) => void;
  setDecision: (data: TradingDecision) => void;
  
  // UI
  activePage: 'dashboard' | 'market' | 'analysis' | 'risk' | 'strategy';
  setActivePage: (page: AppState['activePage']) => void;
}

// Initial agents
const initialAgents: Agent[] = [
  {
    id: 'dataCollector',
    name: '数据收集Agent',
    description: '采集最新市场数据',
    status: 'idle',
    progress: 0,
    lastUpdate: '-',
    icon: '📊'
  },
  {
    id: 'marketAnalyst',
    name: '市场分析Agent',
    description: '分析热点和市场情绪',
    status: 'idle',
    progress: 0,
    lastUpdate: '-',
    icon: '📈'
  },
  {
    id: 'riskAssessor',
    name: '风险评估Agent',
    description: '评估市场风险和波动',
    status: 'idle',
    progress: 0,
    lastUpdate: '-',
    icon: '⚠️'
  },
  {
    id: 'strategyGenerator',
    name: '策略生成Agent',
    description: '生成交易策略建议',
    status: 'idle',
    progress: 0,
    lastUpdate: '-',
    icon: '💡'
  },
  {
    id: 'coordinator',
    name: '主控协调Agent',
    description: '整合结果并输出决策',
    status: 'idle',
    progress: 0,
    lastUpdate: '-',
    icon: '🎯'
  }
];

const initialAnalysisState: AnalysisState = {
  step: 0,
  totalSteps: 5,
  currentAgent: null,
  marketData: null,
  analysis: null,
  riskAssessment: null,
  strategy: null,
  decision: null,
  isAnalyzing: false
};

export const useStore = create<AppState>((set) => ({
  // Agents
  agents: initialAgents,
  updateAgent: (id, updates) => set((state) => ({
    agents: state.agents.map(agent => 
      agent.id === id ? { ...agent, ...updates } : agent
    )
  })),
  resetAgents: () => set({ agents: initialAgents }),
  
  // Analysis
  analysisState: initialAnalysisState,
  setAnalysisState: (state) => set((prev) => ({
    analysisState: { ...prev.analysisState, ...state }
  })),
  
  startAnalysis: () => set({
    analysisState: {
      ...initialAnalysisState,
      step: 1,
      isAnalyzing: true,
      currentAgent: 'dataCollector'
    }
  }),
  
  completeStep: (agentName, data) => set((state) => {
    const newStep = state.analysisState.step + 1;
    const agentOrder: AgentName[] = ['dataCollector', 'marketAnalyst', 'riskAssessor', 'strategyGenerator', 'coordinator'];
    const nextAgent = newStep <= state.analysisState.totalSteps ? agentOrder[newStep - 1] : null;
    
    const updates: any = {
      analysisState: {
        ...state.analysisState,
        step: newStep,
        currentAgent: nextAgent,
        isAnalyzing: newStep <= state.analysisState.totalSteps
      }
    };

    // Update data based on agent
    if (agentName === 'dataCollector') {
      updates.marketData = data;
      updates.analysisState = { ...updates.analysisState, marketData: data };
    } else if (agentName === 'marketAnalyst') {
      updates.analysis = data;
      updates.analysisState = { ...updates.analysisState, analysis: data };
    } else if (agentName === 'riskAssessor') {
      updates.riskAssessment = data;
      updates.analysisState = { ...updates.analysisState, riskAssessment: data };
    } else if (agentName === 'strategyGenerator') {
      updates.strategy = data;
      updates.analysisState = { ...updates.analysisState, strategy: data };
    } else if (agentName === 'coordinator') {
      updates.decision = data;
      updates.analysisState = { ...updates.analysisState, decision: data };
    }
    
    return updates;
  }),
  
  resetAnalysis: () => set({
    analysisState: initialAnalysisState,
    marketData: null,
    analysis: null,
    riskAssessment: null,
    strategy: null,
    decision: null
  }),
  
  // Data
  marketData: null,
  analysis: null,
  riskAssessment: null,
  strategy: null,
  decision: null,
  setMarketData: (data) => set({ marketData: data }),
  setAnalysis: (data) => set({ analysis: data }),
  setRiskAssessment: (data) => set({ riskAssessment: data }),
  setStrategy: (data) => set({ strategy: data }),
  setDecision: (data) => set({ decision: data }),
  
  // UI
  activePage: 'dashboard',
  setActivePage: (page) => set({ activePage: page })
}));
