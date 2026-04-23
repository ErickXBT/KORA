import { useState } from "react";
import { useLocation } from "wouter";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWallet } from "@/hooks/use-wallet";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"connect" | "create">("connect");
  const [walletId, setWalletId] = useState("");
  const [password, setPassword] = useState("");
  const [, setLocation] = useLocation();
  const { connect, createWallet } = useWallet();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === "connect") {
      if (connect(walletId)) {
        setLocation("/wallet");
      } else {
        toast({
          title: "Connection Failed",
          description: "Invalid Wallet ID or not found in local storage.",
          variant: "destructive",
        });
      }
    } else {
      createWallet(password);
      setLocation("/wallet");
    }
  };

  return (
    <AppLayout showNav={false}>
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Background ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="z-10 w-full max-w-md">
          <div className="flex flex-col items-center mb-10">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-red-900 flex items-center justify-center shadow-[0_0_30px_rgba(255,38,37,0.4)] mb-6">
              <span className="text-4xl font-bold text-white">K</span>
            </div>
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

            <form onSubmit={handleSubmit} className="space-y-6">
              {activeTab === "connect" ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground">Wallet ID</Label>
                    <Input 
                      value={walletId}
                      onChange={(e) => setWalletId(e.target.value)}
                      placeholder="KORA..." 
                      className="bg-background/50 border-border/50 h-12"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground">Password</Label>
                    <Input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••" 
                      className="bg-background/50 border-border/50 h-12"
                      required
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground">New Password</Label>
                    <Input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••" 
                      className="bg-background/50 border-border/50 h-12"
                      required
                    />
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    By creating a wallet, you agree to store your recovery details safely. Lost passwords cannot be recovered.
                  </p>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full h-12 bg-gradient-to-r from-primary to-red-800 hover:from-primary/90 hover:to-red-900 text-white font-bold tracking-widest uppercase shadow-[0_0_15px_rgba(255,38,37,0.3)] transition-all"
              >
                {activeTab === "connect" ? "Access Wallet" : "Generate Wallet"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
