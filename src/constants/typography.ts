import { TextStyle } from 'react-native';

export const FontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  display: 42,
} as const;

export const FontWeight: Record<string, TextStyle['fontWeight']> = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
};

export const LineHeight = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.75,
} as const;

export const Typography: Record<string, TextStyle> = {
  display: {
    fontSize: FontSize.display,
    fontWeight: '800',
    letterSpacing: -1,
  },
  h1: {
    fontSize: FontSize.xxxl,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
  },
  h3: {
    fontSize: FontSize.xl,
    fontWeight: '600',
  },
  h4: {
    fontSize: FontSize.lg,
    fontWeight: '600',
  },
  body: {
    fontSize: FontSize.md,
    fontWeight: '400',
  },
  bodyMedium: {
    fontSize: FontSize.md,
    fontWeight: '500',
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  caption: {
    fontSize: FontSize.xs,
    fontWeight: '400',
    letterSpacing: 0.3,
  },
};
