import React from 'react';
import { Agent, AgentStatus } from '@/types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface AgentCardProps {
  agent: Agent;
  isActive: boolean;
}

const statusColors: Record<AgentStatus, string> = {
  idle: 'border-gray-600 bg-gray-800/30',
  working: 'border-blue-500 bg-blue-500/10',
  completed: 'border-green-500 bg-green-500/10',
  error: 'border-red-500 bg-red-500/10'
};

const statusText: Record<AgentStatus, string> = {
  idle: '等待中',
  working: '处理中',
  completed: '已完成',
  error: '错误'
};

const statusTextColors: Record<AgentStatus, string> = {
  idle: 'text-gray-400',
  working: 'text-blue-400',
  completed: 'text-green-400',
  error: 'text-red-400'
};

export const AgentCard: React.FC<AgentCardProps> = ({ agent, isActive }) => {
  return (
    <div className={cn(
      'relative border rounded-xl p-4 transition-all duration-300',
      statusColors[agent.status],
      isActive && 'ring-2 ring-blue-400/50 scale-[1.02]'
    )}>
      {/* Icon */}
      <div className="text-3xl mb-2">{agent.icon}</div>
      
      {/* Name & Description */}
      <h3 className="font-semibold text-white mb-1">{agent.name}</h3>
      <p className="text-xs text-gray-400 mb-3">{agent.description}</p>
      
      {/* Status */}
      <div className="flex items-center justify-between mb-2">
        <span className={cn('text-sm font-medium', statusTextColors[agent.status])}>
          {statusText[agent.status]}
        </span>
        <span className="text-xs text-gray-500">{agent.lastUpdate}</span>
      </div>
      
      {/* Progress Bar */}
      {agent.status !== 'idle' && (
        <div className="mt-2">
          <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
            <div 
              className={cn(
                'h-full transition-all duration-500 rounded-full',
                agent.status === 'completed' ? 'bg-green-500' : 
                agent.status === 'error' ? 'bg-red-500' : 'bg-blue-500'
              )}
              style={{ width: `${agent.progress}%` }}
            />
          </div>
          <span className="text-xs text-gray-400 mt-1 block">{agent.progress}%</span>
        </div>
      )}
      
      {/* Active Indicator */}
      {isActive && (
        <div className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
      )}
    </div>
  );
};
