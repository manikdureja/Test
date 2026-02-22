import { useState, useRef, useEffect, useCallback } from "react";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import AddDealModal from "./components/AddDealModal";
import Dashboard from "./Pages/Dashboard";
import FXMonitor from "./components/FXMonitor";
import Profile from "./components/Profile";
import Landing from "./Pages/Landing";
import Login from "./Pages/Login";
import PriceForecast from "./components/PriceForecast";
import Documents from "./components/Documents";

export default function App() {
  const [page, setPage] = useState("landing"); 
  const [activeNav, setActiveNav] = useState("dashboard");
  const [modalOpen, setModalOpen] = useState(false);
  const [latestDeal, setLatestDeal] = useState(null);
  const [isDark, setIsDark] = useState(true);
  const [user, setUser] = useState(null);

  // --- Sidebar Resizing State ---
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(240); // Default width in pixels
  const isDragging = useRef(false);

  // --- 1. Lifted Filter State ---
  const [filterValues, setFilterValues] = useState({
    0: "All Countries", 1: "All Products", 2: "All Risk Levels", 3: "Last 30 days",
  });

  const handleLogin = (userData) => { setUser(userData); setPage("app"); };
  const handleLogout = () => { setUser(null); setPage("landing"); setActiveNav("dashboard"); };

  // --- Drag Logic ---
  const handleMouseDown = () => {
    isDragging.current = true;
    document.body.style.cursor = "col-resize";
  };

  const handleMouseMove = useCallback((e) => {
    if (isDragging.current) {
      // Prevent sidebar from getting too small or too large
      const newWidth = Math.min(Math.max(e.clientX, 160), 400); 
      setSidebarWidth(newWidth);
      if (newWidth > 160 && isSidebarCollapsed) setIsSidebarCollapsed(false);
    }
  }, [isSidebarCollapsed]);

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
    document.body.style.cursor = "default";
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  if (page === "landing") return (
    <div>
      <button onClick={() => setIsDark(p => !p)}
        className="fixed top-4 right-4 z-50 w-9 h-9 rounded-lg flex items-center justify-center text-base border transition-all"
        style={{ backgroundColor: isDark ? "#1e2a3a" : "#f0f4ff", borderColor: isDark ? "#2e3a4a" : "#dde3f0" }}>
        {isDark ? "☀️" : "🌙"}
      </button>
      <Landing onGetStarted={() => setPage("login")} isDark={isDark} />
    </div>
  );

  if (page === "login") return (
    <div>
      <button onClick={() => setIsDark(p => !p)}
        className="fixed top-4 right-4 z-50 w-9 h-9 rounded-lg flex items-center justify-center text-base border transition-all"
        style={{ backgroundColor: isDark ? "#1e2a3a" : "#f0f4ff", borderColor: isDark ? "#2e3a4a" : "#dde3f0" }}>
        {isDark ? "☀️" : "🌙"}
      </button>
      <Login onLogin={handleLogin} onBack={() => setPage("landing")} isDark={isDark} />
    </div>
  );

  const renderPage = () => {
    switch (activeNav) {
      // --- 2. Pass filters to Dashboard ---
      case "dashboard": return <Dashboard newDeal={latestDeal} isDark={isDark} currentFilters={filterValues} />;
      case "deals":     return <Dashboard newDeal={latestDeal} isDark={isDark} currentFilters={filterValues} initialTab="Deal Table" dealStatusFilter="ACTIVE" />;
      case "fx":        return <FXMonitor isDark={isDark} />;
      case "forecast":  return <PriceForecast isDark={isDark} />;
      case "documents": return <Documents isDark={isDark} />;
      case "profile":   return <Profile user={user} onLogout={handleLogout} isDark={isDark} />;
      default:
        return (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className={`text-6xl font-black mb-4 ${isDark ? "text-[#1e2a3a]" : "text-[#dde3f0]"}`}>◆</p>
              <p className={`font-mono text-sm ${isDark ? "text-[#3a4a5a]" : "text-[#aab0c0]"}`}>
                {activeNav.charAt(0).toUpperCase() + activeNav.slice(1)} — Coming soon
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? "bg-[#0a0e1a]" : "bg-[#f0f4ff]"}`}>
      <Navbar
        onAddDeal={() => setModalOpen(true)}
        isDark={isDark}
        onToggleTheme={() => setIsDark(p => !p)}
        user={user}
        onProfileClick={() => setActiveNav("profile")}
      />

      <div className="flex pt-12 h-screen relative">
        
        {/* ─── DYNAMIC LEFT SIDEBAR WRAPPER ─── */}
        <div 
          style={{ 
            width: isSidebarCollapsed ? 68 : sidebarWidth,
            transition: isDragging.current ? "none" : "width 0.2s ease"
          }}
          className={`relative flex-shrink-0 border-r ${isDark ? "border-[#1e2a3a] bg-[#0f1825]" : "border-[#dde3f0] bg-white"} z-10`}
        >
          {/* Collapse Toggle Button */}
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className={`absolute -right-3.5 top-6 z-50 w-7 h-7 rounded-full border flex items-center justify-center text-xs cursor-pointer shadow-md transition-colors ${
              isDark ? "bg-[#1e2a3a] border-[#2e3a4a] text-[#dde3f0] hover:bg-[#2e3a4a]" : "bg-white border-[#dde3f0] text-[#1e2a3a] hover:bg-[#f0f4ff]"
            }`}
          >
            {isSidebarCollapsed ? "→" : "←"}
          </button>

          <div className="h-full w-full overflow-hidden">
            <Sidebar 
              active={activeNav} 
              onNav={setActiveNav} 
              isDark={isDark} 
              onProfileClick={() => setActiveNav("profile")} 
              isCollapsed={isSidebarCollapsed} 
              // --- 3. Pass state and setter to Sidebar ---
              filterValues={filterValues}
              onFilterChange={setFilterValues}
            />
          </div>

          {/* Drag Handle (Hidden when collapsed) */}
          {!isSidebarCollapsed && (
            <div 
              onMouseDown={handleMouseDown}
              className="absolute right-[-4px] top-0 bottom-0 w-2 cursor-col-resize z-40 hover:bg-[#00e5ff] hover:opacity-20 transition-colors"
            />
          )}
        </div>

        {/* ─── MAIN CONTENT ─── */}
        <main className="flex-1 flex overflow-hidden h-full">
          {renderPage()}
        </main>
      </div>

      <AddDealModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={(deal) => { setLatestDeal(deal); setModalOpen(false); }}
        isDark={isDark}
      />
    </div>
  );
}
