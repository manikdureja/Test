import { useState } from "react";

export default function Profile({ user, onLogout, isDark }) {
  const [activeTab, setActiveTab] = useState("account");
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || "Rahul M.",
    email: user?.email || "rahul@company.com",
    company: "ImExIQ Pvt. Ltd.",
    role: "Trade Operations Manager",
    phone: "+91 98765 43210",
    timezone: "Asia/Kolkata",
  });
  const [notifs, setNotifs] = useState({
    highRisk: true, dealComplete: true, fxAlert: true, shipDelay: false, weeklyReport: true,
  });

  const bg    = isDark ? "bg-[#0a0e1a]" : "bg-[#f0f4ff]";
  const card  = isDark ? "bg-[#0f1825] border-[#1e2a3a]" : "bg-white border-[#dde3f0]";
  const inp   = isDark ? "bg-[#080c17] border-[#1e2a3a] text-white placeholder-[#2e3a4a]" : "bg-[#f8faff] border-[#dde3f0] text-[#0a0e1a] placeholder-[#bbc0cc]";
  const lbl   = isDark ? "text-[#4a5a6a]" : "text-[#8a9ab0]";
  const head  = isDark ? "text-white" : "text-[#0a0e1a]";
  const sub   = isDark ? "text-[#6a7a8a]" : "text-[#8a9ab0]";
  const div   = isDark ? "border-[#1e2a3a]" : "border-[#dde3f0]";
  const tabA  = isDark ? "text-white border-[#00e5ff]" : "text-[#0a0e1a] border-[#00e5ff]";
  const tabI  = isDark ? "text-[#4a5a6a] border-transparent hover:text-[#8a9ab0]" : "text-[#9aabb0] border-transparent hover:text-[#5a6a8a]";

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const TABS = [
    { id: "account", label: "Account" },
    { id: "notifications", label: "Notifications" },
    { id: "security", label: "Security" },
    { id: "integrations", label: "Integrations" },
  ];

  const STATS = [
    { label: "Active Deals", value: "24", color: "#00e5ff" },
    { label: "Completed", value: "138", color: "#00ff88" },
    { label: "Avg Risk Score", value: "54", color: "#ffaa00" },
    { label: "Total Volume", value: "$12.4M", color: "#a78bfa" },
  ];

  return (
    <div className={`flex-1 overflow-y-auto p-6 transition-colors duration-300 ${bg}`}>
      <div className={`border rounded-2xl p-6 mb-6 ${card}`}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00e5ff]/20 to-[#a78bfa]/20 border border-[#00e5ff]/30 flex items-center justify-center text-2xl font-black text-[#00e5ff]">
                {form.name[0]}
              </div>
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#00ff88] border-2 border-[#0f1825]" />
            </div>
            <div>
              <h2 className={`text-lg font-black ${head}`}>{form.name}</h2>
              <p className={`text-xs font-mono mt-0.5 ${sub}`}>{form.role}</p>
              <p className={`text-xs mt-1 ${sub}`}>{form.company}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className={`text-xs font-mono px-4 py-2 rounded-lg border transition-all ${isDark ? "border-[#ff4444]/30 text-[#ff5555] hover:bg-[#ff4444]/10" : "border-[#ffcccc] text-[#cc4444] hover:bg-[#fff0f0]"}`}
          >
            Sign Out
          </button>
        </div>

        <div className={`grid grid-cols-4 divide-x mt-6 rounded-xl overflow-hidden border ${div}`} style={{ borderColor: isDark ? "#1e2a3a" : "#dde3f0" }}>
          {STATS.map(s => (
            <div key={s.label} className={`px-4 py-3 text-center ${isDark ? "bg-[#080c17]" : "bg-[#f8faff]"}`}>
              <p className="text-xl font-black" style={{ color: s.color }}>{s.value}</p>
              <p className={`text-[10px] font-mono mt-0.5 ${sub}`}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className={`flex border-b mb-6 ${div}`}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`px-5 py-2.5 text-xs font-medium border-b-2 -mb-px transition-all ${activeTab === t.id ? tabA : tabI}`}>
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === "account" && (
        <div className={`border rounded-2xl p-6 ${card}`}>
          <h3 className={`text-sm font-bold mb-5 ${head}`}>Personal Information</h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { key: "name", label: "FULL NAME" },
              { key: "email", label: "EMAIL ADDRESS" },
              { key: "company", label: "COMPANY" },
              { key: "role", label: "JOB ROLE" },
              { key: "phone", label: "PHONE" },
              { key: "timezone", label: "TIMEZONE" },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className={`block text-[10px] font-mono tracking-[0.15em] mb-1.5 ${lbl}`}>{label}</label>
                <input
                  value={form[key]}
                  onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                  className={`w-full border text-xs px-3 py-2.5 rounded-lg focus:outline-none focus:border-[#00e5ff] transition-colors ${inp}`}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-end mt-6 gap-3">
            <button className={`text-xs px-4 py-2 rounded-lg border transition-all ${isDark ? "border-[#1e2a3a] text-[#6a7a8a]" : "border-[#dde3f0] text-[#9aabb0]"}`}>
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="text-xs font-bold px-6 py-2 rounded-lg transition-all"
              style={{ backgroundColor: saved ? "#00ff88" : "#00e5ff", color: "#0a0e1a", boxShadow: `0 0 16px ${saved ? "#00ff8840" : "#00e5ff40"}` }}
            >
              {saved ? "✓ Saved!" : "Save Changes"}
            </button>
          </div>
        </div>
      )}

      {activeTab === "notifications" && (
        <div className={`border rounded-2xl p-6 space-y-4 ${card}`}>
          <h3 className={`text-sm font-bold mb-2 ${head}`}>Notification Preferences</h3>
          {[
            { key: "highRisk", label: "High Risk Deal Alerts", desc: "Get notified when a deal scores above 70" },
            { key: "dealComplete", label: "Deal Completed", desc: "Alert when a deal is marked as completed" },
            { key: "fxAlert", label: "FX Rate Alerts", desc: "Notify on significant currency movements (>2%)" },
            { key: "shipDelay", label: "Shipment Delays", desc: "Alert on port congestion or carrier delays" },
            { key: "weeklyReport", label: "Weekly Summary Report", desc: "Receive portfolio summary every Monday" },
          ].map(({ key, label, desc }) => (
            <div key={key} className={`flex items-center justify-between py-3 border-b last:border-0 ${div}`}>
              <div>
                <p className={`text-xs font-medium ${head}`}>{label}</p>
                <p className={`text-[11px] mt-0.5 ${sub}`}>{desc}</p>
              </div>
              <button
                onClick={() => setNotifs(p => ({ ...p, [key]: !p[key] }))}
                className={`relative w-10 h-5 rounded-full transition-all duration-200 ${notifs[key] ? "bg-[#00e5ff]" : isDark ? "bg-[#1e2a3a]" : "bg-[#dde3f0]"}`}
              >
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-200 ${notifs[key] ? "left-5" : "left-0.5"}`} />
              </button>
            </div>
          ))}
        </div>
      )}

      {activeTab === "security" && (
        <div className="space-y-4">
          <div className={`border rounded-2xl p-6 ${card}`}>
            <h3 className={`text-sm font-bold mb-5 ${head}`}>Change Password</h3>
            <div className="space-y-3 max-w-sm">
              {["Current Password", "New Password", "Confirm New Password"].map(l => (
                <div key={l}>
                  <label className={`block text-[10px] font-mono tracking-[0.15em] mb-1.5 ${lbl}`}>{l.toUpperCase()}</label>
                  <input type="password" placeholder="••••••••"
                    className={`w-full border text-xs px-3 py-2.5 rounded-lg focus:outline-none focus:border-[#00e5ff] ${inp}`} />
                </div>
              ))}
              <button className="mt-2 text-xs font-bold px-6 py-2.5 rounded-lg bg-[#00e5ff] text-[#0a0e1a] hover:bg-[#00cfee] transition-all">
                Update Password
              </button>
            </div>
          </div>
          <div className={`border rounded-2xl p-6 ${card}`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className={`text-sm font-bold ${head}`}>Two-Factor Authentication</h3>
                <p className={`text-xs mt-1 ${sub}`}>Add an extra layer of security to your account</p>
              </div>
              <button className={`text-xs font-bold px-4 py-2 rounded-lg border transition-all ${isDark ? "border-[#00e5ff]/30 text-[#00e5ff] hover:bg-[#00e5ff]/10" : "border-[#00b0cc] text-[#00a0bc] hover:bg-[#e0f8ff]"}`}>
                Enable 2FA
              </button>
            </div>
          </div>
          <div className={`border rounded-2xl p-6 ${card}`}>
            <h3 className={`text-sm font-bold mb-3 ${head}`}>Active Sessions</h3>
            {[
              { device: "MacBook Pro", location: "Chandigarh, IN", time: "Now", current: true },
              { device: "iPhone 15", location: "Delhi, IN", time: "2h ago", current: false },
            ].map((s, i) => (
              <div key={i} className={`flex items-center justify-between py-3 border-b last:border-0 ${div}`}>
                <div className="flex items-center gap-3">
                  <span className={`text-lg ${isDark ? "text-[#4a5a6a]" : "text-[#aab0c0]"}`}>{s.current ? "💻" : "📱"}</span>
                  <div>
                    <p className={`text-xs font-medium ${head}`}>{s.device} {s.current && <span className="text-[#00ff88] text-[10px] ml-1 font-mono">CURRENT</span>}</p>
                    <p className={`text-[10px] font-mono ${sub}`}>{s.location} · {s.time}</p>
                  </div>
                </div>
                {!s.current && (
                  <button className="text-[10px] text-[#ff5555] font-mono hover:underline">Revoke</button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "integrations" && (
        <div className={`border rounded-2xl p-6 ${card}`}>
          <h3 className={`text-sm font-bold mb-5 ${head}`}>API & Integrations</h3>
          <div className="space-y-4">
            {[
              { name: "ML Risk Engine", desc: "POST /api/predict — Risk score model", status: "connected", color: "#00ff88" },
              { name: "FX Rate Feed", desc: "GET /fx/rates — Live currency rates", status: "pending", color: "#ffaa00" },
              { name: "Shipment API", desc: "GET /shipments — Port & carrier data", status: "disconnected", color: "#ff4444" },
              { name: "ERP System", desc: "Bi-directional deal sync", status: "disconnected", color: "#ff4444" },
            ].map(({ name, desc, status, color }) => (
              <div key={name} className={`flex items-center justify-between p-4 border rounded-xl ${isDark ? "border-[#1e2a3a] bg-[#080c17]" : "border-[#dde3f0] bg-[#f8faff]"}`}>
                <div>
                  <p className={`text-xs font-bold ${head}`}>{name}</p>
                  <p className={`text-[11px] font-mono mt-0.5 ${sub}`}>{desc}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
                    <span className="text-[10px] font-mono capitalize" style={{ color }}>{status}</span>
                  </div>
                  <button className={`text-[10px] font-bold px-3 py-1.5 rounded border transition-all
                    ${status === "connected"
                      ? isDark ? "border-[#1e2a3a] text-[#4a5a6a]" : "border-[#dde3f0] text-[#9aabb0]"
                      : "border-[#00e5ff]/30 text-[#00e5ff] hover:bg-[#00e5ff]/10"}`}>
                    {status === "connected" ? "Disconnect" : "Connect"}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* <div className={`mt-6 border-t pt-5 ${div}`}>
            <p className={`text-[10px] font-mono tracking-[0.15em] mb-2 ${lbl}`}>YOUR API KEY</p>
            <div className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border font-mono text-xs ${isDark ? "border-[#1e2a3a] bg-[#080c17] text-[#4a5a6a]" : "border-[#dde3f0] bg-[#f0f4ff] text-[#9aabb0]"}`}>
              <span className="flex-1">tiq_sk_••••••••••••••••••••••••••••••••</span>
              <button className="text-[#00e5ff] text-[10px] hover:underline">Reveal</button>
              <button className="text-[#00e5ff] text-[10px] hover:underline">Copy</button>
            </div>
            <p className={`text-[10px] font-mono mt-2 ${sub}`}>Keep this secret. Rotate if compromised.</p>
          </div> */}
        </div>
      )}
    </div>
  );
}
