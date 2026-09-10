import { createContext, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { colors, radii, spacing, typography } from './tokens';

export interface Theme {
  colors: typeof colors;
  spacing: typeof spacing;
  radii: typeof radii;
  typography: typeof typography;
  reduceMotion: boolean;
}

interface ThemeContextValue {
  theme: Theme;
  setReduceMotion: (value: boolean) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }): ReactNode {
  const [reduceMotion, setReduceMotion] = useState(false);
  const value = useMemo<ThemeContextValue>(
    () => ({
      theme: { colors, spacing, radii, typography, reduceMotion },
      setReduceMotion,
    }),
    [reduceMotion],
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx.theme;
}

export function useThemePrefs(): Pick<ThemeContextValue, 'setReduceMotion'> & {
  reduceMotion: boolean;
} {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useThemePrefs must be used within ThemeProvider');
  return { reduceMotion: ctx.theme.reduceMotion, setReduceMotion: ctx.setReduceMotion };
}
