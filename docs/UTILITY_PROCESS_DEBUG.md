# 🔍 Utility Process Debugging - Migration Hang Issue

## Problem

The packaged app (.exe) starts the migration process but **hangs without returning data**:
- ✅ UI responds and navigates correctly  
- ✅ Migration process starts (process ID returned)
- ❌ **No CLI output received** (no stdout/stderr)
- ❌ **Process PID is undefined**
- ❌ No data streaming to UI

## Root Cause Analysis

Based on the log analysis from `Untitled-1.ini`:

```
Line 4145: 🦅 CLI process started: 1760422714221 (PID: undefined)
```

**The process is created but never spawns.** This indicates:

1. `utilityProcess.fork()` returns a child object
2. The 'spawn' event never fires
3. No stdout/stderr streams are established
4. The process is stuck in a pre-spawn state

## Potential Issues

### 1. **Module Resolution**
The utility process may not be able to find node_modules because:
- The script is in `.asar.unpacked` but tries to require modules from `.asar`
- NODE_PATH is not set correctly for the utility process
- The CLI script can't resolve its dependencies

### 2. **Script Path Issues**
Even though the script exists, there might be:
- Permission issues reading the script
- Invalid characters in the path
- Path resolution differs for utilityProcess vs child_process

### 3. **Electron API Limitations**
Possible electron-builder or utilityProcess quirks:
- utilityProcess might not work with ASAR-unpacked files
- The API might require different configuration in packaged apps
- There might be a Windows-specific issue

## Diagnostic Changes Made

### 1. Added Debug Output to Renderer
```javascript
// Send immediate feedback to renderer (visible in DevTools console)
mainWindow.webContents.send('cli-output', {
  processId: processId,
  type: 'stdout',
  data: `[DEBUG] utilityProcess forked - waiting for spawn event...\n`
});
```

This helps us see:
- ✅ IPC communication is working
- ✅ The handler is being called
- ⏳ Waiting for spawn event...

### 2. Added Spawn Detection
```javascript
let hasSpawned = false;

child.on('spawn', () => {
  hasSpawned = true;
  mainWindow.webContents.send('cli-output', {
    processId: processId,
    type: 'stdout',
    data: `[DEBUG] Process spawned successfully (PID: ${child.pid})\n`
  });
});

// 5-second timeout to detect spawn failure
setTimeout(() => {
  if (!hasSpawned) {
    mainWindow.webContents.send('cli-error', {
      processId: processId,
      type: 'error',
      data: `[ERROR] Process failed to spawn within 5 seconds\n`
    });
  }
}, 5000);
```

### 3. Added Stream Validation
```javascript
if (child.stdout) {
  console.log('🚀 [ELECTRON MAIN] Setting up stdout handler...');
  // ... handlers
} else {
  mainWindow.webContents.send('cli-error', {
    processId: processId,
    type: 'error',
    data: '[DEBUG] Error: child.stdout is null\n'
  });
}
```

### 4. Fixed NODE_PATH for Module Resolution
```javascript
// Ensure the utility process can find node_modules
if (app.isPackaged && appPath.includes('.asar')) {
  mergedEnv.NODE_PATH = path.join(appPath + '.unpacked', 'node_modules');
} else if (app.isPackaged) {
  mergedEnv.NODE_PATH = path.join(appPath, '..', 'app.asar.unpacked', 'node_modules');
} else {
  mergedEnv.NODE_PATH = path.join(appRoot, 'node_modules');
}
```

This is **critical** because:
- The CLI script requires `@straiforos/instagramtobluesky`
- Without NODE_PATH, Node.js can't find the unpacked modules
- The script might fail silently during initialization

### 5. Enhanced Error Reporting
```javascript
child.on('error', (error) => {
  console.error(`🚀 [ELECTRON MAIN] Error details:`, {
    message: error.message,
    code: error.code,
    errno: error.errno,
    syscall: error.syscall,
    path: error.path
  });
  
  mainWindow.webContents.send('cli-error', {
    processId: processId,
    type: 'error',
    data: `[ERROR] ${error.message}\n[ERROR] Code: ${error.code}\n[ERROR] Path: ${error.path || 'N/A'}\n`
  });
});
```

## What to Look For in Next Test

When you run the packaged app again, check the **DevTools console** for these messages:

### Expected Success Path
```
🦅 CLI process started: 1760422714221 (PID: undefined)
[DEBUG] utilityProcess forked - waiting for spawn event...
[DEBUG] Process spawned successfully (PID: 12345)
<actual CLI output starts here>
```

### If NODE_PATH Issue
```
🦅 CLI process started: 1760422714221 (PID: undefined)
[DEBUG] utilityProcess forked - waiting for spawn event...
[ERROR] Process failed to spawn within 5 seconds
```

### If Stream Issue
```
🦅 CLI process started: 1760422714221 (PID: undefined)
[DEBUG] utilityProcess forked - waiting for spawn event...
[DEBUG] Error: child.stdout is null
[DEBUG] Error: child.stderr is null
```

### If Script Path Issue
```
[ERROR] ENOENT: no such file or directory
[ERROR] Code: ENOENT
[ERROR] Path: C:\...\main.js
```

## Alternative Solutions if Still Failing

If utilityProcess continues to fail, we have these options:

### Option A: Fallback to child_process.fork()
```javascript
const { fork } = require('child_process');

const child = fork(resolvedScriptPath, scriptArgs, {
  cwd: options.cwd || appRoot,
  env: mergedEnv,
  execPath: process.execPath, // Use Electron's Node.js
  silent: true
});
```

**Pros:**
- More battle-tested for Electron apps
- Better documented edge cases
- Works the same in dev and packaged modes

**Cons:**
- Uses the wrong execPath in packaged apps (we'd need to override it)
- Not the "modern" Electron way

### Option B: Use child_process.spawn() with node binary
```javascript
const { spawn } = require('child_process');

// Extract the embedded Node.js binary path
const nodePath = process.execPath; // Or path to bundled node.exe

const child = spawn(nodePath, [resolvedScriptPath, ...scriptArgs], {
  cwd: options.cwd || appRoot,
  env: mergedEnv,
  stdio: ['ignore', 'pipe', 'pipe']
});
```

**Pros:**
- Explicit control over what binary runs the script
- Can bundle a specific Node.js version

**Cons:**
- Need to bundle node.exe separately
- More complex packaging

### Option C: Extract to extraResources and use external Node.js
Move the CLI to `extraResources` instead of `asarUnpack` and spawn it with an external Node.js runtime.

## Next Steps

1. **Rebuild the app** with the diagnostic changes:
   ```bash
   npm run pack:win:docker
   ```

2. **Run the packaged app** and open DevTools (F12 or Ctrl+Shift+I)

3. **Look for the [DEBUG] messages** in the console

4. **Share the console output** to determine the exact failure point

5. Based on the output:
   - If spawn timeout → investigate script path or permissions
   - If null streams → investigate utilityProcess stdio configuration  
   - If ENOENT → investigate module resolution

## Files Modified

- `projects/flock-native/electron/ipc-handlers.js`:
  - Added debug messages sent to renderer
  - Added spawn detection timeout
  - Added NODE_PATH configuration
  - Enhanced error reporting
  - Added null checks for stdout/stderr

## References

- [Electron utilityProcess Documentation](https://www.electronjs.org/docs/latest/api/utility-process)
- [Node.js Module Resolution](https://nodejs.org/api/modules.html#modules_loading_from_node_modules_folders)
- [electron-builder ASAR Unpacking](https://www.electron.build/configuration/configuration#configuration-asar)

