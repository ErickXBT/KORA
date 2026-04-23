import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { useWallet } from "@/hooks/use-wallet";
import { Logo } from "@/components/Logo";
import { useToast } from "@/hooks/use-toast";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeposit?: () => void;
}

export function SendModal({ open, onOpenChange, onDeposit }: Props) {
  const { solBalance, send } = useWallet();
  const { toast } = useToast();
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");

  const handleSend = () => {
    const amt = parseFloat(amount);
    if (!recipient || !amt || amt <= 0) return;
    if (send(amt, recipient)) {
      toast({ title: "Sent successfully", description: `${amt} KORA sent to ${recipient.slice(0, 8)}...` });
      setRecipient("");
      setAmount("");
      onOpenChange(false);
    } else {
      toast({ title: "Insufficient balance", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border border-primary/20 max-w-md p-0 overflow-hidden">
        <div className="p-6">
          <div className="flex justify-end mb-2">
            <button onClick={() => onOpenChange(false)} className="text-muted-foreground hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-col items-center text-center mb-6">
            <Logo size={64} glow className="mb-3" />
            <h3 className="text-xl font-bold tracking-wider text-white">SEND KORA</h3>
            <p className="text-xs text-muted-foreground mt-1">Transfer KORA to any wallet</p>
          </div>

          {solBalance <= 0 ? (
            <div className="text-center space-y-4 py-4">
              <p className="text-sm text-white">You have no KORA available to send.</p>
              <p className="text-xs text-muted-foreground">Deposit KORA to your wallet first.</p>
              <Button
                onClick={() => {
                  onOpenChange(false);
                  onDeposit?.();
                }}
                className="w-full rounded-full font-bold tracking-wider bg-gradient-to-r from-primary to-red-800 text-white"
              >
                DEPOSIT KORA
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-[10px] text-muted-foreground tracking-wider font-bold">RECIPIENT ADDRESS</label>
                <Input
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="Enter wallet address"
                  className="mt-2 bg-secondary/50 border-border text-white"
                />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground tracking-wider font-bold">AMOUNT</label>
                <div className="mt-2 flex gap-2">
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="bg-secondary/50 border-border text-white"
                  />
                  <Button
                    variant="secondary"
                    onClick={() => setAmount(solBalance.toString())}
                    className="rounded-full text-xs font-bold"
                  >
                    MAX
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Balance: {solBalance.toFixed(4)} KORA</p>
              </div>
              <Button
                onClick={handleSend}
                className="w-full rounded-full font-bold tracking-wider bg-gradient-to-r from-primary to-red-800 text-white"
              >
                SEND
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
