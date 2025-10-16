const { setupFileHandlers } = require('./handlers/file-handlers');
const { setupArchiveHandlers } = require('./handlers/archive-handlers');
const { setupCliHandlers } = require('./handlers/cli-handlers');
const { setupSystemHandlers } = require('./handlers/system-handlers');

/**
 * Main IPC Handlers Coordinator
 *
 * This module coordinates all IPC handlers by importing and registering
 * specialized handler modules for different functionality areas:
 *
 * - File Handlers: File selection, validation, and reading
 * - Archive Handlers: Archive extraction with progress tracking
 * - CLI Handlers: CLI execution and process management
 * - System Handlers: System information and path utilities
 */

/**
 * Setup all IPC handlers
 * @param {BrowserWindow} mainWindow - The main window instance
 * @param {Object} sentryManager - SentryManager instance for error tracking
 * @param {PerformanceTracker} performanceTracker - Performance tracker instance
 */
function setupIpcHandlers(mainWindow, sentryManager, performanceTracker) {
  // Use SentryManager instance provided by main process; fallback to no-op if missing
  const sentryManagerInstance = sentryManager || { addBreadcrumb() {}, captureException() {}, captureMessage() {} };
  
  // Use performance tracker if provided; fallback to no-op if missing
  const tracker = performanceTracker || {
    startOperation: () => 'noop',
    endOperation: () => {},
    startChildOperation: () => 'noop'
  };

  console.log('🔧 [IPC] Setting up modular IPC handlers...');

  // Register all handler modules with performance tracking
  setupFileHandlers(mainWindow, sentryManagerInstance, tracker);
  setupArchiveHandlers(mainWindow, sentryManagerInstance, tracker);
  setupCliHandlers(mainWindow, sentryManagerInstance, tracker);
  setupSystemHandlers(mainWindow, sentryManagerInstance, tracker);

  console.log('✅ [IPC] All IPC handlers registered successfully');
}

module.exports = { setupIpcHandlers };

