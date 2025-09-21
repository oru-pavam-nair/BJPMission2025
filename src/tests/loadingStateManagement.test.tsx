/**
 * Loading State Management Tests
 * Tests for comprehensive loading and error state management system
 * Requirements: 8.3, 8.4, 8.5
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { loadingManager, useLoadingState } from '../utils/loadingStateManager';
import { LoadingIndicator, InlineLoader, ButtonLoader, PageLoader } from '../components/ui/LoadingIndicator';
import { ErrorBoundary, ErrorDisplay, NetworkError } from '../components/ui/ErrorBoundary';
import { Skeleton, SkeletonText, SkeletonTable } from '../components/ui/SkeletonUI';
import { withLoadingState, useAsyncData, AsyncData } from '../components/ui/WithLoadingState';

// Mock components for testing
const TestComponent: React.FC<{ data?: string }> = ({ data = 'Test Data' }) => (
  <div data-testid="test-component">{data}</div>
);

const AsyncTestComponent: React.FC = () => {
  const { data, isLoading, error, execute, retry } = useAsyncData(
    async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
      return 'Async Data Loaded';
    },
    [],
    { immediate: false, loadingStateId: 'test-async' }
  );

  return (
    <div>
      <button onClick={execute} data-testid="load-button">
        Load Data
      </button>
      <button onClick={retry} data-testid="retry-button">
        Retry
      </button>
      {isLoading && <div data-testid="loading">Loading...</div>}
      {error && <div data-testid="error">{error}</div>}
      {data && <div data-testid="data">{data}</div>}
    </div>
  );
};

const ErrorThrowingComponent: React.FC = () => {
  throw new Error('Test error');
};

describe('Loading State Management System', () => {
  beforeEach(() => {
    loadingManager.clear();
  });

  afterEach(() => {
    loadingManager.clear();
  });

  describe('LoadingStateManager', () => {
    it('should manage loading states correctly', async () => {
      const operation = {
        id: 'test-operation',
        operation: async () => {
          await new Promise(resolve => setTimeout(resolve, 100));
          return 'success';
        }
      };

      // Start operation
      const promise = loadingManager.execute(operation);
      
      // Check loading state
      expect(loadingManager.getState('test-operation').isLoading).toBe(true);
      expect(loadingManager.hasActiveOperations()).toBe(true);

      // Wait for completion
      const result = await promise;
      
      expect(result).toBe('success');
      expect(loadingManager.getState('test-operation').isLoading).toBe(false);
      expect(loadingManager.hasActiveOperations()).toBe(false);
    });

    it('should handle errors and retry logic', async () => {
      let attemptCount = 0;
      const operation = {
        id: 'test-error',
        operation: async () => {
          attemptCount++;
          if (attemptCount < 3) {
            throw new Error('Test error');
          }
          return 'success after retry';
        },
        options: { maxRetries: 3, retryDelay: 10 }
      };

      try {
        await loadingManager.execute(operation);
      } catch (error) {
        // First attempt should fail
        expect(error.message).toBe('Test error');
      }

      // Wait for retries
      await new Promise(resolve => setTimeout(resolve, 100));

      const state = loadingManager.getState('test-error');
      expect(state.retryCount).toBeGreaterThan(0);
    });

    it('should support manual retry', async () => {
      const operation = {
        id: 'manual-retry',
        operation: vi.fn().mockRejectedValue(new Error('Test error'))
      };

      try {
        await loadingManager.execute(operation);
      } catch (error) {
        // Expected to fail
      }

      // Manual retry should reset retry count
      operation.operation.mockResolvedValue('success');
      const result = await loadingManager.retry(operation);
      
      expect(result).toBe('success');
      expect(loadingManager.getState('manual-retry').retryCount).toBe(0);
    });

    it('should handle timeout', async () => {
      const operation = {
        id: 'timeout-test',
        operation: async () => {
          await new Promise(resolve => setTimeout(resolve, 200));
          return 'should not reach here';
        },
        options: { timeout: 50 }
      };

      await expect(loadingManager.execute(operation)).rejects.toThrow('Operation timed out');
    });
  });

  describe('useLoadingState Hook', () => {
    const TestHookComponent: React.FC<{ operationId: string }> = ({ operationId }) => {
      const { isLoading, error, execute, retry, cancel } = useLoadingState(operationId);

      const handleExecute = () => {
        execute(async () => {
          await new Promise(resolve => setTimeout(resolve, 100));
          return 'Hook Success';
        });
      };

      return (
        <div>
          <button onClick={handleExecute} data-testid="execute">Execute</button>
          <button onClick={retry} data-testid="retry">Retry</button>
          <button onClick={cancel} data-testid="cancel">Cancel</button>
          {isLoading && <div data-testid="loading">Loading</div>}
          {error && <div data-testid="error">{error}</div>}
        </div>
      );
    };

    it('should provide loading state management through hook', async () => {
      render(<TestHookComponent operationId="hook-test" />);

      const executeButton = screen.getByTestId('execute');
      
      fireEvent.click(executeButton);
      
      expect(screen.getByTestId('loading')).toBeInTheDocument();
      
      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      });
    });
  });

  describe('Loading Indicator Components', () => {
    it('should render LoadingIndicator with different variants', () => {
      const { rerender } = render(<LoadingIndicator variant="spinner" />);
      expect(screen.getByRole('status')).toBeInTheDocument();

      rerender(<LoadingIndicator variant="dots" />);
      expect(screen.getByRole('status')).toBeInTheDocument();

      rerender(<LoadingIndicator variant="pulse" />);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('should render InlineLoader', () => {
      render(<InlineLoader />);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('should render ButtonLoader with loading state', () => {
      const { rerender } = render(
        <ButtonLoader loading={false}>Click me</ButtonLoader>
      );
      expect(screen.getByText('Click me')).toBeInTheDocument();

      rerender(<ButtonLoader loading={true}>Click me</ButtonLoader>);
      expect(screen.getByText('Click me')).toBeInTheDocument();
      expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true');
    });

    it('should render PageLoader with progress', () => {
      render(<PageLoader message="Loading..." progress={50} showProgress />);
      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
  });

  describe('Error Boundary Components', () => {
    // Suppress console.error for these tests
    const originalError = console.error;
    beforeEach(() => {
      console.error = vi.fn();
    });
    afterEach(() => {
      console.error = originalError;
    });

    it('should catch and display errors', () => {
      render(
        <ErrorBoundary>
          <ErrorThrowingComponent />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('should provide retry functionality', () => {
      const onRetry = vi.fn();
      render(
        <ErrorDisplay
          error={new Error('Test error')}
          onRetry={onRetry}
        />
      );

      const retryButton = screen.getByText('Try Again');
      fireEvent.click(retryButton);
      
      expect(onRetry).toHaveBeenCalled();
    });

    it('should render NetworkError component', () => {
      const onRetry = vi.fn();
      render(<NetworkError onRetry={onRetry} />);

      expect(screen.getByText('Connection Error')).toBeInTheDocument();
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });
  });

  describe('Skeleton UI Components', () => {
    it('should render Skeleton component', () => {
      render(<Skeleton />);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('should render SkeletonText with multiple lines', () => {
      render(<SkeletonText lines={3} />);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('should render SkeletonTable', () => {
      render(<SkeletonTable rows={5} columns={4} />);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });
  });

  describe('Higher-Order Components', () => {
    it('should wrap component with loading state', () => {
      const WrappedComponent = withLoadingState(TestComponent, {
        loadingComponent: 'spinner'
      });

      const { rerender } = render(
        <WrappedComponent isLoading={false} />
      );
      expect(screen.getByTestId('test-component')).toBeInTheDocument();

      rerender(<WrappedComponent isLoading={true} />);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('should show error state in wrapped component', () => {
      const WrappedComponent = withLoadingState(TestComponent);
      const onRetry = vi.fn();

      render(
        <WrappedComponent 
          error="Test error" 
          onRetry={onRetry}
        />
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });
  });

  describe('useAsyncData Hook', () => {
    it('should handle async data loading', async () => {
      render(<AsyncTestComponent />);

      const loadButton = screen.getByTestId('load-button');
      fireEvent.click(loadButton);

      expect(screen.getByTestId('loading')).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByTestId('data')).toBeInTheDocument();
        expect(screen.getByText('Async Data Loaded')).toBeInTheDocument();
      });
    });
  });

  describe('AsyncData Component', () => {
    it('should render async data with loading states', async () => {
      const asyncFunction = vi.fn().mockResolvedValue('Async Result');

      render(
        <AsyncData asyncFunction={asyncFunction}>
          {(data) => <div data-testid="async-data">{data}</div>}
        </AsyncData>
      );

      // Should show loading initially
      expect(screen.getByText('Loading data...')).toBeInTheDocument();

      // Should show data after loading
      await waitFor(() => {
        expect(screen.getByTestId('async-data')).toBeInTheDocument();
        expect(screen.getByText('Async Result')).toBeInTheDocument();
      });
    });

    it('should handle async data errors', async () => {
      const asyncFunction = vi.fn().mockRejectedValue(new Error('Async Error'));

      render(
        <AsyncData asyncFunction={asyncFunction}>
          {(data) => <div data-testid="async-data">{data}</div>}
        </AsyncData>
      );

      await waitFor(() => {
        expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      });
    });
  });

  describe('Integration Tests', () => {
    it('should prevent user interactions during loading', () => {
      const WrappedComponent = withLoadingState(TestComponent, {
        preventInteraction: true
      });

      render(<WrappedComponent isLoading={true} />);
      
      const wrapper = screen.getByRole('status').parentElement?.parentElement;
      expect(wrapper).toHaveStyle({ pointerEvents: 'none' });
    });

    it('should handle multiple concurrent operations', async () => {
      const operation1 = {
        id: 'op1',
        operation: async () => {
          await new Promise(resolve => setTimeout(resolve, 50));
          return 'result1';
        }
      };

      const operation2 = {
        id: 'op2',
        operation: async () => {
          await new Promise(resolve => setTimeout(resolve, 100));
          return 'result2';
        }
      };

      const promise1 = loadingManager.execute(operation1);
      const promise2 = loadingManager.execute(operation2);

      expect(loadingManager.hasActiveOperations()).toBe(true);
      expect(loadingManager.getActiveOperations()).toHaveLength(2);

      const results = await Promise.all([promise1, promise2]);
      
      expect(results).toEqual(['result1', 'result2']);
      expect(loadingManager.hasActiveOperations()).toBe(false);
    });
  });

  describe('Accessibility', () => {
    it('should provide proper ARIA labels for loading states', () => {
      render(<LoadingIndicator text="Loading content" />);
      
      expect(screen.getByLabelText('Loading')).toBeInTheDocument();
      expect(screen.getByText('Loading content')).toBeInTheDocument();
    });

    it('should provide proper ARIA labels for error states', () => {
      render(<ErrorDisplay error={new Error('Test error')} />);
      
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByLabelText(/assertive/)).toBeInTheDocument();
    });

    it('should support screen readers with skeleton UI', () => {
      render(<SkeletonText lines={2} />);
      
      expect(screen.getByLabelText('Loading text content')).toBeInTheDocument();
    });
  });
});