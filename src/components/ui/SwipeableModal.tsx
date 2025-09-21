import React, { useEffect, useRef, useState } from 'react';
import { X, ChevronDown } from 'lucide-react';
import { useSwipeGesture, useGPUAnimation, useReducedMotion } from '../../utils/mobilePerformance';
import { useFocusTrap, useAccessibilityAnnouncements } from '../../utils/accessibility';

interface SwipeableModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  enableSwipeToClose?: boolean;
  swipeThreshold?: number;
  description?: string;
  initialFocus?: React.RefObject<HTMLElement>;
}

const SwipeableModal: React.FC<SwipeableModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'lg',
  showCloseButton = true,
  enableSwipeToClose = true,
  swipeThreshold = 100,
  description,
  initialFocus,
}) => {
  const modalRef = useFocusTrap(isOpen);
  const contentRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isClosing, setIsClosing] = useState(false);
  
  const { announceModalOpen, announceModalClose } = useAccessibilityAnnouncements();
  const { getAnimationStyle, shouldUseGPU } = useGPUAnimation();
  const { prefersReducedMotion, getMotionStyle } = useReducedMotion();

  // Size classes mapping
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'max-w-[95vw]'
  };

  // Swipe gesture handling
  const { ref: swipeRef } = useSwipeGesture(
    (direction, interaction) => {
      if (!enableSwipeToClose) return;
      
      // Only handle downward swipes to close
      if (direction === 'down' && Math.abs(interaction.deltaY) > swipeThreshold) {
        handleSwipeClose();
      }
    },
    {
      threshold: swipeThreshold,
      velocity: 0.3,
      preventScroll: false,
      allowedTime: 500
    }
  );

  // Handle swipe close with animation
  const handleSwipeClose = () => {
    if (prefersReducedMotion) {
      onClose();
      return;
    }

    setIsClosing(true);
    
    // Animate out
    if (contentRef.current) {
      contentRef.current.style.transform = shouldUseGPU 
        ? 'translate3d(0, 100%, 0)' 
        : 'translateY(100%)';
      contentRef.current.style.opacity = '0';
    }
    
    // Close after animation
    setTimeout(() => {
      setIsClosing(false);
      setDragOffset(0);
      onClose();
    }, 300);
  };

  // Handle touch interactions for drag feedback
  useEffect(() => {
    const element = swipeRef.current;
    if (!element || !enableSwipeToClose) return;

    let startY = 0;
    let currentY = 0;
    let isDraggingLocal = false;

    const handleTouchStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY;
      currentY = startY;
      isDraggingLocal = false;
      setIsDragging(false);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDraggingLocal && Math.abs(e.touches[0].clientY - startY) > 10) {
        isDraggingLocal = true;
        setIsDragging(true);
      }

      if (isDraggingLocal) {
        currentY = e.touches[0].clientY;
        const deltaY = Math.max(0, currentY - startY); // Only allow downward drag
        setDragOffset(deltaY);

        // Apply real-time transform for smooth dragging
        if (contentRef.current && !prefersReducedMotion) {
          const progress = Math.min(deltaY / swipeThreshold, 1);
          const opacity = 1 - (progress * 0.5);
          
          contentRef.current.style.transform = shouldUseGPU
            ? `translate3d(0, ${deltaY}px, 0)`
            : `translateY(${deltaY}px)`;
          contentRef.current.style.opacity = opacity.toString();
        }
      }
    };

    const handleTouchEnd = () => {
      if (isDraggingLocal) {
        const deltaY = currentY - startY;
        
        if (deltaY > swipeThreshold) {
          handleSwipeClose();
        } else {
          // Snap back to original position
          if (contentRef.current && !prefersReducedMotion) {
            contentRef.current.style.transform = shouldUseGPU 
              ? 'translate3d(0, 0, 0)' 
              : 'translateY(0)';
            contentRef.current.style.opacity = '1';
          }
          setDragOffset(0);
        }
        
        setIsDragging(false);
        isDraggingLocal = false;
      }
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [enableSwipeToClose, swipeThreshold, shouldUseGPU, prefersReducedMotion]);

  // Focus management and accessibility
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      announceModalOpen(title);
      
      setTimeout(() => {
        if (initialFocus?.current) {
          initialFocus.current.focus();
        } else if (modalRef.current) {
          modalRef.current.focus();
        }
      }, 100);
      
      document.body.style.overflow = 'hidden';
      document.body.classList.add('modal-open');
      
      const mainContent = document.querySelector('main, #main-content, [role="main"]');
      if (mainContent) {
        mainContent.setAttribute('aria-hidden', 'true');
      }
    } else {
      if (previousFocusRef.current) {
        announceModalClose();
        previousFocusRef.current.focus();
      }
      
      document.body.style.overflow = '';
      document.body.classList.remove('modal-open');
      
      const mainContent = document.querySelector('main, #main-content, [role="main"]');
      if (mainContent) {
        mainContent.removeAttribute('aria-hidden');
      }
    }

    return () => {
      document.body.style.overflow = '';
      document.body.classList.remove('modal-open');
      const mainContent = document.querySelector('main, #main-content, [role="main"]');
      if (mainContent) {
        mainContent.removeAttribute('aria-hidden');
      }
    };
  }, [isOpen, title, announceModalOpen, announceModalClose, initialFocus]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Handle backdrop click
  const handleBackdropClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ 
        zIndex: 40,
        ...getAnimationStyle('opacity', prefersReducedMotion ? 0 : 300)
      }}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby={description ? "modal-description" : undefined}
      aria-hidden={!isOpen}
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        style={{
          ...getMotionStyle(
            { 
              opacity: isClosing ? 0 : 1,
              transition: 'opacity 300ms ease-out'
            },
            { opacity: 1 }
          )
        }}
        aria-hidden="true"
      />

      {/* Modal Content */}
      <div
        ref={(el) => {
          if (modalRef.current !== el) {
            (modalRef as any).current = el;
          }
          if (swipeRef.current !== el) {
            (swipeRef as any).current = el;
          }
          if (contentRef.current !== el) {
            contentRef.current = el;
          }
        }}
        className={`
          relative w-full ${sizeClasses[size]} max-h-[95vh] sm:max-h-[90vh]
          bg-slate-900/95 backdrop-blur-md 
          rounded-t-2xl sm:rounded-2xl shadow-2xl border border-slate-700/50 
          overflow-hidden ds-focus-ring
          ${shouldUseGPU ? 'ds-gpu-accelerated' : ''}
          ${enableSwipeToClose ? 'ds-swipeable' : ''}
        `}
        style={{ 
          zIndex: 50,
          ...getMotionStyle(
            {
              transform: isClosing 
                ? (shouldUseGPU ? 'translate3d(0, 100%, 0)' : 'translateY(100%)')
                : (shouldUseGPU ? 'translate3d(0, 0, 0)' : 'translateY(0)'),
              opacity: isClosing ? 0 : 1,
              transition: isClosing || !isDragging 
                ? 'transform 300ms cubic-bezier(0.4, 0.0, 0.2, 1), opacity 300ms ease-out'
                : 'none'
            },
            {
              transform: 'none',
              opacity: 1,
              transition: 'none'
            }
          )
        }}
        tabIndex={-1}
        role="document"
      >
        {/* Swipe Indicator (Mobile Only) */}
        {enableSwipeToClose && (
          <div className="flex justify-center pt-2 pb-1 sm:hidden" aria-hidden="true">
            <div 
              className="w-12 h-1 bg-slate-600 rounded-full"
              style={{
                ...getMotionStyle(
                  {
                    backgroundColor: isDragging ? 'rgb(59, 130, 246)' : 'rgb(75, 85, 99)',
                    transition: 'background-color 200ms ease-out'
                  },
                  { backgroundColor: 'rgb(75, 85, 99)' }
                )
              }}
            />
          </div>
        )}

        {/* Header */}
        <header className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-700/50 bg-slate-800/50">
          <div className="flex-1 min-w-0">
            <h2 
              id="modal-title"
              className="text-lg sm:text-xl font-semibold text-slate-100 truncate pr-4"
            >
              {title}
            </h2>
            {description && (
              <p 
                id="modal-description"
                className="text-sm text-slate-400 mt-1 ds-sr-only-focusable"
              >
                {description}
              </p>
            )}
          </div>
          
          {showCloseButton && (
            <button
              onClick={onClose}
              className="
                flex-shrink-0 p-2 hover:bg-slate-700/50 rounded-lg 
                ds-transition-base ds-touch-target ds-focus-ring
              "
              aria-label={`Close ${title} dialog`}
              title="Close Modal (Escape)"
              type="button"
            >
              <X className="w-5 h-5 text-slate-400" aria-hidden="true" />
            </button>
          )}
        </header>

        {/* Swipe instruction for mobile */}
        {enableSwipeToClose && (
          <div className="px-4 py-2 bg-slate-800/30 border-b border-slate-700/30 sm:hidden">
            <div className="flex items-center justify-center space-x-2 text-slate-400">
              <ChevronDown className="w-4 h-4" aria-hidden="true" />
              <span className="text-xs">Swipe down to close</span>
            </div>
          </div>
        )}

        {/* Content */}
        <main 
          className="overflow-auto max-h-[calc(95vh-120px)] sm:max-h-[calc(90vh-120px)] ds-smooth-scroll"
          role="main"
          aria-label={`${title} content`}
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default SwipeableModal;