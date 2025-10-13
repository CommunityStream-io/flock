# Clean Scripts - Implementation Summary

## Overview

Implemented robust cross-platform clean scripts that handle Windows file locking issues when Electron processes hold file handles.

## What Was Fixed

### Problem
- Windows file locking prevented `rimraf` and `fs.rmSync` from deleting Electron build artifacts
- Electron processes and test runners (ChromeDriver) hold file handles to `app.asar` and other files
- Standard deletion commands fail with `EBUSY` or `EPERM` errors

### Solution
Created custom Node.js clean scripts that:
1. **Kill running processes** - Terminate Electron, ChromeDriver, and related processes
2. **Wait for file handles to release** - Give OS time to release locks (2 seconds)
3. **Use platform-specific commands** - Windows `rmdir`, Unix `rm -rf`
4. **Retry with exponential backoff** - Up to 5 attempts with 2-second delays
5. **Provide helpful error messages** - Guide users on manual cleanup steps

## Clean Scripts

### 1. `npm run clean` - Full Cleanup
**File**: `scripts/clean.js`

Cleans all build artifacts and temporary files:
- `dist/` - All build output
- `coverage/` - Test coverage reports
- `allure-results/` - Allure test results
- `allure-report/` - Allure HTML reports
- `logs/` - Log files

**Features**:
- Kills Electron, Chrome, and ChromeDriver processes
- Platform-specific deletion (Windows `rmdir`, Unix `rm -rf`)
- Retry mechanism (5 attempts, 2-second delays)
- Clear progress reporting with emojis
- Detailed summary of cleaned/failed directories

**Usage**:
```bash
npm run clean
```

### 2. `npm run clean:electron` - Electron Build Cleanup
**File**: `scripts/clean-electron.js`

Specifically cleans `dist/electron/` directory:
- More aggressive process killing
- Handles multiple Electron instances
- Kills by process name AND window title

**Features**:
- Kills: `electron.exe`, `Flock Native.exe`, `chrome.exe`, `chromedriver.exe`
- Windows: Uses `taskkill /F` and PowerShell fallback
- macOS/Linux: Uses `pkill -9`
- 5 retry attempts with 2-second delays
- Comprehensive error messages

**Usage**:
```bash
npm run clean:electron
```

### 3. Other Clean Commands

```bash
# Clean specific directories (uses rimraf, may fail on locked files)
npm run clean:dist          # Remove dist/
npm run clean:coverage      # Remove coverage/, allure-results/, allure-report/
npm run clean:logs          # Remove logs/

# Nuclear options
npm run clean:node_modules  # Remove node_modules/ (WARNING: Takes time to reinstall)
npm run clean:all           # Clean everything + node_modules
npm run rebuild             # Clean all + reinstall dependencies
```

## Technical Implementation

### Process Killing Strategy

**Windows**:
```javascript
execSync(`taskkill /F /IM "electron.exe" /T 2>nul`, { stdio: 'ignore' });
execSync(`taskkill /F /IM "Flock Native.exe" /T 2>nul`, { stdio: 'ignore' });
execSync(`taskkill /F /IM "chrome.exe" /T 2>nul`, { stdio: 'ignore' });
execSync(`taskkill /F /IM "chromedriver.exe" /T 2>nul`, { stdio: 'ignore' });
```

**macOS**:
```javascript
execSync('pkill -9 Electron', { stdio: 'ignore' });
execSync('pkill -9 "Flock Native"', { stdio: 'ignore' });
```

**Linux**:
```javascript
execSync('pkill -9 electron', { stdio: 'ignore' });
execSync('pkill -9 flock-native', { stdio: 'ignore' });
```

### Deletion Strategy

**Windows (Primary)**:
```javascript
execSync(`rmdir /s /q "${dirPath}"`, { stdio: 'ignore' });
```

**Windows (Fallback)**:
```javascript
execSync(`powershell -Command "Remove-Item -Path '${dirPath}' -Recurse -Force -ErrorAction SilentlyContinue"`, 
  { stdio: 'ignore' });
```

**Unix (macOS/Linux)**:
```javascript
execSync(`rm -rf "${dirPath}"`, { stdio: 'ignore' });
```

