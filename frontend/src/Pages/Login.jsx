import { useState } from "react";

export default function Login({ onLogin, onBack, isDark }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const bg = isDark ? "bg-[#0a0e1a]" : "bg-[#f0f4ff]";
  const cardBg = isDark ? "bg-[#0f1825] border-[#1e2a3a]" : "bg-white border-[#dde3f0]";
  const inputBg = isDark ? "bg-[#080c17] border-[#1e2a3a] text-white placeholder-[#2e3a4a]" : "bg-[#f8faff] border-[#dde3f0] text-[#0a0e1a] placeholder-[#aab0c0]";
  const labelColor = isDark ? "text-[#4a5a6a]" : "text-[#7a8aa0]";
  const text = isDark ? "text-white" : "text-[#0a0e1a]";
  const sub = isDark ? "text-[#4a5a6a]" : "text-[#7a8aa0]";

  const handleSubmit = async () => {
    if (!form.email || !form.password) {
      setError("Please fill in all fields.");
      return;
    }
    setError("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    onLogin({ name: "Rahul M.", email: form.email });
  };

  return (
    <div className={`min-h-screen ${bg} flex flex-col transition-colors duration-300`}>
      <nav className={`flex items-center justify-between px-8 h-14 border-b ${isDark ? "border-[#1e2a3a]" : "border-[#dde3f0]"}`}>
        <button onClick={onBack} className={`text-xs font-mono ${sub} hover:text-[#00e5ff] transition-colors`}>
          ← Back
        </button>
        <span className={`font-black text-lg ${text}`}>
          Trade<span className="text-[#00e5ff]">IQ</span>
        </span>
        <div className="w-16" />
      </nav>

      <div className="flex-1 flex items-center justify-center px-4">
        <div className={`w-full max-w-sm border rounded-2xl p-8 ${cardBg}`}>
          <div className="mb-8">
            <div className="w-10 h-10 rounded-xl bg-[#00e5ff]/10 border border-[#00e5ff]/20 flex items-center justify-center mb-4">
              <span className="text-[#00e5ff] text-lg">◈</span>
            </div>
            <h1 className={`text-xl font-black ${text}`}>Welcome back</h1>
            <p className={`text-xs mt-1 ${sub}`}>Sign in to your TradeIQ account</p>
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <label className={`block text-[10px] tracking-[0.15em] font-mono mb-1.5 ${labelColor}`}>EMAIL</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                placeholder="rahul@company.com"
                className={`w-full border text-xs px-3 py-2.5 rounded-lg focus:outline-none focus:border-[#00e5ff] transition-colors ${inputBg}`}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
            </div>
            <div>
              <label className={`block text-[10px] tracking-[0.15em] font-mono mb-1.5 ${labelColor}`}>PASSWORD</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                placeholder="••••••••"
                className={`w-full border text-xs px-3 py-2.5 rounded-lg focus:outline-none focus:border-[#00e5ff] transition-colors ${inputBg}`}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
            </div>
          </div>

          {error && (
            <p className="text-[#ff5555] text-xs mb-4 font-mono">{error}</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 text-[#0a0e1a] text-xs font-bold py-3 rounded-lg transition-all disabled:opacity-50"
            style={{ backgroundColor: "#00e5ff", boxShadow: "0 0 20px rgba(0,229,255,0.3)" }}
          >
            {loading ? (
              <>
                <span className="w-3 h-3 border-2 border-[#0a0e1a]/30 border-t-[#0a0e1a] rounded-full animate-spin" />
                Signing in...
              </>
            ) : "Sign In →"}
          </button>

          <p className={`text-center text-[11px] mt-5 ${sub}`}>
            Don't have an account?{" "}
            <span className="text-[#00e5ff] cursor-pointer hover:underline">Request access</span>
          </p>
        </div>
      </div>
    </div>
  );
}
