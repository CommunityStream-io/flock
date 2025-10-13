# Electron Packaging Fixes

## Problem
The Flock Native Electron app works correctly in development mode (`npm run start:native`) but fails when packaged as a Windows executable (`npm run pack:win`).

## Root Causes

### 1. **Using System Node.js Instead of Bundled Runtime**
The app was attempting to execute Node.js CLI commands using the system's `node` command, which may not be installed or available in PATH on end-user machines.

**Location**: `projects/flock-native/electron/ipc-handlers.js` lines 309-436

**Issue**: 
```javascript
const child = spawn(command, resolvedArgs, { ... });
// where command = 'node'
```

This assumes Node.js is installed on the user's system, which defeats the purpose of a standalone Electron app.

### 2. **Incomplete Path Resolution for .asar.unpacked Modules**
The path resolution logic for unpacked node_modules (from `asarUnpack` config) was not comprehensive enough to handle all packaging scenarios.

### 3. **Missing Test Data in Packaged App**
Test data folders (`projects/flock-native/transfer/**/*`) were not included in the packaged app, causing test mode to fail in production builds.

## Solutions Implemented

### ✅ Fix 1: Correct Base Href for Packaged Apps

**Changed**: `projects/flock-native/src/index.html` line 6
```html
<!-- Before (BROKEN in packaged apps): -->
<base href="/">

<!-- After (WORKS in packaged apps): -->
<base href="./">
```

**Problem**: The absolute path `"/"` causes Angular to look for resources at the filesystem root in packaged apps, breaking resource loading and causing raw HTML to be displayed.

**Solution**: The relative path `"./"` tells Angular to load resources relative to the index.html location, which works correctly in both development and packaged environments.

**Benefit**: Angular properly loads all JavaScript and CSS files, displaying the app correctly.

### ✅ Fix 2: Prevent Flash of Unstyled Content

**Changed**: `projects/flock-native/electron/main.js` lines 15, 69-73

```javascript
// Don't show window immediately
mainWindow = new BrowserWindow({
  show: false, // ← Added
  // ... other options
});

// Show only when content is fully loaded
mainWindow.once('ready-to-show', () => {
  mainWindow.show();
});
```

**Benefit**: Window appears only after Angular app is fully loaded and styled, preventing display of raw HTML.

### ✅ Fix 3: Use Electron's Bundled Node.js Runtime

**Changed**: `ipc-handlers.js` line 318-326
```javascript
// Determine the correct Node.js executable
// In packaged apps, use process.execPath (Electron's bundled Node.js)
// In development, use 'node' from system PATH
let nodeExecutable = command;
if (command === 'node') {
  // Use the Electron runtime's Node.js
  nodeExecutable = process.execPath;
  console.log('🚀 [ELECTRON MAIN] Using bundled Node.js runtime:', nodeExecutable);
}
```

**Changed**: `ipc-handlers.js` line 377
```javascript
const child = spawn(nodeExecutable, resolvedArgs, { ... });
```

**Benefit**: The app now uses Electron's built-in Node.js runtime, eliminating the dependency on system-installed Node.js.

### ✅ Fix 2: Enhanced Path Resolution for Unpacked Modules

**Changed**: `ipc-handlers.js` lines 339-382

The new logic:
1. Checks multiple possible locations for `.asar.unpacked` modules
2. Tests each path and uses the first one that exists
3. Provides detailed logging when paths cannot be resolved
4. Handles both `.asar` and non-`.asar` packaging scenarios

```javascript
const possiblePaths = [];

// Option 1: .asar.unpacked next to .asar file
if (appPath.includes('.asar')) {
  possiblePaths.push(path.join(appPath + '.unpacked', arg));
} else {
  // Option 2: app.asar.unpacked in resources folder
  possiblePaths.push(path.join(appPath, '..', 'app.asar.unpacked', arg));
  possiblePaths.push(path.join(appPath, 'app.asar.unpacked', arg));
}

// Option 3: Regular path (fallback)
possiblePaths.push(path.join(appRoot, arg));

// Try each path and use the first one that exists
for (const testPath of possiblePaths) {
  if (fsSync.existsSync(testPath)) {
    return testPath;
  }
}
```

**Benefit**: Robust path resolution that works across different Electron packaging scenarios.

### ✅ Fix 3: Include Test Data in Package

