const { app, BrowserWindow } = require('electron');

/**
 * App Lifecycle Manager Module
 * Handles application lifecycle events and error handling
 */
class AppLifecycleManager {
  constructor(sentryInstance = null, windowManager = null) {
    this.sentry = sentryInstance;
    this.windowManager = windowManager;
  }

  /**
   * Setup all application lifecycle handlers
   */
  setupLifecycleHandlers() {
    console.log('🔄 [LIFECYCLE] Setting up application lifecycle handlers...');

    this.setupAppReady();
    this.setupAppActivate();
    this.setupAppWindowAllClosed();
    this.setupProcessErrorHandlers();

    console.log('✅ [LIFECYCLE] Application lifecycle handlers setup complete');
  }

  /**
   * Setup app ready handler
   */
  setupAppReady() {
    app.whenReady().then(async () => {
      console.log('🚀 [LIFECYCLE] App is ready');

      // Log system information
      this.logSystemInfo();

      // Create main window
      if (this.windowManager) {
        this.windowManager.createMainWindow();
        this.windowManager.setupWindowHandlers();
        this.windowManager.loadApplication();
      }
    });
  }

  /**
   * Setup app activate handler (macOS specific)
   */
  setupAppActivate() {
    app.on('activate', () => {
      console.log('🔄 [LIFECYCLE] App activated');

      // On macOS re-create window when dock icon is clicked
      if (BrowserWindow.getAllWindows().length === 0) {
        console.log('🪟 [LIFECYCLE] No windows open, creating new window');
        if (this.windowManager) {
          this.windowManager.createMainWindow();
          this.windowManager.setupWindowHandlers();
          this.windowManager.loadApplication();
        }
      }
    });
  }

  /**
   * Setup window all closed handler
   */
  setupAppWindowAllClosed() {
    app.on('window-all-closed', () => {
      console.log('🪟 [LIFECYCLE] All windows closed');

      // On macOS, keep app running even when all windows are closed
      if (process.platform !== 'darwin') {
        console.log('🚪 [LIFECYCLE] Quitting application (non-macOS)');
        app.quit();
      } else {
        console.log('🍎 [LIFECYCLE] Keeping app alive on macOS');
      }
    });
  }

  /**
   * Setup process error handlers
   */
  setupProcessErrorHandlers() {
    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      console.error('❌ [LIFECYCLE] Uncaught Exception:', error);

      // Send to Sentry
      if (this.sentry) {
        this.sentry.captureException(error, {
          level: 'fatal',
          tags: {
            process: 'main',
            type: 'uncaughtException'
          }
        });
      }

      // In production, we might want to restart the app
      if (app.isPackaged) {
        console.log('🔄 [LIFECYCLE] Restarting app due to uncaught exception');
        app.relaunch();
        app.exit(1);
      }
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      console.error('❌ [LIFECYCLE] Unhandled Rejection at:', promise, 'reason:', reason);

      // Send to Sentry
      if (this.sentry) {
        this.sentry.captureException(new Error(`Unhandled Promise Rejection: ${reason}`), {
          level: 'error',
          tags: {
            process: 'main',
            type: 'unhandledRejection'
          },
          extra: {
            reason: reason,
            promise: promise
          }
        });
      }
    });

    // Handle app termination
    process.on('SIGTERM', () => {
      console.log('🛑 [LIFECYCLE] SIGTERM received, shutting down gracefully');
      this.gracefulShutdown();
    });

    process.on('SIGINT', () => {
      console.log('🛑 [LIFECYCLE] SIGINT received, shutting down gracefully');
      this.gracefulShutdown();
    });
  }

  /**
   * Log system information
   */
  logSystemInfo() {
    console.log('🖥️ [SYSTEM] Platform:', process.platform);
    console.log('🏗️ [SYSTEM] Architecture:', process.arch);
    console.log('📦 [SYSTEM] Node version:', process.version);
    console.log('⚡ [SYSTEM] Electron version:', process.versions.electron);
    console.log('📂 [SYSTEM] App path:', app.getAppPath());
    console.log('🏠 [SYSTEM] User data:', app.getPath('userData'));
    console.log('📁 [SYSTEM] Home directory:', app.getPath('home'));
    console.log('💾 [SYSTEM] Temp directory:', app.getPath('temp'));
    console.log('📥 [SYSTEM] Downloads directory:', app.getPath('downloads'));
    console.log('📄 [SYSTEM] Documents directory:', app.getPath('documents'));
    console.log('🖥️ [SYSTEM] Desktop directory:', app.getPath('desktop'));
  }

  /**
   * Graceful shutdown procedure
   */
  gracefulShutdown() {
    console.log('🔄 [LIFECYCLE] Starting graceful shutdown...');

    // Close all windows
    const windows = BrowserWindow.getAllWindows();
    windows.forEach(window => {
      if (!window.isDestroyed()) {
        window.close();
      }
    });

    // Give some time for cleanup
    setTimeout(() => {
      console.log('✅ [LIFECYCLE] Graceful shutdown complete');
      app.quit();
    }, 1000);
  }

  /**
   * Handle app quit
   */
  setupAppQuit() {
    app.on('before-quit', (event) => {
      console.log('🚪 [LIFECYCLE] App is about to quit');
      // You can add cleanup logic here
    });

    app.on('will-quit', (event) => {
      console.log('🚪 [LIFECYCLE] App will quit');
      // You can add final cleanup logic here
    });
  }

  /**
   * Get application status
   */
  getAppStatus() {
    return {
      isReady: app.isReady(),
      isPackaged: app.isPackaged,
      platform: process.platform,
      arch: process.arch,
      nodeVersion: process.version,
      electronVersion: process.versions.electron,
      windowCount: BrowserWindow.getAllWindows().length,
      appPath: app.getAppPath(),
      userDataPath: app.getPath('userData')
    };
  }
}

module.exports = AppLifecycleManager;
