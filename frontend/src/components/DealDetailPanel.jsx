import { useState, useEffect, useRef } from "react";

const fmt    = (n, d = 2) => Number(n).toFixed(d);
const fmtUSD = (n) => "$" + Math.round(n).toLocaleString();

const STATUS_STYLES = {
  HIGH:    { bg: "rgba(127,29,29,0.6)",  color: "#fca5a5", border: "#ef4444" },
  ACTIVE:  { bg: "rgba(20,83,45,0.6)",   color: "#86efac", border: "#22c55e" },
  IN:      { bg: "rgba(23,37,84,0.6)",   color: "#93c5fd", border: "#3b82f6" },
  PENDING: { bg: "rgba(113,63,18,0.6)",  color: "#fcd34d", border: "#f59e0b" },
};

function Sparkline({ data, color = "#00e5ff", w = 90, h = 28 }) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 4) - 2;
    return `${x},${y}`;
  }).join(" ");
  const ly = h - ((data[data.length - 1] - min) / range) * (h - 4) - 2;
  return (
    <svg width={w} height={h} style={{ overflow: "visible", display: "block" }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5"
        strokeLinejoin="round" strokeLinecap="round" opacity="0.8" />
      <circle cx={w} cy={ly} r="2.5" fill={color} />
    </svg>
  );
}

function AnimNum({ value, suffix = "", decimals = 2, color = "#e2e8f0" }) {
  const [disp, setDisp] = useState(value);
  const prev = useRef(value);
  useEffect(() => {
    if (value === prev.current) return;
    const start = prev.current, end = value, t0 = performance.now();
    const step = (now) => {
      const p = Math.min((now - t0) / 380, 1);
      setDisp(start + (end - start) * p);
      if (p < 1) requestAnimationFrame(step);
      else prev.current = end;
    };
    requestAnimationFrame(step);
  }, [value]);
  return (
    <span style={{ color, fontVariantNumeric: "tabular-nums" }}>
      {disp.toFixed(decimals)}{suffix}
    </span>
  );
}

const card = { background: "#0a1220", border: "1px solid #1e293b", borderRadius: 8, padding: "10px 12px" };
const row  = { background: "#0a1220", border: "1px solid #1e293b", borderRadius: 8, padding: "10px 13px" };

