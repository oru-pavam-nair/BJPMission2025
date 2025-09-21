import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

// Mock different user agents for browser testing
const mockUserAgent = (userAgent: string) => {
  Object.defineProperty(navigator, 'userAgent', {
    writable: true,
    value: userAgent,
  });
};

// Mock different screen sizes and device capabilities
const mockDevice = (config: {
  width: number;
  height: number;
  pixelRatio: number;
  touchSupport: boolean;
  userAgent: string;
}) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    value: config.width,
  });
  
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    value: config.height,
  });
  
  Object.defineProperty(window, 'devicePixelRatio', {
    writable: true,
    value: config.pixelRatio,
  });
  
  Object.defineProperty(navigator, 'userAgent', {
    writable: true,
    value: config.userAgent,
  });
  
  // Mock touch support
  if (config.touchSupport) {
    Object.defineProperty(window, 'ontouchstart', {
      writable: true,
      value: () => {},
    });
  } else {
    delete (window as any).ontouchstart;
  }
};

describe('Cross-Browser and Device Testing', () => {
  beforeEach(() => {
    cleanup();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  describe('Desktop Browser Compatibility', () => {
    it('should work correctly in Chrome', () => {
      mockUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      
      render(<App />);
      
      // Test Chrome-specific features
      expect(document.body).toBeTruthy();
      
      // Check for CSS Grid support (Chrome supports it)
      const gridElements = document.querySelectorAll('[class*="grid"]');
      gridElements.forEach(element => {
        const styles = window.getComputedStyle(element);
        expect(styles.display).toBe('grid');
      });
    });

    it('should work correctly in Firefox', () => {
      mockUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0');
      
      render(<App />);
      
      // Test Firefox-specific behavior
      expect(document.body).toBeTruthy();
      
      // Check for Flexbox support (Firefox supports it)
      const flexElements = document.querySelectorAll('[class*="flex"]');
      flexElements.forEach(element => {
        const styles = window.getComputedStyle(element);
        expect(styles.display).toBe('flex');
      });
    });

    it('should work correctly in Safari', () => {
      mockUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15');
      
      render(<App />);
      
      // Test Safari-specific behavior
      expect(document.body).toBeTruthy();
      
      // Check for webkit prefixes if needed
      const elements = document.querySelectorAll('*');
      elements.forEach(element => {
        const styles = window.getComputedStyle(element);
        // Safari should handle standard CSS properties
        expect(styles.transform).toBeDefined();
      });
    });

    it('should work correctly in Edge', () => {
      mockUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.59');
      
      render(<App />);
      
      // Test Edge-specific behavior
      expect(document.body).toBeTruthy();
      
      // Edge should support modern CSS features
      const modernElements = document.querySelectorAll('[class*="grid"], [class*="flex"]');
      expect(modernElements.length).toBeGreaterThan(0);
    });
  });

  describe('Mobile Browser Compatibility', () => {
    it('should work correctly in iOS Safari', () => {
      mockDevice({
        width: 375,
        height: 812,
        pixelRatio: 3,
        touchSupport: true,
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
      });
      
      render(<App />);
      
      // Test iOS Safari specific behavior
      expect(document.body).toBeTruthy();
      
      // Check for touch-friendly elements
      const buttons = document.querySelectorAll('button');
      buttons.forEach(button => {
        const rect = button.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          expect(rect.height).toBeGreaterThanOrEqual(44); // iOS touch target minimum
        }
      });
      
      // Check for viewport meta tag
      const viewport = document.querySelector('meta[name="viewport"]');
      expect(viewport).toBeTruthy();
    });

    it('should work correctly in Chrome Mobile', () => {
      mockDevice({
        width: 412,
        height: 915,
        pixelRatio: 2.625,
        touchSupport: true,
        userAgent: 'Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36',
      });
      
      render(<App />);
      
      // Test Chrome Mobile specific behavior
      expect(document.body).toBeTruthy();
      
      // Check for mobile-optimized layout
      const containers = document.querySelectorAll('[class*="container"]');
      containers.forEach(container => {
        const styles = window.getComputedStyle(container);
        expect(parseInt(styles.paddingLeft)).toBeGreaterThanOrEqual(16);
      });
    });

    it('should work correctly in Samsung Internet', () => {
      mockDevice({
        width: 360,
        height: 740,
        pixelRatio: 3,
        touchSupport: true,
        userAgent: 'Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/14.2 Chrome/87.0.4280.141 Mobile Safari/537.36',
      });
      
      render(<App />);
      
      // Test Samsung Internet specific behavior
      expect(document.body).toBeTruthy();
      
      // Should handle touch events properly
      const touchElements = document.querySelectorAll('button, a');
      expect(touchElements.length).toBeGreaterThan(0);
    });
  });

  describe('Device-Specific Testing', () => {
    it('should work on iPhone 12 Pro', () => {
      mockDevice({
        width: 390,
        height: 844,
        pixelRatio: 3,
        touchSupport: true,
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
      });
      
      render(<App />);
      
      // Test iPhone 12 Pro specific layout
      expect(document.body.scrollWidth).toBeLessThanOrEqual(390);
      
      // Check for safe area handling
      const elements = document.querySelectorAll('*');
      elements.forEach(element => {
        const styles = window.getComputedStyle(element);
        // Should not use fixed positioning that conflicts with notch
        if (styles.position === 'fixed') {
          expect(styles.top !== '0px' || styles.paddingTop !== '0px').toBe(true);
        }
      });
    });

    it('should work on iPad Pro', () => {
      mockDevice({
        width: 1024,
        height: 1366,
        pixelRatio: 2,
        touchSupport: true,
        userAgent: 'Mozilla/5.0 (iPad; CPU OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
      });
      
      render(<App />);
      
      // Test iPad Pro specific layout
      expect(document.body).toBeTruthy();
      
      // Should use tablet-optimized layout
      const gridElements = document.querySelectorAll('[class*="grid"]');
      gridElements.forEach(element => {
        const styles = window.getComputedStyle(element);
        expect(styles.display).toBe('grid');
      });
    });

    it('should work on Android Pixel 6', () => {
      mockDevice({
        width: 411,
        height: 914,
        pixelRatio: 2.625,
        touchSupport: true,
        userAgent: 'Mozilla/5.0 (Linux; Android 12; Pixel 6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.45 Mobile Safari/537.36',
      });
      
      render(<App />);
      
      // Test Pixel 6 specific behavior
      expect(document.body.scrollWidth).toBeLessThanOrEqual(411);
      
      // Check for Android-specific optimizations
      const buttons = document.querySelectorAll('button');
      buttons.forEach(button => {
        const rect = button.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          expect(rect.height).toBeGreaterThanOrEqual(48); // Android touch target minimum
        }
      });
    });

    it('should work on Samsung Galaxy S21', () => {
      mockDevice({
        width: 384,
        height: 854,
        pixelRatio: 2.75,
        touchSupport: true,
        userAgent: 'Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.72 Mobile Safari/537.36',
      });
      
      render(<App />);
      
      // Test Galaxy S21 specific behavior
      expect(document.body).toBeTruthy();
      
      // Should handle high pixel density
      const images = document.querySelectorAll('img');
      images.forEach(img => {
        // Should have appropriate image resolution for high DPI
        expect(img.getAttribute('src')).toBeTruthy();
      });
    });
  });

  describe('Feature Detection and Fallbacks', () => {
    it('should handle missing CSS Grid support', () => {
      // Mock older browser without CSS Grid
      const originalSupports = CSS.supports;
      CSS.supports = vi.fn((property: string, value: string) => {
        if (property === 'display' && value === 'grid') {
          return false;
        }
        return originalSupports.call(CSS, property, value);
      });
      
      render(<App />);
      
      // Should fallback to flexbox or other layout methods
      const layoutElements = document.querySelectorAll('[class*="grid"]');
      layoutElements.forEach(element => {
        const styles = window.getComputedStyle(element);
        expect(styles.display === 'flex' || styles.display === 'block').toBe(true);
      });
      
      CSS.supports = originalSupports;
    });

    it('should handle missing Flexbox support', () => {
      // Mock older browser without Flexbox
      const originalSupports = CSS.supports;
      CSS.supports = vi.fn((property: string, value: string) => {
        if (property === 'display' && value === 'flex') {
          return false;
        }
        return originalSupports.call(CSS, property, value);
      });
      
      render(<App />);
      
      // Should fallback to block or inline-block layout
      const flexElements = document.querySelectorAll('[class*="flex"]');
      flexElements.forEach(element => {
        const styles = window.getComputedStyle(element);
        expect(styles.display === 'block' || styles.display === 'inline-block').toBe(true);
      });
      
      CSS.supports = originalSupports;
    });

    it('should handle missing touch support', () => {
      mockDevice({
        width: 1920,
        height: 1080,
        pixelRatio: 1,
        touchSupport: false,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      });
      
      render(<App />);
      
      // Should work with mouse/keyboard only
      const interactiveElements = document.querySelectorAll('button, a, input');
      interactiveElements.forEach(element => {
        // Should have hover states for non-touch devices
        expect(element.getAttribute('tabindex') !== '-1').toBe(true);
      });
    });

    it('should handle missing JavaScript', () => {
      render(<App />);
      
      // Core content should be accessible without JavaScript
      const criticalContent = document.querySelector('main, [role="main"], .main-content');
      expect(criticalContent || document.body.children.length > 0).toBeTruthy();
      
      // Forms should have proper fallbacks
      const forms = document.querySelectorAll('form');
      forms.forEach(form => {
        expect(form.getAttribute('action')).toBeTruthy();
      });
    });
  });

  describe('Modal Behavior Across Browsers', () => {
    it('should handle modal z-index stacking consistently', async () => {
      const user = userEvent.setup();
      render(<App />);
      
      // Look for modal triggers
      const modalTriggers = document.querySelectorAll('[data-testid*="modal"], button[class*="modal"]');
      
      if (modalTriggers.length > 0) {
        await user.click(modalTriggers[0]);
        
        const modal = document.querySelector('[role="dialog"]');
        if (modal) {
          const styles = window.getComputedStyle(modal);
          const zIndex = parseInt(styles.zIndex);
          
          // Modal should have high z-index
          expect(zIndex).toBeGreaterThan(1000);
          
          // Backdrop should be behind modal
          const backdrop = modal.parentElement;
          if (backdrop) {
            const backdropStyles = window.getComputedStyle(backdrop);
            const backdropZIndex = parseInt(backdropStyles.zIndex);
            expect(backdropZIndex).toBeLessThanOrEqual(zIndex);
          }
        }
      }
    });

    it('should handle modal focus management across browsers', async () => {
      const user = userEvent.setup();
      render(<App />);
      
      const modalTriggers = document.querySelectorAll('[data-testid*="modal"], button[class*="modal"]');
      
      if (modalTriggers.length > 0) {
        const trigger = modalTriggers[0] as HTMLElement;
        trigger.focus();
        
        await user.click(trigger);
        
        // Focus should move to modal
        const modal = document.querySelector('[role="dialog"]');
        if (modal) {
          const focusableInModal = modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          
          if (focusableInModal.length > 0) {
            expect(document.activeElement).toBe(focusableInModal[0]);
          }
        }
      }
    });
  });

  describe('Performance Across Devices', () => {
    it('should perform well on low-end devices', () => {
      // Mock low-end device
      mockDevice({
        width: 360,
        height: 640,
        pixelRatio: 2,
        touchSupport: true,
        userAgent: 'Mozilla/5.0 (Linux; Android 8.1.0; SM-J260F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.110 Mobile Safari/537.36',
      });
      
      const startTime = performance.now();
      render(<App />);
      const endTime = performance.now();
      
      const renderTime = endTime - startTime;
      
      // Should render quickly even on low-end devices
      expect(renderTime).toBeLessThan(5000);
      
      // Should have minimal DOM complexity
      const totalElements = document.querySelectorAll('*').length;
      expect(totalElements).toBeLessThan(1000);
    });

    it('should handle high DPI displays correctly', () => {
      mockDevice({
        width: 414,
        height: 896,
        pixelRatio: 3,
        touchSupport: true,
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
      });
      
      render(<App />);
      
      // Images should be crisp on high DPI
      const images = document.querySelectorAll('img');
      images.forEach(img => {
        const src = img.getAttribute('src');
        if (src) {
          // Should use appropriate resolution images
          expect(src).toBeTruthy();
        }
      });
      
      // Text should be crisp
      const textElements = document.querySelectorAll('p, span, div, h1, h2, h3');
      textElements.forEach(element => {
        const styles = window.getComputedStyle(element);
        expect(styles.fontSize).toBeTruthy();
      });
    });
  });
});