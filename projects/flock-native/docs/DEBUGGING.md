# Debugging Guide - Flock Native

This document provides guidance on debugging the Flock Native application, with a focus on the splash screen and progress component lifecycle.

## Table of Contents
- [Logging Prefixes](#logging-prefixes)
- [Component Lifecycle](#component-lifecycle)
- [Common Debugging Scenarios](#common-debugging-scenarios)
- [Understanding Log Output](#understanding-log-output)
- [Troubleshooting](#troubleshooting)

## Logging Prefixes

All logging in the application uses consistent prefixes to help identify the source:

| Prefix | Component/Service | Purpose |
|--------|------------------|---------|
| `[SplashScreenLoading]` | SplashScreenLoading Service | Tracks splash screen state and component lifecycle |
| `[SplashScreen]` | SplashScreen Component | Tracks component changes in the view |
| `[ExtractionProgressComponent]` | Extraction Progress | Monitors archive extraction progress |
| `[ExtractionProgressService]` | Extraction Progress Service | Handles IPC events from Electron for extraction |
| `[MigrationProgressComponent]` | Migration Progress | Monitors migration progress |
| `[NativeFileProcessor]` | File Processing Service | Handles file selection, validation, and extraction |
| `[ExtractArchiveResolver]` | Route Resolver | Manages extraction lifecycle during routing |

## Component Lifecycle

### Splash Screen Component Flow

The splash screen uses a component injection pattern to show custom progress components:

```
1. SplashScreenLoading.show(message)
   └─> Sets isLoading = true
   └─> Updates message

2. SplashScreenLoading.setComponent(ComponentClass)
   └─> Logs: "setComponent() called: OldName → NewName"
   └─> Logs: "Called from: [stack trace]"
   └─> If removing component: Logs full stack trace

3. SplashScreen (View)
   └─> Logs: "Component changed to: ComponentName"
   └─> Renders component via NgComponentOutlet

4. Component ngOnInit()
   └─> Logs: "========== ngOnInit called =========="
   └─> Component starts receiving progress updates

5. SplashScreenLoading.hide()
   └─> Logs: "hide() called"
   └─> Sets isLoading = false
   └─> Clears component (sets to null)
```

### Extraction Progress Flow

```
User clicks "Next" on upload page
  │
  ├─> Router navigates to /step/auth
  │
  ├─> extractArchiveResolver runs
  │     └─> Calls NativeFileProcessor.extractArchive()
  │           │
  │           ├─> Logs: "Starting archive extraction..."
  │           ├─> Calls splashScreenLoading.show()
  │           │     └─> Logs: "[SplashScreenLoading] show() called with message: Preparing extraction..."
  │           │
  │           ├─> Calls splashScreenLoading.setComponent(ExtractionProgressComponent)
  │           │     └─> Logs: "[SplashScreenLoading] setComponent() called: null → _ExtractionProgressComponent"
  │           │     └─> Logs: "[SplashScreenLoading] Called from: [stack trace]"
  │           │
  │           ├─> Component instantiated
  │           │     └─> Logs: "[ExtractionProgressComponent] ========== ngOnInit called =========="
  │           │     └─> Subscribes to ExtractionProgressService
  │           │
  │           ├─> Calls api.extractArchive()
  │           │     └─> Electron backend sends IPC progress events
  │           │           └─> ExtractionProgressService receives events
  │           │                 └─> Logs: "[ExtractionProgressService] RAW IPC EVENT: {...}"
  │           │                 └─> Logs: "[ExtractionProgressService] FORWARDING extraction event: {...}"
  │           │                 └─> Component receives event
  │           │                       └─> Logs: "[ExtractionProgressComponent] Received event from service: {...}"
  │           │                       └─> Logs: "[ExtractionProgressComponent] Set percentage: X → rounded: Y"
  │           │                       └─> Logs: "[ExtractionProgressComponent] Current state: {...}"
  │           │
  │           └─> Extraction completes
  │                 └─> Logs: "[NativeFileProcessor] Archive extraction completed successfully"
  │                 └─> Returns true
  │
  └─> extractArchiveResolver finalize() runs
        └─> Logs: "[ExtractArchiveResolver] Finalize: resetting component and hiding splash"
        └─> Calls splashScreenLoading.setComponent(null)
              └─> Logs: "[SplashScreenLoading] setComponent() called: _ExtractionProgressComponent → null"
              └─> Logs: "[SplashScreenLoading] ⚠️ Component being reset! Full stack trace:"
        └─> Calls splashScreenLoading.hide()
              └─> Logs: "[SplashScreenLoading] hide() called"
        └─> Logs: "[ExtractArchiveResolver] Finalize complete"
```

## Common Debugging Scenarios

### 1. Progress Component Not Rendering

**Symptoms:**
- Component class appears in logs but `ngOnInit` never called
- Component set then immediately cleared

**What to look for:**
```
✅ Good Flow:
[SplashScreenLoading] setComponent() called: null → _ExtractionProgressComponent
[ExtractionProgressComponent] ========== ngOnInit called ==========
[ExtractionProgressComponent] Subscribed to progress service

❌ Bad Flow:
[SplashScreenLoading] setComponent() called: null → _ExtractionProgressComponent
[SplashScreenLoading] setComponent() called: _ExtractionProgressComponent → null
(no ngOnInit log - component never instantiated)
```

**Common causes:**
- Another resolver calling `setComponent(null)` (check stack traces)
- Component being removed in a `finally` block before rendering
- Migration reset resolver clearing component too early

**Solution:**
- Check the "Called from:" stack traces to identify what's resetting the component
- Ensure `setComponent(null)` only happens in resolver `finalize()` blocks
- Update `migrationResetResolver` to check component type before clearing

### 2. Progress Updates Not Showing

**Symptoms:**
- Component renders but percentage stays at 0%
- No "Received event from service" logs

**What to look for:**
```
✅ Good Flow:
[ExtractionProgressService] RAW IPC EVENT: {type: 'extraction', percentage: 45, ...}
[ExtractionProgressService] FORWARDING extraction event: {...}
[ExtractionProgressComponent] Received event from service: {...}
[ExtractionProgressComponent] Set percentage: 45 → rounded: 45

❌ Bad Flow:
[ExtractionProgressService] RAW IPC EVENT: {type: 'migration', ...}
[ExtractionProgressService] Ignoring non-extraction event type: migration
(wrong event type - not forwarding)
```

**Common causes:**
- IPC events have wrong `type` field
- ExtractionProgressService not filtering correctly
- Component subscription not set up properly

**Solution:**
- Verify Electron backend sends `type: 'extraction'` in IPC events
- Check that `ExtractionProgressService` is forwarding events
- Ensure component's `ngOnInit` subscribes before events arrive

### 3. Component Lifecycle Conflicts

**Symptoms:**
- Multiple components trying to render simultaneously
- Component flashing/flickering

**What to look for:**
```
[SplashScreenLoading] setComponent() called: null → _ExtractionProgressComponent
[SplashScreenLoading] setComponent() called: _ExtractionProgressComponent → _MigrationProgressComponent
[SplashScreenLoading] ⚠️ Component being reset! Full stack trace:
```

**Common causes:**
- Multiple resolvers running on same route
- Resolver not waiting for previous operation to complete
- Race condition between extraction and migration

**Solution:**
- Ensure only one progress component active at a time
- Use resolver ordering to control flow
- Check migration reset resolver logic

## Understanding Log Output

### Stack Trace Interpretation

When a component is reset, the full stack trace shows:

```
[SplashScreenLoading] ⚠️ Component being reset! Full stack trace:
[SplashScreenLoading]    at _SplashScreenLoading.setComponent (main.js:895:19)
[SplashScreenLoading]    at migrationResetResolver (main.js:1096:13)  ← CULPRIT
[SplashScreenLoading]    at execFinalizer (...)
```

The second line (after `setComponent`) shows **who called** the reset - this is usually the culprit.

### Progress Event Structure

```typescript
{
  type: 'extraction',           // 'extraction' | 'migration' | 'validation'
  status: 'progress',           // 'starting' | 'progress' | 'complete' | 'error'
  message: 'Extracting...',     // User-friendly message
  percentage: 45.7823,          // Raw percentage (gets rounded to 46)
  filesProcessed: 1234,         // Files completed
  totalFiles: 5678,             // Total files to process
  duration?: '45.2',            // Optional: time taken (seconds)
  outputPath?: '/path/to/...'   // Optional: extraction output path
}
```

### Log Volume Control

To reduce log noise during development, you can filter by prefix in DevTools:

```javascript
// Show only splash screen logs
console.log('[Splash')

// Show only extraction logs
console.log('[Extraction')

// Hide all progress component logs
-console.log('[ExtractionProgressComponent]')
```

## Troubleshooting

### Issue: "Component being reset" Warning

**Cause:** Something is calling `setComponent(null)` when a component is active.

**Debug steps:**
1. Look at the stack trace to identify the caller
2. Check if it's in a resolver's `finalize()` - this is normal
3. If it's from another source (like migration reset), update the logic
4. Verify the component type check in `migrationResetResolver`

### Issue: Percentage Flickering/Unstable

**Cause:** Raw percentage values with decimals causing rapid updates.

**Solution:** Already fixed with computed signal that rounds values:
```typescript
percentage = computed(() => {
  const raw = this.percentageRaw();
  return Math.min(Math.max(Math.round(raw), 0), 100);
});
```

### Issue: Splash Message Not Updating

**Cause:** Effect not triggering or message not being set correctly.

**Debug steps:**
1. Check if component's `constructor()` effect is set up
2. Verify `splashScreenLoading.message.next()` is being called
3. Check logs for "Component changed to:" to see if component is rendering

### Issue: Extraction Doesn't Start

**Cause:** Resolver not calling `extractArchive()` or file processor error.

**Debug steps:**
1. Look for `[ExtractArchiveResolver] Calling extractArchive()`
2. Check for `[NativeFileProcessor] Starting archive extraction...`
3. Look for any error logs from the file processor
4. Verify file was selected and validated

## Best Practices

1. **Always use logging helpers** - Keeps prefixes consistent
   ```typescript
   this.log('Message', data);  // ✅ Good
   console.log('Message');     // ❌ Bad
   ```

2. **Log state transitions** - Makes debugging lifecycle issues easier
   ```typescript
   this.log('State changed:', oldState, '→', newState);
   ```

3. **Include context in logs** - Helps correlate related events
   ```typescript
   this.log('Processing file:', filename, 'size:', fileSize);
   ```

4. **Use log levels appropriately**
   - `log()` - Normal operation flow
   - `error()` - Errors that need attention
   - `warn()` - Potential issues

5. **Check stack traces** - When debugging component lifecycle issues, always check the "Called from:" line to see what triggered the action

## Additional Resources

- [Angular Signals Documentation](https://angular.dev/guide/signals)
- [RxJS Subscription Management](https://rxjs.dev/guide/subscription)
- [Angular Router Resolvers](https://angular.dev/guide/routing/common-router-tasks#resolve)
- [Electron IPC Communication](https://www.electronjs.org/docs/latest/tutorial/ipc)

