const fxPairs = [
  { pair: "USD/INR", value: "83.47", change: "↓", color: "#ff4444" },
  { pair: "EUR/USD", value: "1.082", change: "↑", color: "#00ff88" },
  { pair: "USD/CNY", value: "7.241", change: "→", color: "#ffaa00" },
  { pair: "GBP/USD", value: "1.267", change: "↑", color: "#00ff88" },
];

const geoFeed = [
  { color: "#ff4444", text: "New trade sanctions on select Chinese electronics exporters announced — DHS bulletin" },
  { color: "#ffaa00", text: "Port of Nhava Sheva congestion: 3-5 day delays on container vessels" },
  { color: "#ffaa00", text: "Brent crude up 2.3% — shipping surcharges expected from Gulf carriers" },
  { color: "#4a5a6a", text: "IMF upgrades India GDP forecast to 6.8% for FY25" },
];

const shipments = [
  { from: "Shanghai", to: "Mumbai", vessel: "OOCL Mercury", status: "Delayed 3d", statusColor: "#ff4444", progress: 65 },
  { from: "Dubai", to: "Delhi", vessel: "MSC Zara", status: "On Track", statusColor: "#00ff88", progress: 40 },
];

export default function RightPanel({ isDark }) {
  const bg = isDark ? "bg-[#080c17] border-[#1e2a3a]" : "bg-[#f8faff] border-[#dde3f0]";
  const sectionBorder = isDark ? "border-[#1e2a3a]" : "border-[#dde3f0]";
  const label = isDark ? "text-[#3a4a5a]" : "text-[#aab0c0]";
  const pairLabel = isDark ? "text-[#6a7a8a]" : "text-[#9aabb0]";
  const feedText = isDark ? "text-[#5a6a7a]" : "text-[#7a8a9a]";
  const vesselText = isDark ? "text-[#4a5a6a]" : "text-[#9aabb0]";
  const shipTitle = isDark ? "text-white" : "text-[#0a0e1a]";
  const trackBg = isDark ? "bg-[#1e2a3a]" : "bg-[#dde3f0]";

  return (
    <div className={`w-64 flex-shrink-0 border-l overflow-y-auto transition-colors duration-300 ${bg}`}>
      <div className={`p-4 border-b ${sectionBorder}`}>
        <p className={`text-[10px] tracking-[0.18em] font-mono mb-3 ${label}`}>LIVE FX MONITOR</p>
        <div className="space-y-2">
          {fxPairs.map((fx) => (
            <div key={fx.pair} className="flex items-center justify-between">
              <span className={`text-xs font-mono ${pairLabel}`}>{fx.pair}</span>
              <span className="text-xs font-bold font-mono" style={{ color: fx.color }}>{fx.value} {fx.change}</span>
            </div>
          ))}
          <div className={`flex items-center justify-between pt-1 border-t ${sectionBorder}`}>
            <span className={`text-[10px] font-mono ${label}`}>30d vol (USD/INR)</span>
            <span className="text-[#ffaa00] text-[10px] font-bold font-mono">2.1%</span>
          </div>
        </div>
      </div>

      <div className={`p-4 border-b ${sectionBorder}`}>
        <p className={`text-[10px] tracking-[0.18em] font-mono mb-3 ${label}`}>GEOPOLITICAL FEED</p>
        <div className="space-y-3">
          {geoFeed.map((item, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: item.color }} />
              <p className={`text-[11px] leading-relaxed ${feedText}`}>{item.text}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4">
        <p className={`text-[10px] tracking-[0.18em] font-mono mb-3 ${label}`}>SHIPMENT STATUS</p>
        <div className="space-y-4">
          {shipments.map((s, i) => (
            <div key={i}>
              <div className="flex items-center justify-between mb-1">
                <span className={`text-xs font-bold ${shipTitle}`}>{s.from} → {s.to}</span>
                <span className="text-[10px] font-bold font-mono" style={{ color: s.statusColor }}>{s.status}</span>
              </div>
              <p className={`text-[10px] font-mono mb-2 ${vesselText}`}>{s.vessel}</p>
              <div className={`w-full h-1 rounded-full overflow-hidden ${trackBg}`}>
                <div className="h-full rounded-full" style={{ width: `${s.progress}%`, backgroundColor: s.statusColor }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
