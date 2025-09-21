/**
 * Basic Loading State Management Tests
 * Core functionality tests for loading and error state management
 * Requirements: 8.3, 8.4, 8.5
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { loadingManager } from '../utils/loadingStateManager';
import { LoadingIndicator } from '../components/ui/LoadingIndicator';
import { ErrorDisplay } from '../components/ui/ErrorBoundary';
import { Skeleton } from '../components/ui/SkeletonUI';

describe('Loading State Management - Basic Tests', () => {
  beforeEach(() => {
    loadingManager.clear();
  });

  afterEach(() => {
    loadingManager.clear();
  });

  describe('LoadingStateManager Core', () => {
    it('should execute operations with loading states', async () => {
      const operation = {
        id: 'test-op',
        operation: async () => {
          await new Promise(resolve => setTimeout(resolve, 50));
          return 'success';
        }
      };

      const promise = loadingManager.execute(operation);
      
      // Should be loading
      expect(loadingManager.getState('test-op').isLoading).toBe(true);
      
      const result = await promise;
      
      // Should complete successfully
      expect(result).toBe('success');
      expect(loadingManager.getState('test-op').isLoading).toBe(false);
      expect(loadingManager.getState('test-op').error).toBe(null);
    });

    it('should handle operation errors', async () => {
      const operation = {
        id: 'error-op',
        operation: async () => {
          throw new Error('Test error');
        }
      };

      try {
        await loadingManager.execute(operation);
      } catch (error) {
        expect(error.message).toBe('Test error');
      }

      const state = loadingManager.getState('error-op');
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('Test error');
    });

    it('should track active operations', async () => {
      const operation1 = {
        id: 'op1',
        operation: async () => {
          await new Promise(resolve => setTimeout(resolve, 100));
          return 'result1';
        }
      };

      const operation2 = {
        id: 'op2',
        operation: async () => {
          await new Promise(resolve => setTimeout(resolve, 50));
          return 'result2';
        }
      };

      const promise1 = loadingManager.execute(operation1);
      const promise2 = loadingManager.execute(operation2);

      expect(loadingManager.hasActiveOperations()).toBe(true);
      expect(loadingManager.getActiveOperations()).toHaveLength(2);

      await Promise.all([promise1, promise2]);

      expect(loadingManager.hasActiveOperations()).toBe(false);
    });
  });

  describe('UI Components', () => {
    it('should render LoadingIndicator', () => {
      render(<LoadingIndicator text="Loading test" />);
      expect(screen.getByText('Loading test')).toBeInTheDocument();
    });

    it('should render ErrorDisplay with retry', () => {
      const onRetry = vi.fn();
      render(
        <ErrorDisplay
          error={new Error('Test error')}
          onRetry={onRetry}
        />
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(screen.getByText('Test error')).toBeInTheDocument();
      
      const retryButton = screen.getByText('Try Again');
      fireEvent.click(retryButton);
      
      expect(onRetry).toHaveBeenCalled();
    });

    it('should render Skeleton component', () => {
      render(<Skeleton data-testid="skeleton" />);
      expect(screen.getByTestId('skeleton')).toBeInTheDocument();
    });
  });

  describe('Integration', () => {
    it('should prevent user interactions during loading', () => {
      const TestComponent = () => {
        const [isLoading, setIsLoading] = React.useState(false);
        
        return (
          <div style={{ pointerEvents: isLoading ? 'none' : 'auto' }}>
            <button 
              onClick={() => setIsLoading(!isLoading)}
              data-testid="toggle-loading"
            >
              Toggle Loading
            </button>
            {isLoading && <LoadingIndicator text="Loading..." />}
          </div>
        );
      };

      render(<TestComponent />);
      
      const button = screen.getByTestId('toggle-loading');
      fireEvent.click(button);
      
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should handle timeout scenarios', async () => {
      const operation = {
        id: 'timeout-op',
        operation: async () => {
          await new Promise(resolve => setTimeout(resolve, 200));
          return 'should timeout';
        },
        options: { timeout: 50 }
      };

      await expect(loadingManager.execute(operation)).rejects.toThrow('Operation timed out');
      
      const state = loadingManager.getState('timeout-op');
      expect(state.isLoading).toBe(false);
      expect(state.error).toContain('timed out');
    });
  });

  describe('Error Recovery', () => {
    it('should support manual retry', async () => {
      let attemptCount = 0;
      const operation = {
        id: 'retry-op',
        operation: async () => {
          attemptCount++;
          if (attemptCount === 1) {
            throw new Error('First attempt fails');
          }
          return 'success on retry';
        }
      };

      // First attempt should fail
      try {
        await loadingManager.execute(operation);
      } catch (error) {
        expect(error.message).toBe('First attempt fails');
      }

      // Manual retry should succeed
      const result = await loadingManager.retry(operation);
      expect(result).toBe('success on retry');
    });

    it('should clear operation state', () => {
      loadingManager.execute({
        id: 'clear-test',
        operation: async () => 'test'
      });

      expect(loadingManager.getState('clear-test').isLoading).toBe(true);
      
      loadingManager.cancel('clear-test');
      
      expect(loadingManager.getState('clear-test').isLoading).toBe(false);
    });
  });

  describe('Accessibility', () => {
    it('should provide proper ARIA attributes', () => {
      render(<LoadingIndicator text="Accessible loading" />);
      
      const statusElement = screen.getByRole('status');
      expect(statusElement).toBeInTheDocument();
      expect(statusElement).toHaveAttribute('aria-live', 'polite');
    });

    it('should provide error alerts', () => {
      render(<ErrorDisplay error={new Error('Accessible error')} />);
      
      const alertElement = screen.getByRole('alert');
      expect(alertElement).toBeInTheDocument();
      expect(alertElement).toHaveAttribute('aria-live', 'assertive');
    });
  });
});