// ─── Tab: Cost Breakdown ──────────────────────────────────────────────────────
function CostBreakdown({ deal, live }) {
  const tariff    = live.baseValue * (live.tariffRate / 100);
  const fxImpact  = live.currency === "USD/INR"
    ? live.baseValue * ((live.fxRate - 83.0) / 83.0) * 0.28
    : live.baseValue * ((live.fxRate - 1.08) / 1.08) * 0.22;
  const logistics = live.baseValue * 0.045 * (1 + live.delayDays * 0.14);
  const insurance = live.baseValue * 0.008;
  const misc      = live.baseValue * 0.02;
  const total     = live.baseValue + tariff + Math.abs(fxImpact) + logistics + insurance + misc;
  const netMargin = ((live.margin / 100) * live.baseValue - (tariff + logistics + insurance + misc)) / live.baseValue * 100;

  const rows = [
    { label: "Base Product Value", val: live.baseValue,note: `${Math.round(live.qty).toLocaleString()} units`, color: "#00e5ff",  neg: false },
    { label: "Tariff / Customs",   val: tariff,note: `${fmt(live.tariffRate)}% rate`,color: "#f87171",  neg: true  },
    { label: "FX Impact",          val: fxImpact,note: `${live.currency} @ ${fmt(live.fxRate, 3)}`,color: fxImpact >= 0 ? "#4ade80" : "#f87171", neg: fxImpact < 0 },
    { label: "Logistics & Freight",val: logistics,note: live.delayDays > 0 ? `+${live.delayDays}d surcharge` : "On schedule", color: "#fb923c", neg: true },
    { label: "Insurance",          val: insurance,note: "0.8% of base",color: "#a78bfa",  neg: true  },
    { label: "Misc / Brokerage",   val: misc,note: "2% flat",color: "#64748b",  neg: true  },
  ];
  const barMax = Math.max(...rows.map(r => Math.abs(r.val)));

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
        {[
          { label: "Total Exposure", val: fmtUSD(total), color: "#00e5ff" },
          { label: "Net Margin",     val: fmt(netMargin) + "%", color: netMargin > 15 ? "#22c55e" : netMargin > 7 ? "#f59e0b" : "#ef4444" },
          { label: "Gross Profit",   val: fmtUSD(live.baseValue * live.margin / 100), color: "#a78bfa" },
        ].map(c => (
          <div key={c.label} style={card}>
            <div style={{ fontSize: 9, color: "#475569", letterSpacing: "0.09em", textTransform: "uppercase", marginBottom: 5 }}>{c.label}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: c.color, fontVariantNumeric: "tabular-nums" }}>{c.val}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {rows.map(({ label, val, note, color, neg }) => (
          <div key={label} style={row}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
              <div>
                <span style={{ fontSize: 12, color: "#cbd5e1" }}>{label}</span>
                <span style={{ fontSize: 10, color: "#334155", marginLeft: 8 }}>{note}</span>
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color, fontVariantNumeric: "tabular-nums" }}>
                {neg && val > 0 ? "−" : "+"}{fmtUSD(Math.abs(val))}
              </span>
            </div>
            <div style={{ height: 3, background: "#1e293b", borderRadius: 2, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${(Math.abs(val) / barMax) * 100}%`, background: color, borderRadius: 2, transition: "width 0.5s ease" }} />
            </div>
          </div>
        ))}
      </div>

      {/* Total */}
      <div style={{ marginTop: 10, padding: "11px 14px", borderRadius: 8, border: "1px solid #00e5ff22", background: "#040d18", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ color: "#00e5ff", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>Total Deal Cost</span>
        <span style={{ color: "#00e5ff", fontSize: 17, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{fmtUSD(total)}</span>
      </div>
    </div>
  );
}

function LiveMetrics({ deal, live, history }) {
  const metrics = [
    {
      key: "qty",    label: "Quantity",    val: live.qty,        suffix: " units", dec: 0,
      data: history.qty,    color: "#00e5ff",
      alert: live.qty < (deal.qty ?? 1000) * 0.88 ? "warn" : null,
      note:  live.qty < (deal.qty ?? 1000) * 0.88 ? "Below contracted volume" : "Within tolerance",
    },
    {
      key: "tariff", label: "Tariff Rate", val: live.tariffRate, suffix: "%",      dec: 2,
      data: history.tariff, color: "#fb923c",
      alert: live.tariffRate > (deal.tariffRate ?? 12) * 1.12 ? "alert" : null,
      note:  live.tariffRate > (deal.tariffRate ?? 12) * 1.12 ? "Rate increased since deal" : "Stable",
    },
    {
      key: "fx",     label: live.currency, val: live.fxRate,     suffix: "",       dec: 3,
      data: history.fx,     color: "#a78bfa",
      alert: null, note: "Live interbank rate",
    },
    {
      key: "delay",  label: "Delay",       val: live.delayDays,  suffix: "d",      dec: 0,
      data: history.delay,
      color: live.delayDays > 2 ? "#ef4444" : live.delayDays > 0 ? "#f59e0b" : "#22c55e",
      alert: live.delayDays > 2 ? "alert" : live.delayDays > 0 ? "warn" : null,
      note:  live.delayDays === 0 ? "On schedule" : `${live.delayDays}d behind ETA`,
    },
  ];

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 13 }}>
        <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 7px #22c55e", display: "inline-block", animation: "blink 1.6s infinite" }} />
        <span style={{ fontSize: 10, color: "#475569", letterSpacing: "0.1em", textTransform: "uppercase" }}>Live · updates every 3s</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {metrics.map(({ key, label, val, suffix, dec, data, color, alert, note }) => (
          <div key={key} style={{
            ...row,
            border: `1px solid ${alert === "alert" ? "#ef444430" : alert === "warn" ? "#f59e0b30" : "#1e293b"}`,
            boxShadow: alert === "alert" ? "0 0 16px #ef44440c" : "none",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 9, color: "#475569", letterSpacing: "0.09em", textTransform: "uppercase", marginBottom: 3 }}>{label}</div>
                <div style={{ fontSize: 22, fontWeight: 700 }}>
                  <AnimNum value={val} suffix={suffix} decimals={dec} color={color} />
                </div>
                <div style={{ fontSize: 10, marginTop: 3, color: alert === "alert" ? "#ef4444" : alert === "warn" ? "#f59e0b" : "#334155" }}>{note}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <Sparkline data={data} color={color} w={88} h={26} />
                <div style={{ fontSize: 9, color: "#1e293b", marginTop: 2 }}>20 ticks</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DealDetailPanel({ deal, onClose }) {
  const [tab, setTab] = useState("cost");
  const [live, setLive] = useState(null);
  const [history, setHistory] = useState(null);

  useEffect(() => {
    if (!deal) return;
    const init = {
      baseValue:  deal.value,
      qty:        deal.qty        ?? 1000,
      tariffRate: deal.tariffRate ?? 12,
      fxRate:     deal.fxRate     ?? 83.47,
      currency:   deal.currency   ?? "USD/INR",
      delayDays:  deal.delayDays  ?? 0,
      margin:     deal.margin,
    };
    setLive(init);
    setHistory({
      qty:    Array(20).fill(init.qty),
      tariff: Array(20).fill(init.tariffRate),
      fx:     Array(20).fill(init.fxRate),
      delay:  Array(20).fill(init.delayDays),
    });
    setTab("cost");
  }, [deal?.id]);

  // ── Real-time simulation (swap this block for your WebSocket listener) ──
  useEffect(() => {
    if (!live) return;
    const id = setInterval(() => {
      setLive(prev => {
        if (!prev) return prev;
        const next = {
          ...prev,
          qty:        Math.max(0, prev.qty        + (Math.random() - 0.5)  * prev.qty * 0.009),
          tariffRate: Math.max(0, prev.tariffRate + (Math.random() - 0.46) * 0.18),
          fxRate:                 prev.fxRate     + (Math.random() - 0.5)  * prev.fxRate * 0.0006,
          delayDays:  Math.max(0, Math.round(prev.delayDays + (Math.random() - 0.38) * 0.35)),
        };
        setHistory(h => ({
          qty:    [...h.qty.slice(1),    next.qty],
          tariff: [...h.tariff.slice(1), next.tariffRate],
          fx:     [...h.fx.slice(1),     next.fxRate],
          delay:  [...h.delay.slice(1),  next.delayDays],
        }));
        return next;
      });
    }, 3000);
    return () => clearInterval(id);
  }, [!!live]);

  if (!deal || !live || !history) return null;

  const sc = STATUS_STYLES[deal.status] ?? STATUS_STYLES.ACTIVE;

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{
        position: "fixed", inset: 0, zIndex: 40,
        background: "rgba(0,0,0,0.48)", backdropFilter: "blur(2px)",
      }} />

      {/* Panel */}
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0, zIndex: 50,
        width: 500, maxWidth: "94vw",
        background: "#080f1c",
        borderLeft: "1px solid #1e293b",
        display: "flex", flexDirection: "column",
        fontFamily: "'JetBrains Mono', 'Fira Code', ui-monospace, monospace",
        animation: "slideIn 0.22s cubic-bezier(0.16,1,0.3,1)",
      }}>

        {/* Header */}
        <div style={{ padding: "18px 20px 0", flexShrink: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
            <div>
              <div style={{ color: "#00e5ff", fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", marginBottom: 3 }}>{deal.id}</div>
              <div style={{ color: "#f1f5f9", fontSize: 18, fontWeight: 700, lineHeight: 1.2 }}>{deal.product}</div>
              <div style={{ color: "#334155", fontSize: 11, marginTop: 3 }}>{deal.origin} → {deal.dest}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{
                padding: "3px 9px", borderRadius: 4, fontSize: 10, fontWeight: 700,
                letterSpacing: "0.07em",
                background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`,
              }}>{deal.status}</span>
              <button onClick={onClose} style={{
                background: "#0d1520", border: "1px solid #1e293b", color: "#475569",
                width: 28, height: 28, borderRadius: 6, cursor: "pointer",
                fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "inherit",
              }}>✕</button>
            </div>
          </div>

          {/* Quick-stats strip */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 6, marginBottom: 14 }}>
            {[
              { label: "Value",  val: fmtUSD(deal.value), color: "#00e5ff" },
              { label: "Margin", val: deal.margin + "%",  color: deal.margin > 20 ? "#22c55e" : deal.margin > 12 ? "#f59e0b" : "#ef4444" },
              { label: "Risk",   val: deal.riskScore,     color: deal.riskScore > 60 ? "#ef4444" : deal.riskScore > 40 ? "#f59e0b" : "#22c55e" },
              { label: "ETA",    val: deal.eta,           color: "#64748b" },
            ].map(({ label, val, color }) => (
              <div key={label} style={{ background: "#0d1520", border: "1px solid #1e293b", borderRadius: 6, padding: "7px 10px" }}>
                <div style={{ fontSize: 9, color: "#334155", letterSpacing: "0.09em", textTransform: "uppercase", marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color }}>{val}</div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", borderBottom: "1px solid #1e293b" }}>
            {[
              { key: "cost", label: "Cost Breakdown" },
              { key: "live", label: "Live Metrics"   },
            ].map(({ key, label }) => (
              <button key={key} onClick={() => setTab(key)} style={{
                background: "none", border: "none", cursor: "pointer",
                padding: "8px 16px", marginBottom: -1,
                fontSize: 11, fontWeight: 600, letterSpacing: "0.06em",
                color: tab === key ? "#00e5ff" : "#334155",
                borderBottom: tab === key ? "2px solid #00e5ff" : "2px solid transparent",
                fontFamily: "inherit", transition: "color 0.15s",
              }}>{label}</button>
            ))}
          </div>
        </div>

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "14px 20px 20px", scrollbarWidth: "thin", scrollbarColor: "#1e293b transparent" }}>
          {tab === "cost"
            ? <CostBreakdown deal={deal} live={live} />
            : <LiveMetrics   deal={deal} live={live} history={history} />}
        </div>

        {/* Footer */}
        <div style={{ padding: "11px 20px", borderTop: "1px solid #1e293b", display: "flex", gap: 8, flexShrink: 0 }}>
          <button style={{
            flex: 1, padding: "9px", borderRadius: 7,
            border: "1px solid #22c55e", background: "transparent",
            color: "#22c55e", fontFamily: "inherit", fontWeight: 600,
            fontSize: 11, cursor: "pointer", letterSpacing: "0.05em",
            transition: "background 0.15s",
          }}
            onMouseEnter={e => e.currentTarget.style.background = "#14532d40"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >✓ Mark as Completed</button>
          <button style={{
            padding: "9px 14px", borderRadius: 7,
            border: "1px solid #1e293b", background: "transparent",
            color: "#334155", fontFamily: "inherit", fontWeight: 600,
            fontSize: 11, cursor: "pointer",
          }}>Export</button>
        </div>
      </div>

      <style>{`
        @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @keyframes blink   { 0%,100% { opacity: 1; } 50% { opacity: 0.2; } }
      `}</style>
    </>
  );
}