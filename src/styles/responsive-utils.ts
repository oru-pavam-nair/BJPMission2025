/**
 * Responsive Design Utilities
 * Helper functions and hooks for responsive design
 */

import { breakpoints, mediaQueries } from './design-tokens';

/**
 * Check if current screen size matches a breakpoint
 */
export const useBreakpoint = () => {
  const getBreakpoint = (): keyof typeof breakpoints | 'mobile' => {
    if (typeof window === 'undefined') return 'lg'; // SSR fallback
    
    const width = window.innerWidth;
    
    if (width < breakpoints.sm) return 'mobile';
    if (width < breakpoints.md) return 'sm';
    if (width < breakpoints.lg) return 'md';
    if (width < breakpoints.xl) return 'lg';
    if (width < breakpoints['2xl']) return 'xl';
    return '2xl';
  };

  return {
    current: getBreakpoint(),
    isMobile: getBreakpoint() === 'mobile',
    isTablet: ['sm', 'md'].includes(getBreakpoint()),
    isDesktop: ['lg', 'xl', '2xl'].includes(getBreakpoint()),
  };
};

/**
 * Grid system utilities
 */
export const gridSystem = {
  mobile: {
    columns: 4,
    gutter: '1rem',
    margin: '1rem',
  },
  tablet: {
    columns: 8,
    gutter: '1.5rem',
    margin: '1.5rem',
  },
  desktop: {
    columns: 12,
    gutter: '2rem',
    margin: '2rem',
  },
} as const;

/**
 * Container max-widths for different breakpoints
 */
export const containerSizes = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1400px',
} as const;

/**
 * Responsive spacing scale
 */
export const responsiveSpacing = {
  mobile: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '0.75rem',
    base: '1rem',
    lg: '1.25rem',
    xl: '1.5rem',
    '2xl': '2rem',
  },
  tablet: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '0.75rem',
    base: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
  },
  desktop: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '0.75rem',
    base: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
  },
} as const;

/**
 * Responsive typography scale
 */
export const responsiveTypography = {
  mobile: {
    display: '2rem',      // 32px
    heading1: '1.75rem',  // 28px
    heading2: '1.25rem',  // 20px
    bodyLarge: '1rem',    // 16px
    body: '0.875rem',     // 14px
    small: '0.75rem',     // 12px
    caption: '0.625rem',  // 10px
  },
  tablet: {
    display: '2.25rem',   // 36px
    heading1: '1.875rem', // 30px
    heading2: '1.375rem', // 22px
    bodyLarge: '1.125rem', // 18px
    body: '1rem',         // 16px
    small: '0.875rem',    // 14px
    caption: '0.75rem',   // 12px
  },
  desktop: {
    display: '2.5rem',    // 40px
    heading1: '2rem',     // 32px
    heading2: '1.5rem',   // 24px
    bodyLarge: '1.125rem', // 18px
    body: '1rem',         // 16px
    small: '0.875rem',    // 14px
    caption: '0.75rem',   // 12px
  },
} as const;

/**
 * Touch target sizes for different devices
 */
export const touchTargets = {
  mobile: '48px',   // Larger for touch
  tablet: '44px',   // Standard
  desktop: '40px',  // Smaller for mouse
} as const;

/**
 * Z-index management for layered components
 */
export const zIndexLayers = {
  base: 1,
  content: 10,
  navigation: 100,
  dropdown: 200,
  overlay: 300,
  modal: 400,
  popover: 500,
  tooltip: 600,
  toast: 700,
  loading: 800,
} as const;

/**
 * Animation durations for different screen sizes
 */
export const animationDurations = {
  mobile: {
    fast: '100ms',
    base: '200ms',
    slow: '300ms',
  },
  tablet: {
    fast: '150ms',
    base: '250ms',
    slow: '400ms',
  },
  desktop: {
    fast: '150ms',
    base: '300ms',
    slow: '500ms',
  },
} as const;

/**
 * Utility classes for responsive design
 */
export const responsiveClasses = {
  container: 'ds-container',
  grid: 'ds-grid',
  mobileOnly: 'ds-mobile-only',
  mobileHidden: 'ds-mobile-hidden',
  tabletOnly: 'ds-tablet-only',
  desktopOnly: 'ds-desktop-only',
  touchTarget: 'ds-touch-target',
} as const;

/**
 * CSS-in-JS helpers for responsive styles
 */
export const responsive = {
  mobile: (styles: string) => `@media ${mediaQueries.mobile} { ${styles} }`,
  tablet: (styles: string) => `@media ${mediaQueries.tablet} { ${styles} }`,
  desktop: (styles: string) => `@media ${mediaQueries.desktop} { ${styles} }`,
  sm: (styles: string) => `@media ${mediaQueries.sm} { ${styles} }`,
  md: (styles: string) => `@media ${mediaQueries.md} { ${styles} }`,
  lg: (styles: string) => `@media ${mediaQueries.lg} { ${styles} }`,
  xl: (styles: string) => `@media ${mediaQueries.xl} { ${styles} }`,
  '2xl': (styles: string) => `@media ${mediaQueries['2xl']} { ${styles} }`,
} as const;

/**
 * Viewport detection utilities
 */
export const viewport = {
  isMobile: () => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < breakpoints.sm;
  },
  isTablet: () => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth >= breakpoints.sm && window.innerWidth < breakpoints.lg;
  },
  isDesktop: () => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth >= breakpoints.lg;
  },
  getWidth: () => {
    if (typeof window === 'undefined') return 1024; // SSR fallback
    return window.innerWidth;
  },
  getHeight: () => {
    if (typeof window === 'undefined') return 768; // SSR fallback
    return window.innerHeight;
  },
} as const;

export default {
  useBreakpoint,
  gridSystem,
  containerSizes,
  responsiveSpacing,
  responsiveTypography,
  touchTargets,
  zIndexLayers,
  animationDurations,
  responsiveClasses,
  responsive,
  viewport,
};