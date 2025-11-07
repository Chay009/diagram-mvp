import { create } from 'zustand';

export type ThemeMode = 'default' | 'brand';

export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  text: string;
  border: string;
  accent: string;
}

export interface ThemeState {
  // Current theme mode
  mode: ThemeMode;

  // Theme colors for brand mode
  brandColors: ThemeColors;

  // Default colors
  defaultColors: ThemeColors;

  // Actions
  setThemeMode: (mode: ThemeMode) => void;
  setBrandColors: (colors: Partial<ThemeColors>) => void;
  getCurrentColors: () => ThemeColors;
}

const DEFAULT_COLORS: ThemeColors = {
  primary: '#3b82f6',
  secondary: '#8b5cf6',
  background: '#ffffff',
  text: '#1f2937',
  border: '#e5e7eb',
  accent: '#10b981',
};

const BRAND_COLORS: ThemeColors = {
  primary: '#6366f1',
  secondary: '#ec4899',
  background: '#f9fafb',
  text: '#111827',
  border: '#d1d5db',
  accent: '#f59e0b',
};

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: 'default',
  brandColors: BRAND_COLORS,
  defaultColors: DEFAULT_COLORS,

  setThemeMode: (mode) => set({ mode }),

  setBrandColors: (colors) =>
    set((state) => ({
      brandColors: { ...state.brandColors, ...colors },
    })),

  getCurrentColors: () => {
    const state = get();
    return state.mode === 'brand' ? state.brandColors : state.defaultColors;
  },
}));
