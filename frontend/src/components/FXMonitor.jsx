import React, { useState, useMemo } from "react";

// --- Static Data ---
const DEALS = [
  { id: "TIQ-0019", product: "Electronics - PCBs", origin: "Shenzhen", dest: "Mumbai", value: 320000, margin: 14.2, risk: 72, status: "high", eta: "Mar 4" },
  { id: "TIQ-0020", product: "Textile Machinery", origin: "Stuttgart", dest: "Surat", value: 185000, margin: 21.0, risk: 38, status: "active", eta: "Mar 8" },
  { id: "TIQ-0021", product: "Chemical Compounds", origin: "Dubai", dest: "Chennai", value: 94000, margin: 18.7, risk: 55, status: "pending", eta: "Feb 27" },
  { id: "TIQ-0022", product: "LED Components", origin: "Guangzhou", dest: "Delhi", value: 210000, margin: 16.3, risk: 65, status: "pending", eta: "Mar 12" },
];

const LIVE_FX = [
  { pair: "USD/INR", rate: 83.47, change: -0.23 },
  { pair: "EUR/USD", rate: 1.0824, change: +0.004 },
  { pair: "USD/CNY", rate: 7.2412, change: -0.01 },
  { pair: "GBP/USD", rate: 1.2671, change: +0.009 },
  { pair: "USD/AED", rate: 3.6725, change: 0.000 },
];

const VOL_INDEX = [
  { pair: "USD/INR", value: 68, color: "#ff6b6b" }, // Red
  { pair: "USD/CNY", value: 42, color: "#00e676" }, // Green
  { pair: "EUR/USD", value: 31, color: "#00e676" }, // Green
  { pair: "GBP/USD", value: 55, color: "#ffaa00" }, // Orange
];

// --- Helper Functions ---
function getRiskClass(score) {
  if (score >= 71) return "high";
  if (score >= 41) return "medium";
  return "low";
}

function getStatusLabel(status) {
  if (status === "high") return "HIGH";
  if (status === "pending") return "PENDING";
  return "ACTIVE";
}

