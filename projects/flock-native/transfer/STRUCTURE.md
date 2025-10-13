# Instagram Archive Structure

## Official Instagram Archive Format

When you download your Instagram data, the ZIP file contains:

```
instagram-username-20241012/
└── your_instagram_activity/
    └── media/
        ├── posts_1.json
        ├── reels.json
        ├── stories.json
        ├── profile_photos/
        ├── posts/
        │   ├── 202401/
        │   │   ├── photo1.jpg
        │   │   └── photo2.jpg
        │   └── 202402/
        └── reels/
            └── video1.mp4
```

## Our Test Data Structure

Our test data mimics this structure (simplified):

```
test_video/
├── your_instagram_activity/
│   └── media/
│       ├── posts_1.json          # Main posts file
│       ├── reels.json             # Reels file
│       └── *.mp4                  # Media files in same dir
├── posts.json                     # Legacy (CLI test mode)
└── reels.json                     # Legacy (CLI test mode)
```

### Why Simplified?

- **Same directory**: Media files in same directory as JSON (easier testing)
- **Real archives**: Media files in subdirectories by month
- **Both work**: CLI handles both structures

## JSON Format

### posts_1.json

```json
[
  {
    "media": [
      {
        "uri": "photo.jpg",              // Filename or relative path
        "creation_timestamp": 1458732736, // Unix timestamp
        "media_metadata": {
          "photo_metadata": { ... }      // or video_metadata
        },
        "title": "Post caption"
      }
    ]
  }
]
```

### reels.json

Same format as `posts_1.json`.

## Media URI Resolution

The CLI resolves media URIs:

1. **Filename only**: `"photo.jpg"`
   - Looks in same directory as JSON file
   - Falls back to `posts/` subdirectory

2. **Relative path**: `"202401/photo.jpg"`
   - Looks relative to JSON file
   - Then tries `posts/202401/photo.jpg`

3. **Full path**: Handled by CLI's path resolution logic

## How Flock Native Uses This

1. **Upload step**: User selects ZIP file
2. **Extraction**: ZIP extracted to temp directory
3. **Path detection**: Find `posts_1.json` recursively
4. **Derive root**: Walk up to folder containing `your_instagram_activity/`
5. **Pass to CLI**: `ARCHIVE_FOLDER=/temp/extracted/instagram-username-20241012/`
6. **CLI processes**: Reads `your_instagram_activity/media/posts_1.json`

### Test Mode Override

When "Test Video Mode" is enabled:
- **Skip** user's archive
- **Set** `ARCHIVE_FOLDER=projects/flock-native/transfer/test_video`
- **CLI** processes test data instead

## Creating Test Data

To create your own test data:

```bash
# 1. Create structure
mkdir -p my_test/your_instagram_activity/media

# 2. Copy a real posts_1.json (or create one)
cp ~/Downloads/instagram-data/your_instagram_activity/media/posts_1.json \\
   my_test/your_instagram_activity/media/

# 3. Copy media files
cp ~/Downloads/instagram-data/media/posts/202401/*.jpg \\
   my_test/your_instagram_activity/media/

# 4. Update URIs in posts_1.json to match filenames

# 5. Test it
ARCHIVE_FOLDER=my_test node cli.js
```

## Validation

The CLI validates:
- ✅ `posts_1.json` exists
- ✅ JSON is valid
- ✅ Media files exist at specified URIs
- ✅ Media files are readable
- ⚠️ Warns if media files missing (but continues)

## Common Issues

### "No posts found"

**Cause**: CLI can't find `posts_1.json`

**Check**:
1. File exists: `your_instagram_activity/media/posts_1.json`
2. Path is correct
3. File permissions

### "Media file not found"

**Cause**: URI in JSON doesn't match actual file location

**Fix**:
1. Check URI in JSON: `"uri": "photo.jpg"`
2. Check file exists in correct location
3. Update URI or move file

### "Invalid JSON"

**Cause**: JSON syntax error

**Fix**:
1. Validate JSON: `jq . posts_1.json`
2. Check for trailing commas
3. Check for missing brackets

---

**📁 Archive Structure** | **✅ Validated** | **🔧 Ready to Process**

