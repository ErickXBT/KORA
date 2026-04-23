import { useState } from "react";
import { useLocation } from "wouter";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/hooks/use-wallet";
import { CoinGrid } from "@/components/CoinGrid";
import { DepositModal } from "@/components/modals/DepositModal";
import { SendModal } from "@/components/modals/SendModal";
import { SettingsModal } from "@/components/modals/SettingsModal";
import { ArrowDownLeft, ArrowUpRight, Settings, Copy, RefreshCw, Coins, Wallet as WalletIcon, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect } from "react";

export default function Wallet() {
  const [, setLocation] = useLocation();
  const { walletId, address, solBalance, agents } = useWallet();
  const [deposit, setDeposit] = useState(false);
  const [send, setSend] = useState(false);
  const [settings, setSettings] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!walletId) setLocation("/");
  }, [walletId, setLocation]);

  if (!walletId) return null;

  const totalEarned = agents.reduce((s, a) => s + a.earned, 0);

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto w-full px-6 py-8">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black tracking-wider text-white">WALLET</h1>
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
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative p-6 rounded-2xl bg-gradient-to-br from-card to-secondary/30 border border-primary/20 overflow-hidden"
              style={{
                boxShadow: "0 0 40px rgba(255,38,37,0.08), inset 0 0 40px rgba(255,38,37,0.03)",
              }}
            >
              <div className="absolute -top-20 -right-20 w-60 h-60 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground tracking-widest font-bold">AVAILABLE BALANCE</span>
                  <button className="text-muted-foreground hover:text-white">
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex items-baseline gap-3 mt-3">
                  <span className="text-5xl font-black text-white">{solBalance.toFixed(2)}</span>
                  <span className="px-2 py-1 rounded-md bg-primary/20 text-primary text-xs font-bold tracking-wider">KORA</span>
                </div>
                <div className="text-green-500 text-sm font-medium mt-1">${(solBalance * 145).toFixed(2)} USD</div>

                <button
                  onClick={() => {
                    if (address) {
                      navigator.clipboard.writeText(address);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 1500);
                    }
                  }}
                  className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-white"
                >
                  {address?.slice(0, 4)}...{address?.slice(-4)}
                  <Copy className="w-3 h-3" />
                  {copied && <span className="text-green-500">copied</span>}
                </button>

                <div className="grid grid-cols-2 gap-3 mt-6">
                  <Button variant="secondary" onClick={() => setDeposit(true)} className="rounded-full font-bold tracking-wider">
                    <ArrowDownLeft className="w-4 h-4 mr-2" /> RECEIVE
                  </Button>
                  <Button onClick={() => setSend(true)} className="rounded-full font-bold tracking-wider bg-gradient-to-r from-primary to-red-800 text-white">
                    <ArrowUpRight className="w-4 h-4 mr-2" /> SEND
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Agent stats */}
          <div>
            <div className="text-[10px] text-muted-foreground tracking-widest font-bold mb-2">AGENT STATS</div>
            <div className="space-y-3">
              <StatRow icon={Coins} color="from-amber-500 to-amber-700" label="TOTAL EARNED" value={totalEarned.toFixed(8)} />
              <StatRow icon={WalletIcon} color="from-green-500 to-green-700" label="TOTAL WITHDRAWN" value="0.00000000" />
              <StatRow icon={Clock} color="from-primary to-red-800" label="PENDING IN AGENTS" value={(agents.length * 0.001).toFixed(8)} />
            </div>
          </div>
        </div>

        <CoinGrid initialCount={12} />
      </div>

      <DepositModal open={deposit} onOpenChange={setDeposit} />
      <SendModal open={send} onOpenChange={setSend} onDeposit={() => setDeposit(true)} />
      <SettingsModal open={settings} onOpenChange={setSettings} />
    </AppLayout>
  );
}

function StatRow({ icon: Icon, color, label, value }: { icon: any; color: string; label: string; value: string }) {
  return (
    <div className="p-4 rounded-xl bg-card/60 border border-border/40 flex items-center justify-between">
      <div>
        <div className="text-[10px] text-muted-foreground tracking-widest font-bold">{label}</div>
        <div className="text-green-500 font-bold text-lg mt-1 font-mono">{value}</div>
      </div>
      <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${color} flex items-center justify-center shadow-lg`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
    </div>
  );
}
