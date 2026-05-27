
import React, { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { useAgentCoordinator } from '@/hooks/useAgentCoordinator';
import { AgentCard } from '@/components/AgentCard';
import { DecisionDisplay } from '@/components/DecisionDisplay';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { MarketSnapshot, MarketFeature, RealtimeMarketEvent } from '@/types';
import { generateMockAnalysis, generateMockRiskAssessment, generateMockStrategy, generateMockDecision } from '@/utils/mockData';
import { DataCollectorAgent } from '@/agents/dataCollectorAgent';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 添加一个快速测试按钮组件
const QuickTestButton = () => {
  const { setDecision, setMarketData, setAnalysis, setRiskAssessment, setStrategy, updateAgent, setAnalysisState } = useStore();
  
  const runQuickTest = async () => {
    console.log('[Quick Test] Running...');
    try {
      const snapshot: MarketSnapshot = await DataCollectorAgent.quickTest();
      const analysisData = generateMockAnalysis();
      const riskData = generateMockRiskAssessment();
      const strategyData = generateMockStrategy();
      const decisionData = generateMockDecision();
      
      console.log('[Quick Test] Data generated:', { snapshot, analysisData, riskData, strategyData, decisionData });
      
      setMarketData({ ...snapshot, ...snapshot.rawData });
      setAnalysis(analysisData);
      setRiskAssessment(riskData);
      setStrategy(strategyData);
      setDecision(decisionData);
      
      ['dataCollector', 'marketAnalyst', 'riskAssessor', 'strategyGenerator', 'coordinator'].forEach(id => {
        updateAgent(id as any, { status: 'completed', progress: 100, lastUpdate: new Date().toLocaleTimeString('zh-CN') });
      });
      
      setAnalysisState({ isAnalyzing: false, step: 6 });
      console.log('[Quick Test] Complete!');
    } catch (error) {
      console.error('[Quick Test] Error:', error);
    }
  };
  
  return (
    <button
      onClick={runQuickTest}
      className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium transition-colors text-sm"
    >
      ⚡ 快速测试
    </button>
  );
};

export const Dashboard: React.FC = () => {
  const { agents, analysisState, decision, marketData, analysis, riskAssessment, strategy, setActivePage } = useStore();
  const { runFullAnalysis, resetAll, isAnalyzing, currentStep, totalSteps } = useAgentCoordinator();
  const [stepLog, setStepLog] = useState<string[]>([]);
  
  const hasSnapshot = marketData && 'features' in marketData && 'dataSource' in marketData;
  
  console.log('[Dashboard] State:', { 
    hasDecision: !!decision, 
    hasMarketData: !!marketData, 
    hasAnalysis: !!analysis,
    step: analysisState.step,
    isAnalyzing 
  });

  useEffect(() => {
    if (isAnalyzing && analysisState.currentAgent) {
      const agent = agents.find(a => a.id === analysisState.currentAgent);
      if (agent) {
        const stepDescription = `[${new Date().toLocaleTimeString('zh-CN')}] ${agent.name} 开始工作`;
        setStepLog(prev => [...prev, stepDescription]);
      }
    } else if (decision && stepLog.length > 0 && !stepLog.some(log => log.includes('分析完成'))) {
      setStepLog(prev => [...prev, `[${new Date().toLocaleTimeString('zh-CN')}] 🎉 分析完成！`]);
    }
  }, [analysisState.currentAgent, isAnalyzing, decision, agents]);

  useEffect(() => {
    if (!isAnalyzing && !decision) {
      setStepLog([]);
    }
  }, [isAnalyzing, decision]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              📈 A股热点轮动交易系统
            </h1>
            <p className="text-gray-400">
              多Agent协同智能分析平台 - 5个专门化Agent协同工作
            </p>
          </div>
          <div className="flex gap-3">
            {!isAnalyzing && decision && (
              <button
                onClick={() => setActivePage('market')}
                className="px-5 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
              >
                查看详情
              </button>
            )}
            <QuickTestButton />
            <button
              onClick={isAnalyzing ? resetAll : runFullAnalysis}
              disabled={isAnalyzing && currentStep > 1}
              className={cn(
                'px-6 py-2.5 rounded-lg font-semibold transition-all flex items-center gap-2',
                isAnalyzing
                  ? 'bg-yellow-600 hover:bg-yellow-500 text-white'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg hover:shadow-xl'
              )}
            >
              {isAnalyzing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  分析中 {currentStep}/{totalSteps}
                </>
              ) : (
                <>
                  ▶ 开始分析
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              🤖 智能Agent集群
            </h2>
            <div className="space-y-4">
              {agents.map((agent) => (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  isActive={analysisState.currentAgent === agent.id}
                />
              ))}
            </div>
          </div>

          {isAnalyzing && (
            <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-4">分析进度</h3>
              <div className="w-full bg-slate-700 rounded-full h-4 overflow-hidden mb-3">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full transition-all duration-500"
                  style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">
                  步骤 {currentStep}/{totalSteps}
                </span>
                <span className="text-blue-400 font-medium">
                  {agents.find(a => a.id === analysisState.currentAgent)?.name}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              🧪 数据收集Agent 测试评估
            </h2>
            
            {hasSnapshot && (
              <>
                <div className="bg-slate-900/50 rounded-xl p-4 mb-4 border border-slate-700">
                  <h3 className="text-sm font-semibold text-white mb-3">🌐 数据源信息</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">当前数据源</span>
                      <span className="text-green-400 font-medium">{(marketData as any)?.dataSource}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">采集时间</span>
                      <span className="text-blue-400">{(marketData as any)?.collectionTime ? new Date((marketData as any).collectionTime).toLocaleString('zh-CN') : 'N/A'}</span>
                    </div>
                    {(() => {
                      const timeDiff = (marketData as any)?.collectionTime ? 
                        (Date.now() - new Date((marketData as any).collectionTime).getTime()) / 1000 / 60 / 60 : 0;
                      let freshness = '🟢 非常新鲜';
                      if (timeDiff > 1) freshness = '🟢 新鲜';
                      if (timeDiff > 6) freshness = '🟡 可接受';
                      if (timeDiff > 24) freshness = '🟠 较旧';
                      if (timeDiff > 720) freshness = '🔴 过期';
                      return (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">数据新鲜度</span>
                          <span className="text-yellow-400">{freshness}</span>
                        </div>
                      );
                    })()}
                  </div>
                  
                  {(marketData as any)?.allDataSources && (
                    <div className="mt-4 pt-4 border-t border-slate-700">
                      <div className="text-xs text-gray-500 mb-2">所有数据源状态：</div>
                      <div className="space-y-1">
                        {(marketData as any).allDataSources.map((ds: any, i: number) => (
                          <div key={i} className="flex justify-between text-xs">
                            <span className="text-gray-300">{ds.name}</span>
                            <span className={ds.isAvailable ? "text-green-400" : "text-red-400"}>
                              {ds.isAvailable ? "✓ 可用" : "✗ 不可用"} (优先级{ds.priority})
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="bg-slate-900/50 rounded-xl p-4 mb-4 border border-slate-700">
                  <h3 className="text-sm font-semibold text-white mb-3">📊 数据统计</h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                      <div className="text-lg mb-1">📈</div>
                      <div className="text-white font-medium text-sm">{(marketData as any)?.rawData?.sectors?.length || 0}</div>
                      <div className="text-gray-500 text-xs">板块</div>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                      <div className="text-lg mb-1">📉</div>
                      <div className="text-white font-medium text-sm">{(marketData as any)?.rawData?.stocks?.length || 0}</div>
                      <div className="text-gray-500 text-xs">股票</div>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                      <div className="text-lg mb-1">📰</div>
                      <div className="text-white font-medium text-sm">{(marketData as any)?.rawData?.news?.length || 0}</div>
                      <div className="text-gray-500 text-xs">新闻</div>
                    </div>
                  </div>
                </div>
                
                {(marketData as any)?.features && (
                  <div className="bg-slate-900/50 rounded-xl p-4 mb-4 border border-slate-700">
                    <h3 className="text-sm font-semibold text-white mb-3">📈 市场特征</h3>
                    <div className="space-y-2">
                      {(marketData as any).features.map((feature: any, i: number) => (
                        <div key={i} className="bg-slate-800/50 rounded-lg p-2">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-white font-medium">{feature.name}</span>
                            <span className="text-blue-400">{feature.value}</span>
                          </div>
                          <p className="text-gray-500 text-xs mt-1">{feature.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700">
                  <h3 className="text-sm font-semibold text-white mb-3">📋 总体评估</h3>
                  {(() => {
                    const isRealDataSource = (marketData as any)?.dataSource === '东方财富' || (marketData as any)?.dataSource === '同花顺';
                    const timeDiff = (marketData as any)?.collectionTime ? 
                      (Date.now() - new Date((marketData as any).collectionTime).getTime()) / 1000 / 60 / 60 : 0;
                    const isFresh = timeDiff < 24;

                    let rating = '⚠️ 需改进';
                    let colorClass = 'text-orange-400 bg-orange-900/30 border-orange-700';
                    
                    if (isRealDataSource && isFresh) {
                      rating = '✅ 优秀！使用真实数据源，数据新鲜';
                      colorClass = 'text-green-400 bg-green-900/30 border-green-700';
                    } else if (isRealDataSource) {
                      rating = '⚠️ 良好！使用真实数据源，但数据可能不是最新';
                      colorClass = 'text-yellow-400 bg-yellow-900/30 border-yellow-700';
                    } else if (isFresh) {
                      rating = '⚠️ 良好！数据新鲜，但使用备用数据源';
                      colorClass = 'text-yellow-400 bg-yellow-900/30 border-yellow-700';
                    }
                    
                    return (
                      <div className={`rounded-lg p-3 border ${colorClass}`}>
                        <p className="text-sm font-medium">{rating}</p>
                        <div className="mt-2 pt-2 border-t border-slate-700">
                          <p className="text-xs text-gray-400">数据源：{isRealDataSource ? '真实API' : '模拟数据'}</p>
                          <p className="text-xs text-gray-400">数据延迟：{timeDiff.toFixed(2)}小时</p>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </>
            )}
            
            {!hasSnapshot && marketData && (
              <div className="bg-slate-900/50 rounded-xl p-4 text-center text-gray-500">
                数据格式不是完整的MarketSnapshot，点击"快速测试"来测试优化的数据收集Agent
              </div>
            )}
          </div>

          <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              📋 执行日志
            </h2>
            <div className="bg-slate-900 rounded-xl p-4 h-48 overflow-y-auto">
              {stepLog.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <div className="text-4xl mb-3">⏳</div>
                  <p className="text-sm">等待分析开始...</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {stepLog.map((log, index) => (
                    <div 
                      key={index}
                      className={cn(
                        "text-sm py-2 px-3 rounded-lg",
                        log.includes('完成') 
                          ? "bg-green-900/30 text-green-300" 
                          : "bg-slate-800/50 text-gray-300"
                      )}
                    >
                      {log}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {(marketData || analysis || riskAssessment || strategy) && (
            <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                📊 数据预览
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { data: marketData, label: '市场数据', icon: '📈' },
                  { data: analysis, label: '分析报告', icon: '🔍' },
                  { data: riskAssessment, label: '风险评估', icon: '⚠️' },
                  { data: strategy, label: '策略建议', icon: '💡' }
                ].map((item, index) => (
                  <div 
                    key={index}
                    className={cn(
                      "p-3 rounded-lg text-center transition-all",
                      item.data 
                        ? "bg-green-900/30 border border-green-700" 
                        : "bg-slate-700/50 border border-slate-700"
                    )}
                  >
                    <div className="text-xl mb-1">{item.icon}</div>
                    <div className={cn(
                      "text-xs font-medium",
                      item.data ? "text-green-300" : "text-gray-500"
                    )}>
                      {item.data ? '✓ ' + item.label : item.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
          {decision ? (
            <DecisionDisplay decision={decision} />
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-white mb-2">
                等待分析
              </h3>
              <p className="text-gray-400 max-w-md mb-6">
                点击"开始分析"按钮，多Agent系统将协同工作，为您生成专业的交易决策报告
              </p>
              
              <div className="w-full bg-slate-700/50 rounded-xl p-4 mb-6">
                <h4 className="text-sm font-semibold text-gray-300 mb-3">分析流程</h4>
                <div className="flex items-center justify-between gap-1">
                  {[
                    { icon: '📊', label: '收集', color: 'blue' },
                    { icon: '📈', label: '分析', color: 'green' },
                    { icon: '⚠️', label: '风控', color: 'yellow' },
                    { icon: '💡', label: '策略', color: 'purple' },
                    { icon: '🎯', label: '决策', color: 'pink' }
                  ].map((step, index) => (
                    <React.Fragment key={index}>
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 bg-slate-600 rounded-full flex items-center justify-center text-lg mb-1">
                          {step.icon}
                        </div>
                        <span className="text-xs text-gray-400">{step.label}</span>
                      </div>
                      {index < 4 && (
                        <div className="text-gray-600">→</div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              <button
                onClick={runFullAnalysis}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                🚀 开始分析
              </button>
            </div>
          )}
        </div>
      </div>

      {decision && (
        <div className="max-w-7xl mx-auto mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { id: 'market', icon: '📈', label: '市场数据' },
            { id: 'analysis', icon: '🔍', label: '分析报告' },
            { id: 'risk', icon: '⚠️', label: '风险监控' },
            { id: 'strategy', icon: '💡', label: '策略管理' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id as any)}
              className="bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 hover:border-slate-600 rounded-xl p-4 text-center transition-all"
            >
              <div className="text-3xl mb-2">{item.icon}</div>
              <div className="text-white font-medium">{item.label}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
