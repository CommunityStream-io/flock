const { app } = require('electron');
require('dotenv').config();

// Import modular components
const SentrySetup = require('./sentry-setup');
const LoggingSetup = require('./logging-setup');
const WindowManager = require('./window-manager');
const AppLifecycleManager = require('./app-lifecycle');
const { setupIpcHandlers } = require('./ipc-handlers');

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
    this.sentrySetup = null;
    this.loggingSetup = null;
    this.windowManager = null;
    this.lifecycleManager = null;
  }

  /**
   * Initialize the Electron application
   */
  async initialize() {
    console.log('🚀 [MAIN] Initializing Electron application...');

    try {
      // Initialize Sentry first (for error tracking)
      await this.initializeSentry();

      // Initialize logging (for debugging)
      await this.initializeLogging();

      // Initialize window manager
      this.initializeWindowManager();

      // Initialize lifecycle manager
      this.initializeLifecycleManager();

      // Setup IPC handlers
      this.setupIpcHandlers();

      console.log('✅ [MAIN] Electron application initialization complete');

    } catch (error) {
      console.error('❌ [MAIN] Failed to initialize Electron application:', error);
      throw error;
    }
  }

  /**
   * Initialize Sentry for error tracking
   */
  async initializeSentry() {
    console.log('🔍 [MAIN] Initializing Sentry...');

    this.sentrySetup = new SentrySetup();
    const success = await this.sentrySetup.initialize();

    if (success) {
      console.log('✅ [MAIN] Sentry initialized successfully');
    } else {
      console.warn('⚠️ [MAIN] Sentry initialization failed, continuing without error tracking');
    }
  }

  /**
   * Initialize logging system
   */
  async initializeLogging() {
    console.log('📝 [MAIN] Initializing logging system...');

    this.loggingSetup = new LoggingSetup(this.sentrySetup?.getSentry());
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
      this.sentrySetup?.getSentry(),
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

        // Setup IPC handlers with the window and Sentry instance
        setupIpcHandlers(window, this.sentrySetup?.getSentry());

        return window;
      };
    }

    console.log('✅ [MAIN] IPC handlers setup complete');
  }

  /**
   * Get application status
   */
  getStatus() {
    return {
      sentry: this.sentrySetup ? 'initialized' : 'not initialized',
      logging: this.loggingSetup ? 'initialized' : 'not initialized',
      windowManager: this.windowManager ? 'initialized' : 'not initialized',
      lifecycleManager: this.lifecycleManager ? 'initialized' : 'not initialized',
      appStatus: this.lifecycleManager?.getAppStatus() || 'not available'
    };
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
