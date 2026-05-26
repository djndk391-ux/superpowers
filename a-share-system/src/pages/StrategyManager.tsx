import React from 'react';
import { useStore } from '@/store/useStore';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const entryTypeColors = {
  aggressive: 'text-red-400 bg-red-500/10 border-red-500/30',
  moderate: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
  conservative: 'text-green-400 bg-green-500/10 border-green-500/30'
};

const entryTypeText = {
  aggressive: '激进型',
  moderate: '稳健型',
  conservative: '保守型'
};

export const StrategyManager: React.FC = () => {
  const { strategy, setActivePage } = useStore();

  if (!strategy) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">💡</div>
          <h2 className="text-2xl font-bold text-white mb-2">暂无策略</h2>
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
            <h1 className="text-3xl font-bold text-white">💡 策略管理</h1>
            <p className="text-gray-400">策略生成Agent专业建议</p>
          </div>
        </div>

        {/* Recommended Strategy */}
        <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl p-6 border border-blue-500/30 mb-6">
          <h2 className="text-xl font-bold text-blue-400 mb-3 flex items-center gap-2">
            ✨ 核心策略建议
          </h2>
          <p className="text-white text-lg leading-relaxed">{strategy.recommendedStrategy}</p>
        </div>

        {/* Candidate Stocks */}
        <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700 mb-6">
          <h2 className="text-xl font-bold text-white mb-4">🎯 候选标的</h2>
          <div className="space-y-4">
            {strategy.candidates.map((candidate, idx) => (
              <div key={idx} className="bg-slate-700/30 rounded-xl p-4 border border-slate-600">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                      <span className="text-purple-400 font-bold">{idx + 1}</span>
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">{candidate.name}</h3>
                      <p className="text-gray-400 text-sm">{candidate.code} · {candidate.sector}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <p className="text-gray-400 text-sm">评分</p>
                      <p className="text-purple-400 font-bold text-xl">{candidate.score}</p>
                    </div>
                    <div className="w-20 bg-slate-600 rounded-full h-2">
                      <div 
                        className="bg-purple-500 h-full rounded-full" 
                        style={{ width: `${candidate.score}%` }}
                      />
                    </div>
                  </div>
                </div>
                <p className="text-gray-300 text-sm">{candidate.rationale}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Entry Points */}
        <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700 mb-6">
          <h2 className="text-xl font-bold text-white mb-4">📈 入场点位建议</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {strategy.entryPoints.map((entry, idx) => (
              <div key={idx} className={cn(
                'rounded-xl p-4 border',
                entryTypeColors[entry.type]
              )}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{entryTypeText[entry.type]}</h3>
                  <span className="text-2xl font-bold">{entry.price.toFixed(2)}</span>
                </div>
                <p className="text-gray-400 text-sm">{entry.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Stop Loss / Take Profit */}
        <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
          <h2 className="text-xl font-bold text-white mb-4">🛡️ 止盈止损建议</h2>
          {strategy.stopLoss.map((sl, idx) => (
            <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-red-500/10 rounded-xl p-4 border border-red-500/30">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-red-400 font-semibold">🔻 止损位</h3>
                  <span className="text-2xl font-bold text-red-400">{sl.stopLossPrice.toFixed(2)}</span>
                </div>
              </div>
              <div className="bg-green-500/10 rounded-xl p-4 border border-green-500/30">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-green-400 font-semibold">🔺 止盈位</h3>
                  <span className="text-2xl font-bold text-green-400">{sl.takeProfitPrice.toFixed(2)}</span>
                </div>
              </div>
              <div className="md:col-span-2 bg-slate-700/30 rounded-xl p-4 border border-slate-600">
                <p className="text-gray-300">{sl.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
