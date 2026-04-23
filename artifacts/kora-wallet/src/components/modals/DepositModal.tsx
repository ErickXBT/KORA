import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, X, Check } from "lucide-react";
import { useWallet } from "@/hooks/use-wallet";
import { Logo } from "@/components/Logo";
import { motion } from "framer-motion";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DepositModal({ open, onOpenChange }: Props) {
  const { address } = useWallet();
  const [showQR, setShowQR] = useState(false);
  const [copied, setCopied] = useState(false);

  const copy = () => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border border-primary/20 max-w-md p-0 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-6"
        >
          <div className="flex justify-end mb-2">
            <button onClick={() => onOpenChange(false)} className="text-muted-foreground hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          {!showQR ? (
            <>
              <div className="flex flex-col items-center text-center mb-6">
                <Logo size={64} glow className="mb-3" />
                <h3 className="text-xl font-bold tracking-wider text-white">DEPOSIT KORA</h3>
                <p className="text-xs text-muted-foreground mt-1">Send only KORA to this address</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] text-muted-foreground tracking-wider font-bold">YOUR DEPOSIT ADDRESS</label>
                  <div className="mt-2 flex items-center gap-2 p-3 bg-secondary/50 border border-border rounded-lg">
                    <span className="text-xs text-white font-mono break-all flex-1">{address}</span>
                    <button onClick={copy} className="text-muted-foreground hover:text-primary shrink-0">
                      {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <Button
                    variant="secondary"
                    onClick={() => setShowQR(true)}
                    className="rounded-full font-bold tracking-wider"
                  >
                    QR CODE
                  </Button>
                  <Button
                    onClick={() => onOpenChange(false)}
                    className="rounded-full font-bold tracking-wider bg-gradient-to-r from-primary to-red-800 hover:opacity-90 text-white"
                  >
                    DONE
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-col items-center mb-6">
                <div className="bg-white p-3 rounded-2xl">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(address || "")}`}
                    alt="QR"
                    className="w-52 h-52"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-3">Scan to deposit KORA</p>
              </div>

              <div>
                <label className="text-[10px] text-muted-foreground tracking-wider font-bold">YOUR DEPOSIT ADDRESS</label>
                <div className="mt-2 flex items-center gap-2 p-3 bg-secondary/50 border border-border rounded-lg">
                  <span className="text-xs text-white font-mono break-all flex-1">{address}</span>
                  <button onClick={copy} className="text-muted-foreground hover:text-primary shrink-0">
                    {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4">
                <Button
                  variant="secondary"
                  onClick={() => setShowQR(false)}
                  className="rounded-full font-bold tracking-wider"
                >
                  HIDE QR
                </Button>
                <Button
                  onClick={() => onOpenChange(false)}
                  className="rounded-full font-bold tracking-wider bg-gradient-to-r from-primary to-red-800 text-white"
                >
                  DONE
                </Button>
              </div>
            </>
          )}
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
