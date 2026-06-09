import { create } from 'zustand';

interface AuthState {
  mnemonic: string | null;
  cryptoKey: CryptoKey | null;
  accountId: string | null;
  isAuthenticated: boolean;
  setMnemonic: (mnemonic: string | null) => void;
  setCryptoKey: (key: CryptoKey | null) => void;
  setAccountId: (accountId: string | null) => void;
  setIsAuthenticated: (value: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  mnemonic: null,
  cryptoKey: null,
  accountId: null,
  isAuthenticated: false,
  setMnemonic: (mnemonic) => set({ mnemonic }),
  setCryptoKey: (cryptoKey) => set({ cryptoKey }),
  setAccountId: (accountId) => set({ accountId }),
  setIsAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
  logout: () => set({ mnemonic: null, cryptoKey: null, accountId: null, isAuthenticated: false }),
}));
