import React from 'react';
import { TradingDecision } from '@/types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface DecisionDisplayProps {
  decision: TradingDecision;
}

const riskLevelColors: Record<string, string> = {
  low: 'text-green-400 bg-green-500/10 border-green-500/30',
  medium: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
  high: 'text-red-400 bg-red-500/10 border-red-500/30'
};

const riskLevelText: Record<string, string> = {
  low: '低风险',
  medium: '中等风险',
  high: '高风险'
};

export const DecisionDisplay: React.FC<DecisionDisplayProps> = ({ decision }) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-block px-4 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm font-medium mb-2">
          交易决策报告
        </div>
        <h2 className="text-2xl font-bold text-white mb-1">A股热点轮动分析</h2>
        <p className="text-gray-400 text-sm">
          生成时间: {new Date(decision.timestamp).toLocaleString('zh-CN')}
        </p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
          <p className="text-gray-400 text-sm mb-1">市场情绪</p>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-white">{decision.marketSentimentScore}</span>
            <span className="text-gray-500 text-sm mb-1">/100</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
              style={{ width: `${decision.marketSentimentScore}%` }}
            />
          </div>
        </div>
        
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
          <p className="text-gray-400 text-sm mb-1">热点持续性</p>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-white">{decision.hotSustainabilityScore}</span>
            <span className="text-gray-500 text-sm mb-1">/100</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
            <div 
              className="h-full bg-gradient-to-r from-orange-500 to-yellow-400 rounded-full"
              style={{ width: `${decision.hotSustainabilityScore}%` }}
            />
          </div>
        </div>
      </div>

      {/* Risk Level */}
      <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
        <p className="text-gray-400 text-sm mb-2">风险等级</p>
        <div className={cn(
          'inline-flex items-center px-4 py-2 rounded-lg border',
          riskLevelColors[decision.riskLevel]
        )}>
          <span className="font-semibold">{riskLevelText[decision.riskLevel]}</span>
        </div>
      </div>

      {/* Market Main Line */}
      <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
        <p className="text-gray-400 text-sm mb-2">市场主线</p>
        <p className="text-white font-medium">{decision.marketMainLine}</p>
      </div>

      {/* Core Hot Spots */}
      <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
        <p className="text-gray-400 text-sm mb-3">核心热点</p>
        <div className="flex flex-wrap gap-2">
          {decision.coreHotSpots.map((spot, idx) => (
            <span 
              key={idx}
              className="px-3 py-1.5 bg-orange-500/20 text-orange-400 rounded-full text-sm border border-orange-500/30"
            >
              🔥 {spot}
            </span>
          ))}
        </div>
      </div>

      {/* Recommended Strategy */}
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl p-4 border border-blue-500/30">
        <p className="text-blue-400 text-sm mb-2 font-medium">💡 推荐策略</p>
        <p className="text-white">{decision.recommendedStrategy}</p>
      </div>

      {/* Candidate Directions */}
      <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
        <p className="text-gray-400 text-sm mb-3">📊 候选方向</p>
        <div className="space-y-2">
          {decision.candidateDirections.map((dir, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full" />
              <span className="text-gray-200">{dir}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Areas to Avoid */}
      <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
        <p className="text-gray-400 text-sm mb-3">⚠️ 规避方向</p>
        <div className="space-y-2">
          {decision.areasToAvoid.map((area, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-400 rounded-full" />
              <span className="text-gray-300">{area}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
