import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Key, History, X, ChevronRight } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const items = [
  { icon: Key, title: "EXPORT PRIVATE KEY", desc: "Export your wallet's private key" },
  { icon: History, title: "KORA HISTORY", desc: "View your transactions on KoraScan" },
  { icon: History, title: "SOLANA HISTORY", desc: "View your transactions on SolScan" },
];

export function SettingsModal({ open, onOpenChange }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border border-primary/20 max-w-md p-0 overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-lg font-bold tracking-wider text-white">SETTINGS</h3>
            <button onClick={() => onOpenChange(false)} className="text-muted-foreground hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3">
            {items.map((it) => {
              const Icon = it.icon;
              return (
                <button
                  key={it.title}
                  className="w-full flex items-center gap-3 p-4 bg-secondary/40 hover:bg-secondary/70 border border-border rounded-xl transition-colors text-left group"
                >
                  <div className="flex-1">
                    <div className="text-sm font-bold text-white tracking-wider">{it.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{it.desc}</div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/30 to-red-900/30 border border-primary/40 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
