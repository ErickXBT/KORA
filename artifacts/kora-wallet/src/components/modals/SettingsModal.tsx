import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Key, History, X, Copy, Check, Eye, EyeOff, AlertTriangle, ArrowLeft, ExternalLink } from "lucide-react";
import { useWallet } from "@/hooks/use-wallet";
import { useToast } from "@/hooks/use-toast";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type View = "menu" | "export";

export function SettingsModal({ open, onOpenChange }: Props) {
  const { address, walletId } = useWallet();
  const { toast } = useToast();
  const [view, setView] = useState<View>("menu");
  const [reveal, setReveal] = useState(false);
  const [copied, setCopied] = useState(false);

  const close = () => {
    onOpenChange(false);
    setTimeout(() => { setView("menu"); setReveal(false); }, 200);
  };

  const copyKey = () => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopied(true);
    toast({ title: "Private key copied" });
    setTimeout(() => setCopied(false), 1500);
  };

  const openHistory = (kind: "kora" | "solana") => {
    if (!address) return;
    const url = kind === "kora"
      ? `https://korascan.io/address/${address}`
      : `https://solscan.io/account/${address}`;
    window.open(url, "_blank", "noopener,noreferrer");
    toast({ title: kind === "kora" ? "Opening KoraScan" : "Opening SolScan" });
  };

  const items = [
    { icon: Key, title: "EXPORT PRIVATE KEY", desc: "Reveal and copy your wallet's private key", action: () => setView("export") },
    { icon: History, title: "KORA HISTORY", desc: "View your transactions on KoraScan", action: () => openHistory("kora") },
    { icon: History, title: "SOLANA HISTORY", desc: "View your transactions on SolScan", action: () => openHistory("solana") },
  ];

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? onOpenChange(true) : close())}>
      <DialogContent className="bg-card border border-primary/20 max-w-md p-0 overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-5">
            <div className="flex items-center gap-2">
              {view !== "menu" && (
                <button onClick={() => { setView("menu"); setReveal(false); }} className="text-muted-foreground hover:text-white">
                  <ArrowLeft className="w-4 h-4" />
                </button>
              )}
              <h3 className="text-lg font-bold tracking-wider text-white">
                {view === "menu" ? "SETTINGS" : "EXPORT PRIVATE KEY"}
              </h3>
            </div>
            <button onClick={close} className="text-muted-foreground hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          {view === "menu" && (
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-secondary/30 border border-border/40 mb-2">
                <div className="text-[10px] text-muted-foreground tracking-widest font-bold">WALLET</div>
                <div className="text-sm text-white font-mono mt-1">@{walletId?.toLowerCase()}</div>
              </div>
              {items.map((it) => {
                const Icon = it.icon;
                return (
                  <button
                    key={it.title}
                    onClick={it.action}
                    className="w-full flex items-center gap-3 p-4 bg-secondary/40 hover:bg-secondary/70 border border-border rounded-xl transition-colors text-left group"
                  >
                    <div className="flex-1">
                      <div className="text-sm font-bold text-white tracking-wider">{it.title}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{it.desc}</div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/30 to-red-900/30 border border-primary/40 flex items-center justify-center">
                      {it.title.includes("HISTORY")
                        ? <ExternalLink className="w-3.5 h-3.5 text-primary" />
                        : <Icon className="w-4 h-4 text-primary" />}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {view === "export" && (
            <div>
              <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30 mb-4">
                <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div className="text-xs text-red-200/90 leading-relaxed">
                  Never share your private key. Anyone with this key has full control of your wallet and funds.
                </div>
              </div>

              <div className="text-[10px] text-muted-foreground tracking-widest font-bold mb-2">PRIVATE KEY</div>
              <div className="relative">
                <div className="p-4 pr-12 rounded-xl bg-secondary/50 border border-border font-mono text-xs text-white break-all min-h-[80px]">
                  {reveal ? address : "•".repeat(address?.length || 44)}
                </div>
                <button
                  onClick={() => setReveal((r) => !r)}
                  className="absolute top-3 right-3 text-muted-foreground hover:text-primary"
                  title={reveal ? "Hide" : "Reveal"}
                >
                  {reveal ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-5">
                <Button
                  variant="secondary"
                  onClick={() => setReveal((r) => !r)}
                  className="rounded-full font-bold tracking-wider"
                >
                  {reveal ? "HIDE" : "REVEAL"}
                </Button>
                <Button
                  onClick={copyKey}
                  disabled={!reveal}
                  className="rounded-full font-bold tracking-wider bg-gradient-to-r from-primary to-red-800 text-white disabled:opacity-50"
                >
                  {copied ? <><Check className="w-4 h-4 mr-1.5" /> COPIED</> : <><Copy className="w-4 h-4 mr-1.5" /> COPY KEY</>}
                </Button>
              </div>

              <p className="text-[10px] text-muted-foreground text-center mt-4">
                Copy is enabled only after you reveal the key.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
