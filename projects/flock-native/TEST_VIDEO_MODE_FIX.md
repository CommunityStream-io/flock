# 🎬 Test Video Mode Fix

## Problem

When "Test Video Mode" was enabled in the Config step, the migration still used the real Instagram archive instead of the test data.

## Root Cause

The `TEST_VIDEO_MODE` environment variable wasn't being passed to the CLI.

### What Test Video Mode Does

When enabled, the CLI uses pre-defined test data from `transfer/test_video/` instead of your Instagram archive:

```typescript
// In @straiforos/instagramtobluesky
if (config.isTestModeEnabled()) {
  postsJsonPath = path.join(archivalFolder, "posts.json");  // Test data
  reelsJsonPath = path.join(archivalFolder, "reels.json");  // Test data
} else {
  postsJsonPath = path.join(archivalFolder, "your_instagram_activity/media/posts_1.json");  // Real data
  reelsJsonPath = path.join(archivalFolder, "your_instagram_activity/media/reels.json");    // Real data
}
```

## Solution

Pass `TEST_VIDEO_MODE` environment variable when test video mode is enabled.

### Code Changes

#### 1. CLIService Options

**Added `testVideoMode` parameter:**

```typescript
async executeMigration(
  archivePath: string,
  options: {
    blueskyHandle: string;
    blueskyPassword: string;
    dateFrom?: string;
    dateTo?: string;
    simulate?: boolean;
    testVideoMode?: boolean;  // ✅ NEW
  }
): Promise<string>
```

#### 2. Environment Variable Mapping

**Added TEST_VIDEO_MODE to env vars:**

```typescript
const env: Record<string, string> = {
  BLUESKY_USERNAME: username,
  BLUESKY_PASSWORD: options.blueskyPassword,
  ARCHIVE_FOLDER: archivePath,
  SIMULATE: options.simulate ? '1' : '0',
};

// Add test video mode
if (options.testVideoMode) {
  env['TEST_VIDEO_MODE'] = '1';  // ✅ NEW
  this.log('Test video mode enabled - will use test data instead of archive');
}
```

#### 3. Resolver Update

**Pass testVideoMode from config:**

```typescript
const processId = await cliService.executeMigration(archivePath, {
  blueskyHandle: credentials.username,
  blueskyPassword: credentials.password,
  dateFrom: configService.startDate,
  dateTo: configService.endDate,
  simulate: configService.simulate,
  testVideoMode: configService.testVideoMode  // ✅ NEW
});
```

## Test Modes Available

The CLI supports multiple test modes:

| Environment Variable | Description | Use Case |
|---------------------|-------------|----------|
| `TEST_VIDEO_MODE=1` | Single video post | Quick video upload test |
| `TEST_IMAGE_MODE=1` | Single image post | Quick image upload test |
| `TEST_IMAGES_MODE=1` | Multiple images post | Carousel/album test |
| `TEST_MIXED_MEDIA_MODE=1` | Mixed media types | Comprehensive test |

Currently, only `TEST_VIDEO_MODE` is exposed in the UI via the Config step.

## Benefits of Test Video Mode

1. **Fast Testing**: No need to upload your real Instagram archive
2. **Safe**: Uses pre-defined test data
3. **Reproducible**: Same test data every time
4. **Quick Feedback**: Single post upload is very fast

## Usage

### For Development/Testing

1. Enable "Test Video Mode" in Config step
2. Leave "Simulation Mode" OFF to actually upload
3. CLI will use test data instead of your archive
4. Quick verification that posting works

### Expected Log Output

```
🦅 [MIGRATE] Test video mode: ON
🦅 [CLIService] Test video mode: ON
🦅 [CLIService] Test video mode enabled - will use test data instead of archive
🚀 [ELECTRON MAIN] Custom Env Vars: BLUESKY_USERNAME, BLUESKY_PASSWORD, ARCHIVE_FOLDER, TEST_VIDEO_MODE, SIMULATE
CLI stdout: --- TEST mode is enabled, using content from transfer/test_video ---
CLI stdout: Imported 1 posts with 1 media
CLI process exited with code 0
```

## Comparison: Test Video Mode vs Simulation Mode

| Feature | Test Video Mode | Simulation Mode |
|---------|----------------|-----------------|
| **Data Source** | Test data from CLI | Your Instagram archive |
| **Upload to Bluesky** | Yes (real upload) | No (dry-run) |
| **Speed** | Very fast (1 post) | Depends on archive size |
| **Purpose** | Verify posting works | Verify archive processing |
| **Archive Required** | No | Yes |

### Combining Both

You can enable BOTH modes:
- `TEST_VIDEO_MODE=1` + `SIMULATE=1` = Process test data but don't upload
- Use case: Verify test data processing logic

## Test Data Location Fix

The CLI package doesn't include `transfer/` in npm distribution. Solution:

1. **Copied test data** to `projects/flock-native/transfer/`
2. **Path resolution** in Electron IPC handler
3. **Override ARCHIVE_FOLDER** when test mode enabled

### Implementation

**CLIService (Renderer):**
```typescript
if (options.testVideoMode) {
  env['TEST_VIDEO_MODE'] = '1';
  env['ARCHIVE_FOLDER'] = 'projects/flock-native/transfer/test_video';
}
```

**IPC Handler (Main Process):**
```javascript
// Resolve relative path to absolute
if (mergedEnv.ARCHIVE_FOLDER && !path.isAbsolute(mergedEnv.ARCHIVE_FOLDER)) {
  const resolvedPath = path.resolve(process.cwd(), mergedEnv.ARCHIVE_FOLDER);
  mergedEnv.ARCHIVE_FOLDER = resolvedPath;
}
```

### Expected Logs

```
🦅 [CLIService] Test video mode: ON
🦅 [CLIService] Test data path: projects/flock-native/transfer/test_video
🚀 [ELECTRON MAIN] Resolving relative path: projects/flock-native/transfer/test_video
🚀 [ELECTRON MAIN] Resolved to: C:\Users\...\flock\projects\flock-native\transfer\test_video
CLI stdout: --- TEST mode is enabled, using content from C:\...\test_video ---
CLI stdout: Imported 1 posts with 1 media
```

## Files Modified

- `projects/flock-native/src/app/service/cli.service.ts` - Added testVideoMode parameter and env var, set test data path
- `projects/flock-native/src/app/resolvers/migrate-run.resolver.ts` - Pass testVideoMode from config
- `projects/flock-native/electron/ipc-handlers.js` - Resolve relative paths to absolute
- `projects/flock-native/transfer/` - Test data copied from source repo
- `projects/flock-native/transfer/README.md` - Test data documentation
- `projects/flock-native/CLI_INTEGRATION.md` - Documentation updated

---

**🎬 Test Video Mode Working!** | **⚡ Fast Testing** | **🔒 Safe Development**

