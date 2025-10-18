const { ipcMain, app, utilityProcess } = require('electron');
const fsSync = require('fs');
const path = require('path');
const { wrapIpcHandler, createPerformanceContext } = require('./performance-wrapper');

/**
 * CLI Execution and Management Handlers
 *
 * Handles:
 * - CLI process execution using utilityProcess.fork()
 * - Process monitoring and output streaming
 * - Process cancellation
 * - Migration completion detection
 */

// Store active CLI processes
const activeProcesses = new Map();

/**
 * Setup CLI-related IPC handlers
 * @param {BrowserWindow} mainWindow - The main window instance
 * @param {Object} sentryManager - SentryManager instance for error tracking
 * @param {PerformanceTracker} performanceTracker - Performance tracker instance
 */
function setupCliHandlers(mainWindow, sentryManager, performanceTracker) {
  // CLI execution handler
  // Uses utilityProcess.fork() - the proper Electron API for Node.js child processes
  // Reference: https://www.electronjs.org/docs/latest/api/utility-process
  ipcMain.handle('execute-cli', wrapIpcHandler('execute-cli', async (event, options = {}) => {
    try {
      const processId = Date.now().toString();

      // Get the app root directory
      const appPath = app.getAppPath();
      // In packaged apps, app.getAppPath() points to the app.asar file. Use its
      // directory (resources) as the working root so cwd is a real folder.
      const appRoot = app.isPackaged ? path.dirname(appPath) : path.join(appPath, '../../..');

      console.log('=====================================');
      console.log('🚀 [ELECTRON MAIN] CLI EXECUTION STARTED');
      console.log('🚀 [ELECTRON MAIN] Process ID:', processId);
      console.log('🚀 [ELECTRON MAIN] Execution Method: utilityProcess.fork()');
      console.log('🚀 [ELECTRON MAIN] App Root:', appRoot);
      console.log('🚀 [ELECTRON MAIN] App Path:', appPath);
      console.log('🚀 [ELECTRON MAIN] Is Packaged:', app.isPackaged);
      console.log('🚀 [ELECTRON MAIN] Working Dir:', options.cwd || appRoot);
      console.log('🚀 [ELECTRON MAIN] Custom Env Vars:', Object.keys(options.env || {}).join(', '));

      // Sentry breadcrumb
      sentryManager.addBreadcrumb({
        category: 'ipc',
        message: 'CLI execution started',
        level: 'info',
        data: {
          processId: processId,
          isPackaged: app.isPackaged
        }
      });

      // Resolve archive path if it's a relative path (dev-only test data lives in repo)
      const mergedEnv = { ...process.env, ...options.env };
      if (mergedEnv.ARCHIVE_FOLDER && !path.isAbsolute(mergedEnv.ARCHIVE_FOLDER)) {
        const resolvedPath = path.join(appRoot, mergedEnv.ARCHIVE_FOLDER);
        console.log('🚀 [ELECTRON MAIN] Resolving relative archive path:', mergedEnv.ARCHIVE_FOLDER);
        console.log('🚀 [ELECTRON MAIN] Resolved to:', resolvedPath);
        mergedEnv.ARCHIVE_FOLDER = resolvedPath;
      }

      // Use Node's require.resolve to find the package main script
      // This automatically handles both dev and packaged environments
      let resolvedScriptPath = require.resolve('@straiforos/instagramtobluesky/dist/main.js');
      console.log('🚀 [ELECTRON MAIN] ✅ Resolved script path via require.resolve:', resolvedScriptPath);

      // Fork the utility process using Electron's API
      // This handles packaged apps correctly without process.execPath issues
      console.log('🚀 [ELECTRON MAIN] Forking utility process...');
      console.log('🚀 [ELECTRON MAIN] utilityProcess available?', typeof utilityProcess);
      console.log('🚀 [ELECTRON MAIN] utilityProcess.fork available?', typeof utilityProcess.fork);

      // Sentry breadcrumb
      sentryManager.addBreadcrumb({
        category: 'utilityProcess',
        message: 'Attempting to fork utility process',
        level: 'info',
        data: {
          scriptPath: resolvedScriptPath,
          scriptExists: fsSync.existsSync(resolvedScriptPath),
          nodePath: mergedEnv.NODE_PATH
        }
      });

      // Build fork options
      const forkOptions = {
        cwd: options.cwd || appRoot,
        env: mergedEnv,
        stdio: 'pipe', // Capture stdout/stderr
        serviceName: 'Instagram to Bluesky CLI',
        // Keep execution simple: no preloads
        execArgv: []
      };

      console.log('🚀 [ELECTRON MAIN] Fork options:', {
        cwd: forkOptions.cwd,
        stdio: forkOptions.stdio,
        serviceName: forkOptions.serviceName,
        hasEnv: !!forkOptions.env,
        envKeys: Object.keys(forkOptions.env || {}).slice(0, 10)
      });
      try {
        const stats = fsSync.statSync(forkOptions.cwd);
        console.log('🚀 [ELECTRON MAIN] CWD exists and is directory?', stats.isDirectory());
      } catch (e) {
        console.warn('🚀 [ELECTRON MAIN] CWD invalid (will cause spawn issues):', e && e.message ? e.message : e);
      }

      const child = utilityProcess.fork(resolvedScriptPath, [], forkOptions);

      console.log('🚀 [ELECTRON MAIN] utilityProcess.fork() returned:', {
        childType: typeof child,
        hasStdout: !!child.stdout,
        hasStderr: !!child.stderr,
        hasPid: !!child.pid,
        pid: child.pid,
        hasKill: typeof child.kill === 'function',
        hasOn: typeof child.on === 'function'
      });

      // Log Electron's Node.js path for debugging
      console.log('🚀 [ELECTRON MAIN] process.execPath:', process.execPath);
      console.log('🚀 [ELECTRON MAIN] process.versions.node:', process.versions.node);
      console.log('🚀 [ELECTRON MAIN] process.versions.electron:', process.versions.electron);

      // Store the process
      activeProcesses.set(processId, child);

      // Send comprehensive diagnostic info to renderer
      const diagnosticInfo = [
        `[DEBUG] utilityProcess forked - waiting for spawn event...`,
        `[DEBUG] Is Packaged: ${app.isPackaged}`,
        `[DEBUG] App Path: ${appPath}`,
        `[DEBUG] App Root: ${appRoot}`,
        `[DEBUG] Script Path: ${resolvedScriptPath}`,
        `[DEBUG] Script Exists: ${fsSync.existsSync(resolvedScriptPath)}`,
        `[DEBUG] Working Dir: ${forkOptions.cwd}`,
        `[DEBUG] NODE_PATH: ${mergedEnv.NODE_PATH}`,
        `[DEBUG] NODE_PATH Exists: ${mergedEnv.NODE_PATH ? fsSync.existsSync(mergedEnv.NODE_PATH) : 'N/A'}`,
        ``
      ].join('\n');

      mainWindow.webContents.send('cli-output', {
        processId: processId,
        type: 'stdout',
        data: diagnosticInfo
      });

      // Track spawn state
      let hasSpawned = false;

      // Handle spawn event (utility process successfully started)
      child.on('spawn', () => {
        hasSpawned = true;
        console.log(`🚀 [ELECTRON MAIN] CLI process ${processId} spawned successfully (PID: ${child.pid})`);

        // Sentry breadcrumb - success!
        sentryManager.addBreadcrumb({
          category: 'utilityProcess',
          message: 'Process spawned successfully',
          level: 'info',
          data: {
            processId: processId,
            pid: child.pid
          }
        });

        mainWindow.webContents.send('cli-output', {
          processId: processId,
          type: 'stdout',
          data: `[DEBUG] Process spawned successfully (PID: ${child.pid})\n`
        });
      });

      // Timeout to detect if process never spawns (15s for slower environments)
      setTimeout(() => {
        if (!hasSpawned) {
          console.error(`🚀 [ELECTRON MAIN] ❌ Process ${processId} did not spawn within 15 seconds!`);

          // Capture in Sentry with full diagnostic context
          sentryManager.captureException(new Error('utilityProcess failed to spawn'), {
            level: 'error',
            tags: {
              component: 'utilityProcess',
              processId: processId,
              isPackaged: app.isPackaged
            },
            extra: {
              scriptPath: resolvedScriptPath,
              scriptExists: fsSync.existsSync(resolvedScriptPath),
              nodePath: mergedEnv.NODE_PATH,
              nodePathExists: mergedEnv.NODE_PATH ? fsSync.existsSync(mergedEnv.NODE_PATH) : false,
              cwd: forkOptions.cwd,
              appPath: appPath,
              appRoot: appRoot
            }
          });

          mainWindow.webContents.send('cli-error', {
            processId: processId,
            type: 'error',
            data: `[ERROR] Process failed to spawn within 5 seconds\n[ERROR] This might indicate a problem with the script path or permissions\n`
          });
        }
      }, 15000);

      // Track if migration completed successfully
      let migrationCompleted = false;

      // Handle stdout
      if (child.stdout) {
        console.log('🚀 [ELECTRON MAIN] Setting up stdout handler...');

        child.stdout.on('data', (data) => {
          const output = data.toString();
          console.log('🚀 [ELECTRON MAIN] CLI stdout:', output);

          // Detect completion messages
          // Look for the CLI's actual completion message: "Total import time"
          if (output.includes('Total import time')) {
            console.log('🚀 [ELECTRON MAIN] ✅ Migration completion detected');
            migrationCompleted = true;

            // Force kill the process after a grace period if it doesn't exit naturally
            // Some CLI scripts don't call process.exit() and have open handles
            setTimeout(() => {
              if (activeProcesses.has(processId)) {
                console.log('🚀 [ELECTRON MAIN] ⚠️ Process did not exit naturally, force killing...');
                child.kill();
              }
            }, 2000); // 2 second grace period
          }

          mainWindow.webContents.send('cli-output', {
            processId: processId,
            type: 'stdout',
            data: output
          });
        });

        // Handle stdout close
        child.stdout.on('close', () => {
          console.log('🚀 [ELECTRON MAIN] CLI stdout closed');
          mainWindow.webContents.send('cli-output', {
            processId: processId,
            type: 'stdout',
            data: `[DEBUG] stdout stream closed\n`
          });
        });
      } else {
        console.error('🚀 [ELECTRON MAIN] ❌ child.stdout is null/undefined!');
        mainWindow.webContents.send('cli-error', {
          processId: processId,
          type: 'error',
          data: '[DEBUG] Error: child.stdout is null\n'
        });
      }

      // Handle stderr
      if (child.stderr) {
        console.log('🚀 [ELECTRON MAIN] Setting up stderr handler...');

        child.stderr.on('data', (data) => {
          const output = data.toString();
          console.error('🚀 [ELECTRON MAIN] CLI stderr:', output);
          mainWindow.webContents.send('cli-error', {
            processId: processId,
            type: 'stderr',
            data: output
          });
        });

        // Handle stderr close
        child.stderr.on('close', () => {
          console.log('🚀 [ELECTRON MAIN] CLI stderr closed');
          mainWindow.webContents.send('cli-output', {
            processId: processId,
            type: 'stdout',
            data: `[DEBUG] stderr stream closed\n`
          });
        });
      } else {
        console.error('🚀 [ELECTRON MAIN] ❌ child.stderr is null/undefined!');
        mainWindow.webContents.send('cli-error', {
          processId: processId,
          type: 'error',
          data: '[DEBUG] Error: child.stderr is null\n'
        });
      }

      // Handle process exit
      child.on('exit', (code) => {
        console.log(`🚀 [ELECTRON MAIN] CLI process ${processId} exited with code ${code}`);
        console.log(`🚀 [ELECTRON MAIN] Migration completed: ${migrationCompleted ? 'YES' : 'NO'}`);
        activeProcesses.delete(processId);

        // Sentry: Track migration completion
        if (migrationCompleted && code === 0) {
          sentryManager.captureMessage('Migration completed successfully', {
            level: 'info',
            tags: {
              component: 'utilityProcess',
              operation: 'migrate',
              status: 'success'
            },
            extra: {
              processId: processId,
              exitCode: code
            }
          });
        } else if (code !== 0) {
          sentryManager.captureMessage('Migration process exited with error', {
            level: 'warning',
            tags: {
              component: 'utilityProcess',
              operation: 'migrate',
              status: 'failed'
            },
            extra: {
              processId: processId,
              exitCode: code,
              migrationCompleted: migrationCompleted
            }
          });
        }

        mainWindow.webContents.send('cli-output', {
          processId: processId,
          type: 'exit',
          code: code
        });
      });

      // Handle process error (e.g., ENOENT if script doesn't exist)
      child.on('error', (error) => {
        console.error(`🚀 [ELECTRON MAIN] CLI process ${processId} error:`, error);
        console.error(`🚀 [ELECTRON MAIN] Error details:`, {
          message: error.message,
          code: error.code,
          errno: error.errno,
          syscall: error.syscall,
          path: error.path
        });

        // Capture in Sentry
        sentryManager.captureException(error, {
          level: 'error',
          tags: {
            component: 'utilityProcess',
            errorCode: error.code,
            processId: processId
          },
          extra: {
            scriptPath: resolvedScriptPath,
            syscall: error.syscall,
            errno: error.errno,
            cwd: forkOptions.cwd
          }
        });

        activeProcesses.delete(processId);

        mainWindow.webContents.send('cli-error', {
          processId: processId,
          type: 'error',
          data: `[ERROR] ${error.message}\n[ERROR] Code: ${error.code}\n[ERROR] Path: ${error.path || 'N/A'}\n`
        });
      });

      return {
        success: true,
        processId: processId,
        pid: child.pid
      };
    } catch (error) {
      console.error('Error executing CLI:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }, performanceTracker));

  // CLI cancellation handler
  ipcMain.handle('cancel-cli', wrapIpcHandler('cancel-cli', async (event, processId) => {
    try {
      const process = activeProcesses.get(processId);
      if (process) {
        process.kill();
        activeProcesses.delete(processId);
        return { success: true };
      }
      return { success: false, error: 'Process not found' };
    } catch (error) {
      console.error('Error canceling CLI:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }, performanceTracker));

  console.log('✅ CLI handlers registered');
}

module.exports = { setupCliHandlers };
