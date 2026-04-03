export const Colors = {
  // Backgrounds
  bg: '#0A0A0A',
  bgCard: '#141414',
  bgElevated: '#1C1C1C',
  bgInput: '#1A1A1A',

  // Borders
  border: '#2A2A2A',
  borderFocus: '#3A3A3A',

  // Neon accents
  primary: '#A3FF50',       // lime green — primary CTA
  primaryDim: '#7ACC38',
  secondary: '#00F0FF',     // cyan — secondary / highlights
  secondaryDim: '#00B8C4',
  accent: '#FF4D6D',        // red/pink — destructive / warning

  // Text
  text: '#FFFFFF',
  textSecondary: '#8A8A8A',
  textMuted: '#4A4A4A',
  textOnPrimary: '#0A0A0A', // dark text on neon bg

  // Semantic
  success: '#A3FF50',
  error: '#FF4D6D',
  warning: '#FFB020',
  info: '#00F0FF',

  // Muscle group colors
  chest: '#FF6B6B',
  back: '#4ECDC4',
  legs: '#45B7D1',
  shoulders: '#96CEB4',
  arms: '#FFEAA7',
  core: '#DDA0DD',
  cardio: '#98D8C8',
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const Radius = {
  sm: 6,
  md: 10,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const Shadow = {
  neon: {
    shadowColor: '#A3FF50',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
} as const;

export type ColorKey = keyof typeof Colors;
