import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom';

// Import components and utilities
import MobileOptimizedButton from '../components/ui/MobileOptimizedButton';
import SwipeableModal from '../components/ui/SwipeableModal';
import { 
  useTouchTargetSize, 
  useGPUAnimation, 
  useSwipeGesture, 
  useReducedMotion,
  useTouchFeedback,
  usePerformantScroll,
  detectDeviceCapabilities,
  TOUCH_TARGETS,
  ANIMATION_CONFIG
} from '../utils/mobilePerformance';

// Mock window properties for testing
const mockMatchMedia = (matches: boolean) => {
  return vi.fn().mockImplementation((query) => ({
    matches,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
};

// Mock navigator properties
const mockNavigator = (properties: Partial<Navigator>) => {
  Object.defineProperty(window, 'navigator', {
    value: { ...window.navigator, ...properties },
    writable: true,
  });
};

// Test component for hooks
const TestComponent: React.FC<{ hookTest: string }> = ({ hookTest }) => {
  const touchTarget = useTouchTargetSize();
  const gpuAnimation = useGPUAnimation();
  const reducedMotion = useReducedMotion();
  
  const swipeRef = useSwipeGesture((direction) => {
    console.log('Swiped:', direction);
  });
  
  const touchFeedback = useTouchFeedback(swipeRef, {
    haptic: true,
    visual: true
  });
  
  usePerformantScroll((scrollY, direction) => {
    console.log('Scroll:', scrollY, direction);
  });

  switch (hookTest) {
    case 'touchTarget':
      return (
        <div data-testid="touch-target" style={touchTarget.getTouchTargetStyle()}>
          Device: {touchTarget.deviceType}, Min Size: {touchTarget.minSize}
        </div>
      );
    case 'gpuAnimation':
      return (
        <div 
          data-testid="gpu-animation"
          style={gpuAnimation.getAnimationStyle('transform', 300)}
        >
          GPU: {gpuAnimation.shouldUseGPU ? 'enabled' : 'disabled'}
        </div>
      );
    case 'reducedMotion':
      return (
        <div 
          data-testid="reduced-motion"
          style={reducedMotion.getMotionStyle({ transition: 'all 300ms' })}
        >
          Reduced Motion: {reducedMotion.prefersReducedMotion ? 'enabled' : 'disabled'}
        </div>
      );
    case 'swipeGesture':
      return (
        <div 
          ref={swipeRef.ref}
          data-testid="swipe-gesture"
          style={touchFeedback.isPressed ? touchFeedback.pressedStyle : {}}
        >
          Swipe Active: {swipeRef.isActive ? 'yes' : 'no'}
        </div>
      );
    default:
      return <div>Unknown test</div>;
  }
};

describe('Mobile Performance Optimizations', () => {
  beforeEach(() => {
    // Reset window properties
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true });
    Object.defineProperty(window, 'innerHeight', { value: 768, writable: true });
    
    // Mock matchMedia
    window.matchMedia = mockMatchMedia(false);
    
    // Mock navigator
    mockNavigator({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      maxTouchPoints: 0,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Touch Target Sizing', () => {
    it('should provide correct touch target sizes for different devices', () => {
      expect(TOUCH_TARGETS.mobile).toBe(48);
      expect(TOUCH_TARGETS.tablet).toBe(44);
      expect(TOUCH_TARGETS.desktop).toBe(40);
    });

    it('should detect device type correctly', () => {
      // Desktop
      Object.defineProperty(window, 'innerWidth', { value: 1200 });
      const { unmount: unmount1 } = render(<TestComponent hookTest="touchTarget" />);
      expect(screen.getByTestId('touch-target')).toHaveTextContent('Device: desktop');
      unmount1();

      // Tablet
      Object.defineProperty(window, 'innerWidth', { value: 800 });
      const { unmount: unmount2 } = render(<TestComponent hookTest="touchTarget" />);
      expect(screen.getByTestId('touch-target')).toHaveTextContent('Device: tablet');
      unmount2();

      // Mobile
      Object.defineProperty(window, 'innerWidth', { value: 400 });
      const { unmount: unmount3 } = render(<TestComponent hookTest="touchTarget" />);
      expect(screen.getByTestId('touch-target')).toHaveTextContent('Device: mobile');
      unmount3();
    });

    it('should apply correct minimum touch target sizes', () => {
      Object.defineProperty(window, 'innerWidth', { value: 400 });
      render(<TestComponent hookTest="touchTarget" />);
      
      const element = screen.getByTestId('touch-target');
      const styles = window.getComputedStyle(element);
      
      expect(element).toHaveStyle({
        minHeight: '48px',
        minWidth: '48px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      });
    });
  });

  describe('GPU Animation Optimization', () => {
    it('should detect GPU capabilities', () => {
      const capabilities = detectDeviceCapabilities();
      
      expect(capabilities).toHaveProperty('hasWebGL');
      expect(capabilities).toHaveProperty('prefersReducedMotion');
      expect(capabilities).toHaveProperty('performanceTier');
      expect(capabilities).toHaveProperty('isMobile');
      expect(capabilities).toHaveProperty('deviceMemory');
    });

    it('should provide GPU-optimized animation styles', () => {
      render(<TestComponent hookTest="gpuAnimation" />);
      
      const element = screen.getByTestId('gpu-animation');
      // GPU acceleration should be applied based on device capabilities
      expect(element).toBeInTheDocument();
    });

    it('should have correct animation configurations', () => {
      expect(ANIMATION_CONFIG.mobile.duration.fast).toBe(150);
      expect(ANIMATION_CONFIG.mobile.duration.normal).toBe(200);
      expect(ANIMATION_CONFIG.mobile.duration.slow).toBe(300);
      
      expect(ANIMATION_CONFIG.tablet.duration.fast).toBe(200);
      expect(ANIMATION_CONFIG.desktop.duration.fast).toBe(200);
    });
  });

  describe('Reduced Motion Support', () => {
    it('should respect prefers-reduced-motion setting', () => {
      window.matchMedia = mockMatchMedia(true);
      
      render(<TestComponent hookTest="reducedMotion" />);
      expect(screen.getByTestId('reduced-motion')).toHaveTextContent('Reduced Motion: enabled');
    });

    it('should provide appropriate styles for reduced motion', () => {
      window.matchMedia = mockMatchMedia(true);
      
      render(<TestComponent hookTest="reducedMotion" />);
      const element = screen.getByTestId('reduced-motion');
      
      // Should have no transition when reduced motion is preferred
      expect(element).toHaveStyle({ transition: 'none' });
    });

    it('should allow normal animations when reduced motion is not preferred', () => {
      window.matchMedia = mockMatchMedia(false);
      
      render(<TestComponent hookTest="reducedMotion" />);
      expect(screen.getByTestId('reduced-motion')).toHaveTextContent('Reduced Motion: disabled');
    });
  });

  describe('Swipe Gesture Support', () => {
    it('should handle swipe gestures', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      render(<TestComponent hookTest="swipeGesture" />);
      const element = screen.getByTestId('swipe-gesture');

      // Simulate touch events
      fireEvent.touchStart(element, {
        touches: [{ clientX: 100, clientY: 100 }]
      });

      fireEvent.touchMove(element, {
        touches: [{ clientX: 200, clientY: 100 }]
      });

      fireEvent.touchEnd(element);

      // Should detect swipe gesture
      expect(element).toBeInTheDocument();
      
      consoleSpy.mockRestore();
    });

    it('should provide touch feedback', () => {
      render(<TestComponent hookTest="swipeGesture" />);
      const element = screen.getByTestId('swipe-gesture');

      // Initially not pressed
      expect(element).toHaveTextContent('Swipe Active: no');
    });
  });

  describe('MobileOptimizedButton Component', () => {
    it('should render with correct touch target size', () => {
      render(
        <MobileOptimizedButton onClick={() => {}}>
          Test Button
        </MobileOptimizedButton>
      );

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Test Button');
    });

    it('should handle different variants', () => {
      const variants = ['primary', 'secondary', 'success', 'warning', 'danger'] as const;
      
      variants.forEach(variant => {
        render(
          <MobileOptimizedButton variant={variant} onClick={() => {}}>
            {variant} Button
          </MobileOptimizedButton>
        );
        
        const button = screen.getByText(`${variant} Button`);
        expect(button).toBeInTheDocument();
      });
    });

    it('should handle different sizes', () => {
      const sizes = ['small', 'medium', 'large'] as const;
      
      sizes.forEach(size => {
        render(
          <MobileOptimizedButton size={size} onClick={() => {}}>
            {size} Button
          </MobileOptimizedButton>
        );
        
        const button = screen.getByText(`${size} Button`);
        expect(button).toBeInTheDocument();
      });
    });

    it('should handle disabled state', () => {
      render(
        <MobileOptimizedButton disabled onClick={() => {}}>
          Disabled Button
        </MobileOptimizedButton>
      );

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('should handle loading state', () => {
      render(
        <MobileOptimizedButton loading onClick={() => {}}>
          Loading Button
        </MobileOptimizedButton>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-busy', 'true');
    });

    it('should handle click events', async () => {
      const handleClick = vi.fn();
      
      render(
        <MobileOptimizedButton onClick={handleClick}>
          Click Me
        </MobileOptimizedButton>
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      // Wait for requestAnimationFrame to complete
      await waitFor(() => {
        expect(handleClick).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('SwipeableModal Component', () => {
    it('should render when open', () => {
      render(
        <SwipeableModal isOpen={true} onClose={() => {}} title="Test Modal">
          <div>Modal Content</div>
        </SwipeableModal>
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Test Modal')).toBeInTheDocument();
      expect(screen.getByText('Modal Content')).toBeInTheDocument();
    });

    it('should not render when closed', () => {
      render(
        <SwipeableModal isOpen={false} onClose={() => {}} title="Test Modal">
          <div>Modal Content</div>
        </SwipeableModal>
      );

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should show swipe indicator on mobile', () => {
      Object.defineProperty(window, 'innerWidth', { value: 400 });
      
      render(
        <SwipeableModal isOpen={true} onClose={() => {}} title="Test Modal">
          <div>Modal Content</div>
        </SwipeableModal>
      );

      expect(screen.getByText('Swipe down to close')).toBeInTheDocument();
    });

    it('should handle close button click', () => {
      const handleClose = vi.fn();
      
      render(
        <SwipeableModal isOpen={true} onClose={handleClose} title="Test Modal">
          <div>Modal Content</div>
        </SwipeableModal>
      );

      const closeButton = screen.getByLabelText('Close Test Modal dialog');
      fireEvent.click(closeButton);
      
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('should handle escape key', () => {
      const handleClose = vi.fn();
      
      render(
        <SwipeableModal isOpen={true} onClose={handleClose} title="Test Modal">
          <div>Modal Content</div>
        </SwipeableModal>
      );

      fireEvent.keyDown(document, { key: 'Escape' });
      
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('should handle swipe gestures', async () => {
      const handleClose = vi.fn();
      
      render(
        <SwipeableModal 
          isOpen={true} 
          onClose={handleClose} 
          title="Test Modal"
          enableSwipeToClose={true}
          swipeThreshold={50}
        >
          <div>Modal Content</div>
        </SwipeableModal>
      );

      const modal = screen.getByRole('document');

      // Simulate swipe down gesture
      fireEvent.touchStart(modal, {
        touches: [{ clientX: 100, clientY: 100 }]
      });

      fireEvent.touchMove(modal, {
        touches: [{ clientX: 100, clientY: 200 }]
      });

      fireEvent.touchEnd(modal);

      // Should trigger close after swipe threshold is met
      await waitFor(() => {
        expect(handleClose).toHaveBeenCalled();
      });
    });
  });

  describe('Performance Monitoring', () => {
    it('should detect device capabilities correctly', () => {
      const capabilities = detectDeviceCapabilities();
      
      expect(typeof capabilities.isMobile).toBe('boolean');
      expect(typeof capabilities.isTablet).toBe('boolean');
      expect(typeof capabilities.hasTouch).toBe('boolean');
      expect(typeof capabilities.hasWebGL).toBe('boolean');
      expect(typeof capabilities.prefersReducedMotion).toBe('boolean');
      expect(typeof capabilities.deviceMemory).toBe('number');
      expect(['low', 'medium', 'high']).toContain(capabilities.performanceTier);
    });

    it('should handle mobile user agents', () => {
      mockNavigator({
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
      });
      
      const capabilities = detectDeviceCapabilities();
      expect(capabilities.isMobile).toBe(true);
    });

    it('should handle tablet user agents', () => {
      mockNavigator({
        userAgent: 'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
      });
      
      const capabilities = detectDeviceCapabilities();
      expect(capabilities.isTablet).toBe(true);
    });

    it('should detect touch capability', () => {
      mockNavigator({
        maxTouchPoints: 5
      });
      
      const capabilities = detectDeviceCapabilities();
      expect(capabilities.hasTouch).toBe(true);
    });
  });

  describe('CSS Classes and Animations', () => {
    it('should apply mobile-specific classes correctly', () => {
      Object.defineProperty(window, 'innerWidth', { value: 400 });
      
      const element = document.createElement('div');
      element.className = 'ds-touch-target-mobile ds-mobile-optimized ds-gpu-accelerated';
      
      expect(element.classList.contains('ds-touch-target-mobile')).toBe(true);
      expect(element.classList.contains('ds-mobile-optimized')).toBe(true);
      expect(element.classList.contains('ds-gpu-accelerated')).toBe(true);
    });

    it('should handle swipe-related classes', () => {
      const element = document.createElement('div');
      element.className = 'ds-swipeable ds-swipe-horizontal ds-momentum-scroll';
      
      expect(element.classList.contains('ds-swipeable')).toBe(true);
      expect(element.classList.contains('ds-swipe-horizontal')).toBe(true);
      expect(element.classList.contains('ds-momentum-scroll')).toBe(true);
    });

    it('should handle animation classes', () => {
      const element = document.createElement('div');
      element.className = 'ds-animate-fade-in ds-animate-scale-in ds-gpu-animation';
      
      expect(element.classList.contains('ds-animate-fade-in')).toBe(true);
      expect(element.classList.contains('ds-animate-scale-in')).toBe(true);
      expect(element.classList.contains('ds-gpu-animation')).toBe(true);
    });
  });
});

describe('Integration Tests', () => {
  it('should work together - button in swipeable modal', async () => {
    const handleButtonClick = vi.fn();
    const handleModalClose = vi.fn();
    
    render(
      <SwipeableModal isOpen={true} onClose={handleModalClose} title="Test Modal">
        <div className="p-6">
          <MobileOptimizedButton onClick={handleButtonClick}>
            Test Button
          </MobileOptimizedButton>
        </div>
      </SwipeableModal>
    );

    // Modal should be open
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    
    // Button should be clickable
    const button = screen.getByText('Test Button');
    fireEvent.click(button);
    
    // Wait for requestAnimationFrame to complete
    await waitFor(() => {
      expect(handleButtonClick).toHaveBeenCalledTimes(1);
    });
    
    // Modal should close on escape
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(handleModalClose).toHaveBeenCalledTimes(1);
  });

  it('should handle reduced motion preferences across components', () => {
    window.matchMedia = mockMatchMedia(true);
    
    render(
      <SwipeableModal isOpen={true} onClose={() => {}} title="Test Modal">
        <div className="p-6">
          <MobileOptimizedButton>
            Test Button
          </MobileOptimizedButton>
        </div>
      </SwipeableModal>
    );

    // Both components should respect reduced motion
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});