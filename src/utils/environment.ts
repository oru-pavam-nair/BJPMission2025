// Environment configuration and console management
export const isDevelopment = import.meta.env.DEV;
export const isProduction = import.meta.env.PROD;

// Console management for cleaner production builds
export const setupConsoleManagement = () => {
  if (isProduction) {
    // In production, suppress most console logs except errors
    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalInfo = console.info;
    const originalDebug = console.debug;

    console.log = () => {};
    console.info = () => {};
    console.debug = () => {};
    console.warn = (message: any, ...args: any[]) => {
      // Only show warnings that are important
      if (typeof message === 'string' && message.includes('React')) {
        originalWarn(message, ...args);
      }
    };

    // Keep errors visible
    // console.error remains unchanged
  }
};

// Performance monitoring
export const performanceConfig = {
  enableLogging: isDevelopment,
  enableMetrics: isDevelopment,
  enableDebugMode: isDevelopment
};

// Feature flags
export const featureFlags = {
  enableDetailedLogging: isDevelopment,
  enablePerformanceMonitoring: isDevelopment,
  enableDebugPanel: isDevelopment,
  enableConsoleWarnings: isDevelopment
};

export default {
  isDevelopment,
  isProduction,
  performanceConfig,
  featureFlags,
  setupConsoleManagement
};