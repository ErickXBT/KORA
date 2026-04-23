import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { AppLayout } from "@/components/layout/AppLayout";
import { useCryptoNews } from "@/hooks/use-coingecko";
import { useWallet } from "@/hooks/use-wallet";
import { ExternalLink, Clock } from "lucide-react";
import { motion } from "framer-motion";

function timeAgo(ts: number) {
  const s = Math.floor(Date.now() / 1000 - ts);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export default function News() {
  const [, setLocation] = useLocation();
  const { walletId } = useWallet();
  const { data, isLoading } = useCryptoNews();
  const [filter, setFilter] = useState("ALL");

  useEffect(() => { if (!walletId) setLocation("/"); }, [walletId, setLocation]);
  if (!walletId) return null;

  const articles = Array.isArray(data?.Data) ? data!.Data : [];
  const tags = ["ALL", "BITCOIN", "ETHEREUM", "REGULATION", "DEFI", "NFT", "ALTCOIN"];
  const filtered = filter === "ALL"
    ? articles
    : articles.filter((a) => (a.tags || "").toUpperCase().includes(filter));

  const featured = filtered[0];
  const rest = filtered.slice(1);

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto w-full px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-black tracking-wider text-white">CRYPTO NEWS</h1>
          <p className="text-xs text-muted-foreground mt-1">Real-time market headlines, refreshed every 2 minutes</p>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {tags.map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-3 py-1.5 rounded-full text-[10px] font-bold tracking-widest transition-all ${
                filter === t
                  ? "bg-gradient-to-r from-primary to-red-800 text-white shadow-[0_0_15px_rgba(255,38,37,0.4)]"
                  : "bg-secondary/40 text-muted-foreground hover:text-white border border-border/40"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-3 gap-4">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="h-64 rounded-2xl bg-secondary/30 animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {featured && (
              <motion.a
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                href={featured.url} target="_blank" rel="noreferrer"
                className="block mb-6 group rounded-2xl overflow-hidden bg-card border border-primary/20 hover:border-primary/40 transition-all"
              >
                <div className="md:flex">
                  <div className="md:w-1/2 aspect-video md:aspect-auto overflow-hidden bg-secondary/50">
                    <img src={featured.imageurl} alt={featured.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="md:w-1/2 p-6 flex flex-col justify-center">
                    <div className="flex items-center gap-2 text-[10px] tracking-widest font-bold mb-3">
                      <span className="text-primary">FEATURED</span>
                      <span className="text-muted-foreground">·</span>
                      <span className="text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />{timeAgo(featured.published_on)}</span>
                    </div>
                    <h2 className="text-2xl font-black text-white leading-tight group-hover:text-primary transition-colors">
                      {featured.title}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-3 line-clamp-3">{featured.body}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-4">
                      <img src={`https://www.cryptocompare.com${featured.source_info.img}`} className="w-4 h-4 rounded-full" alt="" onError={(e) => (e.currentTarget.style.display = "none")} />
                      <span>{featured.source_info.name}</span>
                      <ExternalLink className="w-3 h-3 ml-auto" />
                    </div>
                  </div>
                </div>
              </motion.a>
            )}

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rest.slice(0, 30).map((a, i) => (
                <motion.a
                  key={a.id}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  href={a.url} target="_blank" rel="noreferrer"
                  className="group rounded-2xl overflow-hidden bg-card border border-border/40 hover:border-primary/30 transition-all flex flex-col"
                >
                  <div className="aspect-video overflow-hidden bg-secondary/50">
                    <img src={a.imageurl} alt={a.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <div className="text-[10px] text-muted-foreground tracking-widest font-bold flex items-center gap-1 mb-2">
                      <Clock className="w-3 h-3" />{timeAgo(a.published_on)}
                    </div>
                    <h3 className="text-sm font-bold text-white leading-snug group-hover:text-primary transition-colors line-clamp-3">{a.title}</h3>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-auto pt-3">
                      <span>{a.source_info.name}</span>
                      <ExternalLink className="w-3 h-3 ml-auto" />
                    </div>
                  </div>
                </motion.a>
              ))}
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
