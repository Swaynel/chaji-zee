import { Platform } from 'react-native';

export const colors = {
  bg: '#120f0d',
  bgAlt: '#1b1613',
  surface: 'rgba(35, 28, 24, 0.9)',
  surfaceSoft: 'rgba(255, 246, 238, 0.05)',
  border: 'rgba(255, 237, 224, 0.12)',
  text: '#f8efe7',
  muted: '#cebba9',
  accent: '#ff7a2f',
  accentSoft: '#ffb27e',
  highlight: '#f2c36b',
  success: '#6cc58a',
  danger: '#ff7b7b',
  info: '#70b6ff',
};

export const spacing = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radii = {
  sm: 14,
  md: 20,
  lg: 30,
  pill: 999,
};

export const fonts = {
  display: Platform.select({
    web: '"Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif',
    ios: 'Avenir Next',
    android: 'serif',
    default: 'serif',
  }),
  body: Platform.select({
    web: '"Trebuchet MS", "Segoe UI", sans-serif',
    ios: 'Avenir Next',
    android: 'sans-serif-medium',
    default: 'sans-serif',
  }),
  mono: Platform.select({
    web: '"SFMono-Regular", Consolas, "Liberation Mono", monospace',
    ios: 'Menlo',
    android: 'monospace',
    default: 'monospace',
  }),
};

export const surfaceShadow = Platform.select({
  web: {
    boxShadow: '0 26px 80px rgba(0, 0, 0, 0.28)',
  },
  default: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.22,
    shadowRadius: 28,
    elevation: 12,
  },
});
