# Electron App Manual Testing Guide

**Purpose**: Verify the CLI execution fix works in the packaged Electron app

**Date**: October 13, 2025

---

## Prerequisites

✅ Electron app built: `npm run pack:win:dir`  
✅ Build location: `dist/electron/win-unpacked/Flock Native.exe`  
✅ CLI package unpacked: `dist/electron/win-unpacked/resources/app.asar.unpacked/node_modules/@straiforos/instagramtobluesky/`

---

## Test Steps

### Test 1: Launch the App

```bash
# Open File Explorer
explorer dist/electron/win-unpacked

# Double-click: Flock Native.exe
```

**Expected**:
- ✅ App launches successfully
- ✅ Window opens with Flock UI
- ✅ DevTools open automatically (temporary debug mode)
- ✅ No console errors

---

### Test 2: Verify CLI Path Resolution (E2E Test)

**In the app**:
1. Open DevTools (F12 if not already open)
2. Go to Console tab
3. Type and run:

```javascript
window.electronAPI.testResolveCliPath().then(console.log)
```

**Expected Response**:
```json
{
  "success": true,
  "exists": true,
  "path": "C:\\...\\app.asar.unpacked\\node_modules\\@straiforos\\instagramtobluesky\\dist\\main.js",
  "triedPaths": [...],
  "isPackaged": true
}
```

**Verification**:
- ✅ `success: true`
- ✅ `exists: true`
- ✅ `path` points to `.asar.unpacked` directory
- ✅ `isPackaged: true`

---

### Test 3: Navigate Through the App

**Steps**:
1. Click "Begin Your Journey" on landing page
2. Select a ZIP file on upload page
   - Use: `projects/flock-native/transfer/test_video/test_video.zip`
3. Click "Next" to go to auth step
4. Enter credentials:
   - Username: `test.bsky.social`
   - Password: `test-password`
5. Click "Next" to go to config step
6. Enable "Simulation Mode"
7. Enable "Test Video Mode"
8. Click "Next" to go to migration step

**Expected**:
- ✅ Each step loads correctly
- ✅ Form validation works
- ✅ Navigation flows smoothly
- ✅ No console errors

---

### Test 4: Trigger CLI Execution (Critical Test)

**On migration step**:
1. Click "Start Migration" button
2. Watch DevTools console

**Expected Console Output**:
```
🚀 [ELECTRON MAIN] CLI EXECUTION STARTED
🚀 [ELECTRON MAIN] Process ID: 1234567890
🚀 [ELECTRON MAIN] Command: node → C:\...\Flock Native.exe
🚀 [ELECTRON MAIN] Args (raw): ["node_modules/@straiforos/instagramtobluesky/dist/main.js"]
🚀 [ELECTRON MAIN] App Root: C:\...\resources\app.asar
🚀 [ELECTRON MAIN] Is Packaged: true
🚀 [ELECTRON MAIN] Resolved arg (unpacked): ... → C:\...\app.asar.unpacked\node_modules\@straiforos\instagramtobluesky\dist\main.js
🚀 [ELECTRON MAIN] Final Args: ["C:\...\main.js"]
🚀 [ELECTRON MAIN] CLI stdout: [CLI messages]
🦅 CLI Output: { processId: '1234567890', type: 'stdout', data: '...' }
```

**Verification**:
- ✅ No path resolution errors
- ✅ "Resolved arg (unpacked)" shows `.asar.unpacked` path
- ✅ CLI starts successfully
- ✅ CLI output appears in DevTools
- ✅ Angular service receives IPC events
- ✅ UI shows progress updates

---

### Test 5: Verify Simulation Mode

**With simulation mode enabled**:

**Expected**:
- ✅ CLI runs but doesn't actually post to Bluesky
- ✅ Progress updates show in UI
- ✅ Process completes successfully
- ✅ No actual network requests to Bluesky API
- ✅ Success message displayed

---

### Test 6: Error Handling

**Test invalid credentials**:
1. Restart app
2. Go through flow with invalid credentials
3. Watch for error handling

**Expected**:
- ✅ Authentication error shown
- ✅ Error message is clear
- ✅ User remains on auth step
- ✅ Can retry with correct credentials

---

## Success Criteria

### ✅ CLI Execution Works
- [X] CLI package found in unpacked directory
- [X] Path resolution succeeds
- [X] CLI process starts
- [X] CLI output received via IPC
- [X] No ENOENT or path errors

### ✅ Migration Flow Works
- [ ] Can upload test archive
- [ ] Can authenticate (or simulate)
- [ ] Can configure settings
- [ ] CLI executes successfully
- [ ] Progress updates display
- [ ] Completion message shows

### ✅ No Regressions
- [ ] App launches
- [ ] Navigation works
- [ ] Form validation works
- [ ] No console errors
- [ ] UI renders correctly

---

## Common Issues & Solutions

### Issue: CLI path not found
**Symptom**: `ENOENT` or "Could not resolve arg"  
**Check**: DevTools console for path resolution attempts  
**Solution**: Verify `app.asar.unpacked` directory exists

### Issue: No CLI output
**Symptom**: Process starts but no stdout  
**Check**: IPC listeners in Angular service  
**Solution**: Verify `cli-output` event handler is set up

### Issue: App doesn't start
**Symptom**: Window doesn't open  
**Check**: Task Manager for hung processes  
**Solution**: Kill any lingering node/electron processes

---

## Debug Commands

### Check if app.asar.unpacked exists:
```bash
ls dist/electron/win-unpacked/resources/app.asar.unpacked/node_modules/@straiforos/
```

### Check if main.js exists:
```bash
ls dist/electron/win-unpacked/resources/app.asar.unpacked/node_modules/@straiforos/instagramtobluesky/dist/main.js
```

### Run app with extra logging:
```bash
# Set environment variable for more verbose output
set DEBUG=* && dist\electron\win-unpacked\Flock Native.exe
```

---

## Test Results

**Date Tested**: _____________

**Tester**: _____________

**Results**:
- [ ] ✅ All tests passed
- [ ] ⚠️ Some tests failed (document below)
- [ ] ❌ Critical failure (CLI execution doesn't work)

**Notes**:
```
(Add any observations, errors, or issues here)
```

---

## Next Steps After Successful Testing

1. ✅ Remove temporary DevTools enablement (`main.js` line 43)
2. ✅ Remove extra console.log statements if desired
3. ✅ Run E2E tests: `npm run e2e:electron:build`
4. ✅ Create regression test for CLI execution
5. ✅ Deploy to production

---

**Status**: Ready for Manual Testing 🚀

