# 🚀 Migration to utilityProcess API

## Summary

Migrated from `child_process.fork()` to Electron's `utilityProcess.fork()` API to fix CLI execution issues in packaged apps.

## Problem

The packaged app was failing to execute the migration CLI with error:
```
spawn C:\Users\trifo\AppData\Local\Temp\...\Flock Native.exe ENOENT
```

**Root Cause**: `child_process.fork()` uses `process.execPath` by default, which in a packaged Electron app points to `Flock Native.exe`, not the Node.js runtime. This caused the fork to try spawning the .exe file instead of Node.js.

## Solution

Switched to Electron's [`utilityProcess.fork()`](https://www.electronjs.org/docs/latest/api/utility-process) API, which:

1. **Handles packaged apps correctly** - Uses Chromium's Services API instead of Node.js child_process
2. **Proper Node.js runtime** - Automatically uses the embedded Node.js runtime
3. **Better isolation** - Runs as a utility process, not a fork of the main process
4. **Cleaner code** - No need for conditional logic between dev and packaged modes

## Comparison

### Before (❌ Broken in packaged apps)

**Extract handler (worked)**:
```javascript
const extract = require('extract-zip');
await extract(filePath, { dir: targetPath }); // Runs in-process
```

**Migrate handler (failed)**:
```javascript
const { fork } = require('child_process');
child = fork(scriptPath, scriptArgs, {
  cwd: options.cwd || appRoot,
  env: mergedEnv,
  silent: true
});
// fork() uses process.execPath which is "Flock Native.exe" ❌
```

### After (✅ Works everywhere)

**IPC Handler (ipc-handlers.js):**
```javascript
const { utilityProcess } = require('electron');

ipcMain.handle('execute-cli', async (event, scriptPath, args = [], options = {}) => {
  // Direct, clean signature - scriptPath instead of 'node' command
  const child = utilityProcess.fork(scriptPath, args, {
    cwd: options.cwd || appRoot,
    env: mergedEnv,
    stdio: 'pipe',
    serviceName: 'Instagram to Bluesky CLI'
  });
  // utilityProcess handles the Node.js runtime correctly ✅
});
```

**Angular Service (cli.service.ts):**
```typescript
// Clean API - just pass the script path directly
await api.executeCLI(scriptPath, args, options);
// No more redundant 'node' command! ✅
```

## Changes Made

### 1. `ipc-handlers.js`
- Removed `child_process.fork` and `spawn` imports
- Added `utilityProcess` from Electron
- Simplified `execute-cli` handler to only use `utilityProcess.fork()`
- **Cleaned up signature**: `(event, scriptPath, args, options)` instead of `(event, command, args, options)`
- Removed conditional logic for dev vs packaged modes
- Cleaned up path resolution logic

### 2. `cli.service.ts`
- Updated documentation to reflect `utilityProcess` usage
- **Removed redundant 'node' parameter**: `executeCLI(scriptPath, args, options)` instead of `executeCLI('node', [scriptPath, ...args], options)`
- Simplified `execute()` method signature
- Updated `executeMigration()` comments

### 3. `electron.d.ts` & `preload.js`
- Updated TypeScript types to reflect cleaner signature
- Changed parameter name from `command` to `scriptPath` for clarity

### 4. Diagnostic Scripts
- Created `scripts/diagnose-packaged-app.js` - Verify packaged app structure
- Created `scripts/verify-packaged-app.js` - Test path resolution logic

## Benefits

1. **Simpler Code** - No conditional logic for dev vs packaged modes
2. **Cleaner API** - Removed redundant 'node' command parameter
3. **More Reliable** - Official Electron API designed for this use case
4. **Better Performance** - Uses Chromium's Services API
5. **Future Proof** - Following Electron best practices

## Completion Detection

Added automatic process termination to handle CLI scripts that don't explicitly call `process.exit()`:

```javascript
// Detect completion messages in stdout
// The CLI outputs: "Total import time: X hours and Y minutes"
if (output.includes('Total import time') || 
    output.includes('Migration Complete!') || 
    output.includes('Successfully migrated')) {
  migrationCompleted = true;
  
  // Force kill after 2 seconds if process doesn't exit naturally
  setTimeout(() => {
    if (activeProcesses.has(processId)) {
      child.kill();
    }
  }, 2000);
}
```

**Why?** The `@straiforos/instagramtobluesky` CLI has open handles (HTTP agents, timers) that prevent natural exit. This ensures the process terminates after successful completion by detecting the final "Total import time" log message.

## Testing

After rebuilding the app, the CLI should:
1. ✅ Execute in development mode (`npm run start:native`)
2. ✅ Execute in packaged mode (`npm run pack:win:docker`)
3. ✅ Work from NSIS installer temp directory
4. ✅ Properly capture stdout/stderr
5. ✅ Handle errors gracefully
6. ✅ Exit automatically after completion (2 second grace period)

## Debugging

If the packaged app hangs without returning data, see:
- **[UTILITY_PROCESS_DEBUG.md](./UTILITY_PROCESS_DEBUG.md)** - Diagnostic guide for spawn/output issues

## References

- [Electron utilityProcess API](https://www.electronjs.org/docs/latest/api/utility-process)
- [Why utilityProcess vs child_process](https://www.electronjs.org/docs/latest/api/utility-process#why-utility-process)
- [Process Model in Electron](https://www.electronjs.org/docs/latest/tutorial/process-model)

