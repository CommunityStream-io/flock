const { app } = require('electron');
const path = require('path');
const { createRequire } = require('module');

/**
 * Sentry Manager Class
 * 
 * Handles Sentry initialization with kill switch and performance monitoring.
 * Allows disabling Sentry in development or when explicitly requested.
 */
class SentryManager {
  constructor() {
    this.sentry = null;
    this.init = null;
    this.ipcMode = null;
    this.isEnabled = true;
    this.isInitialized = false;
    this.initializationTime = null;
    this.failureReason = null;
  }

  /**
   * Check if Sentry should be enabled
   * @returns {boolean} Whether Sentry should be initialized
   */
  shouldEnableSentry() {
    // Check environment variables first
    if (process.env.SENTRY_DISABLED === 'true' || process.env.DISABLE_SENTRY === 'true') {
      console.log('🔍 [SENTRY] Disabled by environment variable');
      return false;
    }

    // Check if explicitly enabled
    if (process.env.ENABLE_SENTRY === 'true') {
      console.log('🔍 [SENTRY] Explicitly enabled by environment variable');
      return true;
    }

    // In development, disable by default for faster startup
    if (!app.isPackaged && process.env.NODE_ENV !== 'production') {
      console.log('🔍 [SENTRY] Disabled in development mode (set ENABLE_SENTRY=true to enable)');
      return false;
    }

    // In production, enable by default
    console.log('🔍 [SENTRY] Enabled in production mode');
    return true;
  }

  /**
   * Get Sentry configuration
   * @returns {Object} Sentry configuration object
   */
  getSentryConfig() {
    // Use environment-specific DSN if available
    const sentryDsn = process.env.NATIVE_SENTRY_DSN_MAIN || 
                     process.env.SENTRY_DSN || 
                     'https://c525bad84d7baf7a00631c940b44a980@o4506526838620160.ingest.us.sentry.io/4510187648712704';

    return {
      dsn: sentryDsn,
      debug: process.env.SENTRY_DEBUG === 'true' || (!app.isPackaged && process.env.NODE_ENV !== 'production'),
      environment: app.isPackaged ? 'production' : 'development',
      release: 'flock-native@0.4.8',
      tracesSampleRate: app.isPackaged ? 0.1 : (process.env.SENTRY_DEBUG === 'true' ? 1.0 : 0.1),
      integrations: [],
      beforeSend: this.beforeSend.bind(this),
      ignoreErrors: []
    };
  }

  /**
   * Initialize Sentry with performance tracking
   * @returns {Promise<boolean>} Success status
   */
  async initialize() {
    const startTime = Date.now();
    
    try {
      // Check if Sentry should be enabled
      this.isEnabled = this.shouldEnableSentry();
      
      if (!this.isEnabled) {
        console.log('🔍 [SENTRY] Skipping initialization (disabled)');
        this.initializationTime = Date.now() - startTime;
        return false;
      }

      console.log('🔍 [SENTRY] Initializing Sentry...');

      // Try to resolve and load Sentry
      await this.loadSentryModule();
      
      // Initialize Sentry with configuration
      await this.initializeSentry();
      
      this.isInitialized = true;
      this.initializationTime = Date.now() - startTime;
      
      console.log(`✅ [SENTRY] Initialized successfully in ${this.initializationTime}ms`);
      return true;

    } catch (error) {
      this.failureReason = error.message;
      this.initializationTime = Date.now() - startTime;
      
      console.error(`❌ [SENTRY] Failed to initialize after ${this.initializationTime}ms:`, error.message);
      return false;
    }
  }

  /**
   * Load the Sentry module
   * @returns {Promise<void>}
   */
  async loadSentryModule() {
    try {
      // Resolve modules relative to the app root
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
      throw new Error(`Cannot resolve/load @sentry/electron/main: ${err.message}`);
    }
  }

