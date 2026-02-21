import { useState, useEffect } from "react";

export default function Navbar({ onAddDeal, isDark, onToggleTheme, user, onProfileClick }) {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const utcTime = time.toUTCString().split(" ")[4] + " UTC";

  const nav      = isDark ? "bg-[#0a0e1a] border-[#1e2a3a]" : "bg-white border-[#dde3f0]";
  const muted    = isDark ? "text-[#3a4a5a]" : "text-[#aab0c0]";
  const userText = isDark ? "text-[#8a9ab0]" : "text-[#6a7a8a]";
  const avatarBg = isDark ? "bg-[#1e2a3a] border-[#2e3a4a]" : "bg-[#eef2ff] border-[#dde3f0]";
  const logoText = isDark ? "text-white" : "text-[#0a0e1a]";

  return (
    <nav className={`h-12 border-b flex items-center justify-between px-6 z-50 fixed top-0 left-0 right-0 transition-colors duration-300 ${nav}`}>
      <div className="flex items-center gap-3">
        <span className={`font-black text-lg tracking-tight ${logoText}`}>
          Trade<span className="text-[#00e5ff]">IQ</span>
        </span>
        <span className={`text-xs font-mono ${muted}`}>// Global Trade Intelligence</span>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse" />
          <span className="text-[#00ff88] text-xs font-mono tracking-widest">LIVE FEEDS ACTIVE</span>
        </div>
        <span className={`text-xs font-mono ${muted}`}>{utcTime}</span>
      </div>

      <div className="flex items-center gap-3">
        <button onClick={onToggleTheme} title="Toggle theme"
          className={`w-9 h-9 rounded-lg flex items-center justify-center text-base border transition-all duration-200
            ${isDark ? "bg-[#1e2a3a] border-[#2e3a4a] hover:border-[#00e5ff]/40" : "bg-[#f0f4ff] border-[#dde3f0] hover:border-[#00e5ff]/40"}`}>
          {isDark ? "☀️" : "🌙"}
        </button>

        <button onClick={onAddDeal}
          className="flex items-center gap-2 bg-[#00e5ff] hover:bg-[#00cfee] text-[#0a0e1a] text-xs font-bold px-4 py-1.5 rounded transition-all shadow-[0_0_12px_rgba(0,229,255,0.3)] hover:shadow-[0_0_20px_rgba(0,229,255,0.5)]">
          <span className="text-base leading-none">+</span> Add Deal
        </button>

        <button onClick={onProfileClick}
          className={`flex items-center gap-2 text-xs transition-all hover:opacity-80 ${userText}`}>
          <div className={`w-7 h-7 rounded-full border flex items-center justify-center text-xs text-[#00e5ff] font-bold transition-all hover:border-[#00e5ff]/60 ${avatarBg}`}>
            {user?.name?.[0] || "R"}
          </div>
          <span>{user?.name || "Rahul M."}</span>
        </button>
      </div>
    </nav>
  );
}
