const { ipcMain, app } = require('electron');
const os = require('os');
const { wrapIpcHandler } = require('./performance-wrapper');

/**
 * System Information and Path Handlers
 *
 * Handles:
 * - System information (platform, architecture, versions)
 * - Application paths (home, appData, userData, etc.)
 * - Hardware information (CPU, memory)
 */

/**
 * Setup system-related IPC handlers
 * @param {BrowserWindow} mainWindow - The main window instance
 * @param {Object} Sentry - Sentry instance for error tracking
 * @param {PerformanceTracker} performanceTracker - Performance tracker instance
 */
function setupSystemHandlers(mainWindow, Sentry, performanceTracker) {
  // System information handler
  ipcMain.handle('get-system-info', wrapIpcHandler('get-system-info', async (event) => {
    return {
      platform: process.platform,
      arch: process.arch,
      version: process.version,
      electronVersion: process.versions.electron,
      chromeVersion: process.versions.chrome,
      nodeVersion: process.versions.node,
      v8Version: process.versions.v8,
      homedir: os.homedir(),
      tmpdir: os.tmpdir(),
      cpus: os.cpus().length,
      totalmem: os.totalmem(),
      freemem: os.freemem()
    };
  }, performanceTracker));

  // Path utilities handler
  ipcMain.handle('get-paths', wrapIpcHandler('get-paths', async (event) => {
    return {
      home: app.getPath('home'),
      appData: app.getPath('appData'),
      userData: app.getPath('userData'),
      temp: app.getPath('temp'),
      downloads: app.getPath('downloads'),
      documents: app.getPath('documents'),
      desktop: app.getPath('desktop')
    };
  }, performanceTracker));

  console.log('✅ System handlers registered');
}

module.exports = { setupSystemHandlers };
