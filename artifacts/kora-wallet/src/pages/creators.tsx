import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { AppLayout } from "@/components/layout/AppLayout";
import { useWallet } from "@/hooks/use-wallet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Twitter, Check, X, Lock, Copy } from "lucide-react";

type Step = "handle" | "result" | "pin" | "post" | "done";

export default function Creators() {
  const [, setLocation] = useLocation();
  const { walletId, creator, updateCreator } = useWallet();
  const { toast } = useToast();
  const [step, setStep] = useState<Step>(creator.handle ? "done" : "handle");
  const [handle, setHandle] = useState(creator.handle || "");
  const [verified, setVerified] = useState<boolean | null>(creator.verified || null);
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [requestId] = useState(() => "KORA-" + Math.floor(1000 + Math.random() * 9000));
  const [copied, setCopied] = useState(false);

  useEffect(() => { if (!walletId) setLocation("/"); }, [walletId, setLocation]);
  if (!walletId) return null;

  const cleanHandle = handle.replace(/^@/, "").trim();

  const handleVerify = () => {
    if (!cleanHandle) {
      toast({ title: "Enter your X handle", variant: "destructive" });
      return;
    }
    // Mock verification: handles starting with letter & length >= 3 = verified
    const isVerified = /^[a-zA-Z][a-zA-Z0-9_]{2,14}$/.test(cleanHandle);
    setVerified(isVerified);
    setStep("result");
  };

  const handleSetPin = () => {
    if (pin.length !== 6 || !/^\d{6}$/.test(pin)) {
      toast({ title: "PIN must be 6 digits", variant: "destructive" });
      return;
    }
    if (pin !== confirmPin) {
      toast({ title: "PINs don't match", variant: "destructive" });
      return;
    }
    updateCreator({ handle: cleanHandle, verified: !!verified, pin });
    setStep("post");
  };

  const postText = `I'm joining @KORA Creators with request ID ${requestId}. Verify me at kora.app/creators`;

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto w-full px-6 py-12">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-[10px] font-bold tracking-widest mb-3">
            <Twitter className="w-3 h-3" /> KORA CREATORS
          </div>
          <h1 className="text-4xl font-black tracking-wider text-white">VERIFY YOUR ACCOUNT</h1>
          <p className="text-muted-foreground mt-2 text-sm">Link your X profile to start earning as a KORA Creator.</p>
        </div>

        {/* progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {(["handle", "result", "pin", "post", "done"] as Step[]).map((s, i) => {
            const order: Step[] = ["handle", "result", "pin", "post", "done"];
            const isDone = order.indexOf(step) >= i;
            return (
              <div key={s} className={`h-1.5 w-12 rounded-full transition-all ${isDone ? "bg-gradient-to-r from-primary to-red-800" : "bg-secondary"}`} />
            );
          })}
        </div>

        <div className="rounded-2xl bg-card border border-primary/20 p-8" style={{ boxShadow: "0 0 40px rgba(255,38,37,0.08)" }}>
          <AnimatePresence mode="wait">
            {step === "handle" && (
              <motion.div key="handle" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                <h3 className="text-lg font-black tracking-wider text-white">ENTER YOUR X HANDLE</h3>
                <p className="text-xs text-muted-foreground mt-1">We'll verify ownership in the next step.</p>
                <div className="mt-5 flex items-center gap-2 p-3 bg-secondary/40 border border-border/40 rounded-lg">
                  <Twitter className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">@</span>
                  <Input
                    value={handle}
                    onChange={(e) => setHandle(e.target.value)}
                    placeholder="yourhandle"
                    className="flex-1 bg-transparent border-0 h-8 text-white p-0 focus-visible:ring-0"
                  />
                </div>
                <Button onClick={handleVerify} className="w-full mt-5 rounded-full font-bold tracking-wider bg-gradient-to-r from-primary to-red-800 text-white">
                  VERIFY ACCOUNT
                </Button>
              </motion.div>
            )}

            {step === "result" && (
              <motion.div key="result" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="text-center">
                {verified ? (
                  <>
                    <div className="w-16 h-16 mx-auto rounded-full bg-green-500/20 border border-green-500 flex items-center justify-center mb-4">
                      <Check className="w-8 h-8 text-green-500" />
                    </div>
                    <h3 className="text-lg font-black tracking-wider text-white">VERIFIED</h3>
                    <p className="text-xs text-muted-foreground mt-1">@{cleanHandle} is eligible. Set a PIN to continue.</p>
                    <Button onClick={() => setStep("pin")} className="w-full mt-6 rounded-full font-bold tracking-wider bg-gradient-to-r from-primary to-red-800 text-white">
                      CONTINUE
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 mx-auto rounded-full bg-red-500/20 border border-red-500 flex items-center justify-center mb-4">
                      <X className="w-8 h-8 text-red-500" />
                    </div>
                    <h3 className="text-lg font-black tracking-wider text-white">NOT VERIFIED</h3>
                    <p className="text-xs text-muted-foreground mt-1">@{cleanHandle} couldn't be verified. Try a different handle.</p>
                    <Button onClick={() => setStep("handle")} variant="secondary" className="w-full mt-6 rounded-full font-bold tracking-wider">
                      TRY AGAIN
                    </Button>
                  </>
                )}
              </motion.div>
            )}

            {step === "pin" && (
              <motion.div key="pin" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                <div className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-black tracking-wider text-white">SET 6-DIGIT PIN</h3>
                </div>
                <p className="text-xs text-muted-foreground mt-1">You'll use this to authorize creator actions.</p>
                <div className="mt-5 space-y-3">
                  <Input
                    type="password" inputMode="numeric" maxLength={6}
                    value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                    placeholder="••••••"
                    className="bg-secondary/40 border-border/40 text-white text-center tracking-[0.5em] text-lg"
                  />
                  <Input
                    type="password" inputMode="numeric" maxLength={6}
                    value={confirmPin} onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ""))}
                    placeholder="Confirm PIN"
                    className="bg-secondary/40 border-border/40 text-white text-center tracking-[0.5em] text-lg"
                  />
                </div>
                <Button onClick={handleSetPin} className="w-full mt-5 rounded-full font-bold tracking-wider bg-gradient-to-r from-primary to-red-800 text-white">
                  SET PIN
                </Button>
              </motion.div>
            )}

            {step === "post" && (
              <motion.div key="post" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                <h3 className="text-lg font-black tracking-wider text-white">POST TO X</h3>
                <p className="text-xs text-muted-foreground mt-1">Post the message below from @{cleanHandle} to complete verification.</p>

                <div className="mt-5 p-4 bg-secondary/40 border border-border/40 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] text-muted-foreground tracking-widest font-bold">REQUEST ID</span>
                    <span className="text-primary font-mono text-sm font-bold">{requestId}</span>
                  </div>
                  <div className="text-sm text-white leading-relaxed">{postText}</div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(postText);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 1500);
                    }}
                    className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary"
                  >
                    <Copy className="w-3 h-3" /> {copied ? "Copied!" : "Copy text"}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-5">
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(postText)}`}
                    target="_blank" rel="noreferrer"
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-primary to-red-800 text-white text-xs font-bold tracking-wider"
                  >
                    <Twitter className="w-4 h-4" /> POST ON X
                  </a>
                  <Button onClick={() => setStep("done")} variant="secondary" className="rounded-full font-bold tracking-wider">
                    I'VE POSTED
                  </Button>
                </div>
              </motion.div>
            )}

            {step === "done" && (
              <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-primary to-red-800 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(255,38,37,0.5)]">
                  <Check className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-black tracking-wider text-white">YOU'RE A KORA CREATOR</h3>
                <p className="text-sm text-muted-foreground mt-2">@{creator.handle || cleanHandle} · earnings ready to roll in</p>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-xl bg-secondary/40 border border-border/40">
                    <div className="text-[10px] text-muted-foreground tracking-widest font-bold">EARNINGS</div>
                    <div className="text-green-500 font-bold text-lg mt-1">{creator.earnings.toFixed(4)} KORA</div>
                  </div>
                  <div className="p-4 rounded-xl bg-secondary/40 border border-border/40">
                    <div className="text-[10px] text-muted-foreground tracking-widest font-bold">STATUS</div>
                    <div className="text-primary font-bold text-lg mt-1">ACTIVE</div>
                  </div>
                </div>

                <Button
                  onClick={() => {
                    updateCreator({ handle: null, verified: false, pin: null });
                    setStep("handle"); setHandle(""); setPin(""); setConfirmPin(""); setVerified(null);
                  }}
                  variant="ghost"
                  className="mt-5 text-xs text-muted-foreground hover:text-white"
                >
                  Reset Creator Profile
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </AppLayout>
  );
}
