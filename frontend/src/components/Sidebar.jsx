import { useState } from "react";

const navItems = [
  { id: "dashboard", label: "Dashboard",        icon: "⬡", badge: null },
  { id: "deals",     label: "Active Deals",     icon: "◈", badge: 24 },
  { id: "shipments", label: "Shipment Tracker", icon: "◆", badge: null },
  { id: "risk",      label: "Risk Analytics",   icon: "◆", badge: null },
  { id: "fx",        label: "FX Monitor",       icon: "○", badge: null },
  { id: "reports",   label: "Reports",          icon: "≡", badge: null },
  { id: "documents", label: "Documents",        icon: "≡", badge: null },
];

const filters = [
  { label: "All Countries", options: ["All Countries", "India", "China", "Germany", "UAE"] },
  { label: "All Products",  options: ["All Products",  "Electronics", "Machinery", "Chemicals"] },
  { label: "All Risk Levels", options: ["All Risk Levels", "High", "Medium", "Low"] },
  { label: "Last 30 days",  options: ["Last 7 days", "Last 30 days", "Last 90 days", "This Year"] },
];

export default function Sidebar({ active, onNav, isDark }) {
  const [filterValues, setFilterValues] = useState({
    0: "All Countries", 1: "All Products", 2: "All Risk Levels", 3: "Last 30 days",
  });

  const bg       = isDark ? "bg-[#080c17] border-[#1e2a3a]" : "bg-[#f8faff] border-[#dde3f0]";
  const lblC     = isDark ? "text-[#3a4a5a]" : "text-[#aab0c0]";
  const inactive = isDark ? "text-[#6a7a8a] hover:text-white hover:bg-[#1a2535]" : "text-[#7a8aa0] hover:text-[#0a0e1a] hover:bg-[#eef2ff]";
  const divider  = isDark ? "bg-[#1e2a3a]" : "bg-[#dde3f0]";
  const selStyle = isDark ? "bg-[#0f1825] border-[#1e2a3a] text-[#8a9ab0]" : "bg-white border-[#dde3f0] text-[#5a6a8a]";
  const mlBox    = isDark ? "bg-[#0f1825] border-[#1e3a2a]" : "bg-[#f0fdf4] border-[#bbf7d0]";
  const profileC = isDark ? "text-[#6a7a8a] hover:text-white hover:bg-[#1a2535]" : "text-[#7a8aa0] hover:text-[#0a0e1a] hover:bg-[#eef2ff]";

  return (
    <aside className={`fixed top-12 left-0 w-52 h-[calc(100vh-3rem)] border-r flex flex-col overflow-y-auto z-40 transition-colors duration-300 ${bg}`}>    
      <div className="p-4">
        <p className={`text-[10px] tracking-[0.2em] font-mono mb-3 ${lblC}`}>NAVIGATION</p>
        <nav className="space-y-0.5">
          {navItems.map(item => {
            const isActive = active === item.id;
            return (
              <button key={item.id} onClick={() => onNav(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded text-xs transition-all duration-150
                  ${isActive ? "bg-[#00e5ff] text-[#0a0e1a] font-bold" : inactive}`}>
                <div className="flex items-center gap-2">
                  <span className="text-sm">{item.icon}</span>
                  {item.label}
                </div>
                {item.badge && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full
                    ${isActive ? "bg-[#0a0e1a] text-[#00e5ff]" : "bg-[#ff4444] text-white"}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className={`h-px mx-4 ${divider}`} />

      <div className="p-4">
        <p className={`text-[10px] tracking-[0.2em] font-mono mb-3 ${lblC}`}>FILTERS</p>
        <div className="space-y-2">
          {filters.map((f, i) => (
            <select key={i} value={filterValues[i]}
              onChange={e => setFilterValues(prev => ({ ...prev, [i]: e.target.value }))}
              className={`w-full border text-xs px-3 py-2 rounded appearance-none cursor-pointer transition-colors ${selStyle}`}
              style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%238a9ab0' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14L2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 8px center", backgroundSize: "10px", paddingRight: "24px" }}>
              {f.options.map(o => <option key={o}>{o}</option>)}
            </select>
          ))}
        </div>
      </div>

      <div className="mt-auto p-4 space-y-3">
        <button onClick={() => onNav("profile")}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded text-xs transition-all
            ${active === "profile" ? "bg-[#00e5ff] text-[#0a0e1a] font-bold" : profileC}`}>
          <span className="text-sm">◉</span>
          My Profile
        </button>

        <div className={`border rounded p-3 ${mlBox}`}>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-pulse" />
            <span className="text-[#00ff88] text-[10px] font-mono tracking-wider">ML ENGINE</span>
          </div>
          <p className={`text-[10px] leading-relaxed ${isDark ? "text-[#6a7a8a]" : "text-[#5a8a6a]"}`}>
            Risk prediction model active. Scoring 8 live deals.
          </p>
        </div>
      </div>
    </aside>
  );
}
