const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { setupIpcHandlers } = require('./ipc-handlers');

// Keep a global reference to prevent garbage collection
let mainWindow;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 900,
    minWidth: 800,
    minHeight: 600,
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
  const isDev = process.env.NODE_ENV !== 'production';
  
  if (isDev) {
    // Development mode - load from dev server
    const startUrl = process.env.ELECTRON_START_URL || 'http://localhost:4201';
    mainWindow.loadURL(startUrl);
    
    // Open DevTools in development
    mainWindow.webContents.openDevTools();
  } else {
    // Production mode - load from built files
    mainWindow.loadFile(path.join(__dirname, '../../../dist/flock-native/browser/index.html'));
  }

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
});

process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled Rejection:', error);
});

