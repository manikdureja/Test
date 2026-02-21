

import { useState, useEffect, useCallback, useRef } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function apiFetch(path) {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);
  return res.json();
}

const CAT_COLOR   = { Energy:"#f59e0b", Metals:"#22d3ee", Agriculture:"#10b981", Industrial:"#a78bfa" };
const MODEL_COLOR = { "Linear Trend":"#8b5cf6", "Exp. Smoothing":"#10b981", "Moving Avg.":"#f43f5e", "Ensemble":"#f59e0b" };
const MODEL_KEYS  = ["Linear Trend","Exp. Smoothing","Moving Avg.","Ensemble"];
const CAT_KEYS    = ["All","Energy","Metals","Agriculture","Industrial"];

const fmt = (v, unit="") => {
  if (v === null || v === undefined) return "—";
  const n = parseFloat(v);
  if (n >= 10000) return n.toFixed(0);
  if (n >= 1000)  return n.toFixed(0);
  if (n >= 10)    return n.toFixed(2);
  return n.toFixed(3);
};

const pct = v => `${v >= 0 ? "+" : ""}${parseFloat(v).toFixed(1)}%`;

function Spark({ vals, color, w = 72, h = 24 }) {
  if (!vals || vals.length < 2) return null;
  const mn = Math.min(...vals), mx = Math.max(...vals), range = mx - mn || 1;
  const pts = vals.map((v, i) =>
    `${(i / (vals.length - 1)) * w},${h - ((v - mn) / range) * (h - 2) - 1}`
  ).join(" ");
  return (
    <svg width={w} height={h} style={{ display: "block" }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

function ForecastChart({ historical, foreYears, activeModelData, catColor }) {
  const W = 680, H = 210, PL = 60, PR = 14, PT = 12, PB = 30;

  if (!historical?.length || !activeModelData) return (
    <div style={{ height: H, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.2)", fontSize: 12 }}>
      Loading chart...
    </div>
  );

  const histVals  = historical.map(p => p.value);
  const foreVals  = activeModelData.fore_vals  || [];
  const foreUpper = activeModelData.fore_upper || [];
  const foreLower = activeModelData.fore_lower || [];

  const allVals = [...histVals, ...foreVals, ...foreUpper];
  const minV = Math.min(...allVals, ...foreLower) * 0.91;
  const maxV = Math.max(...allVals) * 1.06;

  const histYears = historical.map(p => p.year);
  const allYears  = [...histYears, ...foreYears];
  const total     = allYears.length;

  const xS = i => PL + (i / (total - 1)) * (W - PL - PR);
  const yS = v => PT + (1 - (v - minV) / (maxV - minV)) * (H - PT - PB);

  const histPath = histVals.map((v, i) => `${i === 0 ? "M" : "L"}${xS(i)},${yS(v)}`).join(" ");
  const splitIdx = histVals.length - 1;
  const forePath = [histVals[splitIdx], ...foreVals].map((v, i) =>
    `${i === 0 ? "M" : "L"}${xS(splitIdx + i)},${yS(v)}`
  ).join(" ");

  const upperPath = foreVals.map((_, i) =>
    `${i === 0 ? "M" : "L"}${xS(splitIdx + 1 + i)},${yS(foreUpper[i])}`
  ).join(" ");
  const lowerPathRev = [...foreVals].reverse().map((_, ri, arr) => {
    const i = arr.length - 1 - ri;
    return `${ri === 0 ? "M" : "L"}${xS(splitIdx + 1 + i)},${yS(foreLower[i])}`;
  }).join(" ");

  const yTicks = 4;
  const yStep  = (maxV - minV) / yTicks;

  const xLabels = allYears
    .map((yr, i) => ({ yr, i }))
    .filter(({ yr }) => yr % 5 === 0);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block", overflow: "visible" }}>
      <defs>
        <linearGradient id="histFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={catColor} stopOpacity="0.13" />
          <stop offset="100%" stopColor={catColor} stopOpacity="0" />
        </linearGradient>
      </defs>

      {Array.from({ length: yTicks + 1 }, (_, i) => {
        const val = minV + yStep * i;
        const y   = yS(val);
        const lbl = val >= 10000 ? `${(val / 1000).toFixed(0)}k` : val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val >= 10 ? val.toFixed(1) : val.toFixed(3);
        return (
          <g key={i}>
            <line x1={PL} y1={y} x2={W - PR} y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
            <text x={PL - 5} y={y + 4} fontSize="9" fill="rgba(255,255,255,0.28)" textAnchor="end">{lbl}</text>
          </g>
        );
      })}

      {xLabels.map(({ yr, i }) => (
        <text key={yr} x={xS(i)} y={H - PB + 14} fontSize="9" fill="rgba(255,255,255,0.22)" textAnchor="middle">{yr}</text>
      ))}

      <line x1={xS(splitIdx)} y1={PT} x2={xS(splitIdx)} y2={H - PB}
        stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="3,3" />
      <text x={xS(splitIdx) + 5} y={PT + 10} fontSize="8" fill="rgba(255,255,255,0.25)" letterSpacing="0.5">
        FORECAST →
      </text>

      <path d={`${upperPath} ${lowerPathRev} Z`} fill="rgba(245,158,11,0.07)" />
      <path d={upperPath} fill="none" stroke="rgba(245,158,11,0.2)" strokeWidth="0.7" strokeDasharray="3,2" />

      <path d={`${histPath} L${xS(splitIdx)},${H - PB} L${xS(0)},${H - PB} Z`} fill="url(#histFill)" />

      <path d={histPath} fill="none" stroke={catColor} strokeWidth="1.8" />

      <path d={forePath} fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="5,3" />

      {histVals.slice(-5).map((v, i) => (
        <circle key={i} cx={xS(histVals.length - 5 + i)} cy={yS(v)} r="2.5"
          fill={catColor} stroke="#0e1117" strokeWidth="1.3" />
      ))}

      {/* Forecast dots */}
      {foreVals.map((v, i) => (
        <circle key={i} cx={xS(splitIdx + 1 + i)} cy={yS(v)} r="3"
          fill="#f59e0b" stroke="#0e1117" strokeWidth="1.3" />
      ))}
    </svg>
  );
}

/* ─── Loading skeleton ───────────────────────────────────────────────────────── */
function Skeleton({ w = "100%", h = 14, radius = 4 }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: radius,
      background: "rgba(255,255,255,0.05)",
      animation: "pulse 1.5s ease-in-out infinite"
    }} />
  );
}

