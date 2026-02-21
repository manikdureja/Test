import { useState } from "react";
import StatCard from "../components/StatCard";
import DealTable from "../components/DealTable";
import RightPanel from "../components/RightPanel";
import FXMonitor from "../components/FXMonitor";

const TABS = ["Deal Table", "Risk Analytics", "FX Monitor", "Price Forecast"];

const INITIAL_DEALS = [
  { id: "TIQ-0019", product: "Electronics — PCBs", origin: "Shenzhen", destination: "Mumbai", value: 320000, margin: "14.2", riskScore: 72, status: "HIGH", eta: "Mar 4", completed: false },
  { id: "TIQ-0020", product: "Textile Machinery", origin: "Stuttgart", destination: "Surat", value: 185000, margin: "21.0", riskScore: 38, status: "ACTIVE", eta: "Mar 8", completed: false },
  { id: "TIQ-0021", product: "Chemical Compounds", origin: "Dubai", destination: "Chennai", value: 94000, margin: "18.7", riskScore: 55, status: "IN", eta: "Feb 27", completed: false },
  { id: "TIQ-0022", product: "LED Components", origin: "Guangzhou", destination: "Delhi", value: 210000, margin: "16.3", riskScore: 65, status: "PENDING", eta: "Mar 12", completed: false },
  { id: "TIQ-0023", product: "Steel Coils", origin: "Seoul", destination: "Nhava Sheva", value: 440000, margin: "9.8", riskScore: 47, status: "IN", eta: "Mar 1", completed: false },
  { id: "TIQ-0024", product: "Auto Parts", origin: "Tokyo", destination: "Pune", value: 275000, margin: "22.4", riskScore: 31, status: "ACTIVE", eta: "Mar 15", completed: false },
  { id: "TIQ-0025", product: "Pharma Raw Mat.", origin: "Basel", destination: "Hyderabad", value: 560000, margin: "28.1", riskScore: 44, status: "ACTIVE", eta: "Mar 7", completed: false },
  { id: "TIQ-0026", product: "Solar Panels", origin: "Suzhou", destination: "Rajkot", value: 380000, margin: "11.5", riskScore: 79, status: "HIGH", eta: "Mar 20", completed: false },
];

