const { ipcMain, dialog, app, utilityProcess } = require('electron');
const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const extract = require('extract-zip');
const os = require('os');
require('dotenv').config();

// Store active CLI processes
const activeProcesses = new Map();

/**
 * Setup all IPC handlers
 * @param {BrowserWindow} mainWindow - The main window instance
 */
function setupIpcHandlers(mainWindow, sentryInstance) {
  // Use Sentry instance provided by main process; fallback to no-op if missing
  const Sentry = sentryInstance || { addBreadcrumb() {}, captureException() {}, captureMessage() {} };
  
  // File selection handler
  ipcMain.handle('select-file', async (event) => {
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
      Sentry.addBreadcrumb({
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
  });

  // Archive validation handler
  ipcMain.handle('validate-archive', async (event, filePath) => {
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
  });

  // Archive extraction handler
  ipcMain.handle('extract-archive', async (event, filePath, outputPath) => {
    const startTime = Date.now();
    
    try {
      console.log('🦅 [EXTRACT] Starting archive extraction');
      console.log('🦅 [EXTRACT] Source file:', filePath);
      
      // Sentry: Track extraction start
      Sentry.captureMessage('Archive extraction started', {
        level: 'info',
        tags: {
          component: 'extract-archive',
          operation: 'extract'
        },
        extra: {
          filePath: path.basename(filePath)
        }
      });
      
      // If no output path provided, use temp directory
      const targetPath = outputPath || path.join(os.tmpdir(), 'flock-native-extract', Date.now().toString());
      console.log('🦅 [EXTRACT] Target directory:', targetPath);
      
      // Get file stats for progress reporting
      const fileStats = await fs.stat(filePath);
      const fileSizeMB = (fileStats.size / (1024 * 1024)).toFixed(2);
      console.log(`🦅 [EXTRACT] Archive size: ${fileSizeMB} MB`);
      
      // Ensure target directory exists
      console.log('🦅 [EXTRACT] Creating target directory...');
      await fs.mkdir(targetPath, { recursive: true });

      // Send progress update
      mainWindow.webContents.send('progress', {
        type: 'extraction',
        status: 'starting',
        message: `Starting extraction of ${fileSizeMB} MB archive...`,
        filePath: filePath,
        targetPath: targetPath
      });

      console.log('🦅 [EXTRACT] Extracting ZIP archive...');
      
      // Extract the archive with progress
      await extract(filePath, { 
        dir: targetPath,
        onEntry: (entry, zipfile) => {
          // Log every 10th file to avoid console spam
          if (zipfile.entryCount && zipfile.entriesRead % 10 === 0) {
            const progress = Math.round((zipfile.entriesRead / zipfile.entryCount) * 100);
            console.log(`🦅 [EXTRACT] Progress: ${progress}% (${zipfile.entriesRead}/${zipfile.entryCount} files)`);
            
            mainWindow.webContents.send('progress', {
              type: 'extraction',
              status: 'progress',
              message: `Extracting files... ${progress}%`,
              percentage: progress,
              filesProcessed: zipfile.entriesRead,
              totalFiles: zipfile.entryCount
            });
          }
        }
      });

      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      console.log(`🦅 [EXTRACT] Extraction completed in ${duration} seconds`);
      console.log(`🦅 [EXTRACT] Files extracted to: ${targetPath}`);

      // Instagram archives have a wrapper folder - find the actual archive folder
      // Structure: temp-folder/instagram-username-date/your_instagram_activity/media/posts_1.json
      console.log('🦅 [EXTRACT] Looking for Instagram archive folder...');
      const extractedContents = await fs.readdir(targetPath);
      console.log('🦅 [EXTRACT] Extracted contents:', extractedContents);
      
      // Helper function to recursively search for a file
      async function findFile(dir, filename, maxDepth = 3, currentDepth = 0) {
        if (currentDepth > maxDepth) return null;
        
        try {
          const items = await fs.readdir(dir);
          
          for (const item of items) {
            const fullPath = path.join(dir, item);
            const stats = await fs.stat(fullPath);
            
            if (stats.isFile() && item === filename) {
              return fullPath;
            } else if (stats.isDirectory()) {
              const found = await findFile(fullPath, filename, maxDepth, currentDepth + 1);
              if (found) return found;
            }
          }
        } catch (err) {
          // Ignore permission errors, etc.
        }
        
        return null;
      }
      
      // Helper function to list directory tree (limited depth)
      async function listTree(dir, prefix = '', maxDepth = 3, currentDepth = 0) {
        if (currentDepth > maxDepth) return;
        
        try {
          const items = await fs.readdir(dir);
          
          for (let i = 0; i < Math.min(items.length, 10); i++) { // Limit to first 10 items
            const item = items[i];
            const isLast = i === items.length - 1;
            const fullPath = path.join(dir, item);
            const stats = await fs.stat(fullPath);
            
            console.log(`${prefix}${isLast ? '└── ' : '├── '}${item}${stats.isDirectory() ? '/' : ''}`);
            
            if (stats.isDirectory() && currentDepth < 2) { // Only recurse 2 levels
              await listTree(fullPath, `${prefix}${isLast ? '    ' : '│   '}`, maxDepth, currentDepth + 1);
            }
          }
          
          if (items.length > 10) {
            console.log(`${prefix}... (${items.length - 10} more items)`);
          }
        } catch (err) {
          console.log(`${prefix}[Error reading directory]`);
        }
      }
      
      // Log directory structure
      console.log('🦅 [EXTRACT] Directory structure:');
      await listTree(targetPath);
      
      // Search for posts_1.json to find the correct archive folder
      console.log('🦅 [EXTRACT] Searching for posts_1.json...');
      const postsJsonPath = await findFile(targetPath, 'posts_1.json');
      
      let archiveFolder = targetPath;
      
      if (postsJsonPath) {
        console.log('🦅 [EXTRACT] ✅ Found posts_1.json at:', postsJsonPath);
        
        // The CLI expects the folder containing "your_instagram_activity"
        // posts_1.json is at: .../your_instagram_activity/media/posts_1.json
        // So we need to go up 2 levels from posts_1.json, then up 1 more to get the parent
        const mediaFolder = path.dirname(postsJsonPath); // .../media
        const activityFolder = path.dirname(mediaFolder); // .../your_instagram_activity
        archiveFolder = path.dirname(activityFolder); // The folder containing your_instagram_activity
        
        console.log('🦅 [EXTRACT] Derived archive folder:', archiveFolder);
        console.log('🦅 [EXTRACT] Relative path check:');
        console.log('🦅 [EXTRACT]   - Activity folder:', path.relative(archiveFolder, activityFolder));
        console.log('🦅 [EXTRACT]   - Media folder:', path.relative(archiveFolder, mediaFolder));
        console.log('🦅 [EXTRACT]   - Posts file:', path.relative(archiveFolder, postsJsonPath));
      } else {
        console.log('🦅 [EXTRACT] ⚠️ posts_1.json not found in extracted archive');
        console.log('🦅 [EXTRACT] Using fallback: checking for wrapper folder...');
        
        // Fallback: check for single subfolder
        if (extractedContents.length === 1) {
          const subfolder = path.join(targetPath, extractedContents[0]);
          const subfolderStats = await fs.stat(subfolder);
          
          if (subfolderStats.isDirectory()) {
            console.log('🦅 [EXTRACT] Found wrapper folder:', extractedContents[0]);
            archiveFolder = subfolder;
          }
        }
      }

      // Send completion update
      mainWindow.webContents.send('progress', {
        type: 'extraction',
        status: 'complete',
        message: `Extraction complete (${duration}s)`,
        outputPath: archiveFolder,
        duration: duration
      });
      
      // Sentry: Track extraction success
      Sentry.captureMessage('Archive extraction completed', {
        level: 'info',
        tags: {
          component: 'extract-archive',
          operation: 'extract',
          status: 'success'
        },
        extra: {
          duration: duration,
          hasArchiveFolder: !!archiveFolder
        }
      });

      return {
        success: true,
        outputPath: archiveFolder,
        duration: duration
      };
    } catch (error) {
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      console.error('❌ [EXTRACT] Error extracting archive:', error);
      console.error('❌ [EXTRACT] Failed after', duration, 'seconds');
      
      // Sentry: Track extraction failure
      Sentry.captureException(error, {
        level: 'error',
        tags: {
          component: 'extract-archive',
          operation: 'extract',
          status: 'failed'
        },
        extra: {
          duration: duration,
          errorMessage: error.message
        }
      });
      
      mainWindow.webContents.send('progress', {
        type: 'extraction',
        status: 'error',
        message: error.message
      });

      return {
        success: false,
        error: error.message
      };
    }
  });

  // Read file handler
  ipcMain.handle('read-file', async (event, filePath) => {
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
  });

  // CLI execution handler
  // Uses utilityProcess.fork() - the proper Electron API for Node.js child processes
  // Reference: https://www.electronjs.org/docs/latest/api/utility-process
  ipcMain.handle('execute-cli', async (event, options = {}) => {
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
      Sentry.addBreadcrumb({
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
      Sentry.addBreadcrumb({
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
        Sentry.addBreadcrumb({
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
          Sentry.captureException(new Error('utilityProcess failed to spawn'), {
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
          Sentry.captureMessage('Migration completed successfully', {
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
          Sentry.captureMessage('Migration process exited with error', {
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
        Sentry.captureException(error, {
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
  });

  // CLI cancellation handler
  ipcMain.handle('cancel-cli', async (event, processId) => {
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
  });

  // System information handler
  ipcMain.handle('get-system-info', async (event) => {
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
  });

  // Path utilities handler
  ipcMain.handle('get-paths', async (event) => {
    return {
      home: app.getPath('home'),
      appData: app.getPath('appData'),
      userData: app.getPath('userData'),
      temp: app.getPath('temp'),
      downloads: app.getPath('downloads'),
      documents: app.getPath('documents'),
      desktop: app.getPath('desktop')
    };
  });

  console.log('✅ IPC handlers registered');
}

module.exports = { setupIpcHandlers };

