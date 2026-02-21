import { useState, useRef } from "react";
import StatCard from "../components/StatCard";
import DealTable from "../components/DealTable";
import RightPanel from "../components/RightPanel";
import FXMonitor from "../components/FXMonitor";
import PriceForecast from "../components/PriceForecast";
import DealDetailPanel from "../components/DealDetailPanel";
const TABS = ["Deal Table", "Risk Analytics", "FX Monitor", "Price Forecast", "Documents"];

const INITIAL_DEALS = [
  { id: "TIQ-0019", product: "Electronics — PCBs",  origin: "Shenzhen",  destination: "Mumbai",      value: 320000, margin: "14.2", riskScore: 72, status: "HIGH",    eta: "Mar 4",  completed: false, qty: 4200,  tariffRate: 18.5, currency: "USD/INR", fxRate: 83.47, delayDays: 3 },
  { id: "TIQ-0020", product: "Textile Machinery",   origin: "Stuttgart", destination: "Surat",       value: 185000, margin: "21.0", riskScore: 38, status: "ACTIVE",  eta: "Mar 8",  completed: false, qty: 12,    tariffRate: 7.5,  currency: "EUR/USD", fxRate: 1.082, delayDays: 0 },
  { id: "TIQ-0021", product: "Chemical Compounds",  origin: "Dubai",     destination: "Chennai",     value: 94000,  margin: "18.7", riskScore: 55, status: "IN",      eta: "Feb 27", completed: false, qty: 8800,  tariffRate: 12.0, currency: "USD/INR", fxRate: 83.47, delayDays: 1 },
  { id: "TIQ-0022", product: "LED Components",      origin: "Guangzhou", destination: "Delhi",       value: 210000, margin: "16.3", riskScore: 65, status: "PENDING", eta: "Mar 12", completed: false, qty: 32000, tariffRate: 20.0, currency: "USD/INR", fxRate: 83.47, delayDays: 0 },
  { id: "TIQ-0023", product: "Steel Coils",         origin: "Seoul",     destination: "Nhava Sheva", value: 440000, margin: "9.8",  riskScore: 47, status: "IN",      eta: "Mar 1",  completed: false, qty: 320,   tariffRate: 5.0,  currency: "USD/INR", fxRate: 83.47, delayDays: 2 },
  { id: "TIQ-0024", product: "Auto Parts",          origin: "Tokyo",     destination: "Pune",        value: 275000, margin: "22.4", riskScore: 31, status: "ACTIVE",  eta: "Mar 15", completed: false, qty: 1800,  tariffRate: 10.0, currency: "USD/INR", fxRate: 83.47, delayDays: 0 },
  { id: "TIQ-0025", product: "Pharma Raw Mat.",     origin: "Basel",     destination: "Hyderabad",   value: 560000, margin: "28.1", riskScore: 44, status: "ACTIVE",  eta: "Mar 7",  completed: false, qty: 640,   tariffRate: 0.0,  currency: "EUR/USD", fxRate: 1.082, delayDays: 0 },
  { id: "TIQ-0026", product: "Solar Panels",        origin: "Suzhou",    destination: "Rajkot",      value: 380000, margin: "11.5", riskScore: 79, status: "HIGH",    eta: "Mar 20", completed: false, qty: 2400,  tariffRate: 25.0, currency: "USD/INR", fxRate: 83.47, delayDays: 5 },
];

const DOC_TYPES = [
  { key: "invoice",label: "Commercial Invoice",    icon: "📄", color: "#00e5ff" },
  { key: "bl",         label: "Bill of Lading",        icon: "🚢", color: "#a78bfa" },
  { key: "packing",    label: "Packing List",          icon: "📦", color: "#fb923c" },
  { key: "insurance",  label: "Insurance Certificate", icon: "🛡️", color: "#4ade80" },
  { key: "customs",    label: "Customs Declaration",   icon: "🏛️", color: "#f59e0b" },
  { key: "certificate",label: "Certificate of Origin", icon: "🌐", color: "#f87171" },
  { key: "other",      label: "Other",                 icon: "📎", color: "#64748b" },
];

