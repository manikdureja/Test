export default function Landing({ onGetStarted, isDark }) {
    const bg = isDark ? "bg-[#0a0e1a]" : "bg-[#f0f4ff]";
    const text = isDark ? "text-white" : "text-[#0a0e1a]";
    const sub = isDark ? "text-[#4a5a6a]" : "text-[#5a6a8a]";
    const cardBg = isDark ? "bg-[#0f1825] border-[#1e2a3a]" : "bg-white border-[#dde3f0]";
    const accent = "#00e5ff";
  
    const stats = [
      { value: "$4.2M", label: "Exposure Tracked" },
      { value: "24", label: "Active Deals" },
      { value: "98%", label: "ML Accuracy" },
      { value: "11", label: "Live Shipments" },
    ];
  
    const features = [
      { icon: "⚡", title: "Real-time Risk Scoring", desc: "ML model scores every deal instantly based on geopolitical, FX, and logistics signals." },
      { icon: "◈", title: "Live FX Monitor", desc: "Track USD/INR, EUR/USD, GBP/USD and more with 30-day volatility analysis." },
      { icon: "◆", title: "Shipment Intelligence", desc: "End-to-end visibility from origin port to destination with delay alerts." },
      { icon: "≡", title: "Geopolitical Feed", desc: "Curated alerts on sanctions, port congestion, and trade policy changes." },
    ];
  
    return (
      <div className={`min-h-screen ${bg} ${text} transition-colors duration-300`}>
        <nav className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 h-14 border-b ${isDark ? "border-[#1e2a3a] bg-[#0a0e1a]/90" : "border-[#dde3f0] bg-white/90"} backdrop-blur-sm`}>
          <span className="font-black text-xl tracking-tight">
            Trade<span style={{ color: accent }}>IQ</span>
          </span>
          <button
            onClick={onGetStarted}
            className="text-xs font-bold px-5 py-2 rounded transition-all duration-150"
            style={{ backgroundColor: accent, color: "#0a0e1a", boxShadow: `0 0 16px rgba(0,229,255,0.3)` }}
          >
            Login →
          </button>
        </nav>

        <div className="pt-40 pb-20 px-8 text-center max-w-4xl mx-auto">
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-mono mb-8 border ${isDark ? "border-[#1e3a2a] bg-[#0f1825] text-[#00ff88]" : "border-[#c0e8d0] bg-[#f0fdf4] text-[#16a34a]"}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-pulse inline-block" />
            ML-powered trade intelligence platform
          </div>
  
          <h1 className="text-6xl font-black leading-tight mb-6 tracking-tight">
            Global Trade,<br />
            <span style={{ color: accent }}>Intelligently</span> Managed.
          </h1>
  
          <p className={`text-lg ${sub} max-w-xl mx-auto mb-10 leading-relaxed`}>
            Real-time risk scoring, FX monitoring, and shipment tracking — all in one dashboard built for modern import-export teams.
          </p>
  
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={onGetStarted}
              className="font-bold px-8 py-3 rounded-lg transition-all duration-150 text-sm"
              style={{ backgroundColor: accent, color: "#0a0e1a", boxShadow: `0 0 24px rgba(0,229,255,0.35)` }}
            >
              Get Started Free
            </button>
            <button className={`font-medium px-8 py-3 rounded-lg text-sm border transition-all ${isDark ? "border-[#1e2a3a] text-[#8a9ab0] hover:border-[#2e3a4a]" : "border-[#dde3f0] text-[#5a6a8a] hover:border-[#c0cde0]"}`}>
              Watch Demo ▶
            </button>
          </div>
        </div>
  
        <div className={`max-w-3xl mx-4 md:mx-8 lg:mx-auto mb-20 grid grid-cols-4 divide-x 
  ${isDark 
    ? "divide-[#1e2a3a] border border-[#1e2a3a] bg-[#0f1825]" 
    : "divide-[#dde3f0] border border-[#dde3f0] bg-white"} 
  rounded-2xl overflow-hidden`}>
          {stats.map((s) => (
            <div key={s.label} className="text-center py-6">
              <p className="text-3xl font-black" style={{ color: accent }}>{s.value}</p>
              <p className={`text-xs font-mono mt-1 ${sub}`}>{s.label}</p>
            </div>
          ))}
        </div>
  
        <div className="max-w-4xl mx-auto px-8 mb-24">
          <h2 className="text-center text-2xl font-black mb-12">Everything your trade desk needs</h2>
          <div className="grid grid-cols-2 gap-4">
            {features.map((f) => (
              <div key={f.title} className={`border rounded-xl p-6 ${cardBg} transition-all hover:border-[#00e5ff]/30`}>
                <span className="text-2xl">{f.icon}</span>
                <h3 className="font-bold text-sm mt-3 mb-2">{f.title}</h3>
                <p className={`text-xs leading-relaxed ${sub}`}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
  
        <div className={`border-t ${isDark ? "border-[#1e2a3a]" : "border-[#dde3f0]"} py-12 text-center`}>
          <p className={`text-sm ${sub} mb-4`}>Ready to bring intelligence to your trade ops?</p>
          <button
            onClick={onGetStarted}
            className="font-bold px-8 py-3 rounded-lg text-sm transition-all"
            style={{ backgroundColor: accent, color: "#0a0e1a", boxShadow: `0 0 20px rgba(0,229,255,0.3)` }}
          >
            Start Now — It's Free
          </button>
          <p className={`text-xs mt-8 ${sub} opacity-50`}>© 2026 TradeIQ. Built for the hackathon 🚀</p>
        </div>
      </div>
    );
  }
  