export default function Dashboard({ newDeal, isDark }) {
  const [tab, setTab] = useState("Deal Table");
  const [deals, setDeals] = useState(INITIAL_DEALS);
  const [selected, setSelected] = useState(null);
  const [completedToast, setCompletedToast] = useState(null);
  const [showCompleted, setShowCompleted] = useState(false);

  const allDeals = newDeal
    ? [...deals, {
        id: `TIQ-${String(deals.length + 19).padStart(4, "0")}`,
        product: newDeal.product,
        origin: newDeal.origin,
        destination: newDeal.destination,
        value: Number(newDeal.value),
        margin: newDeal.margin || "—",
        riskScore: newDeal.riskScore,
        status: newDeal.status,
        eta: "TBD",
        completed: false,
      }]
    : deals;

  const activeDeals = allDeals.filter((d) => !d.completed);
  const completedDeals = allDeals.filter((d) => d.completed);

  const totalExposure = (activeDeals.reduce((s, d) => s + d.value, 0) / 1e6).toFixed(1);
  const avgRisk = activeDeals.length ? Math.round(activeDeals.reduce((s, d) => s + d.riskScore, 0) / activeDeals.length) : 0;

  const handleCompleteDeal = (deal) => {
    setDeals((prev) => prev.map((d) => d.id === deal.id ? { ...d, completed: true, status: "DONE" } : d));
    setSelected(null);
    setCompletedToast(deal);
    setTimeout(() => setCompletedToast(null), 3500);
  };

  const bg = isDark ? "bg-[#0a0e1a]" : "bg-[#f0f4ff]";
  const statsBg = isDark ? "bg-[#080c17] border-[#1e2a3a]" : "bg-white border-[#dde3f0]";
  const tabBg = isDark ? "bg-[#0a0e1a] border-[#1e2a3a]" : "bg-white border-[#dde3f0]";
  const tabActive = isDark ? "text-white border-[#00e5ff]" : "text-[#0a0e1a] border-[#00e5ff]";
  const tabInactive = isDark ? "text-[#4a5a6a] border-transparent hover:text-[#8a9ab0]" : "text-[#9aabb0] border-transparent hover:text-[#5a6a8a]";
  const drawerBg = isDark ? "bg-[#0a0e1a] border-[#1e2a3a]" : "bg-white border-[#dde3f0]";
  const drawerText = isDark ? "text-white" : "text-[#0a0e1a]";
  const drawerSub = isDark ? "text-[#4a5a6a]" : "text-[#8a9ab0]";
  const drawerRow = isDark ? "border-[#1e2a3a]" : "border-[#eef2ff]";

  return (
    <div className={`flex h-full transition-colors duration-300 ${bg}`}>
      <div className="flex-1 min-w-0 overflow-y-auto">  
        <div className={`flex border-b transition-colors duration-300 ${statsBg}`}>
          <div className={`flex-shrink-0 px-5 py-3 border-r ${isDark ? "border-[#1e2a3a]" : "border-[#dde3f0]"}`}>
            <p className={`text-[9px] tracking-[0.18em] font-mono uppercase mb-1 ${isDark ? "text-[#4a5a6a]" : "text-[#aab0c0]"}`}>ACTIVE DEALS</p>
            <p className={`text-xl font-black ${isDark ? "text-white" : "text-[#0a0e1a]"}`}>{activeDeals.length}</p>
            <p className="text-[#00ff88] text-[11px] font-mono">↑ 3 this week</p>
          </div>
          <StatCard label="Total Exposure" value={`$${totalExposure}M`} sub="⚡ FX var ±2.1%" isDark={isDark} />
          <StatCard label="Avg Risk Score" value={avgRisk} sub="↑ 4pts vs last month" subColor={avgRisk > 60 ? "#ff4444" : "#ffaa00"} isDark={isDark} />
          <StatCard label="USD / INR" value="83.47" sub="↓ 0.23" subColor="#ff4444" isDark={isDark} />
          <StatCard label="EUR / USD" value="1.082" sub="↑ 0.004" isDark={isDark} />
          <StatCard label="Shipments En Route" value="11" sub="2 delayed" subColor="#ffaa00" isDark={isDark} />
          <StatCard label="Margin Avg" value="18.4%" sub="↑ 1.2%" isDark={isDark} />
        </div>

        <div className={`flex items-center justify-between border-b px-4 transition-colors duration-300 ${tabBg}`}>
          <div className="flex">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-3 text-xs font-medium transition-all border-b-2 -mb-px ${tab === t ? tabActive : tabInactive}`}
              >
                {t}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowCompleted((p) => !p)}
            className={`text-[10px] font-mono px-3 py-1.5 rounded border transition-all ${
              showCompleted
                ? "border-[#00ff88] text-[#00ff88] bg-[#00ff88]/10"
                : isDark ? "border-[#1e2a3a] text-[#4a5a6a]" : "border-[#dde3f0] text-[#aab0c0]"
            }`}
          >
            {showCompleted ? "▼" : "▶"} COMPLETED ({completedDeals.length})
          </button>
        </div>

        <div className={`min-h-full transition-colors duration-300 ${isDark ? "bg-[#0a0e1a]" : "bg-[#f8faff]"}`}>
          {tab === "Deal Table" && (
            <>
              <DealTable deals={activeDeals} onRowClick={setSelected} isDark={isDark} />
              {showCompleted && completedDeals.length > 0 && (
                <div className={`border-t mt-2 ${isDark ? "border-[#1e2a3a]" : "border-[#dde3f0]"}`}>
                  <div className="px-4 py-2 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88]" />
                    <span className={`text-[10px] font-mono tracking-widest ${isDark ? "text-[#3a4a5a]" : "text-[#aab0c0]"}`}>COMPLETED DEALS</span>
                  </div>
                  <DealTable deals={completedDeals} isDark={isDark} completed />
                </div>
              )}
            </>
          )}
          {tab === "FX Monitor" && <FXMonitor isDark={isDark} />}
          {tab === "Risk Analytics" && (
            <div className="flex items-center justify-center h-64">
              <p className={`font-mono text-sm ${isDark ? "text-[#3a4a5a]" : "text-[#aab0c0]"}`}>Risk Analytics — Connect ML model endpoint</p>
            </div>
          )}
          {tab === "Price Forecast" && (
            <div className="flex items-center justify-center h-64">
              <p className={`font-mono text-sm ${isDark ? "text-[#3a4a5a]" : "text-[#aab0c0]"}`}>Price Forecast — Connect ML model endpoint</p>
            </div>
          )}
        </div>
      </div>

      <RightPanel isDark={isDark} />

      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSelected(null)} />
          <div className={`relative w-96 border-l h-full overflow-y-auto shadow-2xl transition-colors ${drawerBg}`}>
            <div className={`p-6 border-b flex items-start justify-between ${drawerRow}`}>
              <div>
                <p className="text-[#00e5ff] font-mono font-bold text-sm">{selected.id}</p>
                <h3 className={`font-bold text-base mt-1 ${drawerText}`}>{selected.product}</h3>
              </div>
              <button onClick={() => setSelected(null)} className={`text-lg ${drawerSub} hover:text-[#00e5ff]`}>✕</button>
            </div>
            <div className="p-6 space-y-4">
              {[
                ["Route", `${selected.origin} → ${selected.destination}`],
                ["Deal Value", `$${Number(selected.value).toLocaleString()}`],
                ["Margin", `${selected.margin}%`],
                ["Risk Score", selected.riskScore],
                ["Status", selected.status],
                ["ETA", selected.eta],
              ].map(([k, v]) => (
                <div key={k} className={`flex justify-between border-b pb-3 ${drawerRow}`}>
                  <span className={`text-xs font-mono ${drawerSub}`}>{k}</span>
                  <span className={`text-xs font-bold ${drawerText}`}>{v}</span>
                </div>
              ))}

              <div className={`rounded-lg p-4 mt-2 ${isDark ? "bg-[#0f1825] border border-[#1e3a2a]" : "bg-[#f0fdf4] border border-[#bbf7d0]"}`}>
                <p className="text-[#00ff88] text-[10px] font-mono tracking-wider mb-2">ML RISK ANALYSIS</p>
                <p className={`text-xs leading-relaxed ${isDark ? "text-[#5a6a7a]" : "text-[#5a8a6a]"}`}>
                  Integrate your ML model via <code className="text-[#00e5ff]">api.js → getPrediction(dealId)</code> for detailed risk breakdown.
                </p>
              </div>

              {!selected.completed && (
                <button
                  onClick={() => handleCompleteDeal(selected)}
                  className="w-full mt-4 py-3 rounded-lg text-xs font-bold border-2 border-[#00ff88] text-[#00ff88] hover:bg-[#00ff88] hover:text-[#0a0e1a] transition-all duration-200"
                >
                  ✓ Mark as Completed
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {completedToast && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce-once">
          <div className="bg-[#0f1825] border border-[#00ff88]/40 rounded-xl px-5 py-4 shadow-[0_0_30px_rgba(0,255,136,0.2)] flex items-start gap-3 max-w-xs">
            <span className="text-[#00ff88] text-xl">✓</span>
            <div>
              <p className="text-[#00ff88] text-xs font-bold font-mono">Deal Completed!</p>
              <p className="text-[#8a9ab0] text-xs mt-0.5">{completedToast.id} — {completedToast.product}</p>
              <p className="text-[#4a5a6a] text-[10px] mt-1 font-mono">Moved to completed archive.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}