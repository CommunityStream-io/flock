# 🦅 Flock Native - Logging Guide

## Service Logging Pattern

All native services now use a consistent logging pattern with service-specific prefixes:

### Services with Logging

1. **NativeFileProcessor** - File selection and extraction
2. **CLIService** - CLI execution and monitoring  
3. **BlueskyService** - Authentication

### Logging Helper Pattern

```typescript
/**
 * Logging helpers with service name prefix
 */
private log(...args: any[]) {
  const message = args.join(' ');
  console.log('🦅 [ServiceName]', ...args);
  this.logger.log(`[ServiceName] ${message}`);
}

private error(...args: any[]) {
  const message = args.join(' ');
  console.error('🦅 [ServiceName]', ...args);
  this.logger.error(`[ServiceName] ${message}`);
}
```

### Usage

```typescript
this.log('Starting operation...');
this.log('Value:', someValue);
this.error('Operation failed:', error);
```

## Log Filtering

### In Chrome DevTools (F12)
```
🦅 [NativeFileProcessor] Files: 2090/5543
🦅 [CLIService] Starting migration...
🦅 [BlueskyService] Credentials validated
```

**Filter by service:**
- Type `[NativeFileProcessor]` in the filter box
- Or `[CLIService]` to see only CLI logs
- Or just `🦅` to see all Flock native logs

### In Terminal (Main Process)
```
🚀 [ELECTRON MAIN] CLI EXECUTION STARTED
CLI stdout: Import started...
```

## Example Output

### Full Migration Flow Logs

```
// DevTools Console:
🦅 [NativeFileProcessor] Starting archive extraction...
🦅 [NativeFileProcessor] File: instagram-20240101.zip
🦅 [NativeFileProcessor] Size: 245.32 MB
🦅 [NativeFileProcessor] Files: 100/5543
🦅 [NativeFileProcessor] Files: 1000/5543
...
🦅 [NativeFileProcessor] ✅ Extraction complete (45.2s)
🦅 [BlueskyService] Validating Bluesky credentials: @user.bsky.social
🦅 [BlueskyService] Credentials validation passed
🦅 [CLIService] Starting Instagram to Bluesky migration...
🦅 [CLIService] Archive folder: C:\Users\...\tmp\extract\...
🦅 [CLIService] Bluesky handle: @user.bsky.social
🦅 [CLIService] Date range: 2023-01-01 to 2024-01-01
🦅 [CLIService] Simulate mode: ON
🦅 [CLIService] Environment variables configured
🦅 [CLIService] Executing migration CLI via Electron IPC...

// Terminal (Main Process):
=====================================
🚀 [ELECTRON MAIN] CLI EXECUTION STARTED
🚀 [ELECTRON MAIN] Process ID: 1734012345678
🚀 [ELECTRON MAIN] Command: node
🚀 [ELECTRON MAIN] Args: ["node_modules/@straiforos/instagramtobluesky/dist/main.js"]
🚀 [ELECTRON MAIN] Working Dir: C:/Users/trifo/Documents/flock
🚀 [ELECTRON MAIN] Custom Env Vars: BLUESKY_USERNAME, BLUESKY_PASSWORD, ARCHIVE_FOLDER, MIN_DATE, MAX_DATE, SIMULATE
=====================================
CLI stdout: --- SIMULATE mode is enabled, no posts will be imported ---
CLI stdout: Import started at 2024-01-01T00:00:00.000Z
CLI stdout: Imported 10 posts with 15 media
...
```

## Why You Might Not See CLI Logs

### Common Issues

1. **Wrong Resolver**: Make sure `app.routes.ts` uses `nativeMigrateRunResolver` NOT `migrateRunResolver`
   ```typescript
   resolve: {
     migrate: nativeMigrateRunResolver  // ✅ Correct
   }
   ```

2. **Missing Archive Path**: The resolver uses a placeholder path
   ```typescript
   const archivePath = '/path/to/extracted/archive';  // ⚠️ Placeholder
   ```
   This needs to be updated to use the actual extracted path.

3. **Not Reaching Complete Step**: CLI only executes when navigating to `/step/complete`

4. **Electron Not Restarted**: Changes require restarting the Electron app

### Debugging Steps

1. **Check Route Configuration**
   ```bash
   # Verify nativeMigrateRunResolver is used
   grep -n "nativeMigrateRunResolver" projects/flock-native/src/app/app.routes.ts
   ```

2. **Check DevTools Console**
   - Press F12 in Electron window
   - Look for `🦅 [MIGRATE]` logs
   - If you see "MIGRATE Starting native migration resolver", the resolver is running

3. **Check Terminal**
   - Look for `🚀 [ELECTRON MAIN] CLI EXECUTION STARTED`
   - If you don't see this, the IPC call isn't reaching the main process

4. **Check for Errors**
   - Look for error messages in both DevTools and Terminal
   - Common error: "Bluesky credentials not found"

## Next Steps

### Store Extracted Archive Path

Currently using placeholder. Need to:

1. **Update ExtractArchive Resolver** to store path in config service
   ```typescript
   configService.setExtractedArchivePath(result.outputPath);
   ```

2. **Update Config Service** to track extracted archive path
   ```typescript
   private extractedArchivePathSignal = signal<string>('');
   
   public get extractedArchivePath(): string {
     return this.extractedArchivePathSignal();
   }
   
   public setExtractedArchivePath(path: string): void {
     this.extractedArchivePathSignal.set(path);
   }
   ```

3. **Update Migration Resolver** to use stored path
   ```typescript
   const archivePath = configService.extractedArchivePath;
   if (!archivePath) {
     throw new Error('Archive not extracted. Please return to upload step.');
   }
   ```

---

**🦅 Clean Logs** | **🔍 Easy Filtering** | **📊 Full Observability**

