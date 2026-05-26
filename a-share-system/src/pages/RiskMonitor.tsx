import React from 'react';
import { useStore } from '@/store/useStore';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const riskLevelColors = {
  low: 'text-green-400 bg-green-500/10 border-green-500/30',
  medium: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
  high: 'text-red-400 bg-red-500/10 border-red-500/30'
};

const riskLevelText = {
  low: '低风险',
  medium: '中等风险',
  high: '高风险'
};

export const RiskMonitor: React.FC = () => {
  const { riskAssessment, setActivePage } = useStore();

  if (!riskAssessment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-white mb-2">暂无风险评估</h2>
          <p className="text-gray-400 mb-6">请先在主控页面运行分析</p>
          <button
            onClick={() => setActivePage('dashboard')}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors"
          >
            返回主控
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <button
              onClick={() => setActivePage('dashboard')}
              className="text-gray-400 hover:text-white mb-2 flex items-center gap-2"
            >
              ← 返回主控
            </button>
            <h1 className="text-3xl font-bold text-white">⚠️ 风险监控中心</h1>
            <p className="text-gray-400">风险评估Agent专业评估</p>
          </div>
        </div>

        {/* Risk Level */}
        <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700 mb-6">
          <div className="text-center">
            <h2 className="text-xl font-bold text-white mb-4">整体风险等级</h2>
            <div className={cn(
              'inline-flex items-center gap-3 px-8 py-4 rounded-2xl border text-3xl font-bold',
              riskLevelColors[riskAssessment.riskLevel]
            )}>
              <span className="text-4xl">
                {riskAssessment.riskLevel === 'low' ? '🟢' : riskAssessment.riskLevel === 'medium' ? '🟡' : '🔴'}
              </span>
              <span>{riskLevelText[riskAssessment.riskLevel]}</span>
            </div>
          </div>
        </div>

        {/* Volatility Score */}
        <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700 mb-6">
          <h2 className="text-xl font-bold text-white mb-4">📊 波动率评分</h2>
          <div className="flex items-center gap-8">
            <div className="flex-1">
              <div className="flex items-end gap-3 mb-3">
                <span className="text-5xl font-bold text-white">{riskAssessment.volatilityScore}</span>
                <span className="text-gray-500 text-lg">/100</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-4 overflow-hidden">
                <div 
                  className={cn(
                    'h-full rounded-full transition-all',
                    riskAssessment.volatilityScore > 70 ? 'bg-gradient-to-r from-red-500 to-red-400' :
                    riskAssessment.volatilityScore > 40 ? 'bg-gradient-to-r from-yellow-500 to-orange-400' :
                    'bg-gradient-to-r from-green-500 to-emerald-400'
                  )}
                  style={{ width: `${riskAssessment.volatilityScore}%` }}
                />
              </div>
              <p className="text-gray-400 text-sm mt-2">
                {riskAssessment.volatilityScore > 70 ? '市场波动剧烈，注意风险控制' :
                 riskAssessment.volatilityScore > 40 ? '市场波动适中，保持谨慎' : '市场波动平稳'}
              </p>
            </div>
          </div>
        </div>

        {/* Risk Factors */}
        <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700 mb-6">
          <h2 className="text-xl font-bold text-white mb-4">🔍 风险因子</h2>
          <div className="space-y-3">
            {riskAssessment.riskFactors.map((factor, idx) => (
              <div key={idx} className="flex items-center gap-3 bg-slate-700/30 rounded-xl p-4 border border-slate-600">
                <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-red-400">⚠️</span>
                </div>
                <p className="text-gray-300">{factor}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts */}
        {riskAssessment.alerts.length > 0 && (
          <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-4">🚨 预警信息</h2>
            <div className="space-y-3">
              {riskAssessment.alerts.map((alert) => (
                <div 
                  key={alert.id}
                  className={cn(
                    'rounded-xl p-4 border',
                    alert.type === 'danger' ? 'bg-red-500/10 border-red-500/30' :
                    alert.type === 'warning' ? 'bg-yellow-500/10 border-yellow-500/30' :
                    'bg-blue-500/10 border-blue-500/30'
                  )}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className={cn(
                      'font-semibold',
                      alert.type === 'danger' ? 'text-red-400' :
                      alert.type === 'warning' ? 'text-yellow-400' : 'text-blue-400'
                    )}>
                      {alert.type === 'danger' ? '🚨' : alert.type === 'warning' ? '⚠️' : 'ℹ️'} {alert.title}
                    </h3>
                    <span className="text-gray-500 text-sm">
                      {new Date(alert.timestamp).toLocaleTimeString('zh-CN')}
                    </span>
                  </div>
                  <p className="text-gray-300">{alert.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
