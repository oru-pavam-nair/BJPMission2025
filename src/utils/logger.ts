// Centralized logging utility for development
interface LogLevel {
  ERROR: 0;
  WARN: 1;
  INFO: 2;
  DEBUG: 3;
}

const LOG_LEVELS: LogLevel = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

// Set log level based on environment
const CURRENT_LOG_LEVEL = import.meta.env.DEV ? LOG_LEVELS.INFO : LOG_LEVELS.ERROR;

class Logger {
  private static shouldLog(level: number): boolean {
    return level <= CURRENT_LOG_LEVEL;
  }

  static error(...args: any[]): void {
    if (this.shouldLog(LOG_LEVELS.ERROR)) {
      console.error('❌', ...args);
    }
  }

  static warn(...args: any[]): void {
    if (this.shouldLog(LOG_LEVELS.WARN)) {
      console.warn('⚠️', ...args);
    }
  }

  static info(...args: any[]): void {
    if (this.shouldLog(LOG_LEVELS.INFO)) {
      console.log('ℹ️', ...args);
    }
  }

  static debug(...args: any[]): void {
    if (this.shouldLog(LOG_LEVELS.DEBUG)) {
      console.log('🔍', ...args);
    }
  }

  static success(...args: any[]): void {
    if (this.shouldLog(LOG_LEVELS.INFO)) {
      console.log('✅', ...args);
    }
  }

  static loading(...args: any[]): void {
    if (this.shouldLog(LOG_LEVELS.INFO)) {
      console.log('🔄', ...args);
    }
  }
}

export default Logger;