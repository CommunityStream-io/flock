# Debugging CLI/IPC Issues in Packaged Electron App

## Current Status

✅ **Fixed**: Base href issue - app now renders correctly  
✅ **Fixed**: Using bundled Node.js runtime (`process.execPath`)  
🔍 **Investigating**: CLI execution not returning values in production

## Key Fixes Applied

### 1. Base Href (DONE)
- Changed from `<base href="/">` to `<base href="./">`
- This fixed the rendering issue

### 2. Bundled Node.js (DONE)
- Using `process.execPath` instead of `'node'` command
- Location: `ipc-handlers.js` lines 318-326

### 3. DevTools Enabled (TEMPORARY)
- DevTools now open in production builds for debugging
- Location: `main.js` line 43

## What to Check in DevTools

When running the packaged app (`dist/electron-fixed/win-unpacked/Flock Native.exe`):

### Console Tab

1. **Check for IPC logs**:
   ```
   Look for: 
   - 🚀 [ELECTRON MAIN] CLI EXECUTION STARTED
   - 🚀 [ELECTRON MAIN] Using bundled Node.js runtime: [path]
   - 🚀 [ELECTRON MAIN] Command: node → [path to Flock Native.exe]
   - 🚀 [ELECTRON MAIN] Final Args: [CLI path]
   ```

2. **Check Angular CLI service logs**:
   ```
   Look for:
   - 🦅 [CLIService] Starting Instagram to Bluesky migration...
   - 🦅 CLI Output: [output from CLI]
   - 🦅 CLI Error: [any errors]
   ```

3. **Check for path resolution**:
   ```
   Look for:
   - 🚀 [ELECTRON MAIN] Resolved arg: node_modules/@straiforos/... → [absolute path]
   ```

### Network Tab

Check if there are any failed resource loads.

### Application Tab

Check Local Storage / Session Storage for any state issues.

## Common Issues & Solutions

### Issue 1: CLI Path Not Resolved

**Symptom**: Console shows path resolution failures  
**Solution**: Check `ipc-handlers.js` lines 339-382 for path resolution logic

### Issue 2: Node.js Not Found

**Symptom**: `ENOENT` or "command not found" errors  
**Solution**: Verify `process.execPath` is being used (should show full path to `Flock Native.exe`)

### Issue 3: CLI Package Not Unpacked

**Symptom**: Can't find `@straiforos/instagramtobluesky`  
**Check**: `dist/electron-fixed/win-unpacked/resources/app.asar.unpacked/node_modules/@straiforos/`  
**Solution**: Verify `asarUnpack` in `package.json` includes the package

### Issue 4: No CLI Output

**Symptom**: CLI starts but no stdout/stderr  
**Check**:
1. IPC listeners set up correctly in Angular (`cli.service.ts` lines 43-68)
2. Main process sending events (`ipc-handlers.js` lines 378-398)
3. Check if CLI is actually running (Task Manager → look for node/electron processes)

## Testing Steps

1. **Test in Development**:
   ```bash
   npm run start:native
   ```
   - Upload a file
   - Enter credentials
   - Try migration
   - ✅ Should work

2. **Test in Packaged App**:
   ```bash
   dist/electron-fixed/win-unpacked/Flock Native.exe
   ```
   - Upload a file
   - Enter credentials
   - Try migration
   - Open DevTools (F12 or automatically opens)
   - Check console logs

## Expected Console Output (Success)

```
🚀 [ELECTRON MAIN] CLI EXECUTION STARTED
🚀 [ELECTRON MAIN] Process ID: 1234567890
🚀 [ELECTRON MAIN] Command: node → C:\...\Flock Native.exe
🚀 [ELECTRON MAIN] Args (raw): ["node_modules/@straiforos/instagramtobluesky/dist/main.js"]
🚀 [ELECTRON MAIN] App Root: C:\...\resources\app.asar
🚀 [ELECTRON MAIN] App Path: C:\...\resources\app.asar
🚀 [ELECTRON MAIN] Is Packaged: true
🚀 [ELECTRON MAIN] Resolved arg (unpacked): ... → C:\...\app.asar.unpacked\node_modules\@straiforos\instagramtobluesky\dist\main.js
🚀 [ELECTRON MAIN] Final Args: ["C:\...\main.js"]
🚀 [ELECTRON MAIN] Command to execute: C:\...\Flock Native.exe

// Then CLI output:
🚀 [ELECTRON MAIN] CLI stdout: [CLI messages]
🦅 CLI Output: { processId: '1234567890', type: 'stdout', data: '...' }
```

## Next Steps After Identifying Issue

1. If path resolution fails → Fix path logic in `ipc-handlers.js`
2. If CLI doesn't start → Check `process.execPath` usage
3. If CLI starts but no output → Check IPC event handling
4. If environment variables not passed → Check `mergedEnv` in `execute-cli` handler

## Files to Check

- `projects/flock-native/electron/main.js` - Window creation, DevTools
- `projects/flock-native/electron/ipc-handlers.js` - CLI execution, path resolution
- `projects/flock-native/src/app/service/cli/cli.service.ts` - Angular CLI service
- `projects/flock-native/src/index.html` - Base href configuration

## Temporary Changes (TO REVERT LATER)

1. ✅ DevTools enabled in production (`main.js` line 43)
2. ✅ Extra console.log statements in `ipc-handlers.js`
3. ⚠️  `show: false` commented out (`main.js` line 15)

Remember to remove these after debugging!

---

**Last Updated**: October 13, 2025


