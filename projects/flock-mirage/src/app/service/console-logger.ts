import { Injectable } from '@angular/core';
import { Logger } from 'shared';

/**
 * Logs in the console without needing a specific logging/telemetry service.
 * @see SentryLogger
 */
@Injectable({
  providedIn: 'root'
})
export class ConsoleLogger implements Logger {
  log(message: string, object?: any): void {
    console.log('LOG:', message, object);
    
    // Special handling for router logs
    if (message.includes('ROUTER:')) {
      console.log('🧭 ROUTER LOG:', message, object);
    }
  }
  error(message: string, object?: any): void {
    console.error('ERROR:', message, object);
    
    // Special handling for router errors
    if (message.includes('ROUTER:')) {
      console.error('❌ ROUTER ERROR:', message, object);
    }
  }
  warn(message: string, object?: any): void {
    console.warn('WARN:', message, object);
    
    // Special handling for router warnings
    if (message.includes('ROUTER:')) {
      console.warn('⚠️ ROUTER WARN:', message, object);
    }
  }
  workflow(message: string, object?: any): void {
    console.log('WORKFLOW:', message, object);
  }
  async instrument(appName: string): Promise<void> {
    console.log('INSTRUMENT:', appName);
  }
}
