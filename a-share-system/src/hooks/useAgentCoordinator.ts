import { useEffect, useCallback, useRef } from 'react';
import { useStore } from '@/store/useStore';
import { AgentName } from '@/types';
import {
  generateMockAnalysis,
  generateMockRiskAssessment,
  generateMockStrategy,
  generateMockDecision
} from '@/utils/mockData';
import { DataCollectorAgent } from '@/agents/dataCollectorAgent';

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
  
  const isExecutingRef = useRef(false);

  // 执行Agent工作
  const executeAgent = useCallback(async (agentName: AgentName) => {
    console.log(`[Agent] Executing: ${agentName}`);
    
    // 更新Agent状态为工作中
    updateAgent(agentName, { 
      status: 'working', 
      progress: 0,
      lastUpdate: new Date().toLocaleTimeString('zh-CN')
    });

    // 根据Agent类型生成对应的数据
    let result: any;
    switch (agentName) {
      case 'dataCollector': {
        // 使用优化后的DataCollectorAgent
        const dataCollector = new DataCollectorAgent((progress) => {
          // 实时更新进度到UI
          updateAgent(agentName, { 
            progress: progress.progressPercent,
            lastUpdate: new Date().toLocaleTimeString('zh-CN')
          });
          console.log(`[DataCollector] ${progress.currentStep}: ${progress.stepDescription} (${progress.progressPercent}%)`);
        });
        
        result = await dataCollector.collectMarketData();
        console.log('[Data] Market data collected:', result);
        break;
      }
      case 'marketAnalyst': {
        // 模拟其他Agent的进度
        for (let i = 0; i <= 100; i += 25) {
          await new Promise(resolve => setTimeout(resolve, 200));
          updateAgent(agentName, { progress: i });
        }
        result = generateMockAnalysis();
        console.log('[Data] Analysis generated:', result);
        break;
      }
      case 'riskAssessor': {
        for (let i = 0; i <= 100; i += 25) {
          await new Promise(resolve => setTimeout(resolve, 200));
          updateAgent(agentName, { progress: i });
        }
        result = generateMockRiskAssessment();
        console.log('[Data] Risk assessment generated:', result);
        break;
      }
      case 'strategyGenerator': {
        for (let i = 0; i <= 100; i += 25) {
          await new Promise(resolve => setTimeout(resolve, 200));
          updateAgent(agentName, { progress: i });
        }
        result = generateMockStrategy();
        console.log('[Data] Strategy generated:', result);
        break;
      }
      case 'coordinator': {
        for (let i = 0; i <= 100; i += 25) {
          await new Promise(resolve => setTimeout(resolve, 200));
          updateAgent(agentName, { progress: i });
        }
        result = generateMockDecision();
        console.log('[Data] Decision generated:', result);
        break;
      }
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
    if (isExecutingRef.current) {
      console.log('[Warning] Already executing, skipping...');
      return;
    }
    
    isExecutingRef.current = true;
    console.log('[Analysis] Starting full analysis...');
    
    try {
      // 重置状态
      resetAgents();
      resetAnalysis();
      
      // 开始分析
      startAnalysis();
      console.log('[Analysis] Analysis started');

      const agentOrder: AgentName[] = ['dataCollector', 'marketAnalyst', 'riskAssessor', 'strategyGenerator', 'coordinator'];

      for (let i = 0; i < agentOrder.length; i++) {
        const agentName = agentOrder[i];
        
        // 获取最新状态
        const currentState = useStore.getState().analysisState;
        if (!currentState.isAnalyzing) {
          console.log('[Analysis] Analysis stopped');
          break;
        }
        
        console.log(`[Analysis] Step ${i + 1}/${agentOrder.length}: ${agentName}`);
        
        const result = await executeAgent(agentName);
        completeStep(agentName, result);
        
        console.log(`[Analysis] Step ${i + 1} completed`);
      }
      
      console.log('[Analysis] Full analysis complete!');
    } catch (error) {
      console.error('[Analysis] Error:', error);
    } finally {
      isExecutingRef.current = false;
    }
  }, [resetAgents, resetAnalysis, startAnalysis, executeAgent, completeStep]);

  // 重置分析
  const resetAll = useCallback(() => {
    console.log('[Analysis] Resetting...');
    isExecutingRef.current = false;
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
