const { app } = require('electron');
require('dotenv').config();

// Import modular components
const SentryManager = require('./sentry-manager');
const LoggingSetup = require('./logging-setup');
const WindowManager = require('./window-manager');
const AppLifecycleManager = require('./app-lifecycle');
const { setupIpcHandlers } = require('./ipc-handlers');
const PerformanceTracker = require('./performance-tracker');

/**
 * Main Electron Process Entry Point
 *
 * This file has been refactored into modular components:
 * - SentrySetup: Handles Sentry initialization and configuration
 * - LoggingSetup: Handles electron-log configuration
 * - WindowManager: Handles window creation and management
 * - AppLifecycleManager: Handles app lifecycle events
 * - IPC Handlers: Handles inter-process communication
 */
class ElectronApp {
  constructor() {
    this.sentryManager = null;
    this.loggingSetup = null;
    this.windowManager = null;
    this.lifecycleManager = null;
    this.performanceTracker = null;
  }

  /**
   * Initialize the Electron application
   */
  async initialize() {
    console.log('🚀 [MAIN] Initializing Electron application...');

    try {
      // Create performance tracker first
      this.createPerformanceTracker();
      
      // Track startup performance
      const startupOpId = this.performanceTracker.startOperation('app-startup', 'startup', {
        timestamp: Date.now(),
        platform: process.platform,
        arch: process.arch,
        nodeVersion: process.version,
        electronVersion: process.versions.electron
      });

      // Initialize Sentry first (for error tracking)
      const sentryOpId = this.performanceTracker.startChildOperation(startupOpId, 'sentry-init');
      await this.initializeSentry();
      this.performanceTracker.endOperation(sentryOpId);

      // Initialize logging (for debugging)
      const loggingOpId = this.performanceTracker.startChildOperation(startupOpId, 'logging-init');
      await this.initializeLogging();
      this.performanceTracker.endOperation(loggingOpId);

      // Initialize window manager
      const windowOpId = this.performanceTracker.startChildOperation(startupOpId, 'window-manager-init');
      this.initializeWindowManager();
      this.performanceTracker.endOperation(windowOpId);

      // Initialize lifecycle manager
      const lifecycleOpId = this.performanceTracker.startChildOperation(startupOpId, 'lifecycle-init');
      this.initializeLifecycleManager();
      this.performanceTracker.endOperation(lifecycleOpId);

      // Setup IPC handlers
      const ipcOpId = this.performanceTracker.startChildOperation(startupOpId, 'ipc-init');
      this.setupIpcHandlers();
      this.performanceTracker.endOperation(ipcOpId);

      // Complete startup tracking
      this.performanceTracker.endOperation(startupOpId, { 
        success: true,
        components: {
          sentry: this.sentrySetup ? 'initialized' : 'failed',
          logging: this.loggingSetup ? 'initialized' : 'failed',
          windowManager: this.windowManager ? 'initialized' : 'failed',
          lifecycleManager: this.lifecycleManager ? 'initialized' : 'failed'
        }
      });

      console.log('✅ [MAIN] Electron application initialization complete');

    } catch (error) {
      console.error('❌ [MAIN] Failed to initialize Electron application:', error);
      
      // Track startup failure
      if (this.performanceTracker) {
        const startupOps = this.performanceTracker.getActiveOperations();
        for (const op of startupOps) {
          if (op.category === 'startup') {
            this.performanceTracker.endOperation(op.id, { 
              success: false, 
              error: error.message,
              errorType: error.constructor.name
            });
          }
        }
      }
      
      throw error;
    }
  }

  /**
   * Initialize Sentry for error tracking
   */
  async initializeSentry() {
    console.log('🔍 [MAIN] Initializing Sentry...');

    this.sentryManager = new SentryManager();
    const success = await this.sentryManager.initialize();

    if (success) {
      console.log('✅ [MAIN] Sentry initialized successfully');
    } else {
      console.warn('⚠️ [MAIN] Sentry initialization skipped or failed, continuing without error tracking');
    }
  }

  /**
   * Initialize logging system
   */
  async initializeLogging() {
    console.log('📝 [MAIN] Initializing logging system...');

    this.loggingSetup = new LoggingSetup(this.sentryManager?.getSentry());
    const success = await this.loggingSetup.initialize();

    if (success) {
      console.log('✅ [MAIN] Logging system initialized successfully');
    } else {
      console.warn('⚠️ [MAIN] Logging initialization failed, using console only');
    }
  }

  /**
   * Initialize window manager
   */
  initializeWindowManager() {
    console.log('🪟 [MAIN] Initializing window manager...');

    this.windowManager = new WindowManager();
    console.log('✅ [MAIN] Window manager initialized');
  }

  /**
   * Initialize lifecycle manager
   */
  initializeLifecycleManager() {
    console.log('🔄 [MAIN] Initializing lifecycle manager...');

    this.lifecycleManager = new AppLifecycleManager(
      this.sentryManager?.getSentry(),
      this.windowManager
    );

    this.lifecycleManager.setupLifecycleHandlers();
    console.log('✅ [MAIN] Lifecycle manager initialized');
  }

  /**
   * Setup IPC handlers
   */
  setupIpcHandlers() {
    console.log('📡 [MAIN] Setting up IPC handlers...');

    // Setup IPC handlers when window is created
    if (this.windowManager) {
      const originalCreateWindow = this.windowManager.createMainWindow.bind(this.windowManager);

      this.windowManager.createMainWindow = () => {
        const window = originalCreateWindow();

        // Setup IPC handlers with the window, SentryManager instance, and performance tracker
        setupIpcHandlers(window, this.sentryManager, this.performanceTracker);

        return window;
      };
    }

    console.log('✅ [MAIN] IPC handlers setup complete');
  }

  /**
   * Create performance tracker
   */
  createPerformanceTracker() {
    if (!this.performanceTracker) {
      this.performanceTracker = new PerformanceTracker(
        this.sentryManager?.getSentry(),
        this.loggingSetup?.getLogger()
      );
    }
    return this.performanceTracker;
  }

  /**
   * Get performance tracker instance
   */
  getPerformanceTracker() {
    return this.performanceTracker;
  }

  /**
   * Get application status
   */
  getStatus() {
    return {
      sentry: this.sentryManager ? this.sentryManager.getStatus() : 'not initialized',
      logging: this.loggingSetup ? 'initialized' : 'not initialized',
      windowManager: this.windowManager ? 'initialized' : 'not initialized',
      lifecycleManager: this.lifecycleManager ? 'initialized' : 'not initialized',
      performanceTracker: this.performanceTracker ? 'initialized' : 'not initialized',
      appStatus: this.lifecycleManager?.getAppStatus() || 'not available',
      performanceSummary: this.performanceTracker ? this.performanceTracker.getSummary() : null
    };
  }

  /**
   * Get Sentry manager instance
   */
  getSentryManager() {
    return this.sentryManager;
  }
}

// Create and initialize the application
const electronApp = new ElectronApp();

// Initialize the application
electronApp.initialize().catch((error) => {
  console.error('❌ [MAIN] Critical error during initialization:', error);
  process.exit(1);
});

// Export for testing purposes
module.exports = ElectronApp;
