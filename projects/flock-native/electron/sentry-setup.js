const { app } = require('electron');
const path = require('path');
const { createRequire } = require('module');

/**
 * Sentry Setup Module
 * Handles Sentry initialization and configuration for the main process
 */
class SentrySetup {
  constructor() {
    this.sentry = null;
    this.init = null;
    this.ipcMode = null;
    this.sentryConfig = null;
  }

  /**
   * Load Sentry configuration and initialize
   */
  async initialize() {
    try {
      // Try resolve/load Sentry early for diagnostics (before any init)
      try {
        // Resolve modules relative to the app root (inside app.asar when packaged)
        const appRoot = (() => {
          try {
            return app.getAppPath();
          } catch (_) {
            return __dirname;
          }
        })();
        const appRequire = createRequire(path.join(appRoot, '/'));
        const resolvedPath = appRequire.resolve('@sentry/electron/main');
        console.log('🔍 [SENTRY] Resolved @sentry/electron/main at:', resolvedPath);
        const sentryMain = appRequire('@sentry/electron/main');
        this.sentry = sentryMain;
        this.init = sentryMain.init;
        this.ipcMode = sentryMain.IPCMode;
      } catch (err) {
        console.error('❌ [SENTRY] Cannot resolve/load @sentry/electron/main:', err && err.message ? err.message : err);
        return false;
      }

      // Initialize Sentry
      return this.initializeSentry();
    } catch (error) {
      console.error('❌ [SENTRY] Failed to initialize Sentry:', error);
      return false;
    }
  }

  /**
   * Initialize Sentry with configuration
   */
  initializeSentry() {
    // Always use hardcoded DSN for proof-of-life testing
    const sentryDsn = 'https://c525bad84d7baf7a00631c940b44a980@o4506526838620160.ingest.us.sentry.io/4510187648712704';

    if (sentryDsn && this.init) {
      this.init({
        dsn: sentryDsn,

        // Debug mode - logs to console (more verbose on macOS)
        debug: true,

        // Use protocol-based IPC for robust cross-process context merging
        ipcMode: this.ipcMode.Protocol,

        // Environment detection
        environment: app.isPackaged ? 'production' : 'development',

        // Release version
        release: 'flock-native@0.4.8',

        // Sample rate for performance monitoring
        tracesSampleRate: app.isPackaged ? 0.1 : 1.0,

        // Enhanced macOS-specific configuration
        integrations: [
          // Note: MainProcessSession is not available in this version
          // The default integrations will handle session tracking
        ],

        // Filter sensitive data
        beforeSend: this.beforeSend.bind(this),

        // Ignore common noise
        ignoreErrors: [],
      });

      console.log('✅ [SENTRY] Initialized for Electron main process');
      console.log('🔍 [SENTRY] Environment:', app.isPackaged ? 'production' : 'development');
      console.log('🔍 [SENTRY] Using:', process.env.NATIVE_SENTRY_DSN_MAIN || (this.sentryConfig && this.sentryConfig.mainDsn) ? 'production DSN' : 'development DSN');
      return true;
    } else {
      if (!sentryDsn) {
        console.log('🔍 [SENTRY] Set NATIVE_SENTRY_DSN_MAIN environment variable to enable error tracking in production');
      }
      if (!this.init) {
        console.log('🔍 [SENTRY] init function unavailable (module not loaded). Skipping Sentry init.');
      }
      return false;
    }
  }

  /**
   * Filter sensitive data before sending to Sentry
   */
  beforeSend(event, hint) {
    // Add platform context for better debugging
    if (!event.contexts) {
      event.contexts = {};
    }
    event.contexts.platform = {
      name: process.platform,
      arch: process.arch,
      version: process.version
    };

    // Remove sensitive environment variables
    if (event.contexts?.runtime?.env) {
      const env = event.contexts.runtime.env;
      delete env.BLUESKY_PASSWORD;
      delete env.BLUESKY_USERNAME;
      delete env.NATIVE_SENTRY_DSN;
      delete env.SENTRY_DSN; // Also filter generic one just in case
    }

    // Remove sensitive breadcrumbs
    if (event.breadcrumbs) {
      event.breadcrumbs = event.breadcrumbs.filter(breadcrumb => {
        const msg = breadcrumb.message || '';
        if (msg.includes('password') ||
            msg.includes('token') ||
            msg.includes('BLUESKY_PASSWORD')) {
          return false;
        }
        return true;
      });
    }

    return event;
  }

  /**
   * Capture an exception with Sentry
   */
  captureException(error, options = {}) {
    if (this.sentry && typeof this.sentry.captureException === 'function') {
      return this.sentry.captureException(error, options);
    }
    return null;
  }

  /**
   * Capture a message with Sentry
   */
  captureMessage(message, options = {}) {
    if (this.sentry && typeof this.sentry.captureMessage === 'function') {
      return this.sentry.captureMessage(message, options);
    }
    return null;
  }

  /**
   * Get the Sentry instance
   */
  getSentry() {
    return this.sentry;
  }
}

module.exports = SentrySetup;
