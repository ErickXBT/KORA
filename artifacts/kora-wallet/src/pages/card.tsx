import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWallet } from "@/hooks/use-wallet";
import { useToast } from "@/hooks/use-toast";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { Globe, Zap, ShieldCheck, Smartphone } from "lucide-react";

const COUNTRIES = [
  "United States", "Indonesia", "Singapore", "Japan", "United Kingdom",
  "Germany", "France", "Spain", "Italy", "Canada", "Brazil", "Mexico",
  "Australia", "India", "South Korea", "Thailand", "Vietnam", "Philippines",
  "Malaysia", "United Arab Emirates", "Saudi Arabia", "Turkey", "Netherlands",
  "Switzerland", "Sweden", "Norway", "Denmark", "Poland", "Argentina", "Chile"
];

const FEATURES = [
  { icon: Globe, title: "Global Acceptance", desc: "Use anywhere Mastercard is accepted — 200+ countries, 150M+ merchants." },
  { icon: Zap, title: "Instant Fiat → Crypto", desc: "Top-up with fiat and convert to your favorite crypto in seconds." },
  { icon: ShieldCheck, title: "Zero FX Fees", desc: "Spend in any currency without hidden conversion charges." },
  { icon: Smartphone, title: "Apple & Google Pay", desc: "Tokenize once, tap anywhere. Native mobile wallet support." },
];

const FEES = [
  ["ATM Withdrawal", "Free up to $200/mo, 2% after"],
  ["Foreign Exchange", "0%"],
  ["Monthly Fee", "$0"],
  ["Daily Spend Limit", "$10,000"],
  ["Crypto Conversion", "0.5% per swap"],
];

export default function Card() {
  const [, setLocation] = useLocation();
  const { walletId, cardOrder, orderCard } = useWallet();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (!walletId) setLocation("/");
  }, [walletId, setLocation]);

  if (!walletId) return null;

  const handleSubmit = () => {
    if (!name || !country || !email) {
      toast({ title: "Please fill all fields", variant: "destructive" });
      return;
    }
    orderCard({ name, country, email, orderedAt: Date.now() });
    toast({ title: "Card order placed!", description: "We'll ship to your address shortly." });
    setName(""); setCountry(""); setEmail("");
  };

  // 3D tilt
  const cardRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [15, -15]);
  const rotateY = useTransform(x, [-100, 100], [-15, 15]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    x.set(e.clientX - rect.left - rect.width / 2);
    y.set(e.clientY - rect.top - rect.height / 2);
  };
  const handleMouseLeave = () => { x.set(0); y.set(0); };

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto w-full px-6 py-12">
        <div className="text-center mb-10">
          <div className="inline-block px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-[10px] font-bold tracking-widest mb-3">
            INTRODUCING KORA CARD
          </div>
          <h1 className="text-5xl md:text-6xl font-black tracking-tight text-white">
            Spend Crypto. <span className="bg-gradient-to-r from-primary to-red-500 bg-clip-text text-transparent">Anywhere.</span>
          </h1>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
            The KORA Mastercard converts fiat to crypto instantly. Accepted in 200+ countries. Zero FX fees. Tap to pay everywhere.
          </p>
        </div>

        {/* 3D Card */}
        <div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="flex justify-center mb-16"
          style={{ perspective: 1000 }}
        >
          <motion.div
            style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
            className="relative w-[420px] h-[260px] rounded-3xl p-7 text-white overflow-hidden"
          >
            {/* gradient layers */}
            <div className="absolute inset-0 bg-gradient-to-br from-red-500 via-primary to-red-900 rounded-3xl" />
            <div className="absolute inset-0 bg-gradient-to-tr from-black/60 via-transparent to-white/10 rounded-3xl" />
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

            <div className="relative h-full flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs tracking-widest opacity-80">KORA</div>
                  <div className="text-[10px] tracking-wider opacity-60 mt-0.5">CRYPTO MASTERCARD</div>
                </div>
                <div className="w-10 h-7 rounded bg-gradient-to-br from-amber-300 to-amber-500 shadow-inner" />
              </div>

              <div className="font-mono text-2xl tracking-[0.25em] [text-shadow:0_2px_4px_rgba(0,0,0,0.5)]">
                4242 2625 0000 KORA
              </div>

              <div className="flex items-end justify-between">
                <div>
                  <div className="text-[10px] opacity-70 tracking-widest">CARDHOLDER</div>
                  <div className="text-sm font-bold tracking-wider mt-0.5">{name.toUpperCase() || "YOUR NAME"}</div>
                </div>
                {/* Mastercard mark */}
                <div className="relative w-14 h-9">
                  <div className="absolute left-0 top-0 w-9 h-9 rounded-full bg-[#EB001B]" />
                  <div className="absolute right-0 top-0 w-9 h-9 rounded-full bg-[#F79E1B] opacity-90" />
                  <div className="absolute left-2.5 top-0 w-4 h-9 bg-[#FF5F00] mix-blend-multiply" style={{ borderRadius: "100%" }} />
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                whileHover={{ y: -4 }}
                className="p-5 rounded-2xl bg-card border border-border/40 hover:border-primary/30 transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-red-900/20 border border-primary/30 flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div className="text-sm font-bold text-white">{f.title}</div>
                <div className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{f.desc}</div>
              </motion.div>
            );
          })}
        </div>

        {/* Order form + fees */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-card border border-primary/20">
            <h3 className="text-lg font-black tracking-wider text-white">ORDER YOUR KORA CARD</h3>
            <p className="text-xs text-muted-foreground mt-1">Free shipping. Activated in minutes.</p>

            {cardOrder ? (
              <div className="mt-6 p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-sm">
                <div className="font-bold">Order confirmed</div>
                <div className="text-xs mt-1 text-green-300/80">
                  {cardOrder.name} — {cardOrder.country} — {cardOrder.email}
                </div>
              </div>
            ) : (
              <div className="space-y-4 mt-5">
                <div>
                  <label className="text-[10px] text-muted-foreground tracking-widest font-bold">FULL NAME</label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" className="mt-1 bg-secondary/40 border-border/40 text-white" />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground tracking-widest font-bold">COUNTRY</label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="mt-1 w-full bg-secondary/40 border border-border/40 text-white rounded-md h-9 px-3 text-sm"
                  >
                    <option value="">Select your country</option>
                    {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground tracking-widest font-bold">EMAIL</label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="mt-1 bg-secondary/40 border-border/40 text-white" />
                </div>
                <Button onClick={handleSubmit} className="w-full rounded-full font-bold tracking-wider bg-gradient-to-r from-primary to-red-800 text-white">
                  ORDER MY CARD
                </Button>
              </div>
            )}
          </div>

          <div className="p-6 rounded-2xl bg-card border border-border/40">
            <h3 className="text-lg font-black tracking-wider text-white">FEES & LIMITS</h3>
            <p className="text-xs text-muted-foreground mt-1">No hidden fees. Ever.</p>
            <div className="mt-5 divide-y divide-border/40">
              {FEES.map(([k, v]) => (
                <div key={k} className="flex items-center justify-between py-3">
                  <span className="text-sm text-muted-foreground">{k}</span>
                  <span className="text-sm text-white font-medium">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
