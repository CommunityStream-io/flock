const { ipcMain, dialog } = require('electron');
const fs = require('fs').promises;
const path = require('path');
const { wrapIpcHandler, createPerformanceContext } = require('./performance-wrapper');

/**
 * File Selection and Validation Handlers
 *
 * Handles:
 * - File selection dialog
 * - Archive validation
 * - File reading
 */

/**
 * Setup file-related IPC handlers
 * @param {BrowserWindow} mainWindow - The main window instance
 * @param {Object} sentryManager - SentryManager instance for error tracking
 * @param {PerformanceTracker} performanceTracker - Performance tracker instance
 */
function setupFileHandlers(mainWindow, sentryManager, performanceTracker) {
  // File selection handler
  ipcMain.handle('select-file', wrapIpcHandler('select-file', async (event) => {
    try {
      const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openFile'],
        filters: [
          { name: 'ZIP Archives', extensions: ['zip'] },
          { name: 'All Files', extensions: ['*'] }
        ],
        title: 'Select Instagram Archive'
      });

      if (result.canceled || result.filePaths.length === 0) {
        return { success: false, canceled: true };
      }

      const filePath = result.filePaths[0];
      const stats = await fs.stat(filePath);

      // Sentry: Track file selection
      sentryManager.addBreadcrumb({
        category: 'file-selection',
        message: 'User selected archive file',
        level: 'info',
        data: {
          fileName: path.basename(filePath),
          fileSize: stats.size
        }
      });

      return {
        success: true,
        filePath: filePath,
        fileName: path.basename(filePath),
        fileSize: stats.size,
        lastModified: stats.mtime
      };
    } catch (error) {
      console.error('Error selecting file:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }, performanceTracker));

  // Archive validation handler
  ipcMain.handle('validate-archive', wrapIpcHandler('validate-archive', async (event, filePath) => {
    try {
      // Check if file exists
      await fs.access(filePath);

      const stats = await fs.stat(filePath);

      // Basic validation
      const errors = [];
      const warnings = [];

      // Check file size (should be reasonable for an Instagram archive)
      if (stats.size < 1024) { // Less than 1KB
        errors.push('File is too small to be a valid Instagram archive');
      }

      if (stats.size > 10 * 1024 * 1024 * 1024) { // More than 10GB
        warnings.push('File is very large, extraction may take a while');
      }

      // Check file extension
      if (!filePath.toLowerCase().endsWith('.zip')) {
        errors.push('File must be a ZIP archive');
      }

      // TODO: Add more sophisticated validation
      // - Check ZIP structure
      // - Verify Instagram archive structure
      // - Check for required files

      return {
        isValid: errors.length === 0,
        errors: errors,
        warnings: warnings,
        timestamp: new Date(),
        fileSize: stats.size,
        filePath: filePath
      };
    } catch (error) {
      console.error('Error validating archive:', error);
      return {
        isValid: false,
        errors: [error.message],
        warnings: [],
        timestamp: new Date()
      };
    }
  }, performanceTracker));

  // Read file handler
  ipcMain.handle('read-file', wrapIpcHandler('read-file', async (event, filePath) => {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      return {
        success: true,
        content: content
      };
    } catch (error) {
      console.error('Error reading file:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }, performanceTracker));

  console.log('✅ File handlers registered');
}

module.exports = { setupFileHandlers };
