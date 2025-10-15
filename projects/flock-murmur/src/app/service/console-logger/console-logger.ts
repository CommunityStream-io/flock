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
  log(message: string, ...args: any[]): void {
    console.log(`[Murmur] ${message}`, ...args);
  }

  error(message: string, ...args: any[]): void {
    console.error(`[Murmur Error] ${message}`, ...args);
  }

  warn(message: string, ...args: any[]): void {
    console.warn(`[Murmur Warning] ${message}`, ...args);
  }

  debug(message: string, ...args: any[]): void {
    if (!window.location.hostname.includes('localhost')) {
      return; // Only log debug in development
    }
    console.debug(`[Murmur Debug] ${message}`, ...args);
  }
}
