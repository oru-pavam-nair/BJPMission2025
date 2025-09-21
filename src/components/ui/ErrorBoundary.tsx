/**
 * Error Boundary and Error State Components
 * Provides comprehensive error handling with retry mechanisms
 * Requirements: 8.3, 8.4, 8.5
 */

import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from 'lucide-react';
import { useTouchTargetSize } from '../../utils/mobilePerformance';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  retryCount: number;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  maxRetries?: number;
  showRetry?: boolean;
  resetOnPropsChange?: boolean;
  resetKeys?: Array<string | number>;
}

/**
 * Error Boundary Component with retry functionality
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private resetTimeoutId: number | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log error for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    const { resetOnPropsChange, resetKeys } = this.props;
    const { hasError } = this.state;

    // Reset error state when resetKeys change
    if (hasError && resetOnPropsChange && resetKeys) {
      const prevResetKeys = prevProps.resetKeys || [];
      const hasResetKeyChanged = resetKeys.some(
        (key, index) => key !== prevResetKeys[index]
      );

      if (hasResetKeyChanged) {
        this.resetErrorBoundary();
      }
    }
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
  }

  resetErrorBoundary = () => {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    });
  };

  handleRetry = () => {
    const { maxRetries = 3 } = this.props;
    const { retryCount } = this.state;

    if (retryCount < maxRetries) {
      this.setState(prevState => ({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: prevState.retryCount + 1
      }));
    }
  };

  render() {
    const { hasError, error, retryCount } = this.state;
    const { children, fallback, maxRetries = 3, showRetry = true } = this.props;

    if (hasError) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback;
      }

      // Default error UI
      return (
        <ErrorDisplay
          error={error}
          onRetry={showRetry && retryCount < maxRetries ? this.handleRetry : undefined}
          retryCount={retryCount}
          maxRetries={maxRetries}
        />
      );
    }

    return children;
  }
}

/**
 * Error Display Component
 */
interface ErrorDisplayProps {
  error: Error | null;
  title?: string;
  message?: string;
  onRetry?: () => void;
  onGoBack?: () => void;
  onGoHome?: () => void;
  retryCount?: number;
  maxRetries?: number;
  showDetails?: boolean;
  className?: string;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  title = 'Something went wrong',
  message,
  onRetry,
  onGoBack,
  onGoHome,
  retryCount = 0,
  maxRetries = 3,
  showDetails = false,
  className = ''
}) => {
  const { minSize } = useTouchTargetSize();

  const getErrorMessage = () => {
    if (message) return message;
    if (error?.message) return error.message;
    return 'An unexpected error occurred. Please try again.';
  };

  const canRetry = onRetry && retryCount < maxRetries;

  return (
    <div 
      className={`
        flex flex-col items-center justify-center min-h-[400px] p-6 text-center
        bg-slate-900/50 rounded-lg border border-slate-700/50
        ${className}
      `}
      role="alert"
      aria-live="assertive"
    >
      {/* Error Icon */}
      <div className="mb-6">
        <div className="w-16 h-16 mx-auto bg-red-500/20 rounded-full flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-red-400" aria-hidden="true" />
        </div>
      </div>

      {/* Error Content */}
      <div className="max-w-md space-y-4">
        <h2 className="text-xl font-semibold text-slate-100">
          {title}
        </h2>
        
        <p className="text-slate-300 leading-relaxed">
          {getErrorMessage()}
        </p>

        {retryCount > 0 && (
          <p className="text-sm text-slate-400">
            Retry attempt {retryCount} of {maxRetries}
          </p>
        )}

        {/* Error Details (Development) */}
        {showDetails && error && process.env.NODE_ENV === 'development' && (
          <details className="mt-4 text-left">
            <summary className="text-sm text-slate-400 cursor-pointer hover:text-slate-300">
              Error Details
            </summary>
            <pre className="mt-2 p-3 bg-slate-800/50 rounded text-xs text-red-300 overflow-auto max-h-32">
              {error.stack || error.message}
            </pre>
          </details>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 mt-8 justify-center">
        {canRetry && (
          <button
            onClick={onRetry}
            className="
              flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 
              text-white rounded-lg transition-colors duration-200
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900
            "
            style={{ minHeight: `${minSize}px` }}
            aria-label={`Retry operation (attempt ${retryCount + 1} of ${maxRetries})`}
          >
            <RefreshCw className="w-4 h-4" aria-hidden="true" />
            <span>Try Again</span>
          </button>
        )}

        {onGoBack && (
          <button
            onClick={onGoBack}
            className="
              flex items-center space-x-2 px-4 py-2 bg-slate-600 hover:bg-slate-700 
              text-white rounded-lg transition-colors duration-200
              focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-900
            "
            style={{ minHeight: `${minSize}px` }}
            aria-label="Go back to previous page"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            <span>Go Back</span>
          </button>
        )}

        {onGoHome && (
          <button
            onClick={onGoHome}
            className="
              flex items-center space-x-2 px-4 py-2 bg-slate-600 hover:bg-slate-700 
              text-white rounded-lg transition-colors duration-200
              focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-900
            "
            style={{ minHeight: `${minSize}px` }}
            aria-label="Go to home page"
          >
            <Home className="w-4 h-4" aria-hidden="true" />
            <span>Home</span>
          </button>
        )}
      </div>
    </div>
  );
};

/**
 * Network Error Component
 */
export const NetworkError: React.FC<{
  onRetry?: () => void;
  className?: string;
}> = ({ onRetry, className = '' }) => {
  return (
    <ErrorDisplay
      title="Connection Error"
      message="Unable to load data. Please check your internet connection and try again."
      onRetry={onRetry}
      className={className}
    />
  );
};

/**
 * Data Not Found Component
 */
export const DataNotFound: React.FC<{
  message?: string;
  onGoBack?: () => void;
  className?: string;
}> = ({ 
  message = "The requested data could not be found.", 
  onGoBack, 
  className = '' 
}) => {
  return (
    <ErrorDisplay
      title="Data Not Available"
      message={message}
      onGoBack={onGoBack}
      className={className}
    />
  );
};

/**
 * Permission Denied Component
 */
export const PermissionDenied: React.FC<{
  onGoBack?: () => void;
  onGoHome?: () => void;
  className?: string;
}> = ({ onGoBack, onGoHome, className = '' }) => {
  return (
    <ErrorDisplay
      title="Access Denied"
      message="You do not have permission to view this content. Please contact your administrator if you believe this is an error."
      onGoBack={onGoBack}
      onGoHome={onGoHome}
      className={className}
    />
  );
};

/**
 * Timeout Error Component
 */
export const TimeoutError: React.FC<{
  onRetry?: () => void;
  className?: string;
}> = ({ onRetry, className = '' }) => {
  return (
    <ErrorDisplay
      title="Request Timeout"
      message="The request took too long to complete. Please try again."
      onRetry={onRetry}
      className={className}
    />
  );
};