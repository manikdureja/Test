const geoFeed = [
  { color: "#ff4444", text: "New trade sanctions on select Chinese electronics exporters announced - DHS bulletin" },
  { color: "#ffaa00", text: "Port of Nhava Sheva congestion: 3-5 day delays on container vessels" },
  { color: "#ffaa00", text: "Brent crude up 2.3% - shipping surcharges expected from Gulf carriers" },
  { color: "#4a5a6a", text: "IMF upgrades India GDP forecast to 6.8% for FY25" },
];

export default function RightPanel({ isDark }) {
  const bg = isDark ? "bg-[#080c17]" : "bg-[#f8faff]";
  const label = isDark ? "text-[#3a4a5a]" : "text-[#aab0c0]";
  const feedText = isDark ? "text-[#5a6a7a]" : "text-[#7a8a9a]";

  return (
    <div className={`h-full w-full transition-colors duration-300 ${bg}`}>
      <div className="h-full p-4">
        <p className={`text-[10px] tracking-[0.18em] font-mono mb-3 ${label}`}>GEOPOLITICAL FEED</p>
        <div className="space-y-3">
          {geoFeed.map((item, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: item.color }} />
              <p className={`text-[11px] leading-relaxed ${feedText}`}>{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
