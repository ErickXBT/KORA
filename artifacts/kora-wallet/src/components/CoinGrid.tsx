import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus } from "lucide-react";
import { useTopCoins, CoinMarketData } from "@/hooks/use-coingecko";
import { useWallet } from "@/hooks/use-wallet";
import { CoinDetailModal } from "@/components/modals/CoinDetailModal";
import { motion } from "framer-motion";

export function CoinGrid({ initialCount = 12 }: { initialCount?: number }) {
  const { data, isLoading } = useTopCoins();
  const { holdings } = useWallet();
  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [selected, setSelected] = useState<CoinMarketData | null>(null);

  const coins = data?.slice(0, 21) || [];
  const filtered = search
    ? coins.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.symbol.toLowerCase().includes(search.toLowerCase()))
    : coins;
  const visible = showAll ? filtered : filtered.slice(0, initialCount);

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <div className="text-xs text-muted-foreground tracking-wider font-bold">COINS</div>
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by CA or name"
            className="pl-9 h-9 bg-secondary/40 border-border/40 text-sm rounded-full"
          />
        </div>
        <Button variant="secondary" size="sm" className="rounded-full text-xs font-bold gap-1.5 flex-shrink-0">
          <Plus className="w-3 h-3" /> <span className="hidden sm:inline">REQUEST COIN</span>
        </Button>
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="h-[68px] rounded-xl bg-secondary/30 animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          <motion.div layout className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {visible.map((coin, i) => {
              const held = holdings[coin.id] || 0;
              const value = held * coin.current_price;
              return (
                <motion.button
                  key={coin.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  onClick={() => setSelected(coin)}
                  className="flex items-center gap-3 p-3 bg-secondary/30 hover:bg-secondary/60 border border-border/40 hover:border-primary/30 rounded-xl transition-all text-left group"
                >
                  <img src={coin.image} alt={coin.name} className="w-9 h-9 rounded-full" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-white truncate">{coin.name}</span>
                      <span className="w-3 h-3 rounded-full bg-primary/20 border border-primary/50" />
                    </div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{coin.symbol}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-white font-medium">{held.toFixed(2)}</div>
                    <div className="text-[10px] text-muted-foreground">${value.toFixed(2)}</div>
                  </div>
                </motion.button>
              );
            })}
          </motion.div>

          {filtered.length > initialCount && (
            <div className="mt-4 text-center">
              <button
                onClick={() => setShowAll((s) => !s)}
                className="text-xs text-muted-foreground hover:text-primary tracking-widest font-bold py-3 px-6 border border-border/40 rounded-full hover:border-primary/40 transition-colors"
              >
                {showAll ? "SHOW LESS" : "SHOW MORE"}
              </button>
            </div>
          )}
        </>
      )}

      <CoinDetailModal coin={selected} open={!!selected} onOpenChange={(o) => !o && setSelected(null)} />
    </div>
  );
}
