/**
 * Accessibility Utilities
 * Helper functions and utilities for managing accessibility features
 */

import { useEffect, useRef, useCallback } from 'react';

/**
 * Focus management utilities
 */
export class FocusManager {
  private static focusableSelectors = [
    'button:not([disabled])',
    '[href]',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]'
  ].join(', ');

  /**
   * Get all focusable elements within a container
   */
  static getFocusableElements(container: HTMLElement): HTMLElement[] {
    return Array.from(container.querySelectorAll(this.focusableSelectors));
  }

  /**
   * Get the first focusable element in a container
   */
  static getFirstFocusable(container: HTMLElement): HTMLElement | null {
    const focusable = this.getFocusableElements(container);
    return focusable.length > 0 ? focusable[0] : null;
  }

  /**
   * Get the last focusable element in a container
   */
  static getLastFocusable(container: HTMLElement): HTMLElement | null {
    const focusable = this.getFocusableElements(container);
    return focusable.length > 0 ? focusable[focusable.length - 1] : null;
  }

  /**
   * Trap focus within a container
   */
  static trapFocus(container: HTMLElement, event: KeyboardEvent): void {
    if (event.key !== 'Tab') return;

    const focusableElements = this.getFocusableElements(container);
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  }
}

/**
 * Hook for managing focus trap in modals and dialogs
 */
export function useFocusTrap(isActive: boolean) {
  const containerRef = useRef<HTMLElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isActive || !containerRef.current) return;
    FocusManager.trapFocus(containerRef.current, event);
  }, [isActive]);

  useEffect(() => {
    if (isActive) {
      // Store the currently focused element
      previousFocusRef.current = document.activeElement as HTMLElement;
      
      // Focus the container or first focusable element
      if (containerRef.current) {
        const firstFocusable = FocusManager.getFirstFocusable(containerRef.current);
        if (firstFocusable) {
          firstFocusable.focus();
        } else {
          containerRef.current.focus();
        }
      }

      // Add event listener for focus trapping
      document.addEventListener('keydown', handleKeyDown);
    } else {
      // Restore focus to previously focused element
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isActive, handleKeyDown]);

  return containerRef;
}

/**
 * Hook for managing keyboard navigation
 */
export function useKeyboardNavigation() {
  const isKeyboardUser = useRef(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        isKeyboardUser.current = true;
        document.body.classList.add('ds-keyboard-nav-active');
      }
    };

    const handleMouseDown = () => {
      isKeyboardUser.current = false;
      document.body.classList.remove('ds-keyboard-nav-active');
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  return isKeyboardUser;
}

/**
 * ARIA live region utilities
 */
export class AriaLiveRegion {
  private static regions: Map<string, HTMLElement> = new Map();

  /**
   * Create or get an ARIA live region
   */
  static getRegion(id: string, politeness: 'polite' | 'assertive' = 'polite'): HTMLElement {
    if (this.regions.has(id)) {
      return this.regions.get(id)!;
    }

    const region = document.createElement('div');
    region.id = id;
    region.setAttribute('aria-live', politeness);
    region.setAttribute('aria-atomic', 'true');
    region.className = `ds-live-region ds-live-region-${politeness}`;
    
    document.body.appendChild(region);
    this.regions.set(id, region);
    
    return region;
  }

  /**
   * Announce a message to screen readers
   */
  static announce(message: string, politeness: 'polite' | 'assertive' = 'polite'): void {
    const region = this.getRegion('aria-live-announcements', politeness);
    region.textContent = message;
    
    // Clear the message after a short delay to allow for re-announcements
    setTimeout(() => {
      region.textContent = '';
    }, 1000);
  }

  /**
   * Update a status message
   */
  static updateStatus(message: string): void {
    const region = this.getRegion('aria-live-status', 'polite');
    region.textContent = message;
  }

  /**
   * Announce an error
   */
  static announceError(message: string): void {
    this.announce(`Error: ${message}`, 'assertive');
  }

  /**
   * Announce success
   */
  static announceSuccess(message: string): void {
    this.announce(`Success: ${message}`, 'polite');
  }
}

/**
 * Hook for managing ARIA live announcements
 */
export function useAriaLive() {
  const announce = useCallback((message: string, politeness: 'polite' | 'assertive' = 'polite') => {
    AriaLiveRegion.announce(message, politeness);
  }, []);

  const announceError = useCallback((message: string) => {
    AriaLiveRegion.announceError(message);
  }, []);

  const announceSuccess = useCallback((message: string) => {
    AriaLiveRegion.announceSuccess(message);
  }, []);

  const updateStatus = useCallback((message: string) => {
    AriaLiveRegion.updateStatus(message);
  }, []);

  return {
    announce,
    announceError,
    announceSuccess,
    updateStatus
  };
}

/**
 * Color contrast utilities for WCAG compliance
 */
export class ColorContrast {
  /**
   * Calculate relative luminance of a color
   */
  static getRelativeLuminance(r: number, g: number, b: number): number {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  }

  /**
   * Calculate contrast ratio between two colors
   */
  static getContrastRatio(color1: [number, number, number], color2: [number, number, number]): number {
    const l1 = this.getRelativeLuminance(...color1);
    const l2 = this.getRelativeLuminance(...color2);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  }

