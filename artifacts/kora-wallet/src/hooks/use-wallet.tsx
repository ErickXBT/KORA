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

interface StoredWallet extends WalletState {
  passwordHash: string;
}

interface WalletContextType extends WalletState {
  connect: (walletId: string, password: string) => { ok: boolean; error?: string };
  createWallet: (walletId: string, password: string) => { ok: boolean; error?: string };
  walletIdExists: (walletId: string) => boolean;
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

const SESSION_KEY = "kora_wallet_session";
const DB_PREFIX = "kora_wallet_db_";
const REGISTRY_KEY = "kora_wallet_registry";

function generateBase58(length: number = 44) {
  const chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Lightweight non-cryptographic hash (demo only — passwords aren't actually secure here)
function hashPassword(pw: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < pw.length; i++) {
    h ^= pw.charCodeAt(i);
    h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
  }
  return "h_" + h.toString(16).padStart(8, "0");
}

function getRegistry(): string[] {
  try {
    const raw = localStorage.getItem(REGISTRY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setRegistry(ids: string[]) {
  localStorage.setItem(REGISTRY_KEY, JSON.stringify(ids));
}

function loadStored(walletId: string): StoredWallet | null {
  try {
    const raw = localStorage.getItem(DB_PREFIX + walletId.toUpperCase());
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveStored(walletId: string, data: StoredWallet) {
  localStorage.setItem(DB_PREFIX + walletId.toUpperCase(), JSON.stringify(data));
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WalletState>(() => {
    const session = localStorage.getItem(SESSION_KEY);
    if (session) {
      const stored = loadStored(session);
      if (stored) {
        const { passwordHash: _omit, ...rest } = stored;
        return rest;
      }
    }
    return defaultState;
  });

  // Persist active session pointer
  useEffect(() => {
    if (state.walletId) {
      localStorage.setItem(SESSION_KEY, state.walletId);
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  }, [state.walletId]);

  // Sync wallet state back to its DB row (preserving stored passwordHash)
  useEffect(() => {
    if (!state.walletId) return;
    const existing = loadStored(state.walletId);
    if (!existing) return;
    saveStored(state.walletId, { ...existing, ...state });
  }, [state]);

  const walletIdExists = (walletId: string) => {
    const id = walletId.trim().toUpperCase();
    if (!id) return false;
    return getRegistry().includes(id) || !!loadStored(id);
  };

  const connect = (walletId: string, password: string) => {
    const id = walletId.trim().toUpperCase();
    if (!id) return { ok: false, error: "Enter a Wallet ID" };
    const stored = loadStored(id);
    if (!stored) return { ok: false, error: "Wallet ID not found" };
    if (stored.passwordHash !== hashPassword(password)) {
      return { ok: false, error: "Incorrect password" };
    }
    const { passwordHash: _omit, ...rest } = stored;
    setState(rest);
    return { ok: true };
  };

  const createWallet = (walletId: string, password: string) => {
    const id = walletId.trim().toUpperCase();
    if (!/^[A-Z0-9_]{4,20}$/.test(id)) {
      return { ok: false, error: "ID must be 4–20 chars (A–Z, 0–9, _)" };
    }
    if (password.length < 6) {
      return { ok: false, error: "Password must be at least 6 characters" };
    }
    if (walletIdExists(id)) {
      return { ok: false, error: "This Wallet ID is already taken" };
    }
    const newState: WalletState = {
      ...defaultState,
      walletId: id,
      address: generateBase58(),
    };
    const stored: StoredWallet = { ...newState, passwordHash: hashPassword(password) };
    saveStored(id, stored);
    setRegistry([...getRegistry(), id]);
    setState(newState);
    return { ok: true };
  };

  const disconnect = () => {
    setState(defaultState);
  };

  const deposit = (amount: number) => {
    setState((prev) => ({ ...prev, solBalance: prev.solBalance + amount }));
  };

  const send = (amount: number, _address: string) => {
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
    setState((prev) => ({ ...prev, creator: { ...prev.creator, ...data } }));
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
      const updatedAgents = prev.agents.map((a) => {
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
        agents: updatedAgents,
      };
    });
  };

  // Passive earnings simulation
  useEffect(() => {
    if (state.agents.length > 0) {
      const interval = setInterval(() => claimEarnings(), 5000);
      return () => clearInterval(interval);
    }
  }, [state.agents.length]);

  return (
    <WalletContext.Provider
      value={{
        ...state,
        connect,
        createWallet,
        walletIdExists,
        disconnect,
        deposit,
        send,
        buyAgent,
        updateCreator,
        orderCard,
        updateHoldings,
        claimEarnings,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) throw new Error("useWallet must be used within WalletProvider");
  return context;
}
