import { useEffect, useCallback, useRef } from 'react';
import { useStore } from '@/store/useStore';
import { AgentName, MarketSnapshot } from '@/types';
import {
  generateMockAnalysis,
  generateMockStrategy,
  generateMockDecision
} from '@/utils/mockData';
import { DataCollectorAgent } from '@/agents/dataCollectorAgent';
import { MarketAnalystAgent } from '@/agents/marketAnalystAgent';
import { RiskAssessorAgent } from '@/agents/riskAssessorAgent';

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
        
        const snapshot: MarketSnapshot = await dataCollector.collectMarketData();
        console.log('[Data] Market snapshot collected:', snapshot);
        // 返回完整snapshot以及兼容的rawData
        result = { ...snapshot, ...snapshot.rawData };
        break;
      }
      case 'marketAnalyst': {
        const marketAnalyst = new MarketAnalystAgent({}, (progress) => {
          updateAgent(agentName, { 
            progress: progress.progressPercent,
            lastUpdate: new Date().toLocaleTimeString('zh-CN')
          });
          console.log(`[MarketAnalyst] ${progress.currentStep}: ${progress.stepDescription} (${progress.progressPercent}%)`);
        });
        
        // 从之前的状态获取MarketSnapshot
        const currentState = useStore.getState().analysisState;
        let snapshot: MarketSnapshot;
        
        // 如果有完整的snapshot就用，否则尝试从marketData重建
        if (currentState.marketData) {
          snapshot = {
            id: 'temp-snapshot',
            timestamp: new Date().toISOString(),
            version: '1.0',
            rawData: currentState.marketData,
            features: [],
            events: [],
            collectionTime: new Date().toISOString(),
            dataSource: 'system',
            summary: {
              marketDirection: 'neutral',
              dominantSector: '',
              hotStocks: [],
              sentimentScore: 50,
              volatilityScore: 50
            }
          };
        } else {
          // 临时方案：使用默认数据
          result = generateMockAnalysis();
          console.log('[Data] Fallback to mock analysis (no snapshot available)');
          break;
        }
        
        result = await marketAnalyst.analyzeMarket(snapshot);
        console.log('[Data] Analysis generated:', result);
        break;
      }
      case 'riskAssessor': {
        const riskAssessor = new RiskAssessorAgent({}, (progress) => {
          updateAgent(agentName, { 
            progress: progress.progressPercent,
            lastUpdate: new Date().toLocaleTimeString('zh-CN')
          });
          console.log(`[RiskAssessor] ${progress.currentStep}: ${progress.stepDescription} (${progress.progressPercent}%)`);
        });

        const currentState = useStore.getState().analysisState;
        
        if (currentState.marketData && currentState.analysis) {
          // 重建市场快照
          const snapshot: MarketSnapshot = {
            id: 'temp-snapshot',
            timestamp: new Date().toISOString(),
            version: '1.0',
            rawData: currentState.marketData,
            features: [],
            events: [],
            collectionTime: new Date().toISOString(),
            dataSource: 'system',
            summary: {
              marketDirection: 'neutral',
              dominantSector: '',
              hotStocks: [],
              sentimentScore: currentState.analysis.sentimentScore,
              volatilityScore: 50
            }
          };
          
          result = await riskAssessor.assessRisk(snapshot, currentState.analysis);
        } else {
          // 备用方案
          result = {
            riskLevel: 'medium',
            volatilityScore: 50,
            riskFactors: ['市场数据不完整，风险评估有限'],
            alerts: [{
              id: 'fallback',
              type: 'info',
              title: '数据提示',
              message: '请先完成市场数据收集和分析',
              timestamp: new Date().toISOString()
            }]
          };
        }
        
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
