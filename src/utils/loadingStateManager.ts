/**
 * Centralized Loading State Management System
 * Provides consistent loading states, error handling, and retry mechanisms
 * Requirements: 8.3, 8.4, 8.5
 */

export interface LoadingState {
  isLoading: boolean;
  error: string | null;
  retryCount: number;
  lastAttempt: number | null;
}

export interface LoadingOptions {
  maxRetries?: number;
  retryDelay?: number;
  timeout?: number;
  preventUserInteraction?: boolean;
}

export interface AsyncOperation<T> {
  id: string;
  operation: () => Promise<T>;
  options?: LoadingOptions;
}

class LoadingStateManager {
  private states = new Map<string, LoadingState>();
  private retryTimeouts = new Map<string, NodeJS.Timeout>();
  private listeners = new Map<string, Set<(state: LoadingState) => void>>();

  private getDefaultState(): LoadingState {
    return {
      isLoading: false,
      error: null,
      retryCount: 0,
      lastAttempt: null
    };
  }

  private getDefaultOptions(): Required<LoadingOptions> {
    return {
      maxRetries: 3,
      retryDelay: 1000,
      timeout: 30000,
      preventUserInteraction: true
    };
  }

  /**
   * Get current loading state for an operation
   */
  getState(id: string): LoadingState {
    return this.states.get(id) || this.getDefaultState();
  }

  /**
   * Subscribe to loading state changes
   */
  subscribe(id: string, listener: (state: LoadingState) => void): () => void {
    if (!this.listeners.has(id)) {
      this.listeners.set(id, new Set());
    }
    this.listeners.get(id)!.add(listener);

    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(id);
      if (listeners) {
        listeners.delete(listener);
        if (listeners.size === 0) {
          this.listeners.delete(id);
        }
      }
    };
  }

  /**
   * Update state and notify listeners
   */
  private updateState(id: string, updates: Partial<LoadingState>): void {
    const currentState = this.getState(id);
    const newState = { ...currentState, ...updates };
    this.states.set(id, newState);

    // Notify listeners
    const listeners = this.listeners.get(id);
    if (listeners) {
      listeners.forEach(listener => listener(newState));
    }
  }

  /**
   * Execute an async operation with loading state management
   */
  async execute<T>(operation: AsyncOperation<T>): Promise<T> {
    const { id, operation: asyncFn, options = {} } = operation;
    const config = { ...this.getDefaultOptions(), ...options };

    // Clear any existing retry timeout
    const existingTimeout = this.retryTimeouts.get(id);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
      this.retryTimeouts.delete(id);
    }

    // Set loading state
    this.updateState(id, {
      isLoading: true,
      error: null,
      lastAttempt: Date.now()
    });

    try {
      // Create timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Operation timed out after ${config.timeout}ms`));
        }, config.timeout);
      });

      // Race between operation and timeout
      const result = await Promise.race([asyncFn(), timeoutPromise]);

      // Success - reset state
      this.updateState(id, {
        isLoading: false,
        error: null,
        retryCount: 0
      });

      return result;
    } catch (error) {
      const currentState = this.getState(id);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';

      // Update error state
      this.updateState(id, {
        isLoading: false,
        error: errorMessage,
        retryCount: currentState.retryCount + 1
      });

      // Check if we should retry
      if (currentState.retryCount < config.maxRetries) {
        // Schedule retry
        const retryTimeout = setTimeout(() => {
          this.retryTimeouts.delete(id);
          this.execute(operation);
        }, config.retryDelay * Math.pow(2, currentState.retryCount)); // Exponential backoff

        this.retryTimeouts.set(id, retryTimeout);
      }

      throw error;
    }
  }

  /**
   * Manually retry an operation
   */
  async retry<T>(operation: AsyncOperation<T>): Promise<T> {
    const currentState = this.getState(operation.id);
    
    // Reset retry count for manual retry
    this.updateState(operation.id, {
      retryCount: 0,
      error: null
    });

    return this.execute(operation);
  }

  /**
   * Cancel an operation and clear its state
   */
  cancel(id: string): void {
    const timeout = this.retryTimeouts.get(id);
    if (timeout) {
      clearTimeout(timeout);
      this.retryTimeouts.delete(id);
    }

    this.updateState(id, {
      isLoading: false,
      error: null,
      retryCount: 0
    });
  }

  /**
   * Clear all states and timeouts
   */
  clear(): void {
    this.retryTimeouts.forEach(timeout => clearTimeout(timeout));
    this.retryTimeouts.clear();
    this.states.clear();
    this.listeners.clear();
  }

  /**
   * Check if any operations are currently loading
   */
  hasActiveOperations(): boolean {
    return Array.from(this.states.values()).some(state => state.isLoading);
  }

  /**
   * Get all active loading operations
   */
  getActiveOperations(): string[] {
    return Array.from(this.states.entries())
      .filter(([_, state]) => state.isLoading)
      .map(([id]) => id);
  }
}

// Export singleton instance
export const loadingManager = new LoadingStateManager();

/**
 * React hook for using loading state
 */
export function useLoadingState(id: string) {
  const [state, setState] = React.useState<LoadingState>(() => 
    loadingManager.getState(id)
  );

  React.useEffect(() => {
    const unsubscribe = loadingManager.subscribe(id, setState);
    return unsubscribe;
  }, [id]);

  const execute = React.useCallback(
    async <T>(operation: () => Promise<T>, options?: LoadingOptions): Promise<T> => {
      return loadingManager.execute({ id, operation, options });
    },
    [id]
  );

  const retry = React.useCallback(
    async <T>(operation: () => Promise<T>, options?: LoadingOptions): Promise<T> => {
      return loadingManager.retry({ id, operation, options });
    },
    [id]
  );

  const cancel = React.useCallback(() => {
    loadingManager.cancel(id);
  }, [id]);

  return {
    ...state,
    execute,
    retry,
    cancel
  };
}

// Import React for the hook
import React from 'react';