/* ─── Main PriceForecast page ────────────────────────────────────────────────── */
export default function PriceForecast() {
  /* ── State ── */
  const [commodities, setCommodities]   = useState([]);   // list from /api/forecast/commodities
  const [selected, setSelected]         = useState(null);
  const [forecastData, setForecastData] = useState(null); // from /api/forecast/{commodity}
  const [activeModel, setActiveModel]   = useState("Ensemble");
  const [catFilter, setCatFilter]       = useState("All");
  const [horizon, setHorizon]           = useState(5);
  const [view, setView]                 = useState("chart");
  const [loadingList, setLoadingList]   = useState(true);
  const [loadingFore, setLoadingFore]   = useState(false);
  const [error, setError]               = useState(null);
  const abortRef = useRef(null);

  /* ── Load commodity list on mount ── */
  useEffect(() => {
    setLoadingList(true);
    apiFetch("/api/forecast/commodities")
      .then(data => {
        setCommodities(data);
        if (data.length > 0) setSelected(data[0].name);
        setLoadingList(false);
      })
      .catch(e => { setError(e.message); setLoadingList(false); });
  }, []);

  /* ── Load forecast when selected or horizon changes ── */
  useEffect(() => {
    if (!selected) return;
    if (abortRef.current) abortRef.current.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    setLoadingFore(true);
    setForecastData(null);

    fetch(`${API_BASE}/api/forecast/forecast/${encodeURIComponent(selected)}?horizon=${horizon}&active_model=${activeModel.toLowerCase().replace(" ","_").replace(".","")}`, {
      signal: ctrl.signal
    })
      .then(r => { if (!r.ok) throw new Error(`${r.status}`); return r.json(); })
      .then(data => { setForecastData(data); setLoadingFore(false); })
      .catch(e => { if (e.name !== "AbortError") { setError(e.message); setLoadingFore(false); } });
  }, [selected, horizon]);

  /* ── Derived values ── */
  const filtered = catFilter === "All"
    ? commodities
    : commodities.filter(c => c.category === catFilter);

  const curMeta = commodities.find(c => c.name === selected);
  const catColor = CAT_COLOR[curMeta?.category] || "#64748b";

  const activeModelData = forecastData?.models?.[activeModel];
  const ensembleData    = forecastData?.models?.["Ensemble"];

  const latest = curMeta?.latest_price ?? 0;
  const yoy    = curMeta?.yoy_pct ?? 0;
  const target = ensembleData?.fore_vals?.at(-1) ?? 0;
  const ret    = latest ? (target - latest) / latest * 100 : 0;
  const signal = ensembleData?.signal ?? "HOLD";
  const mape   = activeModelData?.mape ?? 0;
  const signalColor = signal === "BUY" ? "#10b981" : signal === "SELL" ? "#ef4444" : "#f59e0b";

  /* ── Render ── */
  return (
    <div style={{
      padding: "28px 32px", color: "#fff", minHeight: "100vh",
      background: "#0e1117", fontFamily: "'Courier New', monospace"
    }}>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.45} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
        select option { background: #1a1f2e; }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.1); border-radius:2px; }
      `}</style>

      {/* ── Page Title ── */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{
          fontSize: 26, fontWeight: 700, margin: 0,
          fontFamily: "'Segoe UI', system-ui, sans-serif",
          color: "#fff", letterSpacing: "-0.3px"
        }}>
          Price Forecast
        </h1>
        <p style={{
          margin: "4px 0 0", fontSize: 13,
          color: "rgba(255,255,255,0.38)", letterSpacing: "0.3px"
        }}>
          Synthetic commodity data · Model trained on {curMeta ? `${curMeta.hist_years?.at(-1) - curMeta.hist_years?.at(0) + 1 || 36} years` : "live"} of annual price data · {activeModel} active
        </p>
      </div>

      {error && (
        <div style={{
          padding: "10px 16px", marginBottom: 16, borderRadius: 6,
          background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
          fontSize: 12, color: "#ef4444"
        }}>
          ⚠ {error} — ensure backend is running and synthetic data exists (run: <code>python data_processing/generate_synthetic_data.py</code>)
        </div>
      )}

      {/* ── Filter Row ── */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12,
        marginBottom: 18, background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "14px 18px"
      }}>
        {[
          {
            label: "CATEGORY",
            options: CAT_KEYS,
            value: catFilter,
            set: setCatFilter
          },
          {
            label: "MODEL",
            options: MODEL_KEYS,
            value: activeModel,
            set: setActiveModel
          },
          {
            label: "HORIZON",
            options: [3, 5, 7].map(h => `${h}Y`),
            value: `${horizon}Y`,
            set: v => setHorizon(parseInt(v))
          },
        ].map(({ label, options, value, set }) => (
          <div key={label}>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.32)", letterSpacing: "0.8px", marginBottom: 6 }}>
              {label}
            </div>
            <select
              value={value}
              onChange={e => set(e.target.value)}
              style={{
                width: "100%", background: "#0e1117",
                border: "1px solid rgba(255,255,255,0.12)", borderRadius: 5,
                color: "rgba(255,255,255,0.82)", fontSize: 12,
                padding: "6px 10px", fontFamily: "'Courier New', monospace",
                cursor: "pointer", outline: "none", appearance: "none"
              }}
            >
              {options.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        ))}
      </div>

      {/* ── Stat Cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 18 }}>
        {[
          {
            label: "CURRENT PRICE",
            value: loadingList ? null : `${fmt(latest)}`,
            sub: curMeta ? `${curMeta.unit} · ${curMeta.latest_year}` : "—",
            color: "rgba(255,255,255,0.85)"
          },
          {
            label: "YOY CHANGE",
            value: loadingList ? null : pct(yoy),
            sub: `vs ${curMeta ? curMeta.latest_year - 1 : "—"}`,
            color: yoy >= 0 ? "#10b981" : "#ef4444"
          },
          {
            label: `${horizon}Y TARGET`,
            value: loadingFore || !target ? null : `${fmt(target)}`,
            sub: `${horizon}Y ensemble`,
            color: "#f59e0b"
          },
          {
            label: `${horizon}Y RETURN`,
            value: loadingFore || !target ? null : pct(ret),
            sub: signal,
            color: ret >= 0 ? "#10b981" : "#ef4444"
          },
        ].map(({ label, value, sub, color }) => (
          <div key={label} style={{
            background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 8, padding: "18px 20px"
          }}>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.32)", letterSpacing: "0.8px", marginBottom: 10 }}>
              {label}
            </div>
            {value === null
              ? <Skeleton h={28} w="70%" />
              : <div style={{
                  fontSize: 24, fontWeight: 700, color,
                  letterSpacing: "-0.5px", fontFamily: "'Segoe UI',system-ui,sans-serif"
                }}>{value}</div>
            }
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.28)", marginTop: 5 }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* ── Two-panel layout ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 12 }}>

        {/* Left: Chart / Table panel */}
        <div style={{
          background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 8, padding: "20px 22px"
        }}>
          {/* Panel header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
            <div>
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.32)", letterSpacing: "0.8px" }}>
                {selected ? selected.toUpperCase() : "—"} · PRICE HISTORY & FORECAST
              </span>
              <div style={{ display: "flex", gap: 6, marginTop: 4, alignItems: "center" }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: catColor, display: "inline-block" }} />
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.38)" }}>
                  {curMeta?.category || "—"} · {curMeta?.unit || "—"}
                  {!loadingFore && activeModelData && ` · MAPE ${mape}%`}
                </span>
                {!loadingFore && signal && (
                  <span style={{
                    fontSize: 10, padding: "2px 8px", borderRadius: 4, fontWeight: 700, letterSpacing: "0.5px",
                    background: `${signalColor}18`, border: `1px solid ${signalColor}40`, color: signalColor
                  }}>{signal}</span>
                )}
              </div>
            </div>
            <div style={{ display: "flex", gap: 4 }}>
              {["chart", "table"].map(t => (
                <button key={t} onClick={() => setView(t)} style={{
                  fontSize: 10, padding: "4px 12px", borderRadius: 4, cursor: "pointer", letterSpacing: "0.5px",
                  background: view === t ? "rgba(255,255,255,0.07)" : "transparent",
                  border: view === t ? "1px solid rgba(255,255,255,0.15)" : "1px solid transparent",
                  color: view === t ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.3)"
                }}>{t.toUpperCase()}</button>
              ))}
            </div>
          </div>

          {/* Model selector */}
          <div style={{ display: "flex", gap: 5, marginBottom: 14, flexWrap: "wrap" }}>
            {MODEL_KEYS.map(m => (
              <button key={m} onClick={() => setActiveModel(m)} style={{
                fontSize: 10, padding: "4px 10px", borderRadius: 4, cursor: "pointer",
                display: "flex", alignItems: "center", gap: 5,
                background: activeModel === m ? `${MODEL_COLOR[m]}12` : "transparent",
                border: activeModel === m ? `1px solid ${MODEL_COLOR[m]}35` : "1px solid rgba(255,255,255,0.06)",
                color: activeModel === m ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.33)"
              }}>
                <span style={{
                  width: 6, height: 6, borderRadius: "50%", background: MODEL_COLOR[m],
                  display: "inline-block",
                  boxShadow: activeModel === m ? `0 0 5px ${MODEL_COLOR[m]}` : "none"
                }} />
                {m}
                {forecastData?.models?.[m] && (
                  <span style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", marginLeft: 2 }}>
                    {forecastData.models[m].mape}%
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Chart or table */}
          {view === "chart" ? (
            loadingFore || !forecastData ? (
              <div style={{ height: 210 }}>
                <Skeleton h={210} radius={6} />
              </div>
            ) : (
              <ForecastChart
                historical={forecastData.historical}
                foreYears={forecastData.fore_years}
                activeModelData={activeModelData}
                catColor={catColor}
              />
            )
          ) : (
            /* Table view */
            <div style={{ overflowX: "auto", maxHeight: 280, overflowY: "auto" }}>
              {loadingFore || !forecastData ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {Array.from({ length: 8 }, (_, i) => <Skeleton key={i} h={24} />)}
                </div>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
                  <thead>
                    <tr>
                      {["Year","Type","Price","YoY Δ","vs Now","CI Low","CI High"].map(h => (
                        <th key={h} style={{
                          padding: "6px 10px", textAlign: "left", fontSize: 9,
                          color: "rgba(255,255,255,0.28)", letterSpacing: "0.5px", fontWeight: 500,
                          borderBottom: "1px solid rgba(255,255,255,0.07)"
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {/* Last 6 historical */}
                    {forecastData.historical.slice(-6).map((p, i, arr) => {
                      const prev = arr[i - 1];
                      const yoyc = prev ? (p.value - prev.value) / prev.value * 100 : 0;
                      const vlc  = (p.value - latest) / latest * 100;
                      return (
                        <tr key={p.year} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                          <td style={{ padding: "7px 10px", color: "rgba(255,255,255,0.5)" }}>{p.year}</td>
                          <td><span style={{ fontSize: 9, background: "rgba(34,211,238,0.1)", color: "#22d3ee", borderRadius: 3, padding: "2px 6px" }}>HIST</span></td>
                          <td style={{ padding: "7px 10px", color: "rgba(255,255,255,0.85)", fontWeight: 600 }}>{fmt(p.value)}</td>
                          <td style={{ padding: "7px 10px", color: yoyc >= 0 ? "#10b981" : "#ef4444" }}>{pct(yoyc)}</td>
                          <td style={{ padding: "7px 10px", color: vlc >= 0 ? "#10b981" : "#ef4444" }}>{pct(vlc)}</td>
                          <td style={{ padding: "7px 10px", color: "rgba(255,255,255,0.25)" }}>—</td>
                          <td style={{ padding: "7px 10px", color: "rgba(255,255,255,0.25)" }}>—</td>
                        </tr>
                      );
                    })}
                    {/* Forecast rows */}
                    {activeModelData && forecastData.fore_years.map((yr, i) => {
                      const v = activeModelData.fore_vals[i];
                      const pv = i === 0 ? latest : activeModelData.fore_vals[i - 1];
                      const yoyc = pv ? (v - pv) / pv * 100 : 0;
                      const vlc  = (v - latest) / latest * 100;
                      return (
                        <tr key={yr} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                          <td style={{ padding: "7px 10px", color: "rgba(255,255,255,0.5)" }}>{yr}</td>
                          <td><span style={{ fontSize: 9, background: "rgba(245,158,11,0.1)", color: "#f59e0b", borderRadius: 3, padding: "2px 6px" }}>FORE</span></td>
                          <td style={{ padding: "7px 10px", color: "rgba(255,255,255,0.85)", fontWeight: 600 }}>{fmt(v)}</td>
                          <td style={{ padding: "7px 10px", color: yoyc >= 0 ? "#10b981" : "#ef4444" }}>{pct(yoyc)}</td>
                          <td style={{ padding: "7px 10px", color: vlc >= 0 ? "#10b981" : "#ef4444" }}>{pct(vlc)}</td>
                          <td style={{ padding: "7px 10px", color: "rgba(255,255,255,0.3)" }}>{fmt(activeModelData.fore_lower[i])}</td>
                          <td style={{ padding: "7px 10px", color: "rgba(255,255,255,0.3)" }}>{fmt(activeModelData.fore_upper[i])}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>

        {/* Right: Commodity tracker panel */}
        <div style={{
          background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 8, padding: "20px 20px", display: "flex", flexDirection: "column"
        }}>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.32)", letterSpacing: "0.8px", marginBottom: 14 }}>
            COMMODITY TRACKER
          </div>

          {/* Category pills */}
          <div style={{ display: "flex", gap: 4, marginBottom: 12, flexWrap: "wrap" }}>
            {CAT_KEYS.map(c => (
              <button key={c} onClick={() => setCatFilter(c)} style={{
                fontSize: 9, padding: "3px 9px", borderRadius: 3, cursor: "pointer", letterSpacing: "0.5px",
                background: catFilter === c ? "rgba(255,255,255,0.07)" : "transparent",
                border: catFilter === c ? "1px solid rgba(255,255,255,0.15)" : "1px solid rgba(255,255,255,0.05)",
                color: catFilter === c ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.3)"
              }}>{c.toUpperCase()}</button>
            ))}
          </div>

          {/* Commodity rows */}
          <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
            {loadingList
              ? Array.from({ length: 8 }, (_, i) => (
                  <div key={i} style={{ padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.04)", display: "flex", gap: 10, alignItems: "center" }}>
                    <div style={{ width: 4, height: 28, borderRadius: 2, background: "rgba(255,255,255,0.04)" }} />
                    <div style={{ flex: 1 }}>
                      <Skeleton h={11} w="60%" />
                      <div style={{ marginTop: 6 }}><Skeleton h={4} /></div>
                    </div>
                  </div>
                ))
              : filtered.map(c => {
                  const cc       = CAT_COLOR[c.category] || "#64748b";
                  const isActive = c.name === selected;
                  const chg      = c.yoy_pct ?? 0;
                  const barW     = Math.min(100, Math.abs(chg) * 6 + 20);

                  return (
                    <button key={c.name} onClick={() => setSelected(c.name)} style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "10px 0", cursor: "pointer", textAlign: "left",
                      background: "transparent", border: "none",
                      borderBottom: "1px solid rgba(255,255,255,0.04)",
                      opacity: isActive ? 1 : 0.72, transition: "opacity 0.12s"
                    }}>
                      {/* Active indicator bar */}
                      <div style={{
                        width: 4, height: 30, borderRadius: 2, flexShrink: 0,
                        background: isActive ? cc : "transparent"
                      }} />

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                          <span style={{
                            fontSize: 12,
                            color: isActive ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.58)",
                            fontWeight: isActive ? 600 : 400
                          }}>{c.name}</span>
                          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.82)", fontFamily: "'Courier New',monospace" }}>
                            {fmt(c.latest_price)}
                            <span style={{ marginLeft: 7, fontSize: 11, color: chg >= 0 ? "#10b981" : "#ef4444" }}>
                              {chg >= 0 ? "+" : ""}{chg.toFixed(2)}
                            </span>
                          </span>
                        </div>

                        {/* Sparkline */}
                        <div style={{ marginTop: 4, display: "flex", alignItems: "center", gap: 8 }}>
                          <Spark vals={c.hist_vals?.slice(-10) ?? []} color={cc} w={60} h={18} />
                          {/* YoY bar */}
                          <div style={{ flex: 1, height: 3, borderRadius: 2, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                            <div style={{
                              height: "100%", borderRadius: 2,
                              width: `${barW}%`,
                              background: chg >= 0 ? "#10b981" : "#ef4444",
                              transition: "width 0.3s"
                            }} />
                          </div>
                          <span style={{ fontSize: 9, color: "rgba(255,255,255,0.28)", minWidth: 34, textAlign: "right" }}>
                            {chg >= 0 ? "+" : ""}{chg.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })
            }
          </div>

          {/* Signal footer */}
          <div style={{
            marginTop: 12, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.07)",
            display: "flex", justifyContent: "space-between", alignItems: "center"
          }}>
            <div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.28)", letterSpacing: "0.5px" }}>
                ML SIGNAL · {selected?.toUpperCase() ?? "—"}
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: signalColor, marginTop: 3, letterSpacing: "-0.3px" }}>
                {loadingFore ? <Skeleton h={16} w={60} /> : <>
                  {signal}
                  <span style={{ fontSize: 10, color: "rgba(255,255,255,0.32)", fontWeight: 400, marginLeft: 8 }}>
                    {pct(ret)} in {horizon}Y
                  </span>
                </>}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.28)", letterSpacing: "0.5px" }}>MAPE</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.55)", marginTop: 2 }}>
                {loadingFore ? "—" : `${mape}%`}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer bar ── */}
      <div style={{
        marginTop: 12, display: "flex", alignItems: "center", gap: 16,
        padding: "10px 14px", background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.06)", borderRadius: 6
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{
            width: 8, height: 8, borderRadius: "50%",
            background: loadingFore ? "#f59e0b" : "#10b981",
            boxShadow: `0 0 6px ${loadingFore ? "#f59e0b" : "#10b981"}`,
            animation: loadingFore ? "blink 1s infinite" : "none"
          }} />
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", letterSpacing: "0.5px" }}>
            {loadingFore ? "TRAINING MODELS..." : "ML ENGINE"}
          </span>
        </div>
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.22)" }}>
          {loadingFore
            ? `Fitting Linear Trend, Exp. Smoothing, Moving Avg. on ${selected} data...`
            : `${activeModel} model active · ${horizon}Y horizon · ${filtered.length} commodities · trained on synthetic data`}
        </span>
        <span style={{ marginLeft: "auto", fontSize: 10, color: "rgba(255,255,255,0.18)" }}>
          Source: Synthetic commodity prices · Feb 2026 · Not financial advice
        </span>
      </div>
    </div>
  );
}
