// Sidebar.jsx
const navItems = [
  { id: "dashboard", label: "Dashboard",        icon: "⬡", badge: null },
  { id: "deals",     label: "Active Deals",     icon: "◈", badge: null },
  { id: "forecast",  label: "Price Forecast",   icon: "◒", badge: null },
  { id: "fx",        label: "FX Monitor",       icon: "○", badge: null },
  { id: "documents", label: "Documents",        icon: "≡", badge: null },
];

const filters = [
  { label: "All Countries", options: ["All Countries", "India", "China", "Germany", "UAE"] },
  { label: "All Products",  options: ["All Products",  "Electronics", "Machinery", "Chemicals"] },
  { label: "All Risk Levels", options: ["All Risk Levels", "High", "Medium", "Low"] },
  { label: "Last 30 days",  options: ["Last 7 days", "Last 30 days", "Last 90 days", "This Year"] },
];

// 1. ADD filterValues and onFilterChange to props!
export default function Sidebar({ active, onNav, isDark, isCollapsed, filterValues, onFilterChange }) {
  
  const bg       = isDark ? "bg-[#080c17]" : "bg-[#f8faff]";
  const lblC     = isDark ? "text-[#3a4a5a]" : "text-[#aab0c0]";
  const inactive = isDark ? "text-[#6a7a8a] hover:text-white hover:bg-[#1a2535]" : "text-[#7a8aa0] hover:text-[#0a0e1a] hover:bg-[#eef2ff]";
  const divider  = isDark ? "bg-[#1e2a3a]" : "bg-[#dde3f0]";
  const selStyle = isDark ? "bg-[#0f1825] border-[#1e2a3a] text-[#8a9ab0]" : "bg-white border-[#dde3f0] text-[#5a6a8a]";
  const profileC = isDark ? "text-[#6a7a8a] hover:text-white hover:bg-[#1a2535]" : "text-[#7a8aa0] hover:text-[#0a0e1a] hover:bg-[#eef2ff]";

  return (
    <aside className={`flex flex-col h-full w-full overflow-y-auto overflow-x-hidden z-40 transition-colors duration-300 ${bg}`}>    
      <div className={`p-4 transition-all duration-200 ${isCollapsed ? "px-2" : "px-4"}`}>
        <p className={`text-[10px] tracking-[0.2em] font-mono mb-3 transition-opacity duration-200 ${lblC} ${isCollapsed ? "opacity-0 h-0 mb-0 overflow-hidden" : "opacity-100"}`}>
          NAVIGATION
        </p>
        
        <nav className="space-y-0.5">
          {navItems.map(item => {
            const isActive = active === item.id;
            return (
              <button 
                key={item.id} onClick={() => onNav(item.id)} title={isCollapsed ? item.label : ""}
                className={`w-full flex items-center ${isCollapsed ? "justify-center" : "justify-between"} px-3 py-2 rounded text-xs transition-all duration-150 ${isActive ? "bg-[#00e5ff] text-[#0a0e1a] font-bold" : inactive}`}
              >
                <div className="flex items-center">
                  <span className="text-sm flex-shrink-0">{item.icon}</span>
                  <span className={`whitespace-nowrap transition-all duration-200 overflow-hidden text-left ${isCollapsed ? "w-0 opacity-0 ml-0" : "w-auto opacity-100 ml-2"}`}>
                    {item.label}
                  </span>
                </div>
                {!isCollapsed && item.badge && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 transition-opacity duration-200 ${isActive ? "bg-[#0a0e1a] text-[#00e5ff]" : "bg-[#ff4444] text-white"}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className={`h-px mx-4 transition-opacity duration-200 ${divider} ${isCollapsed ? "opacity-0" : "opacity-100"}`} />

      {/* ── FILTERS SECTION ── */}
      <div className={`transition-all duration-300 overflow-hidden ${isCollapsed ? "max-h-0 opacity-0 p-0 m-0" : "max-h-96 opacity-100 p-4"}`}>
        <p className={`text-[10px] tracking-[0.2em] font-mono mb-3 ${lblC}`}>FILTERS</p>
        <div className="space-y-2">
          {filters.map((f, i) => (
            <select 
              key={i} 
              // 2. Use the props passed down from App.jsx
              value={filterValues[i]}
              onChange={e => onFilterChange(prev => ({ ...prev, [i]: e.target.value }))}
              className={`w-full border text-xs px-3 py-2 rounded appearance-none cursor-pointer transition-colors ${selStyle}`}
              style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%238a9ab0' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14L2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 8px center", backgroundSize: "10px", paddingRight: "24px" }}
            >
              {/* Added value={o} here to prevent React select bugs */}
              {f.options.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          ))}
        </div>
      </div>

      <div className={`mt-auto space-y-3 transition-all duration-200 ${isCollapsed ? "p-2 pb-4" : "p-4"}`}>
        <button onClick={() => onNav("profile")} title={isCollapsed ? "My Profile" : ""} className={`w-full flex items-center ${isCollapsed ? "justify-center" : "justify-start"} px-3 py-2 rounded text-xs transition-all ${active === "profile" ? "bg-[#00e5ff] text-[#0a0e1a] font-bold" : profileC}`}>
          <span className="text-sm flex-shrink-0">◉</span>
          <span className={`whitespace-nowrap transition-all duration-200 overflow-hidden ${isCollapsed ? "w-0 opacity-0 ml-0" : "w-auto opacity-100 ml-2"}`}>
            My Profile
          </span>
        </button>
      </div>
    </aside>
  );
}
