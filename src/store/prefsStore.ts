import { create } from 'zustand';

interface PrefsState {
  theme: 'light' | 'dark' | 'system';
  font: string;
  customColors: string[];
  localPinHash: string | null;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setFont: (font: string) => void;
  setCustomColors: (colors: string[]) => void;
  addCustomColor: (color: string) => void;
  removeCustomColor: (color: string) => void;
  setLocalPinHash: (hash: string | null) => void;
  hydrate: (prefs: Partial<PrefsState>) => void;
}

export const usePrefsStore = create<PrefsState>((set) => ({
  theme: 'system',
  font: 'dm-sans',
  customColors: [],
  localPinHash: null,
  setTheme: (theme) => set({ theme }),
  setFont: (font) => set({ font }),
  setCustomColors: (customColors) => set({ customColors }),
  addCustomColor: (color) =>
    set((state) => ({
      customColors: state.customColors.includes(color)
        ? state.customColors
        : [...state.customColors, color],
    })),
  removeCustomColor: (color) =>
    set((state) => ({
      customColors: state.customColors.filter((c) => c !== color),
    })),
  setLocalPinHash: (localPinHash) => set({ localPinHash }),
  hydrate: (prefs) => set((state) => ({ ...state, ...prefs })),
}));
