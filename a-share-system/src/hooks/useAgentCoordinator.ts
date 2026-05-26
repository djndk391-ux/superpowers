import { useEffect, useCallback } from 'react';
import { useStore } from '@/store/useStore';
import { AgentName } from '@/types';
import {
  generateMockMarketData,
  generateMockAnalysis,
  generateMockRiskAssessment,
  generateMockStrategy,
  generateMockDecision
} from '@/utils/mockData';

export const useAgentCoordinator = () => {
  const { 
    agents,
    updateAgent,
    startAnalysis,
    completeStep,
    resetAgents,
    resetAnalysis,
    analysisState
  } = useStore();

  // 执行Agent工作
  const executeAgent = useCallback(async (agentName: AgentName) => {
    // 更新Agent状态为工作中
    updateAgent(agentName, { 
      status: 'working', 
      progress: 0,
      lastUpdate: new Date().toLocaleTimeString('zh-CN')
    });

    // 模拟进度更新
    for (let i = 0; i <= 100; i += 25) {
      await new Promise(resolve => setTimeout(resolve, 300));
      updateAgent(agentName, { progress: i });
    }

    // 根据Agent类型生成对应的数据
    let result: any;
    switch (agentName) {
      case 'dataCollector':
        result = generateMockMarketData();
        break;
      case 'marketAnalyst':
        result = generateMockAnalysis();
        break;
      case 'riskAssessor':
        result = generateMockRiskAssessment();
        break;
      case 'strategyGenerator':
        result = generateMockStrategy();
        break;
      case 'coordinator':
        result = generateMockDecision();
        break;
    }

    // 更新Agent状态为完成
    updateAgent(agentName, { 
      status: 'completed', 
      progress: 100,
      lastUpdate: new Date().toLocaleTimeString('zh-CN')
    });

    return result;
  }, [updateAgent]);

  // 开始完整的分析流程
  const runFullAnalysis = useCallback(async () => {
    // 重置状态
    resetAgents();
    resetAnalysis();
    
    // 开始分析
    startAnalysis();

    const agentOrder: AgentName[] = ['dataCollector', 'marketAnalyst', 'riskAssessor', 'strategyGenerator', 'coordinator'];

    for (const agentName of agentOrder) {
      if (!analysisState.isAnalyzing) break;
      
      const result = await executeAgent(agentName);
      completeStep(agentName, result);
    }
  }, [resetAgents, resetAnalysis, startAnalysis, executeAgent, completeStep, analysisState.isAnalyzing]);

  // 重置分析
  const resetAll = useCallback(() => {
    resetAgents();
    resetAnalysis();
  }, [resetAgents, resetAnalysis]);

  return {
    runFullAnalysis,
    resetAll,
    isAnalyzing: analysisState.isAnalyzing,
    currentStep: analysisState.step,
    totalSteps: analysisState.totalSteps
  };
};
