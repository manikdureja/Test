const statusStyle = {
  HIGH: "bg-[#ff3333]/20 text-[#ff5555] border border-[#ff3333]/30",
  ACTIVE: "bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]/20",
  PENDING: "bg-[#ffaa00]/10 text-[#ffaa00] border border-[#ffaa00]/20",
  "IN TRANSIT": "bg-[#00e5ff]/10 text-[#00e5ff] border border-[#00e5ff]/20",
  IN: "bg-[#00e5ff]/10 text-[#00e5ff] border border-[#00e5ff]/20",
  DONE: "bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]/20",
};

function RiskBar({ score }) {
  const color = score >= 70 ? "#ff4444" : score >= 50 ? "#ffaa00" : "#00ff88";
  return (
    <div className="flex items-center gap-2">
      <span className="text-white text-xs font-bold w-5">{score}</span>
      <div className="w-16 h-1.5 bg-[#1e2a3a] rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${score}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

export default function DealTable({ deals, onRowClick, isDark, completed }) {
  const headerC = isDark ? "text-[#3a4a5a] border-[#1e2a3a]" : "text-[#aab0c0] border-[#dde3f0]";
  const rowHover = isDark ? "hover:bg-[#0f1825]" : "hover:bg-[#eef2ff]";
  const rowBorder = isDark ? "border-[#1e2a3a]/50" : "border-[#eef2ff]";
  const idColor = completed ? "text-[#00ff88]" : "text-[#00e5ff]";
  const productC = isDark ? "text-[#d0dde8]" : "text-[#1a2a3a]";
  const routeC = isDark ? "text-[#6a7a8a]" : "text-[#9aabb0]";
  const valueC = isDark ? "text-white" : "text-[#0a0e1a]";

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className={`border-b ${headerC}`}>
            {["DEAL ID", "PRODUCT", "ORIGIN → DEST", "VALUE", "MARGIN %", "RISK SCORE", "STATUS", "ETA"].map((h) => (
              <th key={h} className={`text-left font-mono text-[10px] tracking-[0.12em] px-4 py-3 whitespace-nowrap ${headerC}`}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {deals.map((deal) => (
            <tr
              key={deal.id}
              onClick={() => onRowClick && onRowClick(deal)}
              className={`border-b transition-colors group ${rowBorder} ${onRowClick ? `cursor-pointer ${rowHover}` : ""} ${completed ? "opacity-60" : ""}`}
            >
              <td className={`px-4 py-3 font-mono font-bold ${idColor}`}>{deal.id}</td>
              <td className={`px-4 py-3 font-medium ${productC}`}>{deal.product}</td>
              <td className={`px-4 py-3 font-mono ${routeC}`}>{deal.origin} → {deal.destination}</td>
              <td className={`px-4 py-3 font-bold ${valueC}`}>${Number(deal.value).toLocaleString()}</td>
              <td className="px-4 py-3">
                <span className={`font-bold ${parseFloat(deal.margin) >= 20 ? "text-[#00ff88]" : parseFloat(deal.margin) >= 15 ? "text-[#ffaa00]" : "text-[#ff5555]"}`}>
                  {deal.margin}%
                </span>
              </td>
              <td className="px-4 py-3"><RiskBar score={deal.riskScore} /></td>
              <td className="px-4 py-3">
                <span className={`px-2 py-1 rounded text-[10px] font-bold tracking-wider ${statusStyle[deal.status] || statusStyle["IN"]}`}>
                  {deal.status}
                </span>
              </td>
              <td className={`px-4 py-3 font-mono ${routeC}`}>{deal.eta}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
