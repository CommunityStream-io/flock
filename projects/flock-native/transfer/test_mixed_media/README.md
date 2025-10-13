# Test Mixed Media Data

This directory contains test data for testing mixed media (images + videos) uploads to Bluesky.

## Structure

This mimics a real Instagram archive structure:

```
test_mixed_media/
├── your_instagram_activity/
│   └── media/
│       ├── posts_1.json          # Post metadata
│       ├── reels.json             # Reels metadata
│       └── posts/
│           └── 202407/
│               ├── *.jpg          # Image files
│               └── *.mp4          # Video files
├── posts.json                     # Legacy (for CLI's test mode)
└── reels.json                     # Legacy (for CLI's test mode)
```

## Usage in Flock Native

When "Test Mixed Media Mode" is enabled in the Config step:
- `ARCHIVE_FOLDER` is set to `projects/flock-native/transfer/test_mixed_media`
- CLI treats it as a normal Instagram archive
- Looks for `your_instagram_activity/media/posts_1.json`
- Imports multiple posts with mixed media (images and videos)

## Files

### posts_1.json
Contains multiple posts with various media types:
- Posts with single images
- Posts with multiple images (carousels)
- Posts with videos
- Mix of everything

### reels.json
Contains reel/story videos

### Media Files
Media files are organized in `posts/202407/` subdirectory:
- Image files: `.jpg` format
- Video files: `.mp4` format
- URIs in JSON point to relative paths like `202407/filename.jpg`

## Testing Flow

1. Enable "Test Mixed Media Mode" in Config step
2. Start migration
3. CLI processes test data
4. Uploads multiple posts with various media types to Bluesky
5. Verify posts appear in your feed with correct media

## Compared to Test Video Mode

| Feature | Test Video | Test Mixed Media |
|---------|-----------|-----------------|
| Posts | 1 | Multiple |
| Media Types | Video only | Images + Videos |
| Total Size | ~1-3 MB | ~5-10 MB |
| Processing Time | ~3 seconds | ~10-30 seconds |
| Use Case | Quick smoke test | Comprehensive testing |

---

**🎬 Mixed Media Test** | **📸 Images + Videos** | **🔒 Safe**

