# 🎬 Test Data Setup

## Problem

The `@straiforos/instagramtobluesky` package's test data (`transfer/` directory) is not included in the npm package distribution.

### Package.json Files Configuration

```json
{
  "files": [
    "dist",
    "README.md",
    "LICENSE.txt"
  ]
}
```

Notice `transfer/` is **not** in the files array, so npm doesn't include it when the package is installed.

## Solution

**Copy test data into the flock-native app** so we have local access to it.

### Steps Taken

1. **Copy test data:**
   ```bash
   cp -r ../instagram-to-bluesky/transfer/* projects/flock-native/transfer/
   ```

2. **Add path resolution** in Electron IPC handler

3. **Override ARCHIVE_FOLDER** when test mode is enabled

## Implementation

### Directory Structure

```
projects/flock-native/
├── transfer/
│   ├── README.md
│   ├── STRUCTURE.md
│   ├── test_video/
│   │   ├── README.md
│   │   ├── your_instagram_activity/
│   │   │   └── media/
│   │   │       ├── posts_1.json
│   │   │       ├── reels.json
│   │   │       └── *.mp4
│   │   ├── posts.json (legacy)
│   │   └── reels.json (legacy)
│   ├── test_image/
│   ├── test_images/
│   └── test_mixed_media/
├── electron/
└── src/
```

### Code Changes

#### 1. CLIService (Renderer Process)

**File:** `projects/flock-native/src/app/service/cli.service.ts`

```typescript
// Add test video mode
if (options.testVideoMode) {
  // Don't use TEST_VIDEO_MODE - it has hardcoded paths in the CLI
  // Instead, just point ARCHIVE_FOLDER to our local test data
  env['ARCHIVE_FOLDER'] = 'projects/flock-native/transfer/test_video';
  this.log('Test video mode enabled - using local test data');
  this.log('Test data path: projects/flock-native/transfer/test_video');
  this.log('Note: Not using TEST_VIDEO_MODE env var (CLI has hardcoded paths)');
}
```

**Why relative path?**
- Renderer process can't access `process.cwd()` or Node.js path module
- Pass relative path string to main process
- Main process resolves to absolute path

#### 2. IPC Handler (Main Process)

**File:** `projects/flock-native/electron/ipc-handlers.js`

```javascript
// Resolve test data path if it's a relative path
const mergedEnv = { ...process.env, ...options.env };
if (mergedEnv.ARCHIVE_FOLDER && !path.isAbsolute(mergedEnv.ARCHIVE_FOLDER)) {
  const resolvedPath = path.resolve(process.cwd(), mergedEnv.ARCHIVE_FOLDER);
  console.log('🚀 [ELECTRON MAIN] Resolving relative path:', mergedEnv.ARCHIVE_FOLDER);
  console.log('🚀 [ELECTRON MAIN] Resolved to:', resolvedPath);
  mergedEnv.ARCHIVE_FOLDER = resolvedPath;
}
```

**What this does:**
1. Check if `ARCHIVE_FOLDER` is a relative path
2. Resolve it relative to `process.cwd()` (app root)
3. Pass absolute path to CLI

## How It Works

### Flow Diagram

```
User enables Test Video Mode
    ↓
CLIService sets env['ARCHIVE_FOLDER'] = 'projects/flock-native/transfer/test_video'
    ↓
IPC call to Electron main process
    ↓
Main process detects relative path
    ↓
Resolves: 'projects/flock-native/transfer/test_video'
      →  'C:\Users\...\flock\projects\flock-native\transfer\test_video'
    ↓
Spawns CLI with absolute path
    ↓
CLI reads test data from resolved path
    ↓
Posts test video to Bluesky ✅
```

### Log Output

```
🦅 [CLIService] Test video mode: ON
🦅 [CLIService] Test data path: projects/flock-native/transfer/test_video
🦅 [CLIService] Note: Not using TEST_VIDEO_MODE env var (CLI has hardcoded paths)
🚀 [ELECTRON MAIN] CLI EXECUTION STARTED
🚀 [ELECTRON MAIN] Custom Env Vars: BLUESKY_USERNAME, BLUESKY_PASSWORD, ARCHIVE_FOLDER, SIMULATE
🚀 [ELECTRON MAIN] Resolving relative path: projects/flock-native/transfer/test_video
🚀 [ELECTRON MAIN] Resolved to: C:\Users\trifo\Documents\flock\projects\flock-native\transfer\test_video
CLI stdout: Import started at 2025-10-12T23:XX:XX.XXXZ
CLI stdout: SourceFolder: "C:\Users\trifo\...\flock\projects\flock-native\transfer\test_video"
CLI stdout: Imported 1 posts with 1 media
CLI process exited with code 0
```

## Benefits

1. **Self-contained**: App includes its own test data
2. **No external dependencies**: Don't rely on npm package including test files
3. **Consistent**: Same test data across all environments
4. **Maintainable**: Can update test data independently

## Updating Test Data

### From Source Repo

```bash
# From flock repo root
cp -r ../instagram-to-bluesky/transfer/* projects/flock-native/transfer/
```

### Custom Test Data

You can add your own test data:

1. Create folder: `projects/flock-native/transfer/my_test/`
2. Add files:
   - `posts.json` (Instagram format)
   - `reels.json` (optional)
   - Media files (.jpg, .mp4, etc.)
3. Use environment variable: `ARCHIVE_FOLDER=projects/flock-native/transfer/my_test`

## Git Considerations

### Should We Commit Test Data?

**✅ YES - Commit it!**

Reasons:
- Small test files (~4MB total)
- Enables consistent testing
- No external dependencies
- Developers can test immediately after clone

**What to exclude:**
- Large personal archives
- Real Instagram data
- Temporary test files

### .gitignore

Already configured to exclude:
- `dist/`
- `node_modules/`
- `*.log`

Test data in `transfer/` is intentionally included.

## Troubleshooting

### Test Mode Not Finding Files

**Symptom:**
```
CLI stdout: No posts found. The file path may have changed
```

**Check:**
1. Files exist: `ls projects/flock-native/transfer/test_video/`
2. Path resolution logs in terminal
3. Absolute path is correct

### Wrong Path Resolved

**Check:**
- `process.cwd()` returns app root (where package.json is)
- Relative path is correct from app root
- No extra `..` or `/` in path

### Test Data Not Copied

**Solution:**
```bash
# Verify source exists
ls ../instagram-to-bluesky/transfer/

# Copy again
cp -r ../instagram-to-bluesky/transfer/* projects/flock-native/transfer/

# Verify copy
ls projects/flock-native/transfer/test_video/
```

## Files Modified

- `projects/flock-native/src/app/service/cli.service.ts` - Set relative test data path
- `projects/flock-native/electron/ipc-handlers.js` - Resolve relative to absolute path
- `projects/flock-native/transfer/` - Test data copied here
- `projects/flock-native/transfer/README.md` - Documentation

---

**📁 Self-Contained Test Data** | **🔧 Path Resolution** | **✅ Ready to Test**

