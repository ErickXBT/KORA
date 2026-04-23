import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  Wallet,
  TrendingUp,
  CreditCard,
  Newspaper,
  BarChart3,
  LogOut,
  Settings,
  User,
  Bot,
  Briefcase,
  Sparkles
} from "lucide-react";
import { useWallet } from "@/hooks/use-wallet";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/wallet", label: "WALLET", icon: Wallet },
  { href: "/trade", label: "TRADE", icon: TrendingUp },
  { href: "/card", label: "CARD", icon: CreditCard },
  { href: "/news", label: "NEWS", icon: Newspaper },
  { href: "/markets", label: "MARKETS", icon: BarChart3 },
  { href: "/portal", label: "PORTAL", icon: Briefcase },
  { href: "/agents", label: "AGENTS", icon: Bot },
  { href: "/creators", label: "CREATORS", icon: Sparkles },
];

export function Navbar() {
  const [location, setLocation] = useLocation();
  const { walletId, solBalance, disconnect } = useWallet();

  if (!walletId) return null;

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-background border-b border-border/40 z-50 flex items-center justify-between px-6">
      <div className="flex items-center gap-8">
        <Link href="/wallet" className="flex items-center gap-2 cursor-pointer group">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-red-900 flex items-center justify-center shadow-[0_0_15px_rgba(255,38,37,0.5)] group-hover:shadow-[0_0_25px_rgba(255,38,37,0.7)] transition-all">
            <span className="text-white font-bold tracking-tighter text-sm">K</span>
          </div>
          <span className="text-lg font-bold tracking-widest uppercase text-white">KORA</span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold tracking-wider transition-all",
                  isActive
                    ? "bg-gradient-to-r from-primary to-red-800 text-white shadow-[0_0_10px_rgba(255,38,37,0.3)]"
                    : "text-muted-foreground hover:text-white hover:bg-white/5"
                )}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-3 px-4 py-1.5 rounded-full bg-secondary/50 border border-border">
          <span className="text-sm font-medium text-white">{solBalance.toFixed(2)} SOL</span>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-white">
            <Settings className="w-5 h-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full text-muted-foreground hover:text-primary"
            onClick={() => {
              disconnect();
              setLocation("/");
            }}
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </nav>
  );
}
