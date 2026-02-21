export default function StatCard({ label, value, sub, subColor = "#00ff88", isDark }) {
  const border = isDark ? "border-[#1e2a3a]" : "border-[#dde3f0]";
  const labelC = isDark ? "text-[#4a5a6a]" : "text-[#aab0c0]";
  const valueC = isDark ? "text-white" : "text-[#0a0e1a]";
  return (
    <div className={`flex-1 min-w-0 px-5 py-3 border-r last:border-r-0 ${border}`}>
      <p className={`text-[9px] tracking-[0.18em] font-mono uppercase mb-1 ${labelC}`}>{label}</p>
      <p className={`text-xl font-black leading-tight tracking-tight ${valueC}`}>{value}</p>
      {sub && <p className="text-[11px] font-mono mt-0.5" style={{ color: subColor }}>{sub}</p>}
    </div>
  );
}
