# Test Video Data

This directory contains test data for testing video uploads to Bluesky.

## Structure

This mimics a real Instagram archive structure:

```
test_video/
├── your_instagram_activity/
│   └── media/
│       ├── posts_1.json          # Post metadata
│       ├── reels.json             # Reels metadata
│       ├── *.mp4                  # Video files
│       └── *.mp4                  # Video files
├── posts.json                     # Legacy (for CLI's test mode)
└── reels.json                     # Legacy (for CLI's test mode)
```

## Usage in Flock Native

When "Test Video Mode" is enabled in the Config step:
- `ARCHIVE_FOLDER` is set to `projects/flock-native/transfer/test_video`
- CLI treats it as a normal Instagram archive
- Looks for `your_instagram_activity/media/posts_1.json`
- Imports 1 post with 1 video

## Files

### posts_1.json
Contains 1 post with 1 video:
- Pokemon test video
- ~1.1 MB MP4 file
- Has geo-location metadata

### Video Files
- `AQPTSNLZ6iUA4HKv1fhGWroYyhb2Ccrm9A9xbXRR3sWTzEz_LSfVjCbA2OuODLVHivWjGmHSfLtjOh7aSdseiCpCC3OwLC4lkXLcByU_17898982279059393.mp4`

## Testing Flow

1. Enable "Test Video Mode" in Config step
2. Start migration
3. CLI processes test data
4. Uploads 1 video to Bluesky
5. Verify post appears in your feed

---

**🎬 Quick Video Test** | **⚡ ~3 seconds** | **🔒 Safe**