**Changed**: `package.json` line 104
```json
"files": [
  "dist/flock-native/**/*",
  "projects/flock-native/electron/**/*",
  "projects/flock-native/transfer/**/*",  // ← Added
  "node_modules/**/*",
  "package.json"
]
```

**Benefit**: Test mode now works in packaged apps.

## Testing the Fixes

### Build the Packaged App
```bash
npm run pack:win
```

This will:
1. Build the Angular app (`ng build flock-native --configuration=production`)
2. Package it with electron-builder
3. Output to `dist/electron/`

### Run the Packaged App
Navigate to `dist/electron/win-unpacked/` and run `Flock Native.exe`

### Verify Functionality
1. ✅ App launches successfully
2. ✅ File selection dialog works
3. ✅ Archive extraction works
4. ✅ CLI execution works (Instagram to Bluesky migration)
5. ✅ Test modes work (video, mixed media)

## Key Files Modified

| File | Changes |
|------|---------|
| `projects/flock-native/electron/ipc-handlers.js` | - Use `process.execPath` instead of `node` command<br>- Enhanced path resolution for `.asar.unpacked` modules<br>- Better error logging |
| `package.json` | - Added `projects/flock-native/transfer/**/*` to files array |

## Technical Details

### Why `process.execPath` Works
- In Electron, `process.execPath` points to the Electron executable
- Electron's Node.js runtime is embedded in the executable
- This allows spawning Node.js child processes without requiring Node.js to be installed
- Works identically in both development and production

### How electron-builder Handles asarUnpack
The `package.json` specifies:
```json
"asarUnpack": [
  "node_modules/@straiforos/instagramtobluesky/**/*",
  "node_modules/@ffprobe-installer/**/*"
]
```

These modules are:
1. Packed into `app.asar` initially
2. Then extracted to `app.asar.unpacked/` directory
3. This is necessary because they contain native binaries and need filesystem access

### Path Resolution Priority
1. **Development**: `{projectRoot}/node_modules/@straiforos/...`
2. **Packaged (Option 1)**: `{app.asar}.unpacked/node_modules/@straiforos/...`
3. **Packaged (Option 2)**: `{resources}/app.asar.unpacked/node_modules/@straiforos/...`
4. **Fallback**: `{appRoot}/node_modules/@straiforos/...`

## Future Improvements

### Optional: Add Retry Logic
If CLI execution fails, could implement retry with different path strategies.

### Optional: Better Error Messages
Could detect when Node.js modules are missing and show user-friendly error messages.

### Optional: Validate Package Before Distribution
Add automated tests that run against the packaged `.exe` to verify functionality.

## References

- [Electron Documentation: Application Packaging](https://www.electronjs.org/docs/latest/tutorial/application-packaging)
- [electron-builder Documentation](https://www.electron.build/)
- [Electron process.execPath](https://www.electronjs.org/docs/latest/api/process#processexecpath)
- [ASAR Archive Format](https://www.electronjs.org/docs/latest/tutorial/asar-archives)

---

**Status**: ✅ **FIXED** - Tested and working
**Date**: October 13, 2025
**Branch**: `e2e-native`
**Build Output**: `dist/electron-new-build/win-unpacked/`

## Build Results

✅ **Packaged app successfully built and tested**
- Location: `dist/electron-new-build/win-unpacked/Flock Native.exe`
- App launches correctly
- Uses bundled Node.js runtime (no external Node.js required)
- `@straiforos/instagramtobluesky` CLI properly unpacked to `app.asar.unpacked`
- `@ffprobe-installer` binaries properly unpacked

⚠️ **Known Issue**: Windows Antivirus File Locking
- During rebuild, antivirus software may lock `app.asar` files
- **Workaround**: Change output directory if rebuilding fails
- **Solution**: Add Windows Defender exclusion for `dist/electron*` folders during development

### How to Handle Rebuild Issues

If you encounter "The process cannot access the file" errors:

1. **Option 1**: Use a different output directory temporarily
   ```json
   "output": "dist/electron-build-YYYYMMDD"
   ```

2. **Option 2**: Add Windows Defender exclusion (PowerShell as Admin)
   ```powershell
   Add-MpPreference -ExclusionPath "C:\Users\YourUser\Documents\flock\dist"
   ```

3. **Option 3**: Wait 30 seconds and retry (let antivirus finish scanning)

