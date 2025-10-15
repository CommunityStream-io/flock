import { Injectable } from '@angular/core';
import * as Sentry from '@sentry/angular';
import { Logger } from './interfaces/logger';

export interface SentryConfig {
  dsn: string | null;
  environment?: string;
  tracesSampleRate?: number;
}

/**
 * Sentry-based logger implementation
 * Provides error tracking, performance monitoring, and breadcrumbs
 */
@Injectable({
  providedIn: 'root'
})
export class SentryLogger implements Logger {
  private initialized = false;
  private appName = 'Unknown';
  private config: SentryConfig | null = null;

  /**
   * Initialize Sentry with DSN and configuration
   * @param appName The name of the application (flock-native, flock-mirage, etc.)
   * @param config Optional Sentry configuration from environment
   */
  async instrument(appName: string, config?: SentryConfig): Promise<void> {
    this.appName = appName;
    this.config = config || null;

    // Get Sentry DSN from config or fallback
    const sentryDsn = this.config?.dsn || this.getSentryDsn();
    
    if (!sentryDsn) {
      console.warn('🔍 [SentryLogger] No Sentry DSN found, logging will be console-only');
      this.initialized = false;
      return;
    }

    try {
      Sentry.init({
        dsn: sentryDsn,
        
        // Set environment (development, staging, production)
        environment: this.config?.environment || this.getEnvironment(),
        
        // Release version from package.json
        release: this.getRelease(),
        
        // Sample rate for performance monitoring (0.0 to 1.0)
        tracesSampleRate: this.config?.tracesSampleRate ?? (this.getEnvironment() === 'production' ? 0.1 : 1.0),
        
        // Breadcrumbs
        integrations: [
          // Automatically capture breadcrumbs from browser
          Sentry.breadcrumbsIntegration({
            console: true,
            dom: true,
            fetch: true,
            history: true,
            sentry: true,
            xhr: true
          }),
          
          // Capture HTTP requests
          Sentry.httpClientIntegration(),
        ],
        
        // Filter out sensitive data
        beforeSend(event, hint) {
          // Remove sensitive environment variables
          
          // Remove sensitive breadcrumbs
          if (event.breadcrumbs) {
            event.breadcrumbs = event.breadcrumbs.filter(breadcrumb => {
              if (breadcrumb.message?.includes('password') || 
                  breadcrumb.message?.includes('token')) {
                return false;
              }
              return true;
            });
          }
          
          return event;
        },
        
        // Ignore certain errors
        ignoreErrors: [
          // Browser extensions
          'top.GLOBALS',
          // Random plugins/extensions
          'originalCreateNotification',
          'canvas.contentDocument',
          'MyApp_RemoveAllHighlights',
          // Network errors that are expected
          'NetworkError',
          'Network request failed',
          // Expected navigation errors
          'Non-Error promise rejection captured',
        ],
      });

      // Set user context
      Sentry.setContext('app', {
        name: appName,
        platform: this.getPlatform()
      });

      this.initialized = true;
      console.log(`✅ [SentryLogger] Initialized for ${appName} in ${this.getEnvironment()} environment`);
    } catch (error) {
      console.error('❌ [SentryLogger] Failed to initialize:', error);
      this.initialized = false;
    }
  }

  /**
   * Log general information (creates breadcrumb)
   */
  log(message: string, object?: any): void {
    console.log(`🦅 LOG: ${message}`, object);
    
    if (this.initialized) {
      Sentry.addBreadcrumb({
        category: 'log',
        message: message,
        level: 'info',
        data: object
      });
    }
  }

  /**
   * Log error messages and capture in Sentry
   */
  error(message: string, object?: any): void {
    console.error(`❌ ERROR: ${message}`, object);
    
    if (this.initialized) {
      Sentry.captureException(object instanceof Error ? object : new Error(message), {
        level: 'error',
        tags: {
          app: this.appName
        },
        extra: {
          message: message,
          data: object
        }
      });
    }
  }

  /**
   * Log warning messages
   */
  warn(message: string, object?: any): void {
    console.warn(`⚠️ WARN: ${message}`, object);
    
    if (this.initialized) {
      Sentry.addBreadcrumb({
        category: 'warning',
        message: message,
        level: 'warning',
        data: object
      });
    }
  }

  /**
   * Log workflow-related information (business logic tracking)
   */
  workflow(message: string, object?: any): void {
    console.log(`🦅 WORKFLOW: ${message}`, object);
    
    if (this.initialized) {
      Sentry.addBreadcrumb({
        category: 'workflow',
        message: message,
        level: 'info',
        data: object
      });
    }
  }

  /**
   * Get Sentry DSN from window configuration (fallback)
   * Prefer passing config via instrument() method from environment
   */
  private getSentryDsn(): string | null {
    // Check window (for browser environment)
    if (typeof window !== 'undefined' && (window as any).SENTRY_DSN) {
      return (window as any).SENTRY_DSN;
    }
    
    // Return null if not configured (Sentry won't be enabled)
    return null;
  }

  /**
   * Determine the current environment
   */
  private getEnvironment(): string {
    // Check if we're in Electron
    if (typeof window !== 'undefined' && (window as any).electronAPI) {
      return 'electron';
    }
    
    // Check hostname for staging/production
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
        return 'development';
      }
      if (hostname.includes('staging')) {
        return 'staging';
      }
      return 'production';
    }
    
    return 'development';
  }

  /**
   * Get release version from package.json
   */
  private getRelease(): string {
    // This should be injected at build time
    return `${this.appName}@0.4.8`; // TODO: Read from package.json at build time
  }

  /**
   * Get platform information
   */
  private getPlatform(): string {
    if (typeof window !== 'undefined' && (window as any).electronAPI) {
      return 'electron';
    }
    return 'web';
  }
}