  /**
   * Initialize Sentry with configuration
   * @returns {Promise<void>}
   */
  async initializeSentry() {
    if (!this.init) {
      throw new Error('Sentry init function unavailable');
    }

    const config = this.getSentryConfig();
    
    // Add IPC mode to config
    if (this.ipcMode) {
      config.ipcMode = this.ipcMode.Protocol;
    }

    // Initialize Sentry
    this.init(config);

    console.log('✅ [SENTRY] Initialized for Electron main process');
    console.log('🔍 [SENTRY] Environment:', config.environment);
    console.log('🔍 [SENTRY] Debug mode:', config.debug);
    console.log('🔍 [SENTRY] Sample rate:', config.tracesSampleRate);
  }

  /**
   * Filter sensitive data before sending to Sentry
   * @param {Object} event - Sentry event
   * @param {Object} hint - Event hint
   * @returns {Object} Filtered event
   */
  beforeSend(event, hint) {
    // Add platform context
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
      delete env.SENTRY_DSN;
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
   * @param {Error} error - Error to capture
   * @param {Object} options - Capture options
   * @returns {string|null} Event ID or null if Sentry not available
   */
  captureException(error, options = {}) {
    if (!this.isAvailable()) {
      console.log('🔍 [SENTRY] Cannot capture exception - Sentry not available');
      return null;
    }

    return this.sentry.captureException(error, options);
  }

  /**
   * Capture a message with Sentry
   * @param {string} message - Message to capture
   * @param {Object} options - Capture options
   * @returns {string|null} Event ID or null if Sentry not available
   */
  captureMessage(message, options = {}) {
    if (!this.isAvailable()) {
      console.log('🔍 [SENTRY] Cannot capture message - Sentry not available');
      return null;
    }

    return this.sentry.captureMessage(message, options);
  }

  /**
   * Add a breadcrumb to Sentry
   * @param {Object} breadcrumb - Breadcrumb data
   */
  addBreadcrumb(breadcrumb) {
    if (!this.isAvailable()) {
      return;
    }

    this.sentry.addBreadcrumb(breadcrumb);
  }

  /**
   * Start a Sentry transaction
   * @param {Object} options - Transaction options
   * @returns {Object|null} Transaction or null if Sentry not available
   */
  startTransaction(options) {
    if (!this.isAvailable()) {
      console.log('🔍 [SENTRY] Cannot start transaction - Sentry not available');
      return null;
    }

    return this.sentry.startTransaction(options);
  }

  /**
   * Check if Sentry is available for use
   * @returns {boolean} Whether Sentry is available
   */
  isAvailable() {
    return this.isEnabled && this.isInitialized && this.sentry;
  }

  /**
   * Get the Sentry instance (for compatibility)
   * @returns {Object|null} Sentry instance or null
   */
  getSentry() {
    return this.isAvailable() ? this.sentry : null;
  }

  /**
   * Get Sentry status information
   * @returns {Object} Status information
   */
  getStatus() {
    return {
      enabled: this.isEnabled,
      initialized: this.isInitialized,
      available: this.isAvailable(),
      initializationTime: this.initializationTime,
      failureReason: this.failureReason,
      environment: app.isPackaged ? 'production' : 'development',
      sampleRate: this.getSentryConfig().tracesSampleRate
    };
  }

  /**
   * Force disable Sentry (runtime kill switch)
   */
  disable() {
    console.log('🔍 [SENTRY] Disabled by runtime kill switch');
    this.isEnabled = false;
  }

  /**
   * Force enable Sentry (runtime enable)
   */
  enable() {
    console.log('🔍 [SENTRY] Enabled by runtime switch');
    this.isEnabled = true;
  }

  /**
   * Reinitialize Sentry (useful after enable/disable)
   * @returns {Promise<boolean>} Success status
   */
  async reinitialize() {
    console.log('🔍 [SENTRY] Reinitializing...');
    this.isInitialized = false;
    this.failureReason = null;
    return await this.initialize();
  }
}

module.exports = SentryManager;
