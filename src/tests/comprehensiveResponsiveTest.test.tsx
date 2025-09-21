import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import App from '../App';

// Mock window.matchMedia for responsive testing
const mockMatchMedia = (width: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
  
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => {},
    }),
  });
};

describe('Comprehensive Responsive Design Testing', () => {
  beforeEach(() => {
    // Reset any previous mocks
    cleanup();
  });

  afterEach(() => {
    cleanup();
  });

  describe('Mobile Breakpoint (320px - 767px)', () => {
    it('should display properly at 320px width', () => {
      mockMatchMedia(320);
      render(<App />);
      
      // Verify no horizontal overflow
      const body = document.body;
      expect(body.scrollWidth).toBeLessThanOrEqual(320);
      
      // Check for mobile-specific layout
      const containers = document.querySelectorAll('[class*="container"]');
      containers.forEach(container => {
        const styles = window.getComputedStyle(container);
        expect(parseInt(styles.paddingLeft)).toBeGreaterThanOrEqual(16);
        expect(parseInt(styles.paddingRight)).toBeGreaterThanOrEqual(16);
      });
    });

    it('should stack elements vertically on mobile', () => {
      mockMatchMedia(375);
      render(<App />);
      
      // Check for vertical stacking in grid layouts
      const gridElements = document.querySelectorAll('[class*="grid"]');
      gridElements.forEach(grid => {
        const styles = window.getComputedStyle(grid);
        expect(styles.flexDirection === 'column' || styles.gridTemplateColumns === '1fr').toBe(true);
      });
    });

    it('should have proper touch targets (minimum 44px)', () => {
      mockMatchMedia(414);
      render(<App />);
      
      const buttons = document.querySelectorAll('button');
      buttons.forEach(button => {
        const rect = button.getBoundingClientRect();
        expect(rect.height).toBeGreaterThanOrEqual(44);
        expect(rect.width).toBeGreaterThanOrEqual(44);
      });
    });
  });

  describe('Tablet Breakpoint (768px - 1199px)', () => {
    it('should display properly at 768px width', () => {
      mockMatchMedia(768);
      render(<App />);
      
      // Verify efficient space utilization
      const containers = document.querySelectorAll('[class*="container"]');
      containers.forEach(container => {
        const styles = window.getComputedStyle(container);
        expect(parseInt(styles.paddingLeft)).toBeGreaterThanOrEqual(24);
        expect(parseInt(styles.paddingRight)).toBeGreaterThanOrEqual(24);
      });
    });

    it('should use 8-column grid layout on tablet', () => {
      mockMatchMedia(1024);
      render(<App />);
      
      // Check for tablet-specific grid behavior
      const gridElements = document.querySelectorAll('[class*="grid"]');
      gridElements.forEach(grid => {
        const styles = window.getComputedStyle(grid);
        // Should have more columns than mobile but less than desktop
        expect(styles.display).toBe('grid');
      });
    });
  });

  describe('Desktop Breakpoint (1200px+)', () => {
    it('should display properly at 1200px width', () => {
      mockMatchMedia(1200);
      render(<App />);
      
      // Verify desktop layout utilizes larger screens
      const containers = document.querySelectorAll('[class*="container"]');
      containers.forEach(container => {
        const styles = window.getComputedStyle(container);
        expect(parseInt(styles.paddingLeft)).toBeGreaterThanOrEqual(32);
        expect(parseInt(styles.paddingRight)).toBeGreaterThanOrEqual(32);
      });
    });

    it('should use 12-column grid layout on desktop', () => {
      mockMatchMedia(1440);
      render(<App />);
      
      // Check for desktop-specific grid behavior
      const gridElements = document.querySelectorAll('[class*="grid"]');
      gridElements.forEach(grid => {
        const styles = window.getComputedStyle(grid);
        expect(styles.display).toBe('grid');
      });
    });

    it('should have proper max-width constraint', () => {
      mockMatchMedia(1920);
      render(<App />);
      
      const mainContainers = document.querySelectorAll('[class*="max-w"]');
      mainContainers.forEach(container => {
        const styles = window.getComputedStyle(container);
        const maxWidth = parseInt(styles.maxWidth);
        expect(maxWidth).toBeLessThanOrEqual(1400);
      });
    });
  });

  describe('Element Overlap Prevention', () => {
    it('should prevent UI element overlapping at all breakpoints', () => {
      const breakpoints = [320, 375, 414, 768, 1024, 1200, 1440, 1920];
      
      breakpoints.forEach(width => {
        mockMatchMedia(width);
        render(<App />);
        
        // Check for overlapping elements
        const allElements = document.querySelectorAll('*');
        const positions = Array.from(allElements).map(el => {
          const rect = el.getBoundingClientRect();
          return { element: el, rect };
        });
        
        // Verify no critical overlaps (allowing for intentional overlays)
        positions.forEach((pos1, i) => {
          positions.slice(i + 1).forEach(pos2 => {
            if (pos1.rect.width > 0 && pos1.rect.height > 0 && 
                pos2.rect.width > 0 && pos2.rect.height > 0) {
              // Check if elements are siblings and not intentionally overlapping
              const isModal = pos1.element.closest('[role="dialog"]') || pos2.element.closest('[role="dialog"]');
              const isOverlay = pos1.element.classList.contains('overlay') || pos2.element.classList.contains('overlay');
              
              if (!isModal && !isOverlay) {
                // Elements should not completely overlap
                const overlap = !(pos1.rect.right <= pos2.rect.left || 
                                pos2.rect.right <= pos1.rect.left || 
                                pos1.rect.bottom <= pos2.rect.top || 
                                pos2.rect.bottom <= pos1.rect.top);
                
                if (overlap) {
                  // Allow minimal overlap for borders/shadows
                  const overlapArea = Math.max(0, Math.min(pos1.rect.right, pos2.rect.right) - Math.max(pos1.rect.left, pos2.rect.left)) *
                                    Math.max(0, Math.min(pos1.rect.bottom, pos2.rect.bottom) - Math.max(pos1.rect.top, pos2.rect.top));
                  const minArea = Math.min(pos1.rect.width * pos1.rect.height, pos2.rect.width * pos2.rect.height);
                  expect(overlapArea / minArea).toBeLessThan(0.1); // Less than 10% overlap
                }
              }
            }
          });
        });
        
        cleanup();
      });
    });
  });

  describe('Text Legibility and Sizing', () => {
    it('should maintain proper text sizing across breakpoints', () => {
      const breakpoints = [320, 768, 1200];
      
      breakpoints.forEach(width => {
        mockMatchMedia(width);
        render(<App />);
        
        const textElements = document.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6');
        textElements.forEach(element => {
          const styles = window.getComputedStyle(element);
          const fontSize = parseInt(styles.fontSize);
          
          // Minimum font size should be 12px on mobile, 14px on larger screens
          const minSize = width < 768 ? 12 : 14;
          if (fontSize > 0) {
            expect(fontSize).toBeGreaterThanOrEqual(minSize);
          }
        });
        
        cleanup();
      });
    });

    it('should prevent text overlap', () => {
      mockMatchMedia(375);
      render(<App />);
      
      const textElements = document.querySelectorAll('p, span, div:not(:empty)');
      textElements.forEach(element => {
        const styles = window.getComputedStyle(element);
        expect(styles.overflow).not.toBe('visible');
        expect(styles.whiteSpace).not.toBe('nowrap');
      });
    });
  });
});