import { Injectable } from '@angular/core';
import { Logger } from 'shared';

/**
 * Console Logger for Murmur
 * Simple console-based logging for web environment
 */
@Injectable({
  providedIn: 'root'
})
export class ConsoleLogger implements Logger {
  log(message: string, object?: any): void {
    if (object) {
      console.log(`[Murmur] ${message}`, object);
    } else {
      console.log(`[Murmur] ${message}`);
    }
  }

  error(message: string, object?: any): void {
    if (object) {
      console.error(`[Murmur Error] ${message}`, object);
    } else {
      console.error(`[Murmur Error] ${message}`);
    }
  }

  warn(message: string, object?: any): void {
    if (object) {
      console.warn(`[Murmur Warning] ${message}`, object);
    } else {
      console.warn(`[Murmur Warning] ${message}`);
    }
  }

  workflow(message: string, object?: any): void {
    if (object) {
      console.log(`[Murmur Workflow] ${message}`, object);
    } else {
      console.log(`[Murmur Workflow] ${message}`);
    }
  }

  async instrument(appName: string): Promise<void> {
    // No-op for web console logger
    console.log(`[Murmur] Instrumentation initialized for ${appName}`);
  }
}
