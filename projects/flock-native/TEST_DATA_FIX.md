# 🎬 Test Data Fix - Proper Archive Structure

## Problem

When running test video mode, the CLI was looking in the wrong location and couldn't find posts:

```
CLI stdout: No posts found. The file path may have changed
```

### Root Causes

1. **Wrong env var**: Using `TEST_VIDEO_MODE=1` which has hardcoded paths in the CLI
2. **Wrong structure**: Test data didn't have proper Instagram archive structure
3. **CLI's test mode**: Hardcoded to look in `node_modules/@straiforos/instagramtobluesky/transfer/test_video` which doesn't exist in npm package

## Solution

### 1. Don't Use TEST_VIDEO_MODE

**Before:**
```typescript
if (options.testVideoMode) {
  env['TEST_VIDEO_MODE'] = '1';  // ❌ Has hardcoded paths
  env['ARCHIVE_FOLDER'] = 'projects/flock-native/transfer/test_video';
}
```

**After:**
```typescript
if (options.testVideoMode) {
  // ✅ Just override ARCHIVE_FOLDER, no TEST_VIDEO_MODE
  env['ARCHIVE_FOLDER'] = 'projects/flock-native/transfer/test_video';
}
```

### 2. Create Proper Archive Structure

**Before:**
```
test_video/
├── posts.json          ❌ Wrong name
├── reels.json
└── *.mp4
```

**After:**
```
test_video/
├── your_instagram_activity/
│   └── media/
│       ├── posts_1.json     ✅ Correct name and location
│       ├── reels.json
│       └── *.mp4
├── posts.json (legacy, kept for reference)
└── reels.json (legacy, kept for reference)
```

### 3. CLI Processes It Normally

Now the CLI treats it as a normal Instagram archive:

```typescript
// CLI's normal path (not test mode)
postsJsonPath = path.join(archivalFolder, "your_instagram_activity/media/posts_1.json");
```

## Implementation

### Files Created/Modified

1. **Test Data Structure:**
   ```bash
   mkdir -p projects/flock-native/transfer/test_video/your_instagram_activity/media
   cp posts.json your_instagram_activity/media/posts_1.json
   cp reels.json your_instagram_activity/media/
   cp *.mp4 your_instagram_activity/media/
   ```

2. **CLIService** (`projects/flock-native/src/app/service/cli.service.ts`):
   - Removed `TEST_VIDEO_MODE=1`
   - Only override `ARCHIVE_FOLDER`

3. **Documentation:**
   - `projects/flock-native/transfer/README.md` - Updated usage
   - `projects/flock-native/transfer/test_video/README.md` - Video test docs
   - `projects/flock-native/transfer/STRUCTURE.md` - Archive structure guide
   - `projects/flock-native/TEST_DATA_SETUP.md` - Implementation details

## Expected Behavior

### Before Fix

```
🚀 [ELECTRON MAIN] Custom Env Vars: ..., TEST_VIDEO_MODE
CLI stdout: SourceFolder: "C:\...\node_modules\@straiforos\instagramtobluesky\transfer\test_video"
CLI stdout: --- TEST mode is enabled, using content from ... ---
CLI stdout: No posts found. The file path may have changed ❌
```

### After Fix

```
🚀 [ELECTRON MAIN] Custom Env Vars: ..., ARCHIVE_FOLDER, SIMULATE
🚀 [ELECTRON MAIN] Resolved to: C:\...\flock\projects\flock-native\transfer\test_video
CLI stdout: Import started at 2025-10-12T...
CLI stdout: SourceFolder: "C:\...\flock\projects\flock-native\transfer\test_video"
CLI stdout: Imported 1 posts with 1 media ✅
CLI process exited with code 0
```

## Testing

1. Enable "Test Video Mode" in Config step
2. Start migration
3. Should see:
   - ✅ Path resolved correctly
   - ✅ Posts file found
   - ✅ 1 post imported
   - ✅ Video uploaded to Bluesky

## Why This Approach Works

1. **No CLI modification needed**: Use existing archive processing logic
2. **Proper structure**: Mimics real Instagram archives
3. **Self-contained**: Our own test data, not dependent on npm package
4. **Flexible**: Can easily add more test data in the same format

## Key Learnings

1. **CLI's test mode is limited**: Hardcoded paths that don't work in npm package
2. **Archive structure matters**: Must have `your_instagram_activity/media/posts_1.json`
3. **Filename matters**: `posts_1.json` not `posts.json` for normal mode
4. **Path resolution is key**: Electron main process resolves relative to absolute

## Related Files

- `projects/flock-native/src/app/service/cli.service.ts` - CLI execution
- `projects/flock-native/electron/ipc-handlers.js` - Path resolution
- `projects/flock-native/transfer/test_video/` - Test data
- `projects/flock-native/TEST_DATA_SETUP.md` - Full implementation guide
- `projects/flock-native/TEST_VIDEO_MODE_FIX.md` - Original test mode fix

---

**✅ Fixed** | **📁 Proper Structure** | **🎬 Test Video Working**