  /**
   * Check if color combination meets WCAG AA standards (4.5:1)
   */
  static meetsWCAG_AA(foreground: [number, number, number], background: [number, number, number]): boolean {
    return this.getContrastRatio(foreground, background) >= 4.5;
  }

  /**
   * Check if color combination meets WCAG AAA standards (7:1)
   */
  static meetsWCAG_AAA(foreground: [number, number, number], background: [number, number, number]): boolean {
    return this.getContrastRatio(foreground, background) >= 7;
  }
}

/**
 * Screen reader utilities
 */
export class ScreenReader {
  /**
   * Check if screen reader is likely being used
   */
  static isLikelyActive(): boolean {
    // Check for common screen reader indicators
    return (
      window.navigator.userAgent.includes('NVDA') ||
      window.navigator.userAgent.includes('JAWS') ||
      window.speechSynthesis?.speaking ||
      document.body.classList.contains('screen-reader-active')
    );
  }

  /**
   * Create descriptive text for complex UI elements
   */
  static createDescription(element: {
    type: string;
    label?: string;
    value?: string;
    state?: string;
    position?: { current: number; total: number };
  }): string {
    let description = element.type;
    
    if (element.label) {
      description += `, ${element.label}`;
    }
    
    if (element.value) {
      description += `, ${element.value}`;
    }
    
    if (element.state) {
      description += `, ${element.state}`;
    }
    
    if (element.position) {
      description += `, ${element.position.current} of ${element.position.total}`;
    }
    
    return description;
  }
}

/**
 * Reduced motion utilities
 */
export class ReducedMotion {
  /**
   * Check if user prefers reduced motion
   */
  static prefersReducedMotion(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /**
   * Apply reduced motion styles conditionally
   */
  static applyReducedMotion(): void {
    if (this.prefersReducedMotion()) {
      document.body.classList.add('ds-reduced-motion');
    }
  }
}

/**
 * Touch target utilities
 */
export class TouchTarget {
  private static readonly MIN_SIZE = 44; // 44px minimum touch target

  /**
   * Check if element meets minimum touch target size
   */
  static meetsMinimumSize(element: HTMLElement): boolean {
    const rect = element.getBoundingClientRect();
    return rect.width >= this.MIN_SIZE && rect.height >= this.MIN_SIZE;
  }

  /**
   * Ensure element meets minimum touch target requirements
   */
  static ensureMinimumSize(element: HTMLElement): void {
    if (!this.meetsMinimumSize(element)) {
      element.style.minWidth = `${this.MIN_SIZE}px`;
      element.style.minHeight = `${this.MIN_SIZE}px`;
      element.classList.add('ds-touch-target');
    }
  }
}

/**
 * Hook for managing accessibility announcements in components
 */
export function useAccessibilityAnnouncements() {
  const { announce, announceError, announceSuccess } = useAriaLive();

  const announceModalOpen = useCallback((title: string) => {
    announce(`Dialog opened: ${title}`);
  }, [announce]);

  const announceModalClose = useCallback(() => {
    announce('Dialog closed');
  }, [announce]);

  const announceTableSort = useCallback((column: string, direction: 'ascending' | 'descending') => {
    announce(`Table sorted by ${column}, ${direction}`);
  }, [announce]);

  const announcePageChange = useCallback((page: number, total: number) => {
    announce(`Page ${page} of ${total}`);
  }, [announce]);

  const announceLoadingStart = useCallback((context: string) => {
    announce(`Loading ${context}`);
  }, [announce]);

  const announceLoadingComplete = useCallback((context: string) => {
    announce(`${context} loaded`);
  }, [announce]);

  return {
    announce,
    announceError,
    announceSuccess,
    announceModalOpen,
    announceModalClose,
    announceTableSort,
    announcePageChange,
    announceLoadingStart,
    announceLoadingComplete
  };
}

/**
 * Initialize accessibility features
 */
export function initializeAccessibility(): void {
  // Apply reduced motion preferences
  ReducedMotion.applyReducedMotion();

  // Create ARIA live regions
  AriaLiveRegion.getRegion('aria-live-announcements', 'polite');
  AriaLiveRegion.getRegion('aria-live-status', 'polite');
  AriaLiveRegion.getRegion('aria-live-errors', 'assertive');

  // Add skip link if not present
  if (!document.querySelector('.ds-skip-link')) {
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.className = 'ds-skip-link';
    skipLink.textContent = 'Skip to main content';
    document.body.insertBefore(skipLink, document.body.firstChild);
  }

  // Ensure main content has proper ID
  const mainContent = document.querySelector('main') || document.querySelector('#main-content');
  if (mainContent && !mainContent.id) {
    mainContent.id = 'main-content';
  }
}

export default {
  FocusManager,
  AriaLiveRegion,
  ColorContrast,
  ScreenReader,
  ReducedMotion,
  TouchTarget,
  useFocusTrap,
  useKeyboardNavigation,
  useAriaLive,
  useAccessibilityAnnouncements,
  initializeAccessibility
};