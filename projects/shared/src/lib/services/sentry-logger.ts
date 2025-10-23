import { Injectable, Inject, Optional } from '@angular/core';
import * as Sentry from '@sentry/angular';
import { Logger } from './interfaces/logger';

export interface SentryConfig {
  dsn: string | null;
  environment?: string;
  tracesSampleRate?: number;
}

export interface AppEnvironment {
  production: boolean;
  version?: string;
  sentry?: SentryConfig;
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

  constructor(@Optional() @Inject('APP_ENVIRONMENT') private readonly environment?: AppEnvironment) {}

  /**
   * Initialize Sentry with DSN and configuration
   * @param appName The name of the application (flock-native, flock-mirage, etc.)
   * @param config Optional Sentry configuration from environment
   */
  async instrument(appName: string, config?: SentryConfig): Promise<void> {
    this.appName = appName;
    this.config = config || null;

    // Get Sentry DSN from config or environment fallback
    const sentryDsn = this.config?.dsn || this.environment?.sentry?.dsn || null;

    if (!sentryDsn) {
      console.warn('🔍 [SentryLogger] No Sentry DSN found, logging will be console-only');
      this.initialized = false;
      return;
    }

    try {
      Sentry.init({
        dsn: sentryDsn,

        // Debug mode - logs to console
        debug: true,

        // Set environment (development, staging, production)
        environment: this.config?.environment || this.environment?.sentry?.environment || (this.environment?.production ? 'production' : 'development'),

        // Release version from package.json
        release: await this.getRelease(),

        // Sample rate for performance monitoring (0.0 to 1.0)
        tracesSampleRate: this.config?.tracesSampleRate ?? this.environment?.sentry?.tracesSampleRate ?? (this.environment?.production ? 0.1 : 1.0),

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
      console.log(`✅ [SentryLogger] Initialized for ${appName} in ${this.config?.environment || (this.environment?.production ? 'production' : 'development')} environment`);
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
   * Get Sentry DSN from environment (fallback)
   */
  private getSentryDsn(): string | null {
    return this.environment?.sentry?.dsn || null;
  }


  /**
   * Get release version from environment variable or fallback methods
   */
  private getRelease(): string {
    try {
      if(this.environment?.version) {
        return `${this.appName}@${this.environment?.version}`;
      }
      // If all else fails, return unknown version
      console.log('🔍 [SentryLogger] Could not determine version, using unknown');
      return `${this.appName}@unknown`;
    } catch (error) {
      console.log('🔍 [SentryLogger] Failed to get release version:', error);
      return `${this.appName}@unknown`;
    }
  }

  /**
   * Get platform information
   */
  private getPlatform(): string {
    // Simple platform detection - apps can override this if needed
    if (typeof window !== 'undefined' && (window as any).electronAPI) {
      return 'electron';
    }
    return 'web';
  }
}
