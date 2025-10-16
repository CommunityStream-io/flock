# 🦅 Flock Native - CLI Integration Guide

## Overview

Flock Native uses a **hybrid architecture** where the Angular UI collects configuration and the real `@straiforos/instagramtobluesky` CLI handles the actual migration via Electron IPC.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│          Renderer Process (Angular/Browser)             │
│                                                          │
│  User fills out forms → ConfigService stores config     │
│  ┌────────────────────────────────────────────┐        │
│  │ CLIService.executeMigration()              │        │
│  │ - Builds env vars from config              │        │
│  │ - Calls electronAPI.executeCLI()           │        │
│  └────────────────┬───────────────────────────┘        │
└────────────────────┼──────────────────────────────────┘
                     │ IPC (Secure)
┌────────────────────▼──────────────────────────────────┐
│           Main Process (Electron/Node.js)              │
│                                                          │
│  ┌────────────────────────────────────────────┐        │
│  │ ipc-handlers.js: execute-cli               │        │
│  │ - Merges env: {...process.env, ...opts}   │        │
│  │ - spawn('node', ['cli.js'], {env})         │        │
│  └────────────────┬───────────────────────────┘        │
└────────────────────┼──────────────────────────────────┘
                     │ spawn
┌────────────────────▼──────────────────────────────────┐
│              Child Process (Node.js)                    │
│                                                          │
│  @straiforos/instagramtobluesky CLI                     │
│  - Reads config from process.env                        │
│  - Connects to Bluesky                                  │
│  - Processes Instagram archive                          │
│  - Uploads posts and media                              │
│  - Streams stdout/stderr back via IPC                   │
└─────────────────────────────────────────────────────────┘
```

## Configuration Flow

### 1. User Configures via UI

```typescript
// Auth Step
blueskyCredentials: {
  username: '@user.bsky.social',  // User enters with @ prefix (for UX)
  password: 'app-password'
}

// Config Step
startDate: '2023-01-01'
endDate: '2024-01-01'
simulationMode: true
```

### 2. CLIService Builds Environment Variables

```typescript
// CLIService.executeMigration()
// Note: @ prefix is stripped for AT Protocol authentication
const username = '@user.bsky.social'.substring(1); // => 'user.bsky.social'

