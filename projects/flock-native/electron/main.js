const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const Sentry = require('@sentry/electron/main');
const { setupIpcHandlers } = require('./ipc-handlers');
require('dotenv').config();

// Initialize Sentry as early as possible
const sentryDsn = process.env.NATIVE_SENTRY_DSN;
if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    
    // Debug mode - logs to console
    debug: true,
    
    // Environment detection
    environment: app.isPackaged ? 'production' : 'development',
    
    // Release version
    release: 'flock-native@0.4.8',
    
    // Sample rate for performance monitoring
    tracesSampleRate: app.isPackaged ? 0.1 : 1.0,
    
    // Filter sensitive data
    beforeSend(event, hint) {
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
    },
    
    // Ignore common noise
    ignoreErrors: [],
  });
  
  console.log('✅ [SENTRY] Initialized for Electron main process');
  console.log('🔍 [SENTRY] Environment:', app.isPackaged ? 'production' : 'development');
} else {
  console.log('🔍 [SENTRY] No NATIVE_SENTRY_DSN found, error tracking disabled');
  console.log('🔍 [SENTRY] Set NATIVE_SENTRY_DSN environment variable to enable error tracking');
}

// Keep a global reference to prevent garbage collection
let mainWindow;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    // show: false, // Temporarily commented out for debugging
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false // Required for file system access
    },
    title: 'Flock Native - Bluesky Social Migrator',
    icon: path.join(__dirname, '../public/icon.png')
  });

  // Setup IPC handlers
  setupIpcHandlers(mainWindow);

  // Load the app
  // Use app.isPackaged to reliably detect production vs development
  // Allow override with ELECTRON_IS_PACKAGED env var for testing
  const isDev = !app.isPackaged && !process.env.ELECTRON_IS_PACKAGED;
  
  if (isDev) {
    // Development mode - load from dev server
    const startUrl = process.env.ELECTRON_START_URL || 'http://localhost:4201';
    mainWindow.loadURL(startUrl);
    
    // Open DevTools in development
    mainWindow.webContents.openDevTools();
  } else {
    // Open DevTools in production for debugging (TEMPORARY)
    mainWindow.webContents.openDevTools();
    // Production mode - load from built files
    const appPath = app.getAppPath();
    let indexPath;
    
    if (app.isPackaged) {
      // In packaged app, files are in dist/flock-native/browser/
      indexPath = path.join(appPath, 'dist/flock-native/browser/index.html');
    } else {
      // In local test (ELECTRON_IS_PACKAGED=1), need to go to project root
      // appPath is projects/flock-native/electron, need to go up 3 levels
      const projectRoot = path.join(appPath, '../../..');
      indexPath = path.join(projectRoot, 'dist/flock-native/browser/index.html');
    }
    
    console.log('🔍 [PROD] Loading from:', indexPath);
    console.log('🔍 [PROD] App path:', appPath);
    console.log('🔍 [PROD] Is packaged:', app.isPackaged);
    console.log('🔍 [PROD] process.execPath:', process.execPath);
    
    mainWindow.loadFile(indexPath).catch(err => {
      console.error('❌ Failed to load index.html:', err);
      console.error('📂 App path:', appPath);
      console.error('📄 Index path:', indexPath);
    });
  }

  // Handle load failures
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error('❌ Page failed to load:', errorDescription, 'URL:', validatedURL);
  });

  // Show window when ready to prevent flash of unstyled content
  let windowShown = false;
  
  mainWindow.once('ready-to-show', () => {
    if (!windowShown) {
      console.log('✅ Window ready to show');
      mainWindow.show();
      windowShown = true;
    }
  });
  
  // Fallback: show window after 3 seconds if ready-to-show doesn't fire
  setTimeout(() => {
    if (!windowShown && mainWindow && !mainWindow.isDestroyed()) {
      console.log('⚠️ Fallback: showing window after timeout');
      mainWindow.show();
      windowShown = true;
    }
  }, 3000);

  // Log when page loads
  mainWindow.webContents.on('did-finish-load', () => {
    console.log('✅ Page loaded successfully');
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    require('electron').shell.openExternal(url);
    return { action: 'deny' };
  });
}

// App lifecycle

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    // On macOS re-create window when dock icon is clicked
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Handle app termination
app.on('before-quit', () => {
  console.log('🦅 Eagle preparing to land...');
});

// Log when ready
app.on('ready', () => {
  console.log('🦅 Flock Native - Eagle is ready to soar!');
  console.log(`📂 App Path: ${app.getAppPath()}`);
  console.log(`🏠 User Data: ${app.getPath('userData')}`);
});

// Error handling
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  
  // Send to Sentry
  if (sentryDsn) {
    Sentry.captureException(error, {
      level: 'fatal',
      tags: {
        process: 'main',
        type: 'uncaughtException'
      }
    });
  }
});

process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled Rejection:', error);
  
  // Send to Sentry
  if (sentryDsn) {
    Sentry.captureException(error, {
      level: 'error',
      tags: {
        process: 'main',
        type: 'unhandledRejection'
      }
    });
  }
});

