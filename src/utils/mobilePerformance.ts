/**
 * Mobile Performance Optimization Utilities
 * Implements touch-friendly interactions, GPU-accelerated animations,
 * reduced motion support, and swipe gestures
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';

// Touch target configuration
export const TOUCH_TARGETS = {
  mobile: 48, // 48px minimum for mobile
  tablet: 44,  // 44px for tablet
  desktop: 40  // 40px for desktop
} as const;

// Animation performance configuration
export const ANIMATION_CONFIG = {
  mobile: {
    duration: {
      fast: 150,
      normal: 200,
      slow: 300
    },
    easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)', // Material Design easing
    gpuAcceleration: true
  },
  tablet: {
    duration: {
      fast: 200,
      normal: 250,
      slow: 400
    },
    easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
    gpuAcceleration: true
  },
  desktop: {
    duration: {
      fast: 200,
      normal: 300,
      slow: 500
    },
    easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
    gpuAcceleration: false
  }
} as const;

// Swipe gesture configuration
export interface SwipeConfig {
  threshold: number;
  velocity: number;
  preventScroll: boolean;
  allowedTime: number;
}

export const DEFAULT_SWIPE_CONFIG: SwipeConfig = {
  threshold: 50,    // Minimum distance for swipe
  velocity: 0.3,    // Minimum velocity
  preventScroll: false,
  allowedTime: 300  // Maximum time for swipe
};

// Touch interaction types
export interface TouchInteraction {
  startX: number;
  startY: number;
  startTime: number;
  currentX: number;
  currentY: number;
  deltaX: number;
  deltaY: number;
  velocity: number;
  direction: 'left' | 'right' | 'up' | 'down' | null;
}

// Device detection for performance optimization
export const detectDeviceCapabilities = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
  const isTablet = /ipad|android(?!.*mobile)/i.test(userAgent);
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  // Detect GPU acceleration support
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  const hasWebGL = !!gl;
  
  // Detect reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  // Detect device memory (if available)
  const deviceMemory = (navigator as any).deviceMemory || 4; // Default to 4GB
  
  // Performance tier based on device capabilities
  let performanceTier: 'low' | 'medium' | 'high' = 'medium';
  if (deviceMemory <= 2 || !hasWebGL) {
    performanceTier = 'low';
  } else if (deviceMemory >= 8 && hasWebGL && !isMobile) {
    performanceTier = 'high';
  }
  
  return {
    isMobile,
    isTablet,
    hasTouch,
    hasWebGL,
    prefersReducedMotion,
    deviceMemory,
    performanceTier
  };
};

// Touch target size hook
export const useTouchTargetSize = () => {
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  
  useEffect(() => {
    const updateDeviceType = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setDeviceType('mobile');
      } else if (width < 1024) {
        setDeviceType('tablet');
      } else {
        setDeviceType('desktop');
      }
    };
    
    updateDeviceType();
    window.addEventListener('resize', updateDeviceType);
    
    return () => window.removeEventListener('resize', updateDeviceType);
  }, []);
  
  return {
    minSize: TOUCH_TARGETS[deviceType],
    deviceType,
    getTouchTargetStyle: (size?: number) => ({
      minHeight: `${size || TOUCH_TARGETS[deviceType]}px`,
      minWidth: `${size || TOUCH_TARGETS[deviceType]}px`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    })
  };
};

// GPU-accelerated animation hook
export const useGPUAnimation = (enabled: boolean = true) => {
  const capabilities = detectDeviceCapabilities();
  const shouldUseGPU = enabled && capabilities.hasWebGL && !capabilities.prefersReducedMotion;
  
  const getAnimationStyle = useCallback((
    property: string,
    duration: number = 300,
    easing: string = 'ease-out'
  ) => {
    if (capabilities.prefersReducedMotion) {
      return {
        transition: 'none',
        transform: shouldUseGPU ? 'translateZ(0)' : undefined
      };
    }
    
    const config = ANIMATION_CONFIG[capabilities.isMobile ? 'mobile' : capabilities.isTablet ? 'tablet' : 'desktop'];
    
    return {
      transition: `${property} ${duration}ms ${easing}`,
      transform: shouldUseGPU ? 'translateZ(0)' : undefined,
      willChange: shouldUseGPU ? property : undefined,
      backfaceVisibility: shouldUseGPU ? 'hidden' as const : undefined,
      perspective: shouldUseGPU ? 1000 : undefined
    };
  }, [shouldUseGPU, capabilities]);
  
  const createKeyframes = useCallback((name: string, keyframes: Record<string, any>) => {
    if (capabilities.prefersReducedMotion) {
      return {};
    }
    
    const keyframeString = Object.entries(keyframes)
      .map(([percentage, styles]) => {
        const styleString = Object.entries(styles)
          .map(([prop, value]) => `${prop}: ${value}`)
          .join('; ');
        return `${percentage} { ${styleString} }`;
      })
      .join(' ');
    
    // Inject keyframes into document
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `@keyframes ${name} { ${keyframeString} }`;
    document.head.appendChild(styleSheet);
    
    return {
      animationName: name,
      transform: shouldUseGPU ? 'translateZ(0)' : undefined
    };
  }, [shouldUseGPU, capabilities.prefersReducedMotion]);
  
  return {
    getAnimationStyle,
    createKeyframes,
    shouldUseGPU,
    capabilities
  };
};

// Swipe gesture hook
export const useSwipeGesture = (
  onSwipe: (direction: 'left' | 'right' | 'up' | 'down', interaction: TouchInteraction) => void,
  config: Partial<SwipeConfig> = {}
) => {
  const swipeConfig = { ...DEFAULT_SWIPE_CONFIG, ...config };
  const touchRef = useRef<TouchInteraction | null>(null);
  const elementRef = useRef<HTMLElement>(null);
  
  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    touchRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      startTime: Date.now(),
      currentX: touch.clientX,
      currentY: touch.clientY,
      deltaX: 0,
      deltaY: 0,
      velocity: 0,
      direction: null
    };
    
    if (swipeConfig.preventScroll) {
      e.preventDefault();
    }
  }, [swipeConfig.preventScroll]);
  
  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!touchRef.current) return;
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - touchRef.current.startX;
    const deltaY = touch.clientY - touchRef.current.startY;
    const currentTime = Date.now();
    const deltaTime = currentTime - touchRef.current.startTime;
    
    touchRef.current = {
      ...touchRef.current,
      currentX: touch.clientX,
      currentY: touch.clientY,
      deltaX,
      deltaY,
      velocity: Math.sqrt(deltaX * deltaX + deltaY * deltaY) / deltaTime
    };
    
    if (swipeConfig.preventScroll && (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10)) {
      e.preventDefault();
    }
  }, [swipeConfig.preventScroll]);
  
  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!touchRef.current) return;
    
    const interaction = touchRef.current;
    const deltaTime = Date.now() - interaction.startTime;
    
    // Check if swipe meets criteria
    if (deltaTime <= swipeConfig.allowedTime && interaction.velocity >= swipeConfig.velocity) {
      const absDeltaX = Math.abs(interaction.deltaX);
      const absDeltaY = Math.abs(interaction.deltaY);
      
      if (absDeltaX >= swipeConfig.threshold || absDeltaY >= swipeConfig.threshold) {
        let direction: 'left' | 'right' | 'up' | 'down';
        
        if (absDeltaX > absDeltaY) {
          direction = interaction.deltaX > 0 ? 'right' : 'left';
        } else {
          direction = interaction.deltaY > 0 ? 'down' : 'up';
        }
        
        interaction.direction = direction;
        onSwipe(direction, interaction);
      }
    }
    
    touchRef.current = null;
  }, [onSwipe, swipeConfig]);
  
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;
    
    element.addEventListener('touchstart', handleTouchStart, { passive: !swipeConfig.preventScroll });
    element.addEventListener('touchmove', handleTouchMove, { passive: !swipeConfig.preventScroll });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });
    
    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, swipeConfig.preventScroll]);
  
  return {
    ref: elementRef,
    isActive: touchRef.current !== null,
    currentInteraction: touchRef.current
  };
};

// Performance-optimized scroll hook
export const usePerformantScroll = (
  onScroll?: (scrollY: number, direction: 'up' | 'down') => void,
  throttleMs: number = 16 // 60fps
) => {
  const [scrollY, setScrollY] = useState(0);
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('down');
  const lastScrollY = useRef(0);
  const ticking = useRef(false);
  
  const updateScrollPosition = useCallback(() => {
    const currentScrollY = window.scrollY;
    const direction = currentScrollY > lastScrollY.current ? 'down' : 'up';
    
    setScrollY(currentScrollY);
    setScrollDirection(direction);
    
    onScroll?.(currentScrollY, direction);
    lastScrollY.current = currentScrollY;
    ticking.current = false;
  }, [onScroll]);
  
  const handleScroll = useCallback(() => {
    if (!ticking.current) {
      requestAnimationFrame(updateScrollPosition);
      ticking.current = true;
    }
  }, [updateScrollPosition]);
  
  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);
  
  return { scrollY, scrollDirection };
};

// Touch feedback hook for better UX
export const useTouchFeedback = (
  element: React.RefObject<HTMLElement>,
  options: {
    haptic?: boolean;
    visual?: boolean;
    audio?: boolean;
  } = {}
) => {
  const { haptic = true, visual = true, audio = false } = options;
  const [isPressed, setIsPressed] = useState(false);
  
  useEffect(() => {
    const el = element.current;
    if (!el) return;
    
    const handleTouchStart = () => {
      setIsPressed(true);
      
      // Haptic feedback (if supported)
      if (haptic && 'vibrate' in navigator) {
        navigator.vibrate(10);
      }
      
      // Audio feedback (if enabled)
      if (audio) {
        // Create a subtle click sound
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
      }
    };
    
    const handleTouchEnd = () => {
      setIsPressed(false);
    };
    
    el.addEventListener('touchstart', handleTouchStart, { passive: true });
    el.addEventListener('touchend', handleTouchEnd, { passive: true });
    el.addEventListener('touchcancel', handleTouchEnd, { passive: true });
    
    return () => {
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchend', handleTouchEnd);
      el.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [element, haptic, audio]);
  
  return {
    isPressed,
    pressedStyle: visual ? {
      transform: 'scale(0.95)',
      opacity: 0.8,
      transition: 'all 150ms ease-out'
    } : {}
  };
};

// Reduced motion utilities
export const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);
  
  return {
    prefersReducedMotion,
    getMotionStyle: (normalStyle: React.CSSProperties, reducedStyle?: React.CSSProperties) => {
      return prefersReducedMotion ? (reducedStyle || { transition: 'none' }) : normalStyle;
    }
  };
};

// Performance monitoring hook
export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useState({
    fps: 60,
    memoryUsage: 0,
    renderTime: 0
  });
  
  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animationId: number;
    
    const measurePerformance = (currentTime: number) => {
      frameCount++;
      
      if (currentTime - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        
        // Memory usage (if available)
        const memoryInfo = (performance as any).memory;
        const memoryUsage = memoryInfo ? memoryInfo.usedJSHeapSize / memoryInfo.totalJSHeapSize : 0;
        
        setMetrics({
          fps,
          memoryUsage,
          renderTime: performance.now() - currentTime
        });
        
        frameCount = 0;
        lastTime = currentTime;
      }
      
      animationId = requestAnimationFrame(measurePerformance);
    };
    
    animationId = requestAnimationFrame(measurePerformance);
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, []);
  
  return metrics;
};

// Export utility functions
export const mobilePerformanceUtils = {
  detectDeviceCapabilities,
  TOUCH_TARGETS,
  ANIMATION_CONFIG,
  DEFAULT_SWIPE_CONFIG
};

export default {
  useTouchTargetSize,
  useGPUAnimation,
  useSwipeGesture,
  usePerformantScroll,
  useTouchFeedback,
  useReducedMotion,
  usePerformanceMonitor,
  mobilePerformanceUtils
};