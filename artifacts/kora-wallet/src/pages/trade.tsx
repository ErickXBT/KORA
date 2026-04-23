import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWallet } from "@/hooks/use-wallet";
import { useTopCoins } from "@/hooks/use-coingecko";
import { CoinGrid } from "@/components/CoinGrid";
import { DepositModal } from "@/components/modals/DepositModal";
import { SendModal } from "@/components/modals/SendModal";
import { SettingsModal } from "@/components/modals/SettingsModal";
import { Settings, ArrowDownLeft, ArrowUpRight, RefreshCw, Copy, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Trade() {
  const [, setLocation] = useLocation();
  const { walletId, address, solBalance, send, updateHoldings } = useWallet();
  const { data: coins } = useTopCoins();
  const { toast } = useToast();
  const [deposit, setDeposit] = useState(false);
  const [sendOpen, setSendOpen] = useState(false);
  const [settings, setSettings] = useState(false);
  const [pay, setPay] = useState("");
  const [selectedId, setSelectedId] = useState<string>("bitcoin");
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    if (!walletId) setLocation("/");
  }, [walletId, setLocation]);

  if (!walletId) return null;

  const selected = coins?.find((c) => c.id === selectedId);
  const payAmount = parseFloat(pay) || 0;
  const receiveAmount = selected ? (payAmount * 145) / selected.current_price : 0;

  const handleBuy = () => {
    if (!selected || payAmount <= 0) return;
    if (payAmount > solBalance) {
      toast({ title: "Insufficient balance", variant: "destructive" });
      return;
    }
    send(payAmount, "trade");
    updateHoldings(selected.id, receiveAmount);
    toast({ title: `Bought ${receiveAmount.toFixed(4)} ${selected.symbol.toUpperCase()}` });
    setPay("");
  };

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto w-full px-6 py-8">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black tracking-wider text-white">TRADE</h1>
            <p className="text-xs text-muted-foreground mt-1">@{walletId.toLowerCase()}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => setSettings(true)} className="rounded-full border-border/40">
              <Settings className="w-4 h-4" />
            </Button>
            <Button variant="outline" onClick={() => setLocation("/")} className="rounded-full border-border/40 text-xs font-bold tracking-wider">
              DISCONNECT
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Wallet card */}
          <div>
            <div className="text-[10px] text-muted-foreground tracking-widest font-bold mb-2">WALLET</div>
            <div className="relative p-6 rounded-2xl bg-gradient-to-br from-card to-secondary/30 border border-primary/20 overflow-hidden" style={{ boxShadow: "0 0 40px rgba(255,38,37,0.08)" }}>
              <div className="absolute -top-20 -right-20 w-60 h-60 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground tracking-widest font-bold">AVAILABLE BALANCE</span>
                  <button className="text-muted-foreground hover:text-white"><RefreshCw className="w-3.5 h-3.5" /></button>
                </div>
                <div className="flex items-baseline gap-3 mt-3">
                  <span className="text-5xl font-black text-white">{solBalance.toFixed(2)}</span>
                  <span className="px-2 py-1 rounded-md bg-primary/20 text-primary text-xs font-bold tracking-wider">KORA</span>
                </div>
                <button className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  {address?.slice(0, 4)}...{address?.slice(-4)} <Copy className="w-3 h-3" />
                </button>
                <div className="grid grid-cols-2 gap-3 mt-6">
                  <Button variant="secondary" onClick={() => setDeposit(true)} className="rounded-full font-bold tracking-wider">
                    <ArrowDownLeft className="w-4 h-4 mr-2" /> RECEIVE
                  </Button>
                  <Button onClick={() => setSendOpen(true)} className="rounded-full font-bold tracking-wider bg-gradient-to-r from-primary to-red-800 text-white">
                    <ArrowUpRight className="w-4 h-4 mr-2" /> SEND
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Buy */}
          <div>
            <div className="text-[10px] text-muted-foreground tracking-widest font-bold mb-2">QUICK BUY</div>
            <div className="p-6 rounded-2xl bg-card border border-primary/20" style={{ boxShadow: "0 0 40px rgba(255,38,37,0.08)" }}>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] text-muted-foreground tracking-widest font-bold">YOU PAY</label>
                  <div className="mt-2 flex items-center gap-2 p-3 bg-secondary/40 rounded-lg border border-border/40">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-red-900 flex items-center justify-center text-white text-xs font-bold">K</div>
                    <Input
                      type="number"
                      value={pay}
                      onChange={(e) => setPay(e.target.value)}
                      placeholder="0.00"
                      className="flex-1 bg-transparent border-0 h-8 text-white p-0 focus-visible:ring-0"
                    />
                    <span className="text-xs text-muted-foreground font-bold">KORA</span>
                    <button
                      onClick={() => setPay(solBalance.toString())}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-primary/20 text-primary font-bold"
                    >
                      MAX
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-muted-foreground tracking-widest font-bold">YOU RECEIVE</label>
                  <button
                    onClick={() => setPickerOpen((p) => !p)}
                    className="mt-2 w-full flex items-center gap-2 p-3 bg-secondary/40 rounded-lg border border-border/40 relative"
                  >
                    {selected && <img src={selected.image} className="w-7 h-7 rounded-full" alt="" />}
                    <span className="text-sm font-bold text-white uppercase flex-1 text-left">{selected?.symbol || "—"}</span>
                    <span className="text-xs text-white">{receiveAmount.toFixed(4)}</span>
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    {pickerOpen && (
                      <div className="absolute top-full left-0 right-0 mt-2 max-h-72 overflow-auto bg-card border border-primary/30 rounded-xl z-20 p-2 shadow-2xl">
                        {coins?.slice(0, 30).map((c) => (
                          <div
                            key={c.id}
                            onClick={(e) => { e.stopPropagation(); setSelectedId(c.id); setPickerOpen(false); }}
                            className="flex items-center gap-2 p-2 hover:bg-secondary/60 rounded-lg cursor-pointer"
                          >
                            <img src={c.image} className="w-6 h-6 rounded-full" alt="" />
                            <span className="text-sm text-white">{c.name}</span>
                            <span className="text-xs text-muted-foreground ml-auto">${c.current_price.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </button>
                </div>

                <Button
                  onClick={handleBuy}
                  className="w-full rounded-full font-bold tracking-wider bg-gradient-to-r from-primary to-red-800 hover:opacity-90 text-white"
                >
                  BUY {selected?.symbol.toUpperCase() || ""}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <CoinGrid initialCount={12} />
      </div>

      <DepositModal open={deposit} onOpenChange={setDeposit} />
      <SendModal open={sendOpen} onOpenChange={setSendOpen} onDeposit={() => setDeposit(true)} />
      <SettingsModal open={settings} onOpenChange={setSettings} />
    </AppLayout>
  );
}
