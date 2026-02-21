import { useState } from "react";

const initialForm = {
  product: "",
  origin: "",
  destination: "",
  value: "",
  margin: "",
  status: "PENDING",
};

const statusOptions = ["PENDING", "ACTIVE", "HIGH", "IN TRANSIT"];

export default function AddDealModal({ isOpen, onClose, onSubmit }) {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    if (!form.product || !form.origin || !form.destination || !form.value) return;
    setLoading(true);

    await new Promise((r) => setTimeout(r, 900));
    const mlRiskScore = Math.floor(Math.random() * 60) + 20; // Placeholder for ML model
    onSubmit({ ...form, riskScore: mlRiskScore });
    setForm(initialForm);
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-[#0a0e1a] border border-[#1e2a3a] rounded-xl w-full max-w-lg mx-4 shadow-[0_0_60px_rgba(0,229,255,0.08)]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e2a3a]">
          <div>
            <h2 className="text-white font-bold text-sm tracking-wide">Add New Deal</h2>
            <p className="text-[#4a5a6a] text-xs font-mono mt-0.5">ML risk score will be auto-generated</p>
          </div>
          <button onClick={onClose} className="text-[#4a5a6a] hover:text-white text-lg transition-colors">✕</button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <Field label="PRODUCT / CATEGORY" name="product" value={form.product} onChange={handleChange} placeholder="e.g. Electronics - PCBs" />

          <div className="grid grid-cols-2 gap-3">
            <Field label="ORIGIN CITY" name="origin" value={form.origin} onChange={handleChange} placeholder="e.g. Shenzhen" />
            <Field label="DESTINATION CITY" name="destination" value={form.destination} onChange={handleChange} placeholder="e.g. Mumbai" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="DEAL VALUE (USD)" name="value" value={form.value} onChange={handleChange} placeholder="e.g. 320000" type="number" />
            <Field label="MARGIN %" name="margin" value={form.margin} onChange={handleChange} placeholder="e.g. 14.2" type="number" />
          </div>

          <div>
            <label className="block text-[#4a5a6a] text-[10px] tracking-[0.15em] font-mono mb-1.5">STATUS</label>
            <div className="flex gap-2 flex-wrap">
              {statusOptions.map((s) => (
                <button
                  key={s}
                  onClick={() => setForm((prev) => ({ ...prev, status: s }))}
                  className={`px-3 py-1.5 rounded text-[11px] font-bold border transition-all duration-150
                    ${form.status === s
                      ? "border-[#00e5ff] bg-[#00e5ff]/10 text-[#00e5ff]"
                      : "border-[#1e2a3a] text-[#4a5a6a] hover:border-[#2e3a4a]"
                    }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-[#0f1825] border border-[#1e3a2a] rounded-lg p-3 flex items-start gap-3">
            <span className="text-[#00ff88] text-sm mt-0.5">⚡</span>
            <div>
              <p className="text-[#00ff88] text-[10px] font-mono tracking-wider">ML RISK SCORING</p>
              <p className="text-[#5a6a7a] text-[11px] mt-0.5">Your model will auto-score this deal on submit. Integrate <code className="text-[#00e5ff]">api.js → /predict</code> to replace mock score.</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#1e2a3a]">
          <button onClick={onClose} className="text-[#6a7a8a] hover:text-white text-xs px-4 py-2 rounded border border-[#1e2a3a] hover:border-[#2e3a4a] transition-all">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !form.product || !form.origin || !form.destination || !form.value}
            className="flex items-center gap-2 bg-[#00e5ff] hover:bg-[#00cfee] disabled:opacity-40 disabled:cursor-not-allowed text-[#0a0e1a] text-xs font-bold px-6 py-2 rounded transition-all duration-150 shadow-[0_0_16px_rgba(0,229,255,0.3)]"
          >
            {loading ? (
              <>
                <span className="w-3 h-3 border-2 border-[#0a0e1a]/30 border-t-[#0a0e1a] rounded-full animate-spin" />
                Scoring...
              </>
            ) : (
              "Submit Deal"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, name, value, onChange, placeholder, type = "text" }) {
  return (
    <div>
      <label className="block text-[#4a5a6a] text-[10px] tracking-[0.15em] font-mono mb-1.5">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-[#0f1825] border border-[#1e2a3a] text-white text-xs px-3 py-2.5 rounded focus:outline-none focus:border-[#00e5ff] transition-colors placeholder-[#2e3a4a]"
      />
    </div>
  );
}
