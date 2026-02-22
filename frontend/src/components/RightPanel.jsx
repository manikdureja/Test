import { useEffect, useState } from "react";

const NEWS_API_KEY = import.meta.env.VITE_GNEWS_API_KEY || "ef3cd617f570341efb78b9337596122d";
const DEFAULT_FEED = [
  { color: "#ff4444", text: "New trade sanctions on select Chinese electronics exporters announced - DHS bulletin", source: "Fallback" },
  { color: "#ffaa00", text: "Port of Nhava Sheva congestion: 3-5 day delays on container vessels", source: "Fallback" },
  { color: "#ffaa00", text: "Brent crude up 2.3% - shipping surcharges expected from Gulf carriers", source: "Fallback" },
  { color: "#4a5a6a", text: "IMF upgrades India GDP forecast to 6.8% for FY25", source: "Fallback" },
];

export default function RightPanel({ isDark }) {
  const [geoFeed, setGeoFeed] = useState(DEFAULT_FEED);
  const [loading, setLoading] = useState(false);

  const getRiskColor = (title) => {
    const text = String(title || "").toLowerCase();
    if (text.includes("sanction") || text.includes("tariff") || text.includes("conflict")) return "#ff4444";
    if (text.includes("delay") || text.includes("congestion") || text.includes("crisis")) return "#ffaa00";
    return "#4a5a6a";
  };

  useEffect(() => {
    let alive = true;
    const fetchNews = async () => {
      if (!NEWS_API_KEY) return;
      setLoading(true);
      try {
        const query = encodeURIComponent('"trade sanctions" OR "port delays" OR "import tariffs"');
        const url = `https://gnews.io/api/v4/search?q=${query}&lang=en&max=5&apikey=${NEWS_API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();
        if (!alive || !data?.articles?.length) return;
        const mapped = data.articles.map((article) => ({
          color: getRiskColor(article.title),
          text: article.title,
          source: article?.source?.name || "GNews",
        }));
        setGeoFeed(mapped);
      } catch {
        // keep fallback feed
      } finally {
        if (alive) setLoading(false);
      }
    };
    fetchNews();
    const interval = setInterval(fetchNews, 600000);
    return () => {
      alive = false;
      clearInterval(interval);
    };
  }, []);

  const bg = isDark ? "bg-[#080c17]" : "bg-[#f8faff]";
  const label = isDark ? "text-[#3a4a5a]" : "text-[#aab0c0]";
  const feedText = isDark ? "text-[#5a6a7a]" : "text-[#7a8a9a]";

  return (
    <div className={`h-full w-full transition-colors duration-300 ${bg}`}>
      <div className="h-full p-4">
        <p className={`text-[10px] tracking-[0.18em] font-mono mb-3 ${label}`}>GEOPOLITICAL FEED</p>
        <div className="space-y-3">
          {loading && <p className={`text-[10px] font-mono ${label}`}>SYNCING...</p>}
          {geoFeed.map((item, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: item.color }} />
              <div>
                <p className={`text-[11px] leading-relaxed ${feedText}`}>{item.text}</p>
                <p className={`text-[9px] opacity-50 ${label}`}>{item.source}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
