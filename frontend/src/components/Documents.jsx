import { useState, useRef } from "react";

const INITIAL_DEALS = [
  { id: "TIQ-0019", product: "Electronics — PCBs" },
  { id: "TIQ-0020", product: "Textile Machinery" },
  { id: "TIQ-0021", product: "Chemical Compounds" },
  { id: "TIQ-0022", product: "LED Components" },
  { id: "TIQ-0023", product: "Steel Coils" },
  { id: "TIQ-0024", product: "Auto Parts" },
  { id: "TIQ-0025", product: "Pharma Raw Mat." },
  { id: "TIQ-0026", product: "Solar Panels" },
];

const DOC_TYPES = [
  { key: "invoice",    label: "Commercial Invoice",    icon: "📄", color: "#00e5ff" },
  { key: "bl",         label: "Bill of Lading",        icon: "🚢", color: "#a78bfa" },
  { key: "packing",    label: "Packing List",          icon: "📦", color: "#fb923c" },
  { key: "insurance",  label: "Insurance Certificate", icon: "🛡️", color: "#4ade80" },
  { key: "customs",    label: "Customs Declaration",   icon: "🏛️", color: "#f59e0b" },
  { key: "certificate",label: "Certificate of Origin", icon: "🌐", color: "#f87171" },
  { key: "other",      label: "Other",                 icon: "📎", color: "#64748b" },
];

const FILE_ICON = (ext) => {
  if (["pdf"].includes(ext))                     return { icon: "PDF", color: "#f87171" };
  if (["jpg","jpeg","png","webp"].includes(ext)) return { icon: "IMG", color: "#4ade80" };
  if (["xlsx","xls","csv"].includes(ext))        return { icon: "XLS", color: "#22c55e" };
  if (["docx","doc"].includes(ext))              return { icon: "DOC", color: "#60a5fa" };
  return { icon: "FILE", color: "#94a3b8" };
};

export default function Documents({ isDark = true, deals = INITIAL_DEALS }) {
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

  const grouped = {};
  filtered.forEach(d => {
    const key = d.dealId === "all" ? "General" : d.dealId;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(d);
  });

  return (
    <div className="flex-1 overflow-y-auto" style={{ padding: "28px 32px", minHeight: "100%", background: isDark ? "#0a0e1a" : "#f0f4ff" }}>
      
      {/* ── Page Title ── */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0, color: text, letterSpacing: "-0.3px" }}>
          Document Center
        </h1>
        <p style={{ margin: "4px 0 0", fontSize: 13, color: muted, letterSpacing: "0.3px" }}>
          Upload, verify, and link trade compliance documents to active deals.
        </p>
      </div>

      {/* Toolbar */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18, flexWrap: "wrap" }}>
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

        <select
          value={filterDeal}
          onChange={e => setFilterDeal(e.target.value)}
          style={{ height: 34, padding: "0 10px", background: surface, border: `1px solid ${border}`, borderRadius: 7, color: text, fontSize: 11, fontFamily: "inherit", outline: "none" }}
        >
          <option value="all">All Deals</option>
          {deals.map(d => <option key={d.id} value={d.id}>{d.id} — {d.product}</option>)}
        </select>

        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          style={{ height: 34, padding: "0 10px", background: surface, border: `1px solid ${border}`, borderRadius: 7, color: text, fontSize: 11, fontFamily: "inherit", outline: "none" }}
        >
          <option value="all">All Types</option>
          {DOC_TYPES.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
        </select>

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
          Object.entries(grouped).map(([dealKey, items]) => {
            const dealObj = deals.find(d => d.id === dealKey);
            return (
              <div key={dealKey} style={{ marginBottom: 22 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <span style={{ color: "#00e5ff", fontSize: 11, fontWeight: 700, fontFamily: "monospace" }}>{dealKey}</span>
                  {dealObj && <span style={{ color: muted, fontSize: 10 }}>— {dealObj.product}</span>}
                  <span style={{ fontSize: 10, color: muted, marginLeft: "auto" }}>{items.length} file{items.length !== 1 ? "s" : ""}</span>
                </div>

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
                        <div style={{ height: 72, background: isDark ? "#060c16" : "#f0f4ff", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                          {doc.previewUrl
                            ? <img src={doc.previewUrl} alt={doc.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            : <span style={{ fontSize: 24, fontWeight: 800, color: fi.color, fontFamily: "monospace", letterSpacing: "-0.03em" }}>{fi.icon}</span>
                          }
                          <span style={{
                            position: "absolute", top: 6, right: 6,
                            fontSize: 9, padding: "2px 6px", borderRadius: 3,
                            background: isDark ? "#0a1220" : "#fff",
                            color: dt.color, border: `1px solid ${dt.color}44`,
                            fontWeight: 600, letterSpacing: "0.05em",
                          }}>{dt.icon} {dt.label}</span>
                        </div>

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