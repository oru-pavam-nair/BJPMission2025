/**
 * Loading Indicator Components
 * Provides consistent loading animations and indicators
 * Requirements: 8.3, 8.4
 */

import React from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import { useReducedMotion } from '../../utils/mobilePerformance';

interface LoadingIndicatorProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'spinner' | 'dots' | 'pulse' | 'bars';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  text?: string;
  className?: string;
  fullScreen?: boolean;
  overlay?: boolean;
}

/**
 * Main Loading Indicator Component
 */
export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  size = 'md',
  variant = 'spinner',
  color = 'primary',
  text,
  className = '',
  fullScreen = false,
  overlay = false
}) => {
  const { prefersReducedMotion } = useReducedMotion();

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const colorClasses = {
    primary: 'text-blue-500',
    secondary: 'text-slate-400',
    success: 'text-green-500',
    warning: 'text-amber-500',
    error: 'text-red-500'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  const renderIndicator = () => {
    const baseClasses = `${sizeClasses[size]} ${colorClasses[color]}`;
    
    if (prefersReducedMotion) {
      // Static indicator for reduced motion
      return (
        <div 
          className={`${baseClasses} rounded-full border-2 border-current border-t-transparent`}
          role="status"
          aria-label="Loading"
        />
      );
    }

    switch (variant) {
      case 'spinner':
        return (
          <Loader2 
            className={`${baseClasses} animate-spin`}
            role="status"
            aria-label="Loading"
          />
        );

      case 'dots':
        return (
          <div className="flex space-x-1" role="status" aria-label="Loading">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`
                  ${sizeClasses[size]} ${colorClasses[color]} rounded-full
                  animate-bounce
                `}
                style={{
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: '0.6s'
                }}
              />
            ))}
          </div>
        );

      case 'pulse':
        return (
          <div 
            className={`
              ${baseClasses} rounded-full bg-current animate-pulse
            `}
            role="status"
            aria-label="Loading"
          />
        );

      case 'bars':
        return (
          <div className="flex space-x-1" role="status" aria-label="Loading">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`
                  w-1 ${colorClasses[color]} bg-current animate-pulse
                  ${size === 'sm' ? 'h-4' : size === 'md' ? 'h-6' : size === 'lg' ? 'h-8' : 'h-12'}
                `}
                style={{
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: '1.2s'
                }}
              />
            ))}
          </div>
        );

      default:
        return (
          <RefreshCw 
            className={`${baseClasses} animate-spin`}
            role="status"
            aria-label="Loading"
          />
        );
    }
  };

  const content = (
    <div 
      className={`
        flex flex-col items-center justify-center space-y-3
        ${fullScreen ? 'min-h-screen' : ''}
        ${className}
      `}
      role="status"
      aria-live="polite"
    >
      {renderIndicator()}
      {text && (
        <p className={`${textSizeClasses[size]} text-slate-300 font-medium`}>
          {text}
        </p>
      )}
    </div>
  );

  if (overlay || fullScreen) {
    return (
      <div 
        className={`
          fixed inset-0 flex items-center justify-center
          ${overlay ? 'bg-black/50 backdrop-blur-sm' : 'bg-slate-900'}
          z-50
        `}
        role="dialog"
        aria-modal="true"
        aria-label="Loading content"
      >
        {content}
      </div>
    );
  }

  return content;
};

/**
 * Inline Loading Spinner
 */
export const InlineLoader: React.FC<{
  size?: 'sm' | 'md';
  className?: string;
}> = ({ size = 'sm', className = '' }) => {
  return (
    <LoadingIndicator
      size={size}
      variant="spinner"
      color="primary"
      className={`inline-flex ${className}`}
    />
  );
};

/**
 * Button Loading State
 */
export const ButtonLoader: React.FC<{
  loading?: boolean;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}> = ({ 
  loading = false, 
  children, 
  disabled = false, 
  className = '', 
  onClick,
  type = 'button'
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        relative flex items-center justify-center space-x-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      aria-busy={loading}
    >
      {loading && (
        <InlineLoader size="sm" className="absolute left-3" />
      )}
      <span className={loading ? 'ml-6' : ''}>
        {children}
      </span>
    </button>
  );
};

/**
 * Page Loading Overlay
 */
export const PageLoader: React.FC<{
  message?: string;
  progress?: number;
  showProgress?: boolean;
}> = ({ 
  message = 'Loading...', 
  progress,
  showProgress = false 
}) => {
  return (
    <LoadingIndicator
      size="lg"
      variant="spinner"
      color="primary"
      text={message}
      fullScreen
      overlay
      className="space-y-6"
    >
      {showProgress && typeof progress === 'number' && (
        <div className="w-64 bg-slate-700 rounded-full h-2 overflow-hidden">
          <div 
            className="h-full bg-blue-500 transition-all duration-300 ease-out"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Loading progress: ${progress}%`}
          />
        </div>
      )}
    </LoadingIndicator>
  );
};

/**
 * Table Loading Overlay
 */
export const TableLoader: React.FC<{
  rows?: number;
  columns?: number;
  message?: string;
}> = ({ rows = 5, columns = 4, message = 'Loading data...' }) => {
  return (
    <div className="relative">
      {/* Loading overlay */}
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-10">
        <LoadingIndicator
          size="md"
          variant="spinner"
          color="primary"
          text={message}
        />
      </div>
      
      {/* Skeleton table underneath */}
      <div className="opacity-30">
        <table className="min-w-full">
          <thead>
            <tr>
              {Array.from({ length: columns }).map((_, i) => (
                <th key={i} className="px-6 py-4">
                  <div className="h-4 bg-slate-700 rounded animate-pulse" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <tr key={rowIndex}>
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <td key={colIndex} className="px-6 py-4">
                    <div className="h-4 bg-slate-700 rounded animate-pulse" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/**
 * Modal Loading State
 */
export const ModalLoader: React.FC<{
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}> = ({ message = 'Loading...', size = 'md' }) => {
  return (
    <div className="flex items-center justify-center py-12">
      <LoadingIndicator
        size={size}
        variant="spinner"
        color="primary"
        text={message}
      />
    </div>
  );
};