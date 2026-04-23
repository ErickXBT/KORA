import { useState, useEffect, createContext, useContext, ReactNode } from "react";

export type AgentTier = "NANO" | "MICRO" | "PRO" | "ELITE";

export interface Agent {
  id: string;
  tier: AgentTier;
  purchasedAt: number;
  lastClaimedAt: number;
  earned: number;
}

export interface CreatorData {
  handle: string | null;
  verified: boolean;
  pin: string | null;
  earnings: number;
}

export interface WalletState {
  walletId: string | null;
  address: string | null;
  solBalance: number;
  holdings: Record<string, number>;
  agents: Agent[];
  creator: CreatorData;
  cardOrder: any | null;
}

interface WalletContextType extends WalletState {
  connect: (walletId: string) => boolean;
  createWallet: (password: string) => void;
  disconnect: () => void;
  deposit: (amount: number) => void;
  send: (amount: number, address: string) => boolean;
  buyAgent: (tier: AgentTier, cost: number) => boolean;
  updateCreator: (data: Partial<CreatorData>) => void;
  orderCard: (data: any) => void;
  updateHoldings: (coinId: string, change: number) => void;
  claimEarnings: () => void;
}

const defaultState: WalletState = {
  walletId: null,
  address: null,
  solBalance: 0,
  holdings: {},
  agents: [],
  creator: { handle: null, verified: false, pin: null, earnings: 0 },
  cardOrder: null,
};

const WalletContext = createContext<WalletContextType | undefined>(undefined);

function generateBase58(length: number = 44) {
  const chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WalletState>(() => {
    const saved = localStorage.getItem("kora_wallet_state");
    return saved ? JSON.parse(saved) : defaultState;
  });

  useEffect(() => {
    localStorage.setItem("kora_wallet_state", JSON.stringify(state));
  }, [state]);

  const connect = (walletId: string) => {
    // In a real app we'd check password, here we just check if it exists in a mock DB
    // For simplicity, we just log in if any wallet exists in localStorage matching
    const saved = localStorage.getItem("kora_wallet_db_" + walletId);
    if (saved) {
      const parsed = JSON.parse(saved);
      setState(parsed);
      return true;
    }
    return false;
  };

  const createWallet = (password: string) => {
    const walletId = "KORA" + Math.floor(1000 + Math.random() * 9000);
    const address = generateBase58();
    const newState: WalletState = {
      ...defaultState,
      walletId,
      address,
    };
    localStorage.setItem("kora_wallet_db_" + walletId, JSON.stringify(newState));
    setState(newState);
  };

  const disconnect = () => {
    setState(defaultState);
  };

  const deposit = (amount: number) => {
    setState((prev) => ({ ...prev, solBalance: prev.solBalance + amount }));
  };

  const send = (amount: number, address: string) => {
    if (state.solBalance >= amount) {
      setState((prev) => ({ ...prev, solBalance: prev.solBalance - amount }));
      return true;
    }
    return false;
  };

  const buyAgent = (tier: AgentTier, cost: number) => {
    if (state.solBalance >= cost) {
      const newAgent: Agent = {
        id: "AGT" + Math.floor(1000 + Math.random() * 9000),
        tier,
        purchasedAt: Date.now(),
        lastClaimedAt: Date.now(),
        earned: 0,
      };
      setState((prev) => ({
        ...prev,
        solBalance: prev.solBalance - cost,
        agents: [...prev.agents, newAgent],
      }));
      return true;
    }
    return false;
  };

  const updateCreator = (data: Partial<CreatorData>) => {
    setState((prev) => ({
      ...prev,
      creator: { ...prev.creator, ...data },
    }));
  };

  const orderCard = (data: any) => {
    setState((prev) => ({ ...prev, cardOrder: data }));
  };

  const updateHoldings = (coinId: string, change: number) => {
    setState((prev) => {
      const current = prev.holdings[coinId] || 0;
      return {
        ...prev,
        holdings: { ...prev.holdings, [coinId]: Math.max(0, current + change) },
      };
    });
  };

  const claimEarnings = () => {
    setState((prev) => {
      let totalClaimed = 0;
      const now = Date.now();
      const updatedAgents = prev.agents.map(a => {
        const daysElapsed = (now - a.lastClaimedAt) / (1000 * 60 * 60 * 24);
        let rate = 0;
        if (a.tier === "NANO") rate = 0.002;
        if (a.tier === "MICRO") rate = 0.02;
        if (a.tier === "PRO") rate = 0.1;
        if (a.tier === "ELITE") rate = 1;
        
        const earned = rate * daysElapsed;
        totalClaimed += earned;
        return { ...a, earned: a.earned + earned, lastClaimedAt: now };
      });

      return {
        ...prev,
        solBalance: prev.solBalance + totalClaimed,
        agents: updatedAgents
      };
    });
  };

  // Passive earnings simulation
  useEffect(() => {
    if (state.agents.length > 0) {
      const interval = setInterval(() => {
        claimEarnings();
      }, 5000); // Fast simulation for demo
      return () => clearInterval(interval);
    }
  }, [state.agents]);

  // Sync back to mock DB on change
  useEffect(() => {
    if (state.walletId) {
      localStorage.setItem("kora_wallet_db_" + state.walletId, JSON.stringify(state));
    }
  }, [state]);

  return (
    <WalletContext.Provider value={{ ...state, connect, createWallet, disconnect, deposit, send, buyAgent, updateCreator, orderCard, updateHoldings, claimEarnings }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) throw new Error("useWallet must be used within WalletProvider");
  return context;
}
