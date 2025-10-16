const { BrowserWindow } = require('electron');
const path = require('path');

/**
 * Window Manager Module
 * Handles window creation and management for the main process
 */
class WindowManager {
  constructor() {
    this.mainWindow = null;
  }

  /**
   * Create the main application window
   */
  createMainWindow() {
    console.log('🪟 [WINDOW] Creating main window...');

    // Create the browser window
    this.mainWindow = new BrowserWindow({
      width: 1200,
      height: 900,
      minWidth: 800,
      minHeight: 600,
      // show: false, // Temporarily commented out for debugging
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: false, // Required for file system access
        allowRunningInsecureContent: false,
        experimentalFeatures: false,
        webSecurity: true, // Keep web security enabled for production
        enableRemoteModule: false
      },
      title: 'Flock Native - Bluesky Social Migrator',
      icon: path.join(__dirname, '../public/icon.png')
    });

    console.log('✅ [WINDOW] Main window created successfully');
    return this.mainWindow;
  }

  /**
   * Load the application content
   */
  loadApplication() {
    if (!this.mainWindow) {
      console.error('❌ [WINDOW] Cannot load application: main window not created');
      return;
    }

    const { app } = require('electron');

    // Use app.isPackaged to reliably detect production vs development
    // Allow override with ELECTRON_IS_PACKAGED env var for testing
    const isDev = !app.isPackaged && !process.env.ELECTRON_IS_PACKAGED;

    if (isDev) {
      this.loadDevelopmentContent();
    } else {
      this.loadProductionContent();
    }
  }

  /**
   * Load content in development mode
   */
  loadDevelopmentContent() {
    console.log('🔧 [WINDOW] Loading development content...');

    // Development mode - load from dev server
    const startUrl = process.env.ELECTRON_START_URL;
    const devUrl = startUrl || 'http://localhost:4201';

    console.log('🌐 [WINDOW] Loading from dev server:', devUrl);

    this.mainWindow.loadURL(devUrl).then(() => {
      console.log('✅ [WINDOW] Development content loaded successfully');

      // Open DevTools in development
      if (process.env.OPEN_DEVTOOLS !== 'false') {
        this.mainWindow.webContents.openDevTools();
      }
    }).catch((error) => {
      console.error('❌ [WINDOW] Failed to load development content:', error);
    });
  }

  /**
   * Load content in production mode
   */
  loadProductionContent() {
    console.log('📦 [WINDOW] Loading production content...');

    const { app } = require('electron');
    
    // Production mode - load from file
    // In packaged apps with asar: false, files are in resources/app/dist/flock-native/browser/
    // In development, files are in project root dist/flock-native/browser/
    let indexPath;
    
    if (app.isPackaged) {
      // Packaged app: files are in resources/app/dist/flock-native/browser/
      // The electron-builder files config includes "dist/flock-native/**/*"
      indexPath = path.join(process.resourcesPath, 'app', 'dist', 'flock-native', 'browser', 'index.html');
    } else {
      // Development: files are in project root dist/flock-native/browser/
      indexPath = path.join(__dirname, '../dist/flock-native/browser/index.html');
    }
    
    console.log('📁 [WINDOW] Loading from file:', indexPath);
    console.log('📁 [WINDOW] File exists:', require('fs').existsSync(indexPath));
    console.log('📁 [WINDOW] App is packaged:', app.isPackaged);
    console.log('📁 [WINDOW] Resources path:', process.resourcesPath);

    this.mainWindow.loadFile(indexPath).then(() => {
      console.log('✅ [WINDOW] Production content loaded successfully');
    }).catch((error) => {
      console.error('❌ [WINDOW] Failed to load production content:', error);
    });
  }

  /**
   * Setup window event handlers
   */
  setupWindowHandlers() {
    if (!this.mainWindow) {
      console.error('❌ [WINDOW] Cannot setup handlers: main window not created');
      return;
    }

    // Handle window closed
    this.mainWindow.on('closed', () => {
      console.log('🪟 [WINDOW] Main window closed');
      this.mainWindow = null;
    });

    // Handle page load events
    this.mainWindow.webContents.on('did-finish-load', () => {
      console.log('✅ [WINDOW] Page loaded successfully');
    });

    this.mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
      console.error('❌ [WINDOW] Page failed to load:', errorCode, errorDescription);
    });

    // Handle navigation
    this.mainWindow.webContents.on('will-navigate', (event, url) => {
      console.log('🧭 [WINDOW] Navigation attempt to:', url);

      // Prevent navigation to external URLs
      const { app } = require('electron');
      const isDev = !app.isPackaged && !process.env.ELECTRON_IS_PACKAGED;

      if (isDev) {
        // In development, allow localhost navigation
        if (!url.includes('localhost') && !url.includes('127.0.0.1')) {
          event.preventDefault();
          console.log('🚫 [WINDOW] Blocked external navigation in development');
        }
      } else {
        // In production, prevent all external navigation
        if (!url.startsWith('file://')) {
          event.preventDefault();
          console.log('🚫 [WINDOW] Blocked external navigation in production');
        }
      }
    });

    // Handle new window requests
    this.mainWindow.webContents.setWindowOpenHandler(({ url }) => {
      console.log('🪟 [WINDOW] New window request for:', url);
      return { action: 'deny' };
    });
  }

  /**
   * Show the main window
   */
  show() {
    if (this.mainWindow) {
      this.mainWindow.show();
      console.log('👁️ [WINDOW] Main window shown');
    }
  }

  /**
   * Hide the main window
   */
  hide() {
    if (this.mainWindow) {
      this.mainWindow.hide();
      console.log('🙈 [WINDOW] Main window hidden');
    }
  }

  /**
   * Focus the main window
   */
  focus() {
    if (this.mainWindow) {
      this.mainWindow.focus();
      console.log('🎯 [WINDOW] Main window focused');
    }
  }

  /**
   * Get the main window instance
   */
  getMainWindow() {
    return this.mainWindow;
  }

  /**
   * Check if main window exists
   */
  hasMainWindow() {
    return this.mainWindow !== null;
  }

  /**
   * Close the main window
   */
  close() {
    if (this.mainWindow) {
      this.mainWindow.close();
      console.log('🚪 [WINDOW] Main window closed');
    }
  }
}

module.exports = WindowManager;
