import { useState, useEffect, useRef } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Status options matching existing app
const STATUSES = ["PENDING", "ACTIVE", "HIGH", "IN TRANSIT"];

// ── tiny helpers ──────────────────────────────────────────────────────────────
const inp = (isDark) => ({
  width: "100%",
  background:  isDark ? "#0d1520" : "#f8faff",
  border:      `1px solid ${isDark ? "#1e293b" : "#dde3f0"}`,
  borderRadius: 7,
  color:        isDark ? "#e2e8f0" : "#0a0e1a",
  fontSize:     12,
  fontFamily:   "inherit",
  padding:      "9px 12px",
  outline:      "none",
  boxSizing:    "border-box",
});

const label = (isDark) => ({
  fontSize: 9,
  color:    isDark ? "#475569" : "#94a3b8",
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  display:  "block",
  marginBottom: 5,
});

const RISK_COLOR = (score) =>
  score >= 60 ? "#ef4444" : score >= 35 ? "#f59e0b" : "#22c55e";
const RISK_BG    = (score) =>
  score >= 60 ? "rgba(127,29,29,0.5)"  : score >= 35 ? "rgba(113,63,18,0.5)" : "rgba(20,83,45,0.5)";

// ── Component ─────────────────────────────────────────────────────────────────
export default function AddDealModal({ isOpen, onClose, onSubmit, isDark }) {
  // Don't render if modal is not open
  if (!isOpen) return null;

  const [form, setForm] = useState({
    product:     "",
    origin:      "",
    destination: "",
    value:       "",
    margin:      "",
    status:      "PENDING",
  });

  // risk score state
  const [riskScore,  setRiskScore]  = useState(null);  // number | null
  const [riskBand,   setRiskBand]   = useState(null);  // "LOW"|"MEDIUM"|"HIGH"
  const [riskLoading,setRiskLoading]= useState(false);
  const [riskError,  setRiskError]  = useState(null);
  const [riskDetails,setRiskDetails]= useState(null);

  const debounceRef = useRef(null);

  // ── colours ──────────────────────────────────────────────────────────────
  const bg      = isDark ? "#080f1c"  : "#ffffff";
  const border  = isDark ? "#1e293b"  : "#dde3f0";
  const text     = isDark ? "#e2e8f0" : "#0a0e1a";
  const muted    = isDark ? "#475569" : "#94a3b8";
  const surface2 = isDark ? "#0d1520" : "#f8faff";

  // ── Auto-score whenever form fields change (debounced 600ms) ─────────────
  useEffect(() => {
    const { product, origin, destination } = form;
    if (!product.trim() || !origin.trim() || !destination.trim()) {
      setRiskScore(null); setRiskBand(null); setRiskDetails(null); setRiskError(null);
      return;
    }

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setRiskLoading(true);
      setRiskError(null);
      try {
        const value = parseFloat(form.value) || 100000;
        const margin = parseFloat(form.margin) || 15;
        const product = form.product.toLowerCase();
        const origin = form.origin.toLowerCase();

        const payload = {
          supplier_reliability:
            product.includes("electronics") ? 0.72 :
            product.includes("pharma") ? 0.86 :
            product.includes("steel") ? 0.78 : 0.8,
          transport_delay_days:
            form.status === "HIGH" ? 8 :
            form.status === "IN TRANSIT" ? 4 : 2,
          geo_political_risk:
            origin.includes("china") ? 0.62 :
            origin.includes("russia") ? 0.8 : 0.35,
          weather_risk: 0.25,
          inventory_level: Math.max(50, Math.min(600, Math.round(200 + (margin - 15) * 10))),
          currency_volatility: Math.max(0, Math.min(0.1, value > 300000 ? 0.06 : 0.03)),
        };

        const res = await fetch(`${API_BASE}/api/risk/score`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.risk_score_pct !== undefined) {
          setRiskScore(data.risk_score_pct);
          setRiskBand(data.risk_tier);
          setRiskDetails(data.feature_contributions || null);
        } else {
          throw new Error(data.error || "No score returned");
        }
      } catch (e) {
        setRiskError("API offline");
        // Fallback: deterministic estimate so UI isn't empty
        const fallback = Math.min(100, Math.max(10,
          (form.product.toLowerCase().includes("solar") ? 65 :
           form.product.toLowerCase().includes("pharma") ? 32 :
           form.product.toLowerCase().includes("steel") ? 50 : 45)
          + (parseFloat(form.margin) < 10 ? 8 : 0)
          + (form.status === "HIGH" ? 12 : 0)
        ));
        setRiskScore(fallback);
        setRiskBand(fallback >= 60 ? "HIGH" : fallback >= 35 ? "MEDIUM" : "LOW");
        setRiskDetails(null);
      } finally {
        setRiskLoading(false);
      }
    }, 600);
  }, [form.product, form.origin, form.destination, form.value, form.margin, form.status]);

  const handleSubmit = () => {
    if (!form.product.trim() || !form.origin.trim() || !form.destination.trim() || !form.value) return;
    onSubmit({
      ...form,
      value:     parseFloat(form.value),
      margin:    form.margin || "—",
      riskScore: riskScore ?? 50,
      status:    form.status,
    });
    onClose();
  };

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  const canSubmit = form.product && form.origin && form.destination && form.value;

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{
        position: "fixed", inset: 0, zIndex: 50,
        background: "rgba(0,0,0,0.55)", backdropFilter: "blur(3px)",
      }} />

      {/* Modal */}
      <div style={{
        position:  "fixed", zIndex: 51,
        top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        width: 480, maxWidth: "92vw", maxHeight: "90vh",
        background: bg,
        border:     `1px solid ${border}`,
        borderRadius: 12,
        display:    "flex", flexDirection: "column",
        fontFamily: "'JetBrains Mono','Fira Code',ui-monospace,monospace",
        boxShadow:  "0 24px 60px rgba(0,0,0,0.5)",
        animation:  "fadeUp 0.2s ease",
        overflow:   "hidden",
      }}>

        {/* Header */}
        <div style={{ padding: "18px 20px 14px", borderBottom: `1px solid ${border}`, flexShrink: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ color: "#00e5ff", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 3, fontWeight: 600 }}>
                New Deal
              </div>
              <div style={{ color: text, fontSize: 15, fontWeight: 700 }}>Add Deal</div>
              <div style={{ color: muted, fontSize: 10, marginTop: 2 }}>
                Risk score auto-generated from your inputs
              </div>
            </div>
            <button onClick={onClose} style={{
              background: surface2, border: `1px solid ${border}`,
              color: muted, width: 28, height: 28, borderRadius: 6,
              cursor: "pointer", fontSize: 15,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "inherit",
            }}>✕</button>
          </div>
        </div>

        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", scrollbarWidth: "thin", scrollbarColor: `${border} transparent` }}>

          {/* Product */}
          <div style={{ marginBottom: 12 }}>
            <label style={label(isDark)}>Product / Category</label>
            <input
              value={form.product}
              onChange={set("product")}
              placeholder="e.g. Electronics - PCBs"
              style={inp(isDark)}
              onFocus={e => e.target.style.borderColor = "#00e5ff"}
              onBlur={e => e.target.style.borderColor = border}
            />
          </div>

          {/* Origin + Destination */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
            <div>
              <label style={label(isDark)}>Origin City</label>
              <input
                value={form.origin}
                onChange={set("origin")}
                placeholder="e.g. Shenzhen"
                style={inp(isDark)}
                onFocus={e => e.target.style.borderColor = "#00e5ff"}
                onBlur={e => e.target.style.borderColor = border}
              />
            </div>
            <div>
              <label style={label(isDark)}>Destination City</label>
              <input
                value={form.destination}
                onChange={set("destination")}
                placeholder="e.g. Mumbai"
                style={inp(isDark)}
                onFocus={e => e.target.style.borderColor = "#00e5ff"}
                onBlur={e => e.target.style.borderColor = border}
              />
            </div>
          </div>

          {/* Value + Margin */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
            <div>
              <label style={label(isDark)}>Deal Value (USD)</label>
              <input
                type="number"
                value={form.value}
                onChange={set("value")}
                placeholder="e.g. 320000"
                style={inp(isDark)}
                onFocus={e => e.target.style.borderColor = "#00e5ff"}
                onBlur={e => e.target.style.borderColor = border}
              />
            </div>
            <div>
              <label style={label(isDark)}>Margin %</label>
              <input
                type="number"
                step="0.1"
                value={form.margin}
                onChange={set("margin")}
                placeholder="e.g. 14.2"
                style={inp(isDark)}
                onFocus={e => e.target.style.borderColor = "#00e5ff"}
                onBlur={e => e.target.style.borderColor = border}
              />
            </div>
          </div>

          {/* Status */}
          <div style={{ marginBottom: 16 }}>
            <label style={label(isDark)}>Status</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {STATUSES.map(s => (
                <button key={s} onClick={() => setForm(f => ({ ...f, status: s }))} style={{
                  padding: "6px 12px", borderRadius: 6, fontSize: 11, fontWeight: 600,
                  fontFamily: "inherit", cursor: "pointer", letterSpacing: "0.05em",
                  border: form.status === s ? "1px solid #00e5ff" : `1px solid ${border}`,
                  background: form.status === s ? "#00e5ff18" : "transparent",
                  color: form.status === s ? "#00e5ff" : muted,
                  transition: "all 0.15s",
                }}>{s}</button>
              ))}
            </div>
          </div>

          {/* ── Risk Score Card ───────────────────────────────────────────── */}
          <div style={{
            borderRadius: 9,
            border: `1px solid ${riskScore !== null
              ? RISK_COLOR(riskScore) + "40"
              : border}`,
            background: riskScore !== null ? RISK_BG(riskScore) : surface2,
            padding: "12px 14px",
            transition: "all 0.3s",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: riskDetails ? 10 : 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {riskLoading && (
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#a78bfa", display: "inline-block", animation: "blink 1s infinite" }} />
                )}
                <span style={{ fontSize: 9, color: riskScore !== null ? RISK_COLOR(riskScore) : muted, letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600 }}>
                  {riskLoading ? "Scoring…" : riskScore !== null ? "ML Risk Score" : "Risk Score"}
                </span>
                {riskError && (
                  <span style={{ fontSize: 9, color: "#f59e0b" }}>(estimated)</span>
                )}
              </div>

              {/* Score display */}
              {riskScore !== null && !riskLoading && (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{
                    fontSize: 22, fontWeight: 800, color: RISK_COLOR(riskScore),
                    fontVariantNumeric: "tabular-nums",
                  }}>{riskScore}</span>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 4,
                    border: `1px solid ${RISK_COLOR(riskScore)}`,
                    color: RISK_COLOR(riskScore),
                    background: RISK_BG(riskScore),
                  }}>{riskBand}</span>
                </div>
              )}

              {/* Placeholder when no input */}
              {riskScore === null && !riskLoading && (
                <span style={{ fontSize: 11, color: muted }}>— / 100</span>
              )}
            </div>

            {/* Score bar */}
            {riskScore !== null && !riskLoading && (
              <div style={{ height: 3, background: isDark ? "#1e293b" : "#e2e8f0", borderRadius: 2, marginBottom: riskDetails ? 10 : 0 }}>
                <div style={{
                  height: "100%", borderRadius: 2,
                  width: `${riskScore}%`,
                  background: RISK_COLOR(riskScore),
                  transition: "width 0.5s ease",
                }} />
              </div>
            )}

            {/* Feature breakdown (only when API is live) */}
            {riskDetails && !riskLoading && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                {[
                  { label: "Tariff Risk",    val: riskDetails.tariff_risk,               unit: "" },
                  { label: "FX Volatility",  val: riskDetails.fx_volatility_pct,         unit: "%" },
                  { label: "HS Score",       val: riskDetails.hs_score,                  unit: "" },
                  { label: "Political Stab", val: riskDetails.political_stability_index,  unit: "" },
                ].map(({ label: l, val, unit }) => (
                  <div key={l} style={{ background: isDark ? "#0a0f1c" : "#fff", borderRadius: 5, padding: "5px 8px", border: `1px solid ${border}` }}>
                    <div style={{ fontSize: 8, color: muted, letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 2 }}>{l}</div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: text }}>{Number(val).toFixed(2)}{unit}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Prompt when empty */}
            {riskScore === null && !riskLoading && (
              <div style={{ fontSize: 10, color: muted, marginTop: 2 }}>
                Enter product, origin and destination to score
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: "12px 20px", borderTop: `1px solid ${border}`, display: "flex", gap: 8, flexShrink: 0 }}>
          <button onClick={onClose} style={{
            padding: "9px 16px", borderRadius: 7,
            border: `1px solid ${border}`, background: "transparent",
            color: muted, fontFamily: "inherit", fontSize: 11, cursor: "pointer",
          }}>Cancel</button>

          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            style={{
              flex: 1, padding: "9px", borderRadius: 7,
              border: canSubmit ? "1px solid #00e5ff" : `1px solid ${border}`,
              background: canSubmit ? "#00e5ff14" : "transparent",
              color: canSubmit ? "#00e5ff" : muted,
              fontFamily: "inherit", fontWeight: 700,
              fontSize: 11, cursor: canSubmit ? "pointer" : "not-allowed",
              letterSpacing: "0.05em", transition: "all 0.15s",
            }}
            onMouseEnter={e => canSubmit && (e.currentTarget.style.background = "#00e5ff22")}
            onMouseLeave={e => canSubmit && (e.currentTarget.style.background = "#00e5ff14")}
          >
            {riskLoading ? "Scoring…" : `Submit Deal${riskScore !== null ? ` · Risk ${riskScore}` : ""}`}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translate(-50%,-48%); } to { opacity:1; transform:translate(-50%,-50%); } }
        @keyframes blink  { 0%,100%{ opacity:1; } 50%{ opacity:0.2; } }
      `}</style>
    </>
  );
}
