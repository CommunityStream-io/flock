# 🔍 Sentry for Electron - Native App Error Tracking

## Overview

Flock Native now includes **Sentry error tracking in both the main and renderer processes**. This gives us real-time visibility into:

- ✅ **utilityProcess spawn failures** (like the one you're experiencing!)
- ✅ **IPC handler errors**
- ✅ **CLI execution failures**  
- ✅ **Uncaught exceptions** in Electron main process
- ✅ **Renderer process errors** (Angular app)
- ✅ **Full breadcrumb trail** leading to errors

## Quick Setup

### 1. Get Your Sentry DSN

1. Sign up at [sentry.io](https://sentry.io)
2. Create a new **Electron** project (not just Angular)
3. Copy your DSN

### 2. Set Environment Variable

**Important:** Use `NATIVE_SENTRY_DSN` for the Electron native app (separate from the web app's `SENTRY_DSN`).

#### For Development:
```bash
# Windows PowerShell
$env:NATIVE_SENTRY_DSN="https://your-dsn@sentry.io/project-id"
npm run start:native

# Windows CMD
set NATIVE_SENTRY_DSN=https://your-dsn@sentry.io/project-id
npm run start:native

# Linux/Mac
export NATIVE_SENTRY_DSN="https://your-dsn@sentry.io/project-id"
npm run start:native
```

#### For Packaged App:
Set it before running the .exe:

```cmd
set NATIVE_SENTRY_DSN=https://your-dsn@sentry.io/project-id
cd dist\win-unpacked
"Flock Native.exe"
```

Or create a batch file (`run-with-sentry.bat`):

```batch
@echo off
set NATIVE_SENTRY_DSN=https://your-dsn@sentry.io/project-id
"Flock Native.exe"
```

### 3. Run the App

That's it! Sentry is now tracking errors.

## What Gets Captured

### Automatic Error Tracking

**Main Process:**
- Uncaught exceptions
- Unhandled promise rejections
- utilityProcess spawn failures
- IPC handler errors
- File system errors

**Renderer Process:**
- Angular errors
- HTTP request failures
- Component errors
- Service failures

### Breadcrumbs (User Action Trail)

When an error occurs, Sentry shows the breadcrumb trail:

```
1. CLI execution started (processId: 12345)
2. Attempting to fork utility process
3. ❌ ERROR: utilityProcess failed to spawn
```

This helps us see **exactly** what led to the failure!

## Example: Debugging Your Current Issue

When the utilityProcess fails to spawn, Sentry will capture:

**Error:**
```
utilityProcess failed to spawn
```

**Tags:**
- `component`: utilityProcess
- `processId`: 1760441709631
- `isPackaged`: true

**Extra Context:**
- `scriptPath`: C:\...\app.asar.unpacked\node_modules\@straiforos\instagramtobluesky\dist\main.js
- `scriptExists`: true/false ← **This is the smoking gun!**
- `nodePath`: C:\...\app.asar.unpacked\node_modules
- `nodePathExists`: true/false ← **This tells us if NODE_PATH is wrong**
- `cwd`: C:\...\resources
- `appPath`: C:\...\app.asar
- `appRoot`: C:\...\resources

**Breadcrumbs:**
1. CLI execution started
2. Attempting to fork utility process
3. Process failed to spawn within 5 seconds

With this information, we can see:
- Whether the script actually exists
- Whether NODE_PATH is correctly set
- What the exact paths are

## Privacy & Security

### Automatically Filtered:

❌ `BLUESKY_PASSWORD`  
❌ `BLUESKY_USERNAME`  
❌ `SENTRY_DSN`  
❌ Any breadcrumb with "password" or "token"

✅ File paths  
✅ Error messages  
✅ Stack traces  
✅ Process IDs

### Manual Filtering:

If you need to filter more data, edit `main.js` and `ipc-handlers.js`:

```javascript
beforeSend(event, hint) {
  // Add custom filtering
  if (event.extra?.someField) {
    delete event.extra.someField;
  }
  return event;
}
```

## Viewing Errors in Sentry

### 1. Open Sentry Dashboard

Log in to sentry.io and select your project.

### 2. View Issues

Click **Issues** in the left sidebar.

### 3. Click on an Error

You'll see:

**Error Details:**
- Error message and stack trace
- When it occurred
- How many users affected
- Environment (development/production)

**Tags:**
- `component`: utilityProcess
- `errorCode`: ENOENT (if file not found)
- `processId`: 12345

**Extra Context:**
- Full diagnostic information
- All the paths
- Environment variables (filtered)

**Breadcrumbs:**
- Timeline of events leading to error
- IPC calls made
- User actions

### 4. Debug!

With all this information, you can see exactly what went wrong and where.

## Cost Management

**Free Tier:** 5,000 events/month (plenty for development)

**To reduce events:**

1. **Only set DSN in production:**
   ```javascript
   // Only in packaged apps
   const sentryDsn = app.isPackaged ? process.env.NATIVE_SENTRY_DSN : null;
   ```

2. **Lower sample rate:**
   ```javascript
   tracesSampleRate: 0.1, // Only 10% of transactions
   ```

3. **Add more ignored errors:**
   ```javascript
   ignoreErrors: [
     'ENOENT',
     'EACCES',
     'Network request failed',
     'User cancelled', // Add more here
   ],
   ```

## Integration with Existing Debug Output

Sentry **complements** (doesn't replace) your console logging:

**Console Logs:**
- Show real-time output
- Help during active debugging
- Visible in DevTools

**Sentry:**
- Captures errors you don't see
- Shows errors from users
- Provides historical context
- Aggregates similar errors

Both together give you complete visibility!

## Testing Sentry

### 1. Trigger a Test Error

Add this to `main.js` after Sentry init:

```javascript
// Test Sentry - remove after verification
setTimeout(() => {
  Sentry.captureException(new Error('Test error from Electron main'), {
    level: 'info',
    tags: { test: true }
  });
  console.log('✅ Test error sent to Sentry');
}, 2000);
```

### 2. Run the App

```bash
npm run start:native
```

### 3. Check Sentry Dashboard

Within a few seconds, you should see the test error in your Sentry dashboard.

### 4. Remove Test Code

Don't forget to remove the test code!

## Advanced: Source Maps

To get readable stack traces in production builds:

### 1. Enable Source Maps

In `angular.json`:

```json
{
  "configurations": {
    "production": {
      "sourceMap": {
        "scripts": true,
        "hidden": true
      }
    }
  }
}
```

### 2. Upload to Sentry

```bash
npm install --save-dev @sentry/cli

npx sentry-cli upload-sourcemaps \
  --org your-org \
  --project your-project \
  --release flock-native@0.4.8 \
  dist/flock-native/browser/
```

### 3. Configure Upload in package.json

Add to `scripts`:

```json
{
  "sentry:upload": "sentry-cli upload-sourcemaps --org your-org --project your-project --release flock-native@0.4.8 dist/flock-native/browser/"
}
```

Then run after build:

```bash
npm run build:native
npm run sentry:upload
```

## Troubleshooting

### "Sentry not initialized"

Check that `NATIVE_SENTRY_DSN` is set:

```bash
echo %NATIVE_SENTRY_DSN%  # Windows
echo $NATIVE_SENTRY_DSN   # Linux/Mac
```

If empty, set it and restart the app.

**Note:** The native app uses `NATIVE_SENTRY_DSN`, not `SENTRY_DSN`. This keeps native and web app error tracking separate.

### "Events not showing in Sentry"

1. **Check network access** - Can the app reach sentry.io?
2. **Check console** - Look for Sentry initialization message
3. **Wait a minute** - Sentry batches events
4. **Check filters** - You might be filtering the error
5. **Verify DSN** - Make sure it's correct

### "Too many events"

Increase `ignoreErrors` list or lower `tracesSampleRate`.

## Current Implementation

### Files Modified:

1. **`main.js`**
   - Sentry initialization (very early)
   - Uncaught exception handling
   - Unhandled rejection handling

2. **`ipc-handlers.js`**
   - Breadcrumbs for IPC calls
   - Error capture for utilityProcess failures
   - Diagnostic context for spawn timeouts

### Where Errors Are Captured:

- ✅ utilityProcess spawn timeout (5 sec)
- ✅ utilityProcess.on('error')
- ✅ Uncaught exceptions
- ✅ Unhandled rejections

## Next: Solve Your Issue!

Now when you run the packaged app with `SENTRY_DSN` set, **every utilityProcess failure will be logged to Sentry** with full diagnostic context.

You'll see:
- Exact script path being used
- Whether the script exists
- Whether NODE_PATH exists
- All environment details

This will tell us **exactly** why utilityProcess isn't spawning! 🎯

## Example Sentry Event

Here's what you'll see when the error occurs:

```json
{
  "exception": {
    "message": "utilityProcess failed to spawn",
    "type": "Error"
  },
  "tags": {
    "component": "utilityProcess",
    "processId": "1760441709631",
    "isPackaged": "true"
  },
  "extra": {
    "scriptPath": "C:\\...\\app.asar.unpacked\\node_modules\\@straiforos\\instagramtobluesky\\dist\\main.js",
    "scriptExists": false,  // ← THE ANSWER!
    "nodePath": "C:\\...\\app.asar.unpacked\\node_modules",
    "nodePathExists": true,
    "cwd": "C:\\...\\resources",
    "appPath": "C:\\...\\app.asar",
    "appRoot": "C:\\...\\resources"
  },
  "breadcrumbs": [
    {
      "category": "ipc",
      "message": "CLI execution started",
      "timestamp": "2025-01-15T10:30:00Z"
    },
    {
      "category": "utilityProcess",
      "message": "Attempting to fork utility process",
      "timestamp": "2025-01-15T10:30:01Z"
    }
  ]
}
```

With this data, we can immediately see the root cause!

