export const COLORS = {
  // Primary brand colors
  primary: '#0F172A', // Dark Navy / Slate 900
  primaryDark: '#0D1322', // Deep Midnight (Welcome screen background)
  primaryLight: '#1E293B',

  // Surfaces & Backgrounds
  background: '#F8FAFC', // Slate 50 (App background)
  surface: '#FFFFFF', // Pure White (Cards, inputs)
  surfaceSubtle: '#F1F5F9', // Slate 100 (Segmented tab track, badges)
  surfaceDark: '#1E2538', // Dark card container on welcome screen

  // Borders
  border: '#E2E8F0', // Slate 200 (Default subtle border)
  borderDark: '#334155', // Slate 700 (Welcome outline button)
  borderFocus: '#0F172A',

  // Typography Colors
  textPrimary: '#0F172A', // Dark Slate for headings & titles
  textSecondary: '#64748B', // Slate 500 for subtitles & metadata
  textMuted: '#94A3B8', // Slate 400 for placeholders & icons
  textInverse: '#FFFFFF', // Pure white for buttons & dark screens

  // Semantic Accent Colors (matching Figma badges & stat numbers)
  blue: '#2563EB', // Blue 600 (Hearings count, PDF/DOC, links)
  blueLight: '#EFF6FF', // Blue 50
  blueBadge: '#DBEAFE', // Blue 100 (PRO badge)

  green: '#10B981', // Emerald 500 (Tasks count, Paid amounts)
  greenDark: '#059669', // Emerald 600
  greenLight: '#ECFDF5', // Emerald 50 (ONGOING & MEETING badge bg)

  red: '#EF4444', // Red 500 (Deadlines, Total Due, Pending)
  redDark: '#DC2626', // Red 600
  redLight: '#FEE2E2', // Red 50 (DEADLINE badge bg, PDF bg)

  amber: '#F59E0B', // Amber 500 (Pending stat count)
  amberDark: '#D97706', // Amber 600 (ON HOLD badge text)
  amberLight: '#FEF3C7', // Amber 100 (ON HOLD badge bg)
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const RADIUS = {
  xs: 4,
  sm: 6,
  md: 10,
  lg: 12,
  xl: 16,
  xxl: 24,
  full: 9999,
};

export const SHADOWS = {
  subtle: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  card: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
};
