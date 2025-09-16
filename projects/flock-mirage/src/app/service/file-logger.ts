import { Injectable } from '@angular/core';
import { Logger } from 'shared';

/**
 * Logs to console with enhanced formatting for test environments.
 * In browser environment, this acts as a console logger with structured output.
 */
@Injectable({
  providedIn: 'root'
})
export class FileLogger implements Logger {
  private logPrefix = '[TEST-LOGGER]';

  private writeToConsole(level: string, message: string, object?: any): void {
    const timestamp = new Date().toISOString();
    const logEntry = `${this.logPrefix} [${timestamp}] ${level}: ${message}`;
    
    if (object) {
      console.log(logEntry, object);
    } else {
      console.log(logEntry);
    }
  }

  log(message: string, object?: any): void {
    this.writeToConsole('LOG', message, object);
    
    // Special handling for router logs
    if (message.includes('ROUTER:')) {
      console.log('🧭 ROUTER LOG:', message, object);
    }
  }

  error(message: string, object?: any): void {
    this.writeToConsole('ERROR', message, object);
    
    // Special handling for router errors
    if (message.includes('ROUTER:')) {
      console.error('❌ ROUTER ERROR:', message, object);
    }
  }

  warn(message: string, object?: any): void {
    this.writeToConsole('WARN', message, object);
    
    // Special handling for router warnings
    if (message.includes('ROUTER:')) {
      console.warn('⚠️ ROUTER WARN:', message, object);
    }
  }

  workflow(message: string, object?: any): void {
    this.writeToConsole('WORKFLOW', message, object);
  }

  async instrument(appName: string): Promise<void> {
    this.writeToConsole('INSTRUMENT', appName);
  }
}
