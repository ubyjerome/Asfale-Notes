import { create } from 'zustand';

interface AuthState {
  mnemonic: string | null;
  cryptoKey: CryptoKey | null;
  accountId: string | null;
  accountLabel: string;
  isAuthenticated: boolean;
  setMnemonic: (mnemonic: string | null) => void;
  setCryptoKey: (key: CryptoKey | null) => void;
  setAccountId: (accountId: string | null) => void;
  setAccountLabel: (label: string) => void;
  setIsAuthenticated: (value: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  mnemonic: null,
  cryptoKey: null,
  accountId: null,
  accountLabel: '',
  isAuthenticated: false,
  setMnemonic: (mnemonic) => set({ mnemonic }),
  setCryptoKey: (cryptoKey) => set({ cryptoKey }),
  setAccountId: (accountId) => set({ accountId }),
  setAccountLabel: (accountLabel) => set({ accountLabel }),
  setIsAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
  logout: () => set({ mnemonic: null, cryptoKey: null, accountId: null, accountLabel: '', isAuthenticated: false }),
}));
