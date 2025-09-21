import React, { useRef } from 'react';
import { 
  useTouchTargetSize, 
  useGPUAnimation, 
  useTouchFeedback, 
  useReducedMotion 
} from '../../utils/mobilePerformance';

interface MobileOptimizedButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  ariaLabel?: string;
  hapticFeedback?: boolean;
  visualFeedback?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

const MobileOptimizedButton: React.FC<MobileOptimizedButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  className = '',
  ariaLabel,
  hapticFeedback = true,
  visualFeedback = true,
  type = 'button'
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { minSize, deviceType, getTouchTargetStyle } = useTouchTargetSize();
  const { getAnimationStyle, shouldUseGPU } = useGPUAnimation();
  const { isPressed, pressedStyle } = useTouchFeedback(buttonRef, {
    haptic: hapticFeedback,
    visual: visualFeedback
  });
  const { prefersReducedMotion, getMotionStyle } = useReducedMotion();

  // Size configurations
  const sizeConfig = {
    small: {
      padding: '8px 12px',
      fontSize: '14px',
      minSize: Math.max(minSize, 40)
    },
    medium: {
      padding: '12px 16px',
      fontSize: '16px',
      minSize: minSize
    },
    large: {
      padding: '16px 24px',
      fontSize: '18px',
      minSize: Math.max(minSize, 56)
    }
  };

  // Variant styles
  const variantStyles = {
    primary: {
      background: 'var(--color-primary-500)',
      color: 'var(--color-text-primary)',
      border: '1px solid var(--color-primary-500)',
      hoverBackground: 'var(--color-primary-600)',
      hoverBorder: 'var(--color-primary-600)'
    },
    secondary: {
      background: 'rgba(55, 65, 81, 0.8)',
      color: 'var(--color-text-primary)',
      border: '1px solid rgba(156, 163, 175, 0.3)',
      hoverBackground: 'rgba(75, 85, 99, 0.8)',
      hoverBorder: 'rgba(156, 163, 175, 0.5)'
    },
    success: {
      background: 'var(--color-success-500)',
      color: 'var(--color-text-primary)',
      border: '1px solid var(--color-success-500)',
      hoverBackground: 'var(--color-success-600)',
      hoverBorder: 'var(--color-success-600)'
    },
    warning: {
      background: 'var(--color-warning-500)',
      color: 'var(--color-text-primary)',
      border: '1px solid var(--color-warning-500)',
      hoverBackground: 'var(--color-warning-600)',
      hoverBorder: 'var(--color-warning-600)'
    },
    danger: {
      background: 'var(--color-error-500)',
      color: 'var(--color-text-primary)',
      border: '1px solid var(--color-error-500)',
      hoverBackground: 'var(--color-error-600)',
      hoverBorder: 'var(--color-error-600)'
    }
  };

  const currentSize = sizeConfig[size];
  const currentVariant = variantStyles[variant];

  // Performance-optimized styles
  const baseStyle: React.CSSProperties = {
    ...getTouchTargetStyle(currentSize.minSize),
    padding: currentSize.padding,
    fontSize: currentSize.fontSize,
    fontWeight: '500',
    borderRadius: 'var(--border-radius-base)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    position: 'relative',
    overflow: 'hidden',
    background: currentVariant.background,
    color: currentVariant.color,
    border: currentVariant.border,
    outline: 'none',
    WebkitTapHighlightColor: 'transparent',
    touchAction: 'manipulation',
    userSelect: 'none',
    WebkitUserSelect: 'none',
    ...getAnimationStyle('all', prefersReducedMotion ? 0 : 200, 'cubic-bezier(0.4, 0.0, 0.2, 1)'),
    ...(shouldUseGPU && {
      transform: 'translateZ(0)',
      willChange: 'transform, background-color, border-color',
      backfaceVisibility: 'hidden'
    })
  };

  // Apply pressed state styles
  const dynamicStyle: React.CSSProperties = {
    ...baseStyle,
    ...(isPressed && visualFeedback ? pressedStyle : {}),
    ...(disabled && {
      opacity: 0.6,
      pointerEvents: 'none'
    }),
    ...(loading && {
      opacity: 0.8,
      pointerEvents: 'none'
    })
  };

  // Handle click with performance optimizations
  const handleClick = () => {
    if (disabled || loading) return;
    
    // Use requestAnimationFrame for smooth interactions
    requestAnimationFrame(() => {
      onClick?.();
    });
  };

  // Loading spinner component
  const LoadingSpinner = () => (
    <div
      className="absolute inset-0 flex items-center justify-center"
      style={{
        ...(shouldUseGPU && { transform: 'translateZ(0)' })
      }}
    >
      <div
        className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"
        style={{
          ...(shouldUseGPU && {
            transform: 'translateZ(0)',
            willChange: 'transform'
          }),
          ...getMotionStyle(
            { animation: 'spin 1s linear infinite' },
            { animation: 'none', opacity: 0.7 }
          )
        }}
        aria-hidden="true"
      />
    </div>
  );

  return (
    <button
      ref={buttonRef}
      type={type}
      onClick={handleClick}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      aria-busy={loading}
      className={`
        ds-focus-ring ds-touch-feedback
        ${deviceType === 'mobile' ? 'ds-mobile-optimized ds-mobile-transition' : ''}
        ${deviceType === 'tablet' ? 'ds-tablet-optimized ds-tablet-transition' : ''}
        ${shouldUseGPU ? 'ds-gpu-accelerated' : ''}
        ${className}
      `}
      style={dynamicStyle}
      onMouseEnter={(e) => {
        if (!disabled && !loading && deviceType === 'desktop') {
          const target = e.currentTarget;
          target.style.background = currentVariant.hoverBackground;
          target.style.borderColor = currentVariant.hoverBorder;
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && !loading && deviceType === 'desktop') {
          const target = e.currentTarget;
          target.style.background = currentVariant.background;
          target.style.borderColor = currentVariant.border;
        }
      }}
    >
      {/* Button content */}
      <span
        className={`relative z-10 ${loading ? 'opacity-0' : 'opacity-100'}`}
        style={{
          transition: prefersReducedMotion ? 'none' : 'opacity 200ms ease-out'
        }}
      >
        {children}
      </span>

      {/* Loading state */}
      {loading && <LoadingSpinner />}

      {/* Touch ripple effect for enhanced feedback */}
      {visualFeedback && !prefersReducedMotion && (
        <span
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)',
            opacity: isPressed ? 1 : 0,
            transform: shouldUseGPU ? 'translateZ(0) scale(0)' : 'scale(0)',
            transition: 'all 300ms ease-out',
            ...(isPressed && {
              transform: shouldUseGPU ? 'translateZ(0) scale(1)' : 'scale(1)'
            })
          }}
        />
      )}
    </button>
  );
};

export default MobileOptimizedButton;