import { useState } from "react";
import { useLocation } from "wouter";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWallet } from "@/hooks/use-wallet";
import { Logo } from "@/components/Logo";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Check, X, AlertCircle } from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"connect" | "create">("connect");

  // connect state
  const [loginId, setLoginId] = useState("");
  const [loginPw, setLoginPw] = useState("");

  // create state
  const [newId, setNewId] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");

  const [, setLocation] = useLocation();
  const { connect, createWallet, walletIdExists } = useWallet();
  const { toast } = useToast();

  const cleanNewId = newId.trim().toUpperCase();
  const idValid = /^[A-Z0-9_]{4,20}$/.test(cleanNewId);
  const idTaken = idValid && walletIdExists(cleanNewId);
  const idAvailable = idValid && !idTaken;
  const pwLongEnough = newPw.length >= 6;
  const pwMatches = newPw.length > 0 && newPw === confirmPw;
  const canCreate = idAvailable && pwLongEnough && pwMatches;

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    const res = connect(loginId, loginPw);
    if (res.ok) {
      toast({ title: "Welcome back", description: `@${loginId.trim().toLowerCase()}` });
      setLocation("/wallet");
    } else {
      toast({ title: "Connection Failed", description: res.error, variant: "destructive" });
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canCreate) {
      toast({ title: "Please fix the form", variant: "destructive" });
      return;
    }
    const res = createWallet(cleanNewId, newPw);
    if (res.ok) {
      toast({ title: "Wallet created", description: `Welcome to KORA, @${cleanNewId.toLowerCase()}` });
      setLocation("/wallet");
    } else {
      toast({ title: "Could not create wallet", description: res.error, variant: "destructive" });
    }
  };

  return (
    <AppLayout showNav={false}>
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="z-10 w-full max-w-md">
          <div className="flex flex-col items-center mb-10">
            <Logo size={88} glow className="mb-6" />
            <h1 className="text-3xl font-bold tracking-widest uppercase">Kora Wallet</h1>
            <p className="text-muted-foreground mt-2 tracking-widest text-sm uppercase">Next Generation Access</p>
          </div>

          <div className="bg-card border border-card-border p-8 rounded-2xl shadow-2xl relative">
            <div className="flex w-full mb-8 border-b border-border">
              <button
                className={`flex-1 pb-4 text-sm font-bold tracking-wider uppercase transition-colors relative ${
                  activeTab === "connect" ? "text-primary" : "text-muted-foreground hover:text-white"
                }`}
                onClick={() => setActiveTab("connect")}
              >
                Connect
                {activeTab === "connect" && (
                  <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary shadow-[0_0_10px_rgba(255,38,37,1)]" />
                )}
              </button>
              <button
                className={`flex-1 pb-4 text-sm font-bold tracking-wider uppercase transition-colors relative ${
                  activeTab === "create" ? "text-primary" : "text-muted-foreground hover:text-white"
                }`}
                onClick={() => setActiveTab("create")}
              >
                Create Wallet
                {activeTab === "create" && (
                  <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary shadow-[0_0_10px_rgba(255,38,37,1)]" />
                )}
              </button>
            </div>

            {activeTab === "connect" ? (
              <form onSubmit={handleConnect} className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">Wallet ID</Label>
                  <Input
                    value={loginId}
                    onChange={(e) => setLoginId(e.target.value.toUpperCase())}
                    placeholder="YOURNAME"
                    className="bg-background/50 border-border/50 h-12 font-mono"
                    autoComplete="username"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">Password</Label>
                  <Input
                    type="password"
                    value={loginPw}
                    onChange={(e) => setLoginPw(e.target.value)}
                    placeholder="••••••••"
                    className="bg-background/50 border-border/50 h-12"
                    autoComplete="current-password"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-primary to-red-800 hover:opacity-90 text-white font-bold tracking-widest uppercase shadow-[0_0_15px_rgba(255,38,37,0.3)]"
                >
                  Access Wallet
                </Button>
                <button
                  type="button"
                  onClick={() => setActiveTab("create")}
                  className="block w-full text-center text-xs text-muted-foreground hover:text-primary"
                >
                  No wallet yet? <span className="text-primary font-bold">Create one</span>
                </button>
              </form>
            ) : (
              <form onSubmit={handleCreate} className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">Choose your Wallet ID</Label>
                  <div className="relative">
                    <Input
                      value={newId}
                      onChange={(e) => setNewId(e.target.value.toUpperCase())}
                      placeholder="YOURNAME"
                      className="bg-background/50 border-border/50 h-12 font-mono pr-9"
                      autoComplete="off"
                      required
                    />
                    {newId && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {idAvailable ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <X className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                    )}
                  </div>
                  {newId && (
                    <p className={`text-[11px] flex items-center gap-1 ${idAvailable ? "text-green-500" : "text-red-400"}`}>
                      <AlertCircle className="w-3 h-3" />
                      {!idValid
                        ? "4–20 chars, A–Z, 0–9, underscore only"
                        : idTaken
                        ? "This Wallet ID is already taken"
                        : "Available!"}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">New Password</Label>
                  <Input
                    type="password"
                    value={newPw}
                    onChange={(e) => setNewPw(e.target.value)}
                    placeholder="At least 6 characters"
                    className="bg-background/50 border-border/50 h-12"
                    autoComplete="new-password"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">Confirm Password</Label>
                  <Input
                    type="password"
                    value={confirmPw}
                    onChange={(e) => setConfirmPw(e.target.value)}
                    placeholder="Repeat your password"
                    className={`bg-background/50 h-12 ${
                      confirmPw && !pwMatches ? "border-red-500/60" : "border-border/50"
                    }`}
                    autoComplete="new-password"
                    required
                  />
                  {confirmPw && !pwMatches && (
                    <p className="text-[11px] text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> Passwords do not match
                    </p>
                  )}
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  By creating a wallet, you agree to store your recovery details safely. Lost passwords cannot be recovered.
                </p>

                <Button
                  type="submit"
                  disabled={!canCreate}
                  className="w-full h-12 bg-gradient-to-r from-primary to-red-800 hover:opacity-90 text-white font-bold tracking-widest uppercase shadow-[0_0_15px_rgba(255,38,37,0.3)] disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Generate Wallet
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
