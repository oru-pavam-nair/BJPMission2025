import React, { useEffect, useRef, ReactNode } from 'react';
import { X } from 'lucide-react';
import { useFocusTrap, useAccessibilityAnnouncements } from '../../utils/accessibility';
import { useGPUAnimation, useReducedMotion, useTouchTargetSize } from '../../utils/mobilePerformance';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  description?: string;
  initialFocus?: React.RefObject<HTMLElement>;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'lg',
  showCloseButton = true,
  closeOnBackdropClick = true,
  closeOnEscape = true,
  description,
  initialFocus,
}) => {
  const modalRef = useFocusTrap(isOpen);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const { announceModalOpen, announceModalClose } = useAccessibilityAnnouncements();
  const { getAnimationStyle, shouldUseGPU } = useGPUAnimation();
  const { prefersReducedMotion, getMotionStyle } = useReducedMotion();
  const { minSize } = useTouchTargetSize();

  // Size classes mapping
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'max-w-[95vw]'
  };

  // Enhanced focus management and accessibility
  useEffect(() => {
    if (isOpen) {
      // Store the currently focused element
      previousFocusRef.current = document.activeElement as HTMLElement;
      
      // Announce modal opening
      announceModalOpen(title);
      
      // Focus management with initial focus support
      setTimeout(() => {
        if (initialFocus?.current) {
          initialFocus.current.focus();
        } else if (modalRef.current) {
          modalRef.current.focus();
        }
      }, 100);
      
      // Prevent body scroll and add modal class
      document.body.style.overflow = 'hidden';
      document.body.classList.add('modal-open');
      
      // Add aria-hidden to main content
      const mainContent = document.querySelector('main, #main-content, [role="main"]');
      if (mainContent) {
        mainContent.setAttribute('aria-hidden', 'true');
      }
    } else {
      // Announce modal closing
      if (previousFocusRef.current) {
        announceModalClose();
      }
      
      // Restore focus to previously focused element
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
      
      // Restore body scroll and remove modal class
      document.body.style.overflow = '';
      document.body.classList.remove('modal-open');
      
      // Remove aria-hidden from main content
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

  // Enhanced keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      if (event.key === 'Escape' && closeOnEscape) {
        event.preventDefault();
        onClose();
        return;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeOnEscape, onClose]);

  // Handle backdrop click
  const handleBackdropClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget && closeOnBackdropClick) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-2 sm:p-4 ds-modal ds-modal-a11y"
      style={{ zIndex: 40 }}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby={description ? "modal-description" : undefined}
      aria-hidden={!isOpen}
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm ds-modal-backdrop"
        aria-hidden="true"
      />

      {/* Modal Content */}
      <div
        ref={modalRef as React.RefObject<HTMLDivElement>}
        className={`
          relative w-full ${sizeClasses[size]} max-h-[95vh] sm:max-h-[90vh]
          bg-slate-900/95 backdrop-blur-md rounded-xl sm:rounded-2xl 
          shadow-2xl border border-slate-700/50 overflow-hidden
          ds-focus-ring ds-animate-scale-in
          ${shouldUseGPU ? 'ds-gpu-accelerated' : ''}
        `}
        style={{ 
          zIndex: 50,
          ...getMotionStyle(
            getAnimationStyle('all', 300, 'cubic-bezier(0.4, 0.0, 0.2, 1)'),
            { transition: 'none' }
          )
        }}
        tabIndex={-1}
        role="document"
      >
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
                ds-transition-base ds-touch-target ds-focus-ring ds-touch-feedback
              "
              style={{
                minHeight: `${minSize}px`,
                minWidth: `${minSize}px`,
                ...getMotionStyle(
                  getAnimationStyle('background-color', 200),
                  { transition: 'none' }
                )
              }}
              aria-label={`Close ${title} dialog`}
              title="Close Modal (Escape)"
              type="button"
            >
              <X className="w-5 h-5 text-slate-400" aria-hidden="true" />
            </button>
          )}
        </header>

        {/* Content */}
        <main 
          className="overflow-auto max-h-[calc(95vh-120px)] sm:max-h-[calc(90vh-120px)] ds-smooth-scroll"
          role="main"
          aria-label={`${title} content`}
          style={{
            WebkitOverflowScrolling: 'touch',
            overscrollBehavior: 'contain'
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default Modal;