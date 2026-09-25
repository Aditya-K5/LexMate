// ==========================================
// LexMate Configuration & Design Tokens
// ==========================================

export const APP_CONFIG = {
  name: 'LexMate',
  description: 'Mobile-first legal practice management SaaS',
  version: '0.1.0',
  apiPrefix: '/api/v1',
  defaultPort: 4000,
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
  xxxl: 48,
} as const;

export const COLORS = {
  primary: '#0B1D3A', // Deep navy/blue from design.md
  primaryLight: '#1C315E',
  background: '#F8F9FA',
  surface: '#FFFFFF',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  status: {
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },
} as const;
