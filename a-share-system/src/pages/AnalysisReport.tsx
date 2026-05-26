import React from 'react';
import { useStore } from '@/store/useStore';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const AnalysisReport: React.FC = () => {
  const { analysis, setActivePage } = useStore();

  if (!analysis) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold text-white mb-2">暂无分析</h2>
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
            <h1 className="text-3xl font-bold text-white">🔍 分析报告</h1>
            <p className="text-gray-400">市场分析Agent专业分析</p>
          </div>
        </div>

        {/* Sentiment Score */}
        <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700 mb-6">
          <h2 className="text-xl font-bold text-white mb-4">😊 市场情绪</h2>
          <div className="flex items-center gap-8">
            <div className="flex-1">
              <div className="flex items-end gap-3 mb-3">
                <span className="text-5xl font-bold text-white">{analysis.sentimentScore}</span>
                <span className="text-gray-500 text-lg">/100</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-4 overflow-hidden">
                <div 
                  className={cn(
                    'h-full rounded-full transition-all',
                    analysis.sentimentScore > 60 ? 'bg-gradient-to-r from-green-500 to-emerald-400' :
                    analysis.sentimentScore > 40 ? 'bg-gradient-to-r from-yellow-500 to-orange-400' :
                    'bg-gradient-to-r from-red-500 to-red-400'
                  )}
                  style={{ width: `${analysis.sentimentScore}%` }}
                />
              </div>
              <p className="text-gray-400 text-sm mt-2">
                {analysis.sentimentScore > 60 ? '市场情绪偏乐观' :
                 analysis.sentimentScore > 40 ? '市场情绪中性' : '市场情绪偏谨慎'}
              </p>
            </div>
          </div>
        </div>

        {/* Hot Spots */}
        <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700 mb-6">
          <h2 className="text-xl font-bold text-white mb-4">🔥 热点板块</h2>
          <div className="space-y-4">
            {analysis.hotSpots.map((spot, idx) => (
              <div key={idx} className="bg-slate-700/30 rounded-xl p-4 border border-slate-600">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
                    </span>
                    <h3 className="text-white font-semibold text-lg">{spot.name}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-400">强度:</span>
                      <span className="text-white font-bold text-xl">{spot.strength}</span>
                    </div>
                    <div className="w-24 bg-slate-600 rounded-full h-2">
                      <div 
                        className="bg-yellow-500 h-full rounded-full" 
                        style={{ width: `${spot.strength}%` }}
                      />
                    </div>
                  </div>
                </div>
                <p className="text-gray-400 text-sm mb-2">{spot.reasoning}</p>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 text-sm">持续性:</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-slate-600 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-full rounded-full" 
                        style={{ width: `${spot.sustainabilityScore}%` }}
                      />
                    </div>
                    <span className="text-blue-400 text-sm font-medium">{spot.sustainabilityScore}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Leader Stocks */}
        <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700 mb-6">
          <h2 className="text-xl font-bold text-white mb-4">⭐ 龙头股分析</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {analysis.leaderStocks.map((stock, idx) => (
              <div key={idx} className="bg-slate-700/30 rounded-xl p-4 border border-slate-600">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="text-white font-semibold">{stock.name}</h3>
                    <p className="text-gray-400 text-sm">{stock.code}</p>
                  </div>
                  <span className={cn(
                    'text-lg font-bold px-3 py-1 rounded-lg',
                    stock.changePercent > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  )}>
                    {stock.changePercent > 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">领涨评分:</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-slate-600 rounded-full h-2">
                      <div 
                        className="bg-purple-500 h-full rounded-full" 
                        style={{ width: `${stock.leadingScore}%` }}
                      />
                    </div>
                    <span className="text-purple-400 font-bold">{stock.leadingScore}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Observations */}
        <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
          <h2 className="text-xl font-bold text-white mb-4">📝 观察要点</h2>
          <div className="space-y-3">
            {analysis.observations.map((obs, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-400 text-sm font-bold">{idx + 1}</span>
                </div>
                <p className="text-gray-300">{obs}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
