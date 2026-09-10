// Centralized design tokens (spec §35A, engineering rules §6).
// The ONLY place visual constants live. Tune globally here.

export const colors = {
  background: '#0F0F0F',
  surface: '#161616',
  surface2: '#1E1E1E',
  surface3: '#262626',
  border: '#2A2A2A',
  text: '#FFFFFF',
  textDim: '#B3B3B3',
  textMuted: '#7A7A7A',
  brandDeep: '#4A1C6E',
  brandBlue: '#2D6CDF',
  accent: '#FF6B6B',
  success: '#34D399',
  warning: '#FBBF24',
  danger: '#FF6B6B',
  overlay: 'rgba(0, 0, 0, 0.6)',
  onBrand: '#FFFFFF',
} as const;

export type ColorName = keyof typeof colors;

export const gradient = {
  start: colors.brandDeep,
  end: colors.brandBlue,
  angle: { x: 0, y: 0, x1: 1, y1: 1 },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  full: 9999,
} as const;

export const typography = {
  family: 'Inter',
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
  },
  weights: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
} as const;

export const touch = {
  min: 44,
} as const;

export const animation = {
  fast: 150,
  normal: 250,
} as const;
