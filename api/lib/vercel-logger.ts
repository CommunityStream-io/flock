import { Logger } from '@straiforos/instagramtobluesky';

/**
 * Vercel Logger Implementation
 * Provides logging functionality for serverless environment
 */
export class VercelLogger implements Logger {
  private sessionId: string;

  constructor(sessionId: string) {
    this.sessionId = sessionId;
  }

  log(message: string, ...args: any[]): void {
    console.log(`[${this.sessionId}] ${message}`, ...args);
  }

  error(message: string, error?: Error | any): void {
    console.error(`[${this.sessionId}] ERROR: ${message}`, error);
  }

  warn(message: string, ...args: any[]): void {
    console.warn(`[${this.sessionId}] WARN: ${message}`, ...args);
  }

  info(message: string, ...args: any[]): void {
    console.info(`[${this.sessionId}] INFO: ${message}`, ...args);
  }

  debug(message: string, ...args: any[]): void {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[${this.sessionId}] DEBUG: ${message}`, ...args);
    }
  }
}

/**
 * Create a Vercel logger instance
 */
export function createVercelLogger(serviceName: string, sessionId: string): Logger {
  return new VercelLogger(`${serviceName}-${sessionId}`);
}
