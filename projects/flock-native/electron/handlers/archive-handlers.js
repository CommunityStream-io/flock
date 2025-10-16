const { ipcMain } = require('electron');
const fs = require('fs').promises;
const path = require('path');
const extract = require('extract-zip');
const os = require('os');
const { wrapIpcHandler, createPerformanceContext } = require('./performance-wrapper');

/**
 * Archive Extraction Handlers
 *
 * Handles:
 * - Archive extraction with progress tracking
 * - Instagram archive structure detection
 * - Directory tree analysis
 */

/**
 * Setup archive-related IPC handlers
 * @param {BrowserWindow} mainWindow - The main window instance
 * @param {Object} Sentry - Sentry instance for error tracking
 * @param {PerformanceTracker} performanceTracker - Performance tracker instance
 */
function setupArchiveHandlers(mainWindow, Sentry, performanceTracker) {
  // Archive extraction handler with performance tracking
  ipcMain.handle('extract-archive', wrapIpcHandler('extract-archive', async (event, filePath, outputPath) => {
    const parentOpId = performanceTracker.startOperation('extract-archive', 'ipc-handler', {
      filePath: path.basename(filePath),
      hasOutputPath: !!outputPath
    });
    
    const perfContext = createPerformanceContext(performanceTracker, parentOpId);
    
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

      // Track file validation phase
      const fileStats = await perfContext.trackAsync('validate-file', async () => {
        return await fs.stat(filePath);
      });
      
      const fileSizeMB = (fileStats.size / (1024 * 1024)).toFixed(2);
      console.log(`🦅 [EXTRACT] Archive size: ${fileSizeMB} MB`);

      // Track directory setup phase
      const targetPath = await perfContext.trackAsync('setup-directory', async () => {
        const outputPath = outputPath || path.join(os.tmpdir(), 'flock-native-extract', Date.now().toString());
        console.log('🦅 [EXTRACT] Target directory:', outputPath);
        
        await fs.mkdir(outputPath, { recursive: true });
        return outputPath;
      });

      // Send progress update
      mainWindow.webContents.send('progress', {
        type: 'extraction',
        status: 'starting',
        message: `Starting extraction of ${fileSizeMB} MB archive...`,
        filePath: filePath,
        targetPath: targetPath
      });

      // Track extraction phase
      await perfContext.trackAsync('extract-zip', async () => {
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
      });

      console.log(`🦅 [EXTRACT] Files extracted to: ${targetPath}`);

      // Track archive structure detection phase
      const archiveStructure = await perfContext.trackAsync('detect-structure', async () => {
        // Instagram archives have a wrapper folder - find the actual archive folder
        // Structure: temp-folder/instagram-username-date/your_instagram_activity/media/posts_1.json
        console.log('🦅 [EXTRACT] Looking for Instagram archive folder...');
        const extractedContents = await fs.readdir(targetPath);
        console.log('🦅 [EXTRACT] Extracted contents:', extractedContents);

      // Helper function to recursively search for a file
      async function findFile(dir, filename, maxDepth = 5, currentDepth = 0) {
        if (currentDepth > maxDepth) return null;

        try {
          const items = await fs.readdir(dir);

          for (const item of items) {
            const fullPath = path.join(dir, item);
            const stats = await fs.stat(fullPath);

            if (stats.isFile() && item === filename) {
              console.log(`🦅 [EXTRACT] Found ${filename} at depth ${currentDepth}:`, fullPath);
              return fullPath;
            } else if (stats.isDirectory()) {
              // Prioritize Instagram-specific folders for faster searching
              if (item.includes('instagram') || item.includes('activity') || item.includes('media')) {
                console.log(`🦅 [EXTRACT] Searching Instagram folder: ${item} (depth ${currentDepth})`);
                const found = await findFile(fullPath, filename, maxDepth, currentDepth + 1);
                if (found) return found;
              } else {
                const found = await findFile(fullPath, filename, maxDepth, currentDepth + 1);
                if (found) return found;
              }
            }
          }
        } catch (err) {
          // Ignore permission errors, etc.
          console.log(`🦅 [EXTRACT] Error searching ${dir}: ${err.message}`);
        }

        return null;
      }

      // Helper function to list directory tree (limited depth)
      async function listTree(dir, prefix = '', maxDepth = 4, currentDepth = 0) {
        if (currentDepth > maxDepth) return;

        try {
          const items = await fs.readdir(dir);

          for (let i = 0; i < Math.min(items.length, 15); i++) { // Show more items
            const item = items[i];
            const isLast = i === items.length - 1;
            const fullPath = path.join(dir, item);
            const stats = await fs.stat(fullPath);

            // Highlight Instagram-specific folders
            const isInstagramFolder = item.includes('instagram') || item.includes('activity') || item.includes('media');
            const highlight = isInstagramFolder ? '🔍 ' : '';

            console.log(`${prefix}${isLast ? '└── ' : '├── '}${highlight}${item}${stats.isDirectory() ? '/' : ''}`);

            // Recurse deeper for Instagram folders, shallower for others
            if (stats.isDirectory()) {
              const shouldRecurse = isInstagramFolder ? currentDepth < 3 : currentDepth < 2;
              if (shouldRecurse) {
                await listTree(fullPath, `${prefix}${isLast ? '    ' : '│   '}`, maxDepth, currentDepth + 1);
              }
            }
          }

          if (items.length > 15) {
            console.log(`${prefix}... (${items.length - 15} more items)`);
          }
        } catch (err) {
          console.log(`${prefix}[Error reading directory: ${err.message}]`);
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
        console.log('🦅 [EXTRACT] Using fallback: checking for Instagram archive structure...');

        // Enhanced fallback: look for Instagram-specific folder structure
        let foundInstagramFolder = null;

        // Check if we have a single wrapper folder
        if (extractedContents.length === 1) {
          const wrapperFolder = path.join(targetPath, extractedContents[0]);
          const wrapperStats = await fs.stat(wrapperFolder);

          if (wrapperStats.isDirectory()) {
            console.log('🦅 [EXTRACT] Found wrapper folder:', extractedContents[0]);

            // Look inside the wrapper folder for Instagram-specific folders
            const wrapperContents = await fs.readdir(wrapperFolder);
            console.log('🦅 [EXTRACT] Wrapper contents:', wrapperContents);

            // Look for folders that match Instagram archive patterns
            for (const item of wrapperContents) {
              const itemPath = path.join(wrapperFolder, item);
              const itemStats = await fs.stat(itemPath);

              if (itemStats.isDirectory() && (
                item.includes('instagram') ||
                item.includes('meta') ||
                item.includes('your_instagram_activity')
              )) {
                console.log('🦅 [EXTRACT] Found potential Instagram folder:', item);
                foundInstagramFolder = itemPath;
                break;
              }
            }

            // If no specific Instagram folder found, use the wrapper folder
            if (!foundInstagramFolder) {
              foundInstagramFolder = wrapperFolder;
            }
          }
        }

        if (foundInstagramFolder) {
          archiveFolder = foundInstagramFolder;
          console.log('🦅 [EXTRACT] Using fallback archive folder:', archiveFolder);

          // Verify the folder contains expected Instagram structure
          try {
            const folderContents = await fs.readdir(archiveFolder);
            console.log('🦅 [EXTRACT] Archive folder contents:', folderContents);

            // Check for key Instagram folders
            const hasActivityFolder = folderContents.includes('your_instagram_activity');
            const hasMediaFolder = folderContents.some(item => item.includes('media'));
            const hasInstagramFolders = folderContents.some(item =>
              item.includes('instagram') || item.includes('meta')
            );

            console.log('🦅 [EXTRACT] Structure analysis:');
            console.log('🦅 [EXTRACT]   - Has your_instagram_activity:', hasActivityFolder);
            console.log('🦅 [EXTRACT]   - Has media folder:', hasMediaFolder);
            console.log('🦅 [EXTRACT]   - Has Instagram folders:', hasInstagramFolders);

            if (!hasActivityFolder && !hasMediaFolder && !hasInstagramFolders) {
              console.log('🦅 [EXTRACT] ⚠️ Archive folder may not contain Instagram data');
            }
          } catch (err) {
            console.log('🦅 [EXTRACT] Could not analyze archive folder structure:', err.message);
          }
        } else {
          console.log('🦅 [EXTRACT] ❌ No suitable archive folder found');
        }
      }

      return {
        archiveFolder,
        hasPostsJson: !!postsJsonPath,
        structure: {
          hasActivityFolder: foundInstagramFolder ? true : false,
          hasMediaFolder: foundInstagramFolder ? true : false,
          hasInstagramFolders: foundInstagramFolder ? true : false
        }
      };
    });

      // Send completion update
      mainWindow.webContents.send('progress', {
        type: 'extraction',
        status: 'complete',
        message: `Extraction complete`,
        outputPath: archiveStructure.archiveFolder
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
          hasArchiveFolder: !!archiveStructure.archiveFolder,
          hasPostsJson: archiveStructure.hasPostsJson
        }
      });

      performanceTracker.endOperation(parentOpId, {
        success: true,
        fileSizeMB: parseFloat(fileSizeMB),
        hasArchiveFolder: !!archiveStructure.archiveFolder,
        hasPostsJson: archiveStructure.hasPostsJson
      });

      return {
        success: true,
        outputPath: archiveStructure.archiveFolder,
        fileSizeMB: parseFloat(fileSizeMB),
        hasPostsJson: archiveStructure.hasPostsJson
      };
    } catch (error) {
      console.error('❌ [EXTRACT] Error extracting archive:', error);

      // Sentry: Track extraction failure
      Sentry.captureException(error, {
        level: 'error',
        tags: {
          component: 'extract-archive',
          operation: 'extract',
          status: 'failed'
        },
        extra: {
          errorMessage: error.message
        }
      });

      mainWindow.webContents.send('progress', {
        type: 'extraction',
        status: 'error',
        message: error.message
      });

      performanceTracker.endOperation(parentOpId, {
        success: false,
        error: error.message,
        errorType: error.constructor.name
      });

      return {
        success: false,
        error: error.message
      };
    }
  }, performanceTracker));

  console.log('✅ Archive handlers registered');
}

module.exports = { setupArchiveHandlers };