const env = {
  BLUESKY_USERNAME: 'user.bsky.social',  // WITHOUT @ prefix
  BLUESKY_PASSWORD: 'app-password',
  ARCHIVE_FOLDER: '/path/to/extracted/archive',
  MIN_DATE: '2023-01-01',
  MAX_DATE: '2024-01-01',
  SIMULATE: '1'
};
```

### 3. Electron Spawns CLI Process

```javascript
// Main process: ipc-handlers.js
spawn('node', ['node_modules/@straiforos/instagramtobluesky/dist/main.js'], {
  env: { ...process.env, ...customEnv },
  cwd: appDirectory
});
```

### 4. CLI Reads Configuration

```typescript
// @straiforos/instagramtobluesky: config.ts
AppConfig.fromEnv() {
  blueskyUsername: process.env.BLUESKY_USERNAME,
  blueskyPassword: process.env.BLUESKY_PASSWORD,
  archiveFolder: process.env.ARCHIVE_FOLDER,
  minDate: process.env.MIN_DATE ? new Date(process.env.MIN_DATE) : undefined,
  maxDate: process.env.MAX_DATE ? new Date(process.env.MAX_DATE) : undefined,
  simulate: process.env.SIMULATE === '1'
}
```

## Progress Monitoring

### CLI Output Streaming

The CLI logs progress via stdout:

```
Import started at 2024-01-01T00:00:00.000Z
Imported 1 posts with 2 media
Imported 2 posts with 4 media
...
Import finished at 2024-01-01T00:10:00.000Z
```

### IPC Streaming

```javascript
// Main process forwards stdout
child.stdout.on('data', (data) => {
  mainWindow.webContents.send('cli-output', {
    processId: processId,
    type: 'stdout',
    data: data.toString()
  });
});
```

### Angular Subscribes

```typescript
// CLIService receives output
cliService.output$.subscribe((data) => {
  console.log('🦅 [CLI OUTPUT]', data.data);
  
  // Parse for progress
  const progress = parseProgress(data.data);
  if (progress?.percentage) {
    splashScreen.show(`Migration ${progress.percentage}%`);
  }
});
```

## Implementation Details

### Files Modified/Created

#### **Angular Services** (`projects/flock-native/src/app/service/`)
- `bluesky.ts` - Validates credentials (real auth happens in CLI)
- `cli.service.ts` - Builds config, executes CLI via IPC
- `native-file-processor.ts` - Extracts archive, provides path

#### **Electron IPC** (`projects/flock-native/electron/`)
- `ipc-handlers.js` - Spawns CLI with merged environment
- `preload.js` - Exposes `executeCLI()` to renderer

#### **Resolvers** (`projects/flock-native/src/app/resolvers/`)
- `migrate-run.resolver.ts` - Orchestrates migration execution

### Environment Variable Mapping

| UI Config | Environment Variable | CLI Config Method | Notes |
|-----------|---------------------|-------------------|-------|
| `blueskyCredentials.username` | `BLUESKY_USERNAME` | `getBlueskyUsername()` | **@ prefix stripped** |
| `blueskyCredentials.password` | `BLUESKY_PASSWORD` | `getBlueskyPassword()` | |
| Extracted archive path | `ARCHIVE_FOLDER` | `getArchiveFolder()` | Ignored if test mode enabled |
| `startDate` | `MIN_DATE` | `getMinDate()` | |
| `endDate` | `MAX_DATE` | `getMaxDate()` | |
| `simulationMode` | `SIMULATE` | `isSimulateEnabled()` | |
| `testVideoMode` | `TEST_VIDEO_MODE` | `isTestModeEnabled()` | Uses test data instead of archive |

## CLI Package Details

### Package: `@straiforos/instagramtobluesky`

**Entry Point:** `dist/main.js`

**Key Features:**
- Instagram archive parsing
- Media processing (images/videos)
- Bluesky authentication
- Post creation with media
- Date range filtering
- Simulation mode (dry-run)
- Progress logging

**Logging:**
Uses `pino` logger with structured output:
```json
{"level":30,"time":1234567890,"msg":"Import started"}
{"level":30,"time":1234567890,"IG_Post":{"message":"Instagram Post","Created":"2024-01-01T00:00:00.000Z"}}
```

## Testing

### Test Video Mode (Fastest Testing)

Test with a single video without uploading your real archive:

1. **Upload** → Select any ZIP file (or skip if test mode enabled)
2. **Auth** → Enter Bluesky credentials  
3. **Config** → Enable "Test Video Mode"
4. **Migrate** → CLI runs with test data

Expected output:
```
🦅 [CLIService] Test video mode: ON
🦅 [CLIService] Test video mode enabled - will use test data instead of archive
CLI stdout: --- TEST mode is enabled, using content from transfer/test_video ---
CLI stdout: Imported 1 posts with 1 media
```

### Dry-Run Mode (Full Archive, No Posting)

Test with your real archive without actually posting:

1. **Upload** → Select Instagram archive
2. **Auth** → Enter Bluesky credentials
3. **Config** → Enable "Simulation Mode"
4. **Migrate** → CLI runs in dry-run mode
5. **Monitor** → Watch console for logs

Expected output:
```
🦅 [CLIService] Simulate mode: ON
CLI stdout: --- SIMULATE mode is enabled, no posts will be imported ---
CLI stdout: Imported 397 posts with 499 media
CLI stdout: Estimated time for real import: 0 hours and 27 minutes
```

### Real Migration

Same flow but **disable** simulation mode:
- CLI authenticates with Bluesky
- Uploads media
- Creates posts
- Rate-limited (3 seconds per post)

## Error Handling

### CLI Errors

```javascript
// Exit code handling
child.on('exit', (code) => {
  if (code === 0) {
    logger.log('✅ Migration completed');
  } else {
    logger.error(`❌ Migration failed with code ${code}`);
  }
});
```

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| `ARCHIVE_FOLDER not found` | Wrong extraction path | Check extracted archive location |
| `BLUESKY_USERNAME required` | Missing credentials | Ensure auth step completed |
| `Authentication failed` | Wrong password | Verify app password (not account password) |
| `Rate limit exceeded` | Too many requests | CLI handles automatically (3s delay) |

## Progress Parsing

The CLI outputs structured logs that can be parsed for progress:

```typescript
// CLIService.parseProgress()
parseProgress(output: string) {
  // "Imported 5 posts with 10 media"
  const match = output.match(/Imported (\d+) posts with (\d+) media/);
  if (match) {
    return {
      posts: parseInt(match[1]),
      media: parseInt(match[2])
    };
  }
  return null;
}
```

## Future Enhancements

### 1. Real-time Progress Bar
Parse CLI output for:
- Total posts to migrate
- Current post number
- Media upload progress
- Calculate percentage

### 2. Cancellation Support
Already implemented:
```typescript
cliService.cancel(processId);
```

### 3. Retry Failed Posts
CLI continues on errors - could parse failed posts and retry

### 4. Direct API Integration
Instead of CLI, import and use `BlueskyClient` directly from the package:
```typescript
import { BlueskyClient } from '@straiforos/instagramtobluesky';
const client = new BlueskyClient(username, password);
await client.login();
```

## Security Notes

### Credential Handling

✅ **Good:**
- Credentials passed via environment variables
- Not logged to console
- Process isolated in child process
- Child process destroyed after completion
- **@ prefix stripped** from username for AT Protocol compatibility

❌ **Avoid:**
- Don't store credentials in files
- Don't log passwords
- Don't pass via command line arguments (visible in ps)

### IPC Security

✅ **Good:**
- `contextIsolation: true`
- `nodeIntegration: false`
- Controlled API surface via `contextBridge`

## Debugging

### Renderer Process (Angular)
```javascript
// Chrome DevTools (F12)
console.log('🦅 [CLI] Starting migration...');
```

### Main Process (Electron)
```javascript
// Terminal where npm run start:native was executed
console.log('Main process: Spawning CLI...');
```

### CLI Process
```javascript
// Forwarded to renderer via IPC
console.log('[CLI OUTPUT] Import started...');
```

### All Three Simultaneously

**Terminal:** Main process logs  
**DevTools:** Renderer + CLI output (forwarded)  

---

**🦅 Simple, Clean, Working!** | **🔒 Secure IPC** | **📊 Real Progress** | **🚀 Production Ready**

