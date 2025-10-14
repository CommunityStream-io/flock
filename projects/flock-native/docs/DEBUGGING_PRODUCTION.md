# Debugging Production Electron Build

This guide covers how to debug the packaged Electron application from the command line.

## Table of Contents
- [Running Packaged App from Command Line](#running-packaged-app-from-command-line)
- [Viewing Console Logs](#viewing-console-logs)
- [Common Issues](#common-issues)
- [Log Locations](#log-locations)

## Running Packaged App from Command Line

### Windows

#### Method 1: Direct Execution (Shows All Logs)
```bash
# From project root
"dist/electron/win-unpacked/Flock Native.exe"

# Or use full path
C:\path\to\flock\dist\electron\win-unpacked\Flock Native.exe
```

**Benefits:**
- Shows **both** main process and renderer process logs
- See real-time CLI execution output
- Catch startup errors
- View Electron internal errors

#### Method 2: Background Execution (No Logs)
```bash
start "" "dist/electron/win-unpacked/Flock Native.exe"
```

This launches the app in the background (no console logs visible).

### macOS

```bash
# From project root
./dist/electron/mac/Flock\ Native.app/Contents/MacOS/Flock\ Native

# Or
open -a "dist/electron/mac/Flock Native.app"
```

### Linux

```bash
# From project root
./dist/electron/linux-unpacked/flock-native
```

## Viewing Console Logs

### Main Process Logs
These are logged to the terminal when you run the app from command line:

```
🦅 Flock Native - Eagle is ready to soar!
📂 App Path: C:\...\resources\app.asar
🏠 User Data: C:\Users\...\AppData\Roaming\flock
🔍 Loading from: C:\...\dist\flock-native\browser\index.html
✅ Page loaded successfully
```

### CLI Execution Logs
When the migration runs, you'll see detailed CLI logs:

```
=====================================
🚀 [ELECTRON MAIN] CLI EXECUTION STARTED
🚀 [ELECTRON MAIN] Process ID: 1760364904410
🚀 [ELECTRON MAIN] Command: node
🚀 [ELECTRON MAIN] Args (raw): [ 'node_modules/@straiforos/instagramtobluesky/dist/main.js' ]
🚀 [ELECTRON MAIN] App Root: C:\...\app.asar
🚀 [ELECTRON MAIN] Resolved arg: node_modules/... → C:\...\node_modules\...
=====================================
```

### Renderer Process Logs (DevTools)
Even in production builds, you can open DevTools:

1. **Method 1: Keyboard Shortcut**
   - Windows/Linux: `Ctrl + Shift + I`
   - macOS: `Cmd + Option + I`

2. **Method 2: Right-click**
   - Right-click anywhere in the app
   - Select "Inspect Element" (if enabled in build)

## Common Issues

### Issue: "spawn C:\WINDOWS\system32\cmd.exe ENOENT"
**Cause:** CLI execution with `shell: true` fails in packaged apps

**Solution:** Already fixed in latest build - uses direct spawn without shell wrapper

**Debug:**
```bash
# Check if node is accessible
where node

# Verify CLI module is unpacked
dir "dist\electron\win-unpacked\resources\app.asar.unpacked\node_modules\@straiforos\instagramtobluesky"
```

### Issue: "MODULE_NOT_FOUND" 
**Cause:** CLI module not properly unpacked from asar archive

**Solution:** Ensure `asarUnpack` is configured in `package.json`:
```json
"asarUnpack": [
  "node_modules/@straiforos/instagramtobluesky/**/*",
  "node_modules/@ffprobe-installer/**/*"
]
```

**Verify:**
```bash
# Check if module exists in unpacked resources
ls dist/electron/win-unpacked/resources/app.asar.unpacked/node_modules/@straiforos/instagramtobluesky/dist/
```

### Issue: Progress Bar Not Showing
**Cause:** Extraction progress component might be cleared by navigation resolver

**Debug in DevTools Console:**
```javascript
// Check if extraction is running
console.log('Extraction logs should appear here')

// Look for these log patterns:
// 🦅 [EXTRACT] Progress: XX% (files)
// [ExtractionProgressComponent] Component is being initialized
```

### Issue: No Logs Appearing
**Possible causes:**
1. App launched with `start` command (use direct execution instead)
2. Console output redirected
3. App crashed before logging initialized

**Fix:**
```bash
# Kill any running instances
taskkill /F /IM "Flock Native.exe"

# Run directly from terminal
"dist/electron/win-unpacked/Flock Native.exe"
```

## Log Locations

### Application Logs
```
Windows: C:\Users\{username}\AppData\Roaming\flock\logs\
macOS:   ~/Library/Application Support/flock/logs/
Linux:   ~/.config/flock/logs/
```

### Temporary Extraction Files
```
Windows: C:\Users\{username}\AppData\Local\Temp\flock-native-extract\
macOS:   /tmp/flock-native-extract/
Linux:   /tmp/flock-native-extract/
```

### Electron Cache
```
Windows: C:\Users\{username}\AppData\Roaming\flock\
macOS:   ~/Library/Application Support/flock/
Linux:   ~/.config/flock/
```

## Advanced Debugging

### Enable Full Verbose Logging

Add environment variable before running:

**Windows (PowerShell):**
```powershell
$env:ELECTRON_ENABLE_LOGGING=1
& "dist\electron\win-unpacked\Flock Native.exe"
```

**Windows (CMD):**
```cmd
set ELECTRON_ENABLE_LOGGING=1
"dist\electron\win-unpacked\Flock Native.exe"
```

**macOS/Linux:**
```bash
ELECTRON_ENABLE_LOGGING=1 ./dist/electron/mac/Flock\ Native.app/Contents/MacOS/Flock\ Native
```

### Inspect Network Requests

Use DevTools Network tab to monitor API calls to Bluesky:
1. Open DevTools (`Ctrl/Cmd + Shift + I`)
2. Go to Network tab
3. Start migration
4. Filter by "bsky" or "atproto"

### Debug CLI Execution

Check what command is actually being executed:

```javascript
// In DevTools Console, check the logs for:
console.log('🚀 [ELECTRON MAIN] Command: node')
console.log('🚀 [ELECTRON MAIN] Final Args: [...]')
```

## Building for Debug

To build a production package that's easier to debug:

1. **Keep DevTools Available:**
   Edit `projects/flock-native/electron/main.js`:
   ```javascript
   if (isDev || process.env.DEBUG_MODE) {
     mainWindow.webContents.openDevTools();
   }
   ```

2. **Build:**
   ```bash
   npm run build:native
   ```

3. **Package:**
   ```bash
   DEBUG_MODE=1 npm run pack:win:dir
   ```

4. **Run:**
   ```bash
   DEBUG_MODE=1 "dist/electron/win-unpacked/Flock Native.exe"
   ```

## Troubleshooting Checklist

When debugging production issues:

- [ ] Run from command line (not via `start`)
- [ ] Check main process logs in terminal
- [ ] Open DevTools and check Console tab
- [ ] Verify CLI module is unpacked in `app.asar.unpacked/`
- [ ] Check Windows Event Viewer for app crashes
- [ ] Verify `node` is in system PATH
- [ ] Clear app cache and try again
- [ ] Check temporary extraction folder exists
- [ ] Verify Bluesky credentials are correct
- [ ] Test with smaller Instagram archive first

## Reporting Issues

When reporting bugs, include:

1. **Full terminal output** from running exe directly
2. **DevTools Console logs** (screenshots or copy/paste)
3. **Steps to reproduce** the issue
4. **System info:**
   ```bash
   node --version
   npm --version
   echo $env:OS  # Windows
   uname -a      # macOS/Linux
   ```
5. **App version** from Help → About

---

**Pro Tip:** Always run the packaged app from terminal first before deploying. It reveals issues that won't be visible when launching normally.