const FILE_ICON = (ext) => {
  if (["pdf"].includes(ext))               return { icon: "PDF", color: "#f87171" };
  if (["jpg","jpeg","png","webp"].includes(ext)) return { icon: "IMG", color: "#4ade80" };
  if (["xlsx","xls","csv"].includes(ext))  return { icon: "XLS", color: "#22c55e" };
  if (["docx","doc"].includes(ext))        return { icon: "DOC", color: "#60a5fa" };
  return { icon: "FILE", color: "#94a3b8" };
};

function DocumentsTab({ isDark, deals }) {
  const [docs, setDocs]               = useState([]);
  const [dragOver, setDragOver]       = useState(false);
  const [filterDeal, setFilterDeal]   = useState("all");
  const [filterType, setFilterType]   = useState("all");
  const [uploadModal, setUploadModal] = useState(false);
  const [pendingFiles, setPendingFiles] = useState([]);
  const [form, setForm]               = useState({ dealId: "all", docType: "invoice", note: "" });
  const [search, setSearch]           = useState("");
  const fileRef = useRef();

  const border  = isDark ? "#1e293b" : "#dde3f0";
  const surface = isDark ? "#0a1220" : "#ffffff";
  const surface2= isDark ? "#0d1520" : "#f8faff";
  const text    = isDark ? "#e2e8f0" : "#0a0e1a";
  const muted   = isDark ? "#475569" : "#94a3b8";
  const subtle  = isDark ? "#1e293b" : "#eef2ff";

  const processFiles = (files) => {
    const arr = Array.from(files).map(f => ({
      file: f,
      name: f.name,
      size: f.size,
      ext: f.name.split(".").pop().toLowerCase(),
      previewUrl: f.type.startsWith("image/") ? URL.createObjectURL(f) : null,
    }));
    setPendingFiles(arr);
    setUploadModal(true);
  };

  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false);
    processFiles(e.dataTransfer.files);
  };

  const confirmUpload = () => {
    const now = new Date();
    const newDocs = pendingFiles.map((pf, i) => ({
      id: `DOC-${Date.now()}-${i}`,
      name: pf.name,
      ext: pf.ext,
      size: pf.size,
      dealId: form.dealId,
      docType: form.docType,
      note: form.note,
      uploadedAt: now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      previewUrl: pf.previewUrl,
    }));
    setDocs(prev => [...newDocs, ...prev]);
    setPendingFiles([]);
    setUploadModal(false);
    setForm({ dealId: "all", docType: "invoice", note: "" });
  };

  const deleteDoc = (id) => setDocs(prev => prev.filter(d => d.id !== id));

  const filtered = docs.filter(d => {
    const matchDeal = filterDeal === "all" || d.dealId === filterDeal;
    const matchType = filterType === "all" || d.docType === filterType;
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.note.toLowerCase().includes(search.toLowerCase());
    return matchDeal && matchType && matchSearch;
  });

  // Group by deal
  const grouped = {};
  filtered.forEach(d => {
    const key = d.dealId === "all" ? "General" : d.dealId;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(d);
  });

  return (
    <div style={{ padding: "20px 24px", minHeight: "100%" }}>

      {/* Toolbar */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18, flexWrap: "wrap" }}>
        {/* Search */}
        <div style={{ position: "relative", flex: 1, minWidth: 180 }}>
          <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: muted, fontSize: 13 }}>🔍</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search documents…"
            style={{
              width: "100%", paddingLeft: 30, paddingRight: 10, height: 34,
              background: surface, border: `1px solid ${border}`,
              borderRadius: 7, color: text, fontSize: 11,
              fontFamily: "inherit", outline: "none", boxSizing: "border-box",
            }}
          />
        </div>

        {/* Deal filter */}
        <select
          value={filterDeal}
          onChange={e => setFilterDeal(e.target.value)}
          style={{ height: 34, padding: "0 10px", background: surface, border: `1px solid ${border}`, borderRadius: 7, color: text, fontSize: 11, fontFamily: "inherit", outline: "none" }}
        >
          <option value="all">All Deals</option>
          {deals.map(d => <option key={d.id} value={d.id}>{d.id} — {d.product}</option>)}
        </select>

        {/* Type filter */}
        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          style={{ height: 34, padding: "0 10px", background: surface, border: `1px solid ${border}`, borderRadius: 7, color: text, fontSize: 11, fontFamily: "inherit", outline: "none" }}
        >
          <option value="all">All Types</option>
          {DOC_TYPES.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
        </select>

        {/* Upload btn */}
        <button
          onClick={() => fileRef.current.click()}
          style={{
            height: 34, padding: "0 16px", borderRadius: 7,
            border: "1px solid #00e5ff", background: "transparent",
            color: "#00e5ff", fontSize: 11, fontWeight: 600,
            fontFamily: "inherit", cursor: "pointer", letterSpacing: "0.05em",
            whiteSpace: "nowrap",
          }}
        >+ Upload Docs</button>
        <input ref={fileRef} type="file" multiple hidden onChange={e => processFiles(e.target.files)} />
      </div>

      {/* Stats row */}
      <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
        {[
          { label: "Total Documents", val: docs.length, color: "#00e5ff" },
          { label: "Linked to Deals",  val: docs.filter(d => d.dealId !== "all").length, color: "#a78bfa" },
          { label: "Unlinked",         val: docs.filter(d => d.dealId === "all").length, color: "#f59e0b" },
        ].map(({ label, val, color }) => (
          <div key={label} style={{ background: surface, border: `1px solid ${border}`, borderRadius: 8, padding: "10px 16px" }}>
            <div style={{ fontSize: 9, color: muted, letterSpacing: "0.09em", textTransform: "uppercase", marginBottom: 4 }}>{label}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color }}>{val}</div>
          </div>
        ))}
      </div>

      {/* Drop zone + content */}
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        style={{
          border: `2px dashed ${dragOver ? "#00e5ff" : border}`,
          borderRadius: 12,
          background: dragOver ? (isDark ? "#040d1880" : "#e0f7ff40") : "transparent",
          transition: "all 0.2s",
          minHeight: 200,
          padding: docs.length === 0 ? "48px 24px" : "20px 24px",
        }}
      >
        {docs.length === 0 ? (
          /* Empty state */
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.4 }}>📂</div>
            <div style={{ color: muted, fontSize: 13, fontWeight: 600, marginBottom: 6 }}>No documents yet</div>
            <div style={{ color: muted, fontSize: 11, marginBottom: 16, opacity: 0.7 }}>Drag & drop files here, or click Upload Docs</div>
            <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
              {DOC_TYPES.slice(0, 5).map(t => (
                <span key={t.key} style={{ fontSize: 10, padding: "3px 8px", borderRadius: 4, border: `1px solid ${border}`, color: muted }}>
                  {t.icon} {t.label}
                </span>
              ))}
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px 0", color: muted, fontSize: 12 }}>No documents match your filters.</div>
        ) : (
          /* Grouped list */
          Object.entries(grouped).map(([dealKey, items]) => {
            const dealObj = deals.find(d => d.id === dealKey);
            return (
              <div key={dealKey} style={{ marginBottom: 22 }}>
                {/* Group header */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <span style={{ color: "#00e5ff", fontSize: 11, fontWeight: 700, fontFamily: "monospace" }}>{dealKey}</span>
                  {dealObj && <span style={{ color: muted, fontSize: 10 }}>— {dealObj.product}</span>}
                  <span style={{ fontSize: 10, color: muted, marginLeft: "auto" }}>{items.length} file{items.length !== 1 ? "s" : ""}</span>
                </div>

                {/* Doc cards */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10 }}>
                  {items.map(doc => {
                    const fi = FILE_ICON(doc.ext);
                    const dt = DOC_TYPES.find(t => t.key === doc.docType) || DOC_TYPES[DOC_TYPES.length - 1];
                    return (
                      <div key={doc.id} style={{
                        background: surface2, border: `1px solid ${border}`,
                        borderRadius: 9, overflow: "hidden",
                        transition: "border-color 0.15s",
                      }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = "#00e5ff44"}
                        onMouseLeave={e => e.currentTarget.style.borderColor = border}
                      >
                        {/* Preview / icon area */}
                        <div style={{ height: 72, background: isDark ? "#060c16" : "#f0f4ff", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                          {doc.previewUrl
                            ? <img src={doc.previewUrl} alt={doc.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            : <span style={{ fontSize: 24, fontWeight: 800, color: fi.color, fontFamily: "monospace", letterSpacing: "-0.03em" }}>{fi.icon}</span>
                          }
                          {/* Type badge */}
                          <span style={{
                            position: "absolute", top: 6, right: 6,
                            fontSize: 9, padding: "2px 6px", borderRadius: 3,
                            background: isDark ? "#0a1220" : "#fff",
                            color: dt.color, border: `1px solid ${dt.color}44`,
                            fontWeight: 600, letterSpacing: "0.05em",
                          }}>{dt.icon} {dt.label}</span>
                        </div>

                        {/* Info */}
                        <div style={{ padding: "10px 12px" }}>
                          <div style={{ fontSize: 11, fontWeight: 600, color: text, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={doc.name}>{doc.name}</div>
                          {doc.note && <div style={{ fontSize: 10, color: muted, marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{doc.note}</div>}
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
                            <span style={{ fontSize: 9, color: muted }}>{(doc.size / 1024).toFixed(1)} KB · {doc.uploadedAt}</span>
                            <button
                              onClick={() => deleteDoc(doc.id)}
                              style={{ background: "none", border: "none", cursor: "pointer", color: "#ef444460", fontSize: 13, padding: "0 2px", lineHeight: 1 }}
                              title="Remove"
                            >✕</button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}

        {/* Drop overlay hint */}
        {dragOver && (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
            <div style={{ background: isDark ? "#040d18e0" : "#ffffffe0", borderRadius: 12, padding: "16px 28px", border: "1px solid #00e5ff", color: "#00e5ff", fontWeight: 600, fontSize: 13 }}>
              Drop files to upload
            </div>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {uploadModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 60, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div onClick={() => { setUploadModal(false); setPendingFiles([]); }} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(3px)" }} />
          <div style={{
            position: "relative", width: 440, maxWidth: "92vw",
            background: isDark ? "#080f1c" : "#ffffff",
            border: `1px solid ${border}`, borderRadius: 12,
            padding: 24, fontFamily: "inherit",
            boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
          }}>
            <div style={{ marginBottom: 18 }}>
              <div style={{ color: "#00e5ff", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>Upload Documents</div>
              <div style={{ color: muted, fontSize: 11 }}>{pendingFiles.length} file{pendingFiles.length !== 1 ? "s" : ""} selected</div>
            </div>

            {/* File list preview */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16, maxHeight: 140, overflowY: "auto" }}>
              {pendingFiles.map((pf, i) => {
                const fi = FILE_ICON(pf.ext);
                return (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, background: isDark ? "#0a1220" : "#f8faff", borderRadius: 7, padding: "8px 10px", border: `1px solid ${border}` }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: fi.color, fontFamily: "monospace", minWidth: 32 }}>{fi.icon}</span>
                    <span style={{ flex: 1, fontSize: 11, color: text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{pf.name}</span>
                    <span style={{ fontSize: 10, color: muted, flexShrink: 0 }}>{(pf.size / 1024).toFixed(1)} KB</span>
                  </div>
                );
              })}
            </div>

            {/* Form */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={{ fontSize: 10, color: muted, letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: 5 }}>Link to Deal</label>
                <select
                  value={form.dealId}
                  onChange={e => setForm(f => ({ ...f, dealId: e.target.value }))}
                  style={{ width: "100%", height: 34, padding: "0 10px", background: isDark ? "#0a1220" : "#f8faff", border: `1px solid ${border}`, borderRadius: 7, color: text, fontSize: 11, fontFamily: "inherit", outline: "none" }}
                >
                  <option value="all">General (no deal)</option>
                  {deals.map(d => <option key={d.id} value={d.id}>{d.id} — {d.product}</option>)}
                </select>
              </div>

              <div>
                <label style={{ fontSize: 10, color: muted, letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: 5 }}>Document Type</label>
                <select
                  value={form.docType}
                  onChange={e => setForm(f => ({ ...f, docType: e.target.value }))}
                  style={{ width: "100%", height: 34, padding: "0 10px", background: isDark ? "#0a1220" : "#f8faff", border: `1px solid ${border}`, borderRadius: 7, color: text, fontSize: 11, fontFamily: "inherit", outline: "none" }}
                >
                  {DOC_TYPES.map(t => <option key={t.key} value={t.key}>{t.icon} {t.label}</option>)}
                </select>
              </div>

              <div>
                <label style={{ fontSize: 10, color: muted, letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: 5 }}>Note (optional)</label>
                <input
                  value={form.note}
                  onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                  placeholder="e.g. Revised invoice v2, includes insurance…"
                  style={{ width: "100%", height: 34, padding: "0 10px", background: isDark ? "#0a1220" : "#f8faff", border: `1px solid ${border}`, borderRadius: 7, color: text, fontSize: 11, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 18 }}>
              <button
                onClick={confirmUpload}
                style={{
                  flex: 1, height: 36, borderRadius: 7,
                  border: "1px solid #00e5ff", background: "transparent",
                  color: "#00e5ff", fontFamily: "inherit", fontWeight: 600,
                  fontSize: 11, cursor: "pointer", letterSpacing: "0.05em",
                  transition: "background 0.15s",
                }}
                onMouseEnter={e => e.currentTarget.style.background = "#00e5ff18"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >Confirm Upload</button>
              <button
                onClick={() => { setUploadModal(false); setPendingFiles([]); }}
                style={{
                  height: 36, padding: "0 16px", borderRadius: 7,
                  border: `1px solid ${border}`, background: "transparent",
                  color: muted, fontFamily: "inherit", fontSize: 11, cursor: "pointer",
                }}
              >Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export default function Dashboard({ newDeal, isDark }) {
  const [tab, setTab]                   = useState("Deal Table");
  const [deals, setDeals]               = useState(INITIAL_DEALS);
  const [selected, setSelected]         = useState(null);
  const [completedToast, setCompletedToast] = useState(null);
  const [showCompleted, setShowCompleted]   = useState(false);

  const allDeals = newDeal
    ? [...deals, {
        id: `TIQ-${String(deals.length + 19).padStart(4, "0")}`,
        product: newDeal.product,
        origin: newDeal.origin,
        destination: newDeal.destination,
        value: Number(newDeal.value),
        margin: newDeal.margin || "—",
        riskScore: newDeal.riskScore,
        status: newDeal.status,
        eta: "TBD",
        completed: false,
        qty: 1000, tariffRate: 12, currency: "USD/INR", fxRate: 83.47, delayDays: 0,
      }]
    : deals;

  const activeDeals    = allDeals.filter(d => !d.completed);
  const completedDeals = allDeals.filter(d =>  d.completed);
  const totalExposure  = (activeDeals.reduce((s, d) => s + d.value, 0) / 1e6).toFixed(1);
  const avgRisk        = activeDeals.length
    ? Math.round(activeDeals.reduce((s, d) => s + d.riskScore, 0) / activeDeals.length)
    : 0;

  const handleCompleteDeal = (deal) => {
    setDeals(prev => prev.map(d => d.id === deal.id ? { ...d, completed: true, status: "DONE" } : d));
    setSelected(null);
    setCompletedToast(deal);
    setTimeout(() => setCompletedToast(null), 3500);
  };

  // ── theme shortcuts ──
  const bg       = isDark ? "bg-[#0a0e1a]"           : "bg-[#f0f4ff]";
  const statsBg  = isDark ? "bg-[#080c17] border-[#1e2a3a]" : "bg-white border-[#dde3f0]";
  const tabBg    = isDark ? "bg-[#0a0e1a] border-[#1e2a3a]" : "bg-white border-[#dde3f0]";
  const tabActive   = isDark ? "text-white border-[#00e5ff]"   : "text-[#0a0e1a] border-[#00e5ff]";
  const tabInactive = isDark ? "text-[#4a5a6a] border-transparent hover:text-[#8a9ab0]" : "text-[#9aabb0] border-transparent hover:text-[#5a6a8a]";

  return (
    <div className={`flex h-full transition-colors duration-300 ${bg}`}>
      <div className="flex-1 min-w-0 overflow-y-auto">

        {/* ── Stat bar ── */}
        <div className={`flex border-b transition-colors duration-300 ${statsBg}`}>
          <div className={`flex-shrink-0 px-5 py-3 border-r ${isDark ? "border-[#1e2a3a]" : "border-[#dde3f0]"}`}>
            <p className={`text-[9px] tracking-[0.18em] font-mono uppercase mb-1 ${isDark ? "text-[#4a5a6a]" : "text-[#aab0c0]"}`}>ACTIVE DEALS</p>
            <p className={`text-xl font-black ${isDark ? "text-white" : "text-[#0a0e1a]"}`}>{activeDeals.length}</p>
            <p className="text-[#00ff88] text-[11px] font-mono">↑ 3 this week</p>
          </div>
          <StatCard label="Total Exposure"      value={`$${totalExposure}M`} sub="⚡ FX var ±2.1%"           isDark={isDark} />
          <StatCard label="Avg Risk Score"       value={avgRisk}              sub="↑ 4pts vs last month"      subColor={avgRisk > 60 ? "#ff4444" : "#ffaa00"} isDark={isDark} />
          <StatCard label="USD / INR"            value="83.47"                sub="↓ 0.23"                    subColor="#ff4444" isDark={isDark} />
          <StatCard label="EUR / USD"            value="1.082"                sub="↑ 0.004"                   isDark={isDark} />
          <StatCard label="Shipments En Route"   value="11"                   sub="2 delayed"                 subColor="#ffaa00" isDark={isDark} />
          <StatCard label="Margin Avg"           value="18.4%"                sub="↑ 1.2%"                    isDark={isDark} />
        </div>

        {/* ── Tabs ── */}
        <div className={`flex items-center justify-between border-b px-4 transition-colors duration-300 ${tabBg}`}>
          <div className="flex">
            {TABS.map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-3 text-xs font-medium transition-all border-b-2 -mb-px ${tab === t ? tabActive : tabInactive}`}
              >{t}</button>
            ))}
          </div>
          <button
            onClick={() => setShowCompleted(p => !p)}
            className={`text-[10px] font-mono px-3 py-1.5 rounded border transition-all ${
              showCompleted
                ? "border-[#00ff88] text-[#00ff88] bg-[#00ff88]/10"
                : isDark ? "border-[#1e2a3a] text-[#4a5a6a]" : "border-[#dde3f0] text-[#aab0c0]"
            }`}
          >{showCompleted ? "▼" : "▶"} COMPLETED ({completedDeals.length})</button>
        </div>

        {/* ── Tab content ── */}
        <div className={`min-h-full transition-colors duration-300 ${isDark ? "bg-[#0a0e1a]" : "bg-[#f8faff]"}`}>
          {tab === "Deal Table" && (
            <>
              <DealTable deals={activeDeals} onRowClick={setSelected} isDark={isDark} />
              {showCompleted && completedDeals.length > 0 && (
                <div className={`border-t mt-2 ${isDark ? "border-[#1e2a3a]" : "border-[#dde3f0]"}`}>
                  <div className="px-4 py-2 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88]" />
                    <span className={`text-[10px] font-mono tracking-widest ${isDark ? "text-[#3a4a5a]" : "text-[#aab0c0]"}`}>COMPLETED DEALS</span>
                  </div>
                  <DealTable deals={completedDeals} isDark={isDark} completed />
                </div>
              )}
            </>
          )}
          {tab === "FX Monitor"      && <FXMonitor isDark={isDark} />}
          {tab === "Price Forecast"  && <PriceForecast isDark={isDark} />}
          {tab === "Risk Analytics"  && (
            <div className="flex items-center justify-center h-64">
              <p className={`font-mono text-sm ${isDark ? "text-[#3a4a5a]" : "text-[#aab0c0]"}`}>Risk Analytics — Connect ML model endpoint</p>
            </div>
          )}
          {tab === "Documents" && <DocumentsTab isDark={isDark} deals={allDeals} />}
        </div>
      </div>

      <RightPanel isDark={isDark} />

      {/* ── Deal Detail Panel (replaces old drawer) ── */}
      <DealDetailPanel deal={selected} onClose={() => setSelected(null)} />

      {/* ── Completed toast ── */}
      {completedToast && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className="bg-[#0f1825] border border-[#00ff88]/40 rounded-xl px-5 py-4 shadow-[0_0_30px_rgba(0,255,136,0.2)] flex items-start gap-3 max-w-xs">
            <span className="text-[#00ff88] text-xl">✓</span>
            <div>
              <p className="text-[#00ff88] text-xs font-bold font-mono">Deal Completed!</p>
              <p className="text-[#8a9ab0] text-xs mt-0.5">{completedToast.id} — {completedToast.product}</p>
              <p className="text-[#4a5a6a] text-[10px] mt-1 font-mono">Moved to completed archive.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}