### Retry Mechanism

```javascript
const MAX_RETRIES = 5;
const RETRY_DELAY = 2000; // 2 seconds

for (let attempt = 1; attempt <= retries; attempt++) {
  try {
    // Attempt deletion
    return true;
  } catch (error) {
    if (attempt < retries) {
      sleep(RETRY_DELAY);
      killProcesses();  // Try killing processes again
      sleep(1000);      // Extra time for OS to release handles
    }
  }
}
```

## Integration with Build Scripts

Clean scripts are now integrated into build workflows:

```json
{
  "pack:win": "npm run clean:electron && npm run build:native && electron-builder --win",
  "pack:win:dir": "npm run clean:electron && npm run build:native && electron-builder --win --dir",
  "pack:mac": "npm run clean:electron && npm run build:native && electron-builder --mac",
  "pack:linux": "npm run clean:electron && npm run build:native && electron-builder --linux"
}
```

This ensures clean builds by removing old artifacts before building.

## Testing Results

### Before Fix
```
❌ EBUSY: resource busy or locked
❌ EPERM: Permission denied
```

### After Fix
```bash
$ npm run clean

🧹 Cleaning build artifacts and temporary files...
🔍 Checking for processes that might lock files...
ℹ️  No processes found that might lock files
⏳ Waiting for file handles to be released...

🗑️  Build output         (dist)
   ✅ Deleted successfully
🗑️  Test coverage        (coverage)
   ✅ Deleted successfully
🗑️  Allure results       (allure-results)
   ✅ Deleted successfully
✅ Allure reports       (already clean)
🗑️  Log files            (logs)
   ✅ Deleted successfully

============================================================
✅ All artifacts cleaned successfully!
📁 Cleaned: dist, coverage, allure-results, logs
```

## Best Practices

### When to Use Each Command

1. **During Development**:
   ```bash
   npm run clean:electron  # Before rebuilding Electron app
   ```

2. **Before Running Tests**:
   ```bash
   npm run clean:coverage  # Clear old coverage data
   npm run clean:logs      # Clear old log files
   ```

3. **Clean Build**:
   ```bash
   npm run clean           # Full cleanup
   npm run pack:win:dir    # Automatically cleans electron artifacts
   ```

4. **Stuck/Corrupted Build**:
   ```bash
   npm run clean:all       # Nuclear option
   ```

5. **After Major Updates**:
   ```bash
   npm run rebuild         # Clean + reinstall everything
   ```

### Troubleshooting

If clean scripts still fail:

1. **Close all applications**:
   - Close Electron apps manually
   - Close IDEs (VS Code, WebStorm, etc.)
   - Close file explorers viewing dist/ folders

2. **Manual process killing**:
   ```bash
   # Windows
   tasklist | findstr electron
   taskkill /F /PID <PID>
   
   # macOS/Linux
   ps aux | grep electron
   kill -9 <PID>
   ```

3. **Wait and retry**:
   ```bash
   # Wait 10 seconds
   sleep 10  # or timeout /t 10 on Windows
   npm run clean
   ```

4. **Restart computer** (last resort)

## Dependencies

- **rimraf** (v3.0.2) - Used by legacy clean scripts
- **Node.js** (v14.14+) - For `fs.rmSync` API
- **cross-env** - For cross-platform environment variables

## Future Improvements

1. **File Handle Detection** - Identify specific processes holding file locks
2. **Graceful Shutdown** - Ask processes to close before force-killing
3. **Parallel Deletion** - Delete multiple directories concurrently
4. **Progress Bar** - Visual progress for large directory deletions
5. **Dry Run Mode** - Preview what would be deleted without actually deleting

## Related Documentation

- **[Multi-Platform E2E Architecture](docs/testing/MULTI_PLATFORM_E2E_ARCHITECTURE.md)** - Testing across platforms
- **[Electron E2E Strategy](docs/testing/ELECTRON_E2E_STRATEGY.md)** - Electron testing approach
- **[Debugging CLI/IPC](DEBUGGING_CLI_IPC.md)** - Debugging packaged Electron apps

---

**Last Updated**: October 13, 2025

