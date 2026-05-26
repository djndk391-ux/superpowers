import { useStore } from "@/store/useStore";
import { Dashboard } from "@/pages/Dashboard";
import { MarketData } from "@/pages/MarketData";
import { AnalysisReport } from "@/pages/AnalysisReport";
import { RiskMonitor } from "@/pages/RiskMonitor";
import { StrategyManager } from "@/pages/StrategyManager";

export default function App() {
  const { activePage, setActivePage } = useStore();

  const renderPage = () => {
    switch (activePage) {
      case "dashboard":
        return <Dashboard />;
      case "market":
        return <MarketData />;
      case "analysis":
        return <AnalysisReport />;
      case "risk":
        return <RiskMonitor />;
      case "strategy":
        return <StrategyManager />;
      default:
        return <Dashboard />;
    }
  };

  // 如果不是dashboard页面，显示导航栏
  const showNav = activePage !== "dashboard";

  return (
    <div className="min-h-screen bg-slate-900">
      {showNav && (
        <nav className="bg-slate-800 border-b border-slate-700 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📈</span>
                <h1 className="text-xl font-bold text-white">A股热点轮动交易系统</h1>
              </div>
              <div className="flex items-center gap-2">
                {[
                  { id: "dashboard", label: "主控", icon: "🏠" },
                  { id: "market", label: "市场", icon: "📊" },
                  { id: "analysis", label: "分析", icon: "🔍" },
                  { id: "risk", label: "风险", icon: "⚠️" },
                  { id: "strategy", label: "策略", icon: "💡" },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActivePage(item.id as any)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                      activePage === item.id
                        ? "bg-blue-600 text-white"
                        : "bg-slate-700 text-gray-300 hover:bg-slate-600"
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </nav>
      )}

      {renderPage()}
    </div>
  );
}
