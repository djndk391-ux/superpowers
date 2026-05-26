import React from 'react';
import { useStore } from '@/store/useStore';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const MarketData: React.FC = () => {
  const { marketData, setActivePage } = useStore();

  if (!marketData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📊</div>
          <h2 className="text-2xl font-bold text-white mb-2">暂无数据</h2>
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
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <button
              onClick={() => setActivePage('dashboard')}
              className="text-gray-400 hover:text-white mb-2 flex items-center gap-2"
            >
              ← 返回主控
            </button>
            <h1 className="text-3xl font-bold text-white">📈 市场数据中心</h1>
            <p className="text-gray-400">
              最新更新: {new Date(marketData.timestamp).toLocaleString('zh-CN')}
            </p>
          </div>
        </div>

        {/* Fund Flow */}
        <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700 mb-6">
          <h2 className="text-xl font-bold text-white mb-4">💵 资金流向</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-700/50 rounded-xl p-4">
              <p className="text-gray-400 text-sm mb-1">主力资金</p>
              <p className={cn(
                'text-2xl font-bold',
                marketData.fundFlow.mainFlow > 0 ? 'text-green-400' : 'text-red-400'
              )}>
                {marketData.fundFlow.mainFlow > 0 ? '+' : ''}
                {(marketData.fundFlow.mainFlow / 100000000).toFixed(1)}亿
              </p>
            </div>
            <div className="bg-slate-700/50 rounded-xl p-4">
              <p className="text-gray-400 text-sm mb-1">北向资金</p>
              <p className={cn(
                'text-2xl font-bold',
                marketData.fundFlow.northFlow > 0 ? 'text-green-400' : 'text-red-400'
              )}>
                {marketData.fundFlow.northFlow > 0 ? '+' : ''}
                {(marketData.fundFlow.northFlow / 100000000).toFixed(1)}亿
              </p>
            </div>
          </div>
        </div>

        {/* Sectors */}
        <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700 mb-6">
          <h2 className="text-xl font-bold text-white mb-4">📊 板块涨跌</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {marketData.sectors.map((sector) => (
              <div 
                key={sector.id}
                className="bg-slate-700/50 rounded-xl p-4 border border-slate-600"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-white font-semibold">{sector.name}</h3>
                  <span className={cn(
                    'text-lg font-bold px-3 py-1 rounded-lg',
                    sector.changePercent > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  )}>
                    {sector.changePercent > 0 ? '+' : ''}{sector.changePercent.toFixed(1)}%
                  </span>
                </div>
                <p className="text-gray-400 text-sm mb-2">
                  成交: {(sector.volume / 100000000).toFixed(1)}亿
                </p>
                <div className="flex flex-wrap gap-1">
                  {sector.leaderStocks.map((stock, idx) => (
                    <span 
                      key={idx}
                      className="text-xs bg-slate-600 text-gray-300 px-2 py-1 rounded"
                    >
                      {stock}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stocks */}
        <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700 mb-6">
          <h2 className="text-xl font-bold text-white mb-4">📋 个股表现</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left text-gray-400 font-medium pb-3">代码</th>
                  <th className="text-left text-gray-400 font-medium pb-3">名称</th>
                  <th className="text-right text-gray-400 font-medium pb-3">价格</th>
                  <th className="text-right text-gray-400 font-medium pb-3">涨跌幅</th>
                  <th className="text-right text-gray-400 font-medium pb-3">成交量</th>
                  <th className="text-center text-gray-400 font-medium pb-3">龙头</th>
                </tr>
              </thead>
              <tbody>
                {marketData.stocks.map((stock) => (
                  <tr key={stock.id} className="border-b border-slate-700/50">
                    <td className="py-3 text-gray-300">{stock.code}</td>
                    <td className="py-3 text-white font-medium">{stock.name}</td>
                    <td className="py-3 text-right text-gray-200">{stock.price.toFixed(2)}</td>
                    <td className={cn(
                      'py-3 text-right font-semibold',
                      stock.changePercent > 0 ? 'text-green-400' : 'text-red-400'
                    )}>
                      {stock.changePercent > 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                    </td>
                    <td className="py-3 text-right text-gray-400">
                      {(stock.volume / 100000000).toFixed(2)}亿
                    </td>
                    <td className="py-3 text-center">
                      {stock.isLeader && (
                        <span className="text-yellow-400">⭐</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* News */}
        <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
          <h2 className="text-xl font-bold text-white mb-4">📰 相关资讯</h2>
          <div className="space-y-4">
            {marketData.news.map((news) => (
              <div 
                key={news.id}
                className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/50"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-white font-semibold">{news.title}</h3>
                  <span className="text-gray-500 text-sm">
                    {new Date(news.timestamp).toLocaleTimeString('zh-CN')}
                  </span>
                </div>
                <p className="text-gray-400 text-sm mb-2">{news.content}</p>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 text-xs">{news.source}</span>
                  <div className="flex gap-1">
                    {news.tags.map((tag, idx) => (
                      <span 
                        key={idx}
                        className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
