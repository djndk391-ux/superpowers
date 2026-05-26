import React from 'react';
import { useStore } from '@/store/useStore';
import { useAgentCoordinator } from '@/hooks/useAgentCoordinator';
import { AgentCard } from '@/components/AgentCard';
import { DecisionDisplay } from '@/components/DecisionDisplay';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const Dashboard: React.FC = () => {
  const { agents, analysisState, decision, setActivePage } = useStore();
  const { runFullAnalysis, resetAll, isAnalyzing, currentStep, totalSteps } = useAgentCoordinator();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              📈 A股热点轮动交易系统
            </h1>
            <p className="text-gray-400">
              多Agent协同智能分析平台
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

      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-6">
        {/* Left Column - Agents */}
        <div className="space-y-6">
          {/* Agents Grid */}
          <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              🤖 智能Agent集群
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {agents.map((agent) => (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  isActive={analysisState.currentAgent === agent.id}
                />
              ))}
            </div>
          </div>

          {/* Progress Indicator */}
          {isAnalyzing && (
            <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-4">分析进度</h3>
              <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden mb-2">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full transition-all duration-500"
                  style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                />
              </div>
              <p className="text-sm text-gray-400">
                正在进行: {agents.find(a => a.id === analysisState.currentAgent)?.name}
              </p>
            </div>
          )}
        </div>

        {/* Right Column - Decision */}
        <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
          {decision ? (
            <DecisionDisplay decision={decision} />
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-white mb-2">
                等待分析
              </h3>
              <p className="text-gray-400 max-w-md">
                点击"开始分析"按钮，多Agent系统将协同工作，为您生成专业的交易决策报告
              </p>
              <button
                onClick={runFullAnalysis}
                className="mt-6 px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                🚀 开始分析
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Quick Navigation */}
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
