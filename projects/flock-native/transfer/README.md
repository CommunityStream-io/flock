# Test Data for Migration Testing

This directory contains test data for quickly testing the Instagram to Bluesky migration without needing a real Instagram archive.

## Purpose

These test files are used when **Test Video Mode** (or other test modes) is enabled in the Config step. Instead of processing your real Instagram archive, the CLI will use this pre-defined test data to verify that posting to Bluesky works correctly.

## Test Modes Available

### test_video/
- **Contents**: Single video post with 1 video file
- **Structure**: Proper Instagram archive format with `your_instagram_activity/media/`
- **Files**: 
  - `your_instagram_activity/media/posts_1.json` - Post metadata
  - `your_instagram_activity/media/reels.json` - Reels metadata  
  - `your_instagram_activity/media/*.mp4` - Test video files
- **Use Case**: Quick test of video upload functionality
- **Enabled by**: Setting `ARCHIVE_FOLDER` to this directory (not using `TEST_VIDEO_MODE`)

### test_image/ (not yet set up)
- **Contents**: Single image post
- **Use Case**: Quick test of image upload functionality
- **Status**: ⚠️ Not yet configured with proper archive structure

### test_images/ (not yet set up)
- **Contents**: Multiple images (carousel/album post)
- **Use Case**: Test multi-image posts
- **Status**: ⚠️ Not yet configured with proper archive structure

### test_mixed_media/
- **Contents**: Multiple posts with mix of images and videos
- **Structure**: Proper Instagram archive format with `your_instagram_activity/media/` and `posts/202407/` subdirectory
- **Files**:
  - `your_instagram_activity/media/posts_1.json` - Post metadata (multiple posts)
  - `your_instagram_activity/media/reels.json` - Reels metadata
  - `your_instagram_activity/media/posts/202407/*.jpg` - Image files
  - `your_instagram_activity/media/posts/202407/*.mp4` - Video files
- **Use Case**: Comprehensive test of all media types
- **Enabled by**: Selecting "Test Mixed Media Mode" in Config step

## How It Works

### In the UI

1. Enable "Test Video Mode" in the Config step
2. Start migration
3. App overrides `ARCHIVE_FOLDER` to point to test data
4. CLI processes test data as if it were a real archive

### Behind the Scenes

When test mode is enabled in Flock Native:

```typescript
// CLIService
if (options.testVideoMode) {
  env['ARCHIVE_FOLDER'] = 'projects/flock-native/transfer/test_video';
}

// Electron IPC Handler resolves to absolute path
// C:\Users\...\flock\projects\flock-native\transfer\test_video
```

The CLI then processes it normally:
```typescript
postsJsonPath = path.join(archivalFolder, "your_instagram_activity/media/posts_1.json");
reelsJsonPath = path.join(archivalFolder, "your_instagram_activity/media/reels.json");
```

### Why Not Use TEST_VIDEO_MODE?

The CLI's `TEST_VIDEO_MODE` environment variable has hardcoded paths that point to the npm package's location, which doesn't exist in the published package. Instead, we:

1. ✅ Use proper Instagram archive structure
2. ✅ Override `ARCHIVE_FOLDER` with our test data path
3. ✅ CLI treats it as a normal archive
4. ✅ Everything works as expected

## File Structure

### posts_1.json / reels.json
Standard Instagram export format with metadata:
```json
[
  {
    "media": [
      {
        "uri": "media.mp4",
        "creation_timestamp": 1234567890,
        "media_metadata": {
          "video_metadata": { ... }
        }
      }
    ]
  }
]
```

Note: In real Instagram archives, the file is named `posts_1.json` (not `posts.json`).

### Media Files
- Video files: `.mp4` format
- Image files: `.jpg` or `.png` format
- Filenames match the `uri` field in JSON files

## Benefits

1. **Fast Testing**: No need to upload/process a large Instagram archive
2. **Reproducible**: Same test data every time
3. **Safe**: Won't accidentally post your personal content
4. **Development**: Perfect for testing during feature development

## When to Use

| Mode | Use Case | Data Source | Posts Created |
|------|----------|-------------|---------------|
| **Test Video Mode** | Quick smoke test | `test_video/` | 0 (if simulate on) / 1 post |
| **Test Mixed Media Mode** | Comprehensive test | `test_mixed_media/` | 0 (if simulate on) / Multiple posts |
| **Simulation Mode** | Dry run of real archive | User's archive | 0 (simulation only) |
| **Real Migration** | Actual migration | User's archive | All posts from archive |

### Recommendations

- **First time?** Enable "Test Video Mode" + "Simulation Mode" for safe testing
- **Testing real archive?** Use your archive + "Simulation Mode" 
- **Ready to migrate?** Disable all test modes
- **Testing multiple media types?** Enable "Test Mixed Media Mode"

## Source

This test data is copied from the `@straiforos/instagramtobluesky` package's `transfer/` directory. The npm package doesn't include this directory in its published files, so we maintain a copy here for development and testing.

## Updating Test Data

If you need to update the test data:

```bash
# From the flock repo root
cp -r ../instagram-to-bluesky/transfer/* projects/flock-native/transfer/
```

Or manually add your own test files following the same structure.

## .gitignore

Consider whether to commit this data:
- ✅ **Commit**: Small test files for reproducible testing
- ❌ **Don't commit**: Large media files or real personal content

Current recommendation: **Commit the test data** for consistent testing across development environments.

---

**🎬 Quick Testing** | **🔒 Safe Development** | **⚡ Fast Feedback**

