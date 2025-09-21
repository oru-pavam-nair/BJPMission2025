/**
 * Design System Tokens
 * Centralized design tokens for consistent theming across the application
 */

export const colors = {
  primary: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6',
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
  },
  background: {
    primary: '#0F172A',
    secondary: '#1E293B',
    tertiary: '#334155',
    card: 'rgba(30, 41, 59, 0.8)',
  },
  text: {
    primary: '#F8FAFC',
    secondary: '#CBD5E1',
    tertiary: '#94A3B8',
  },
  success: {
    500: '#10B981',
    600: '#059669',
    700: '#047857',
  },
  warning: {
    500: '#F59E0B',
    600: '#D97706',
    700: '#B45309',
  },
  error: {
    500: '#EF4444',
    600: '#DC2626',
    700: '#B91C1C',
  },
  neutral: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
} as const;

export const typography = {
  fontSize: {
    caption: '0.75rem',    // 12px
    small: '0.875rem',     // 14px
    body: '1rem',          // 16px
    bodyLarge: '1.125rem', // 18px
    heading2: '1.5rem',    // 24px
    heading1: '2rem',      // 32px
    display: '2.5rem',     // 40px
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

export const spacing = {
  xs: '0.25rem',    // 4px
  sm: '0.5rem',     // 8px
  md: '0.75rem',    // 12px
  base: '1rem',     // 16px
  lg: '1.5rem',     // 24px
  xl: '2rem',       // 32px
  '2xl': '3rem',    // 48px
  '3xl': '4rem',    // 64px
  '4xl': '6rem',    // 96px
} as const;

export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

export const zIndex = {
  base: 1,
  navigation: 10,
  dropdown: 20,
  modalBackdrop: 30,
  modalContent: 40,
  toast: 50,
  loadingOverlay: 60,
} as const;

export const borderRadius = {
  sm: '0.375rem',   // 6px
  base: '0.5rem',   // 8px
  md: '0.75rem',    // 12px
  lg: '1rem',       // 16px
  xl: '1.5rem',     // 24px
} as const;

export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
} as const;

export const transitions = {
  fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
  base: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: '500ms cubic-bezier(0.4, 0, 0.2, 1)',
} as const;

export const touchTarget = {
  min: '44px',
} as const;

/**
 * Utility functions for working with design tokens
 */
export const designTokens = {
  colors,
  typography,
  spacing,
  breakpoints,
  zIndex,
  borderRadius,
  shadows,
  transitions,
  touchTarget,
};

/**
 * Media query helpers
 */
export const mediaQueries = {
  mobile: `(max-width: ${breakpoints.sm - 1}px)`,
  tablet: `(min-width: ${breakpoints.sm}px) and (max-width: ${breakpoints.lg - 1}px)`,
  desktop: `(min-width: ${breakpoints.lg}px)`,
  sm: `(min-width: ${breakpoints.sm}px)`,
  md: `(min-width: ${breakpoints.md}px)`,
  lg: `(min-width: ${breakpoints.lg}px)`,
  xl: `(min-width: ${breakpoints.xl}px)`,
  '2xl': `(min-width: ${breakpoints['2xl']}px)`,
} as const;

/**
 * CSS custom property names for use in styled components
 */
export const cssVars = {
  colors: {
    primary: {
      50: '--color-primary-50',
      100: '--color-primary-100',
      200: '--color-primary-200',
      300: '--color-primary-300',
      400: '--color-primary-400',
      500: '--color-primary-500',
      600: '--color-primary-600',
      700: '--color-primary-700',
      800: '--color-primary-800',
      900: '--color-primary-900',
    },
    background: {
      primary: '--color-background-primary',
      secondary: '--color-background-secondary',
      tertiary: '--color-background-tertiary',
      card: '--color-background-card',
    },
    text: {
      primary: '--color-text-primary',
      secondary: '--color-text-secondary',
      tertiary: '--color-text-tertiary',
    },
  },
  spacing: {
    xs: '--spacing-xs',
    sm: '--spacing-sm',
    md: '--spacing-md',
    base: '--spacing-base',
    lg: '--spacing-lg',
    xl: '--spacing-xl',
    '2xl': '--spacing-2xl',
    '3xl': '--spacing-3xl',
    '4xl': '--spacing-4xl',
  },
  zIndex: {
    base: '--z-base',
    navigation: '--z-navigation',
    dropdown: '--z-dropdown',
    modalBackdrop: '--z-modal-backdrop',
    modalContent: '--z-modal-content',
    toast: '--z-toast',
    loadingOverlay: '--z-loading-overlay',
  },
} as const;

export default designTokens;