export default function ImExIQDashboard({ isDark = true }) {
  const [filterCountry, setFilterCountry] = useState("all");
  const [filterProduct, setFilterProduct] = useState("all");
  const [filterRisk, setFilterRisk] = useState("all");

  const countries = useMemo(() => ["all", ...Array.from(new Set(DEALS.map(d => d.dest))).sort()], []);
  const products = useMemo(() => ["all", ...Array.from(new Set(DEALS.map(d => d.product))).sort()], []);

  const filteredDeals = useMemo(() => {
    return DEALS.filter(deal => {
      const countryOk = filterCountry === "all" || deal.dest === filterCountry;
      const productOk = filterProduct === "all" || deal.product === filterProduct;
      const riskOk = filterRisk === "all" || getRiskClass(deal.risk) === filterRisk;
      return countryOk && productOk && riskOk;
    }).map(deal => ({ ...deal, statusLabel: getStatusLabel(deal.status) }));
  }, [filterCountry, filterProduct, filterRisk]);

  const kpis = useMemo(() => {
    const safeLen = Math.max(filteredDeals.length, 1);
    return {
      activeDeals: filteredDeals.length,
      totalExposure: filteredDeals.reduce((sum, item) => sum + item.value, 0),
      avgRisk: Math.round(filteredDeals.reduce((sum, item) => sum + item.risk, 0) / safeLen),
      avgMargin: (filteredDeals.reduce((sum, item) => sum + item.margin, 0) / safeLen).toFixed(1),
      delayed: filteredDeals.filter(item => item.status === "high").length
    };
  }, [filteredDeals]);

  // --- Theme Classes ---
  const bg = isDark ? "bg-[#0a0e1a]" : "bg-[#f0f4ff]";
  const card = isDark ? "bg-[#0f1825] border-[#1e2a3a]" : "bg-white border-[#dde3f0]";
  const textMain = isDark ? "text-white" : "text-[#0a0e1a]";
  const textSub = isDark ? "text-[#6a7a8a]" : "text-[#8a9ab0]";
  const inputClass = isDark ? "bg-[#080c17] border-[#1e2a3a] text-white" : "bg-[#f8faff] border-[#dde3f0] text-[#0a0e1a]";

  return (
    <div className={`h-screen w-full overflow-y-auto p-6 font-sans ${bg} ${textMain}`}>
      
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-black">ImExIQ Dashboard</h1>
        <p className={`text-sm mt-1 font-mono ${textSub}`}>Intelligent Import/Export Risk & Exposure Management</p>
      </div>

      {/* Filter Bar */}
      <div className={`flex gap-4 p-4 rounded-xl border mb-6 ${card}`}>
        <div className="flex-1">
          <label className={`block text-[10px] font-mono mb-1 ${textSub}`}>DESTINATION</label>
          <select value={filterCountry} onChange={e => setFilterCountry(e.target.value)} className={`w-full text-xs px-3 py-2 rounded border focus:outline-none focus:border-[#00e5ff] ${inputClass}`}>
            {countries.map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}
          </select>
        </div>
        <div className="flex-1">
          <label className={`block text-[10px] font-mono mb-1 ${textSub}`}>PRODUCT</label>
          <select value={filterProduct} onChange={e => setFilterProduct(e.target.value)} className={`w-full text-xs px-3 py-2 rounded border focus:outline-none focus:border-[#00e5ff] ${inputClass}`}>
            {products.map(p => <option key={p} value={p}>{p.toUpperCase()}</option>)}
          </select>
        </div>
        <div className="flex-1">
          <label className={`block text-[10px] font-mono mb-1 ${textSub}`}>RISK TIER</label>
          <select value={filterRisk} onChange={e => setFilterRisk(e.target.value)} className={`w-full text-xs px-3 py-2 rounded border focus:outline-none focus:border-[#00e5ff] ${inputClass}`}>
            <option value="all">ALL TIERS</option>
            <option value="low">LOW</option>
            <option value="medium">MEDIUM</option>
            <option value="high">HIGH</option>
          </select>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <KPICard title="TOTAL EXPOSURE" value={`$${kpis.totalExposure.toLocaleString()}`} meta="FX variance +2.1%" isDark={isDark} />
        <KPICard title="ACTIVE DEALS" value={kpis.activeDeals} meta={`${Math.max(kpis.activeDeals - 20, 0)} new this week`} isDark={isDark} />
        <KPICard title="AVG RISK SCORE" value={`${kpis.avgRisk}/100`} meta={`${kpis.delayed} high-risk deals`} isDark={isDark} color={kpis.avgRisk > 60 ? "#ff4444" : "#ffaa00"} />
        <KPICard title="AVG MARGIN" value={`${kpis.avgMargin}%`} meta="UP 1.2% vs last month" isDark={isDark} color="#00ff88" />
      </div>

      {/* LIVE FX & VOLATILITY PANELS */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        
        {/* Panel 1: Live FX Pairs */}
        <div className={`border rounded-xl p-6 ${card}`}>
          <h2 className="text-[11px] tracking-[0.15em] font-mono text-[#6a7a8a] mb-6 uppercase">Live FX Pairs</h2>
          <div className="space-y-4">
            {LIVE_FX.map((fx) => {
              const formatChange = (val) => val > 0 ? `+${val.toFixed(3)}` : val === 0 ? "0.000" : val.toFixed(2);
              const colorClass = fx.change > 0 ? "text-[#00e676]" : fx.change < 0 ? "text-[#ff6b6b]" : "text-[#6a7a8a]";
              
              return (
                <div key={fx.pair} className="flex justify-between items-center">
                  <span className="font-mono font-semibold text-sm text-[#d0dde8]">{fx.pair}</span>
                  <div className={`font-mono text-sm font-semibold ${colorClass}`}>
                    <span className="mr-3">{fx.rate.toString().includes('.') ? fx.rate : fx.rate.toFixed(2)}</span>
                    <span>{formatChange(fx.change)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Panel 2: 30-Day Volatility Index */}
        <div className={`border rounded-xl p-6 ${card}`}>
          <h2 className="text-[11px] tracking-[0.15em] font-mono text-[#6a7a8a] mb-6 uppercase">30-Day Volatility Index</h2>
          <div className="space-y-[1.125rem]">
            {VOL_INDEX.map((vol) => (
              <div key={vol.pair} className="flex items-center">
                <span className="font-mono text-xs text-[#6a7a8a] w-20">{vol.pair}</span>
                <div className="flex-1 h-2 bg-[#1e2a3a] rounded-full overflow-hidden mx-4">
                  <div className="h-full rounded-full" style={{ width: `${vol.value}%`, backgroundColor: vol.color }} />
                </div>
                <span className="font-mono text-xs text-[#d0dde8] w-6 text-right">{vol.value}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}

// Sub-component for KPI blocks
function KPICard({ title, value, meta, isDark, color }) {
  const cardClass = isDark ? "bg-[#0f1825] border-[#1e2a3a]" : "bg-white border-[#dde3f0]";
  const subText = isDark ? "text-[#6a7a8a]" : "text-[#8a9ab0]";
  
  return (
    <div className={`border rounded-xl p-5 ${cardClass}`}>
      <p className={`text-[10px] tracking-[0.15em] font-mono mb-2 ${subText}`}>{title}</p>
      <p className="text-2xl font-black mb-1" style={{ color: color || "inherit" }}>{value}</p>
      <p className={`text-[10px] font-mono ${subText}`}>{meta}</p>
    </div>
  );
}