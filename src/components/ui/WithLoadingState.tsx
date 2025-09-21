/**
 * Higher-Order Component for Loading State Management
 * Wraps components with consistent loading and error handling
 * Requirements: 8.3, 8.4, 8.5
 */

import React, { ComponentType, useEffect, useState } from 'react';
import { LoadingIndicator, ModalLoader, TableLoader } from './LoadingIndicator';
import { ErrorDisplay, NetworkError, TimeoutError } from './ErrorBoundary';
import { SkeletonTable, SkeletonModal, SkeletonCard } from './SkeletonUI';
import { useLoadingState } from '../../utils/loadingStateManager';

interface WithLoadingStateOptions {
  loadingComponent?: 'spinner' | 'skeleton' | 'table' | 'modal' | 'custom';
  errorComponent?: 'default' | 'network' | 'timeout' | 'custom';
  showRetry?: boolean;
  preventInteraction?: boolean;
  loadingText?: string;
  customLoader?: React.ComponentType;
  customError?: React.ComponentType<{ error: Error | null; onRetry?: () => void }>;
}

interface LoadingStateProps {
  isLoading?: boolean;
  error?: string | Error | null;
  onRetry?: () => void;
  loadingStateId?: string;
}

/**
 * HOC that adds loading state management to any component
 */
export function withLoadingState<P extends object>(
  WrappedComponent: ComponentType<P>,
  options: WithLoadingStateOptions = {}
) {
  const {
    loadingComponent = 'spinner',
    errorComponent = 'default',
    showRetry = true,
    preventInteraction = true,
    loadingText = 'Loading...',
    customLoader,
    customError
  } = options;

  return React.forwardRef<any, P & LoadingStateProps>((props, ref) => {
    const { 
      isLoading: externalLoading, 
      error: externalError, 
      onRetry: externalRetry,
      loadingStateId,
      ...componentProps 
    } = props;

    // Use loading state manager if ID provided
    const loadingState = loadingStateId ? useLoadingState(loadingStateId) : null;
    
    const isLoading = externalLoading ?? loadingState?.isLoading ?? false;
    const error = externalError ?? loadingState?.error ?? null;
    const onRetry = externalRetry ?? loadingState?.retry;

    // Render loading state
    if (isLoading) {
      if (customLoader) {
        const CustomLoader = customLoader;
        return <CustomLoader />;
      }

      switch (loadingComponent) {
        case 'skeleton':
          return <SkeletonCard showTitle showContent />;
        case 'table':
          return <TableLoader message={loadingText} />;
        case 'modal':
          return <ModalLoader message={loadingText} />;
        case 'spinner':
        default:
          return (
            <LoadingIndicator
              size="md"
              variant="spinner"
              color="primary"
              text={loadingText}
            />
          );
      }
    }

    // Render error state
    if (error) {
      const errorObj = typeof error === 'string' ? new Error(error) : error;
      
      if (customError) {
        const CustomError = customError;
        return <CustomError error={errorObj} onRetry={onRetry} />;
      }

      const retryHandler = showRetry ? onRetry : undefined;

      switch (errorComponent) {
        case 'network':
          return <NetworkError onRetry={retryHandler} />;
        case 'timeout':
          return <TimeoutError onRetry={retryHandler} />;
        case 'default':
        default:
          return (
            <ErrorDisplay
              error={errorObj}
              onRetry={retryHandler}
            />
          );
      }
    }

    // Render wrapped component with interaction prevention if needed
    const wrapperProps = preventInteraction && isLoading 
      ? { 
          style: { pointerEvents: 'none', opacity: 0.6 },
          'aria-busy': true 
        }
      : {};

    return (
      <div {...wrapperProps}>
        <WrappedComponent {...(componentProps as P)} ref={ref} />
      </div>
    );
  });
}

/**
 * Hook for managing async data loading with loading states
 */
export function useAsyncData<T>(
  asyncFunction: () => Promise<T>,
  dependencies: React.DependencyList = [],
  options: {
    immediate?: boolean;
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
    loadingStateId?: string;
  } = {}
) {
  const { immediate = true, onSuccess, onError, loadingStateId } = options;
  
  const [data, setData] = useState<T | null>(null);
  const [localLoading, setLocalLoading] = useState(false);
  const [localError, setLocalError] = useState<Error | null>(null);
  
  const loadingState = loadingStateId ? useLoadingState(loadingStateId) : null;

  const execute = React.useCallback(async () => {
    try {
      if (loadingStateId && loadingState) {
        const result = await loadingState.execute(asyncFunction);
        setData(result);
        onSuccess?.(result);
        return result;
      } else {
        setLocalLoading(true);
        setLocalError(null);
        const result = await asyncFunction();
        setData(result);
        onSuccess?.(result);
        return result;
      }
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      if (!loadingStateId) {
        setLocalError(errorObj);
      }
      onError?.(errorObj);
      throw error;
    } finally {
      if (!loadingStateId) {
        setLocalLoading(false);
      }
    }
  }, [asyncFunction, loadingStateId, loadingState, onSuccess, onError]);

  const retry = React.useCallback(async () => {
    if (loadingStateId && loadingState) {
      return loadingState.retry(asyncFunction);
    } else {
      return execute();
    }
  }, [execute, loadingStateId, loadingState, asyncFunction]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, dependencies);

  return {
    data,
    isLoading: loadingState?.isLoading ?? localLoading,
    error: loadingState?.error ?? localError?.message ?? null,
    execute,
    retry,
    cancel: loadingState?.cancel
  };
}

/**
 * Component wrapper for async data loading
 */
interface AsyncDataProps<T> {
  asyncFunction: () => Promise<T>;
  children: (data: T) => React.ReactNode;
  loadingComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
  onError?: (error: Error) => void;
  dependencies?: React.DependencyList;
  loadingStateId?: string;
}

export function AsyncData<T>({
  asyncFunction,
  children,
  loadingComponent,
  errorComponent,
  onError,
  dependencies = [],
  loadingStateId
}: AsyncDataProps<T>) {
  const { data, isLoading, error, retry } = useAsyncData(
    asyncFunction,
    dependencies,
    { onError, loadingStateId }
  );

  if (isLoading) {
    return loadingComponent || (
      <LoadingIndicator
        size="md"
        variant="spinner"
        color="primary"
        text="Loading data..."
      />
    );
  }

  if (error) {
    return errorComponent || (
      <ErrorDisplay
        error={new Error(error)}
        onRetry={retry}
      />
    );
  }

  if (!data) {
    return null;
  }

  return <>{children(data)}</>;
}

/**
 * Loading state wrapper for modals
 */
export const ModalWithLoading = withLoadingState(
  ({ children }: { children: React.ReactNode }) => <>{children}</>,
  {
    loadingComponent: 'modal',
    errorComponent: 'default',
    showRetry: true,
    preventInteraction: false
  }
);

/**
 * Loading state wrapper for tables
 */
export const TableWithLoading = withLoadingState(
  ({ children }: { children: React.ReactNode }) => <>{children}</>,
  {
    loadingComponent: 'table',
    errorComponent: 'default',
    showRetry: true,
    preventInteraction: true
  }
);

/**
 * Loading state wrapper for cards
 */
export const CardWithLoading = withLoadingState(
  ({ children }: { children: React.ReactNode }) => <>{children}</>,
  {
    loadingComponent: 'skeleton',
    errorComponent: 'default',
    showRetry: true,
    preventInteraction: false
  }
);