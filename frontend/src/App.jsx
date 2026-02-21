import { useState } from "react";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import AddDealModal from "./components/AddDealModal";
import Dashboard from "./Pages/Dashboard";
import FXMonitor from "./components/FXMonitor";
import Profile from "./components/Profile";
import Landing from "./Pages/Landing";
import Login from "./Pages/Login";

export default function App() {
  const [page, setPage] = useState("landing"); 
  const [activeNav, setActiveNav] = useState("dashboard");
  const [modalOpen, setModalOpen] = useState(false);
  const [latestDeal, setLatestDeal] = useState(null);
  const [isDark, setIsDark] = useState(true);
  const [user, setUser] = useState(null);

  const handleLogin = (userData) => { setUser(userData); setPage("app"); };
  const handleLogout = () => { setUser(null); setPage("landing"); setActiveNav("dashboard"); };

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
      case "dashboard": return <Dashboard newDeal={latestDeal} isDark={isDark} />;
      case "fx":        return <FXMonitor isDark={isDark} />;
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

      <div className="flex pt-12 h-screen">
        <Sidebar active={activeNav} onNav={setActiveNav} isDark={isDark} onProfileClick={() => setActiveNav("profile")} />

        <main className="ml-52 flex-1 flex overflow-hidden h-full">
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
