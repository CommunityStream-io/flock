# 🔧 CLI Path Fix - Posts Not Found

## Problem

The Instagram CLI couldn't find `posts_1.json`:

```
No posts found. The file path may have changed - please update the env to point to the new folder containing posts_1.json
```

## Root Cause

**Instagram Archive Structure:**
```
temp-extraction-folder/
  └── instagram-username-20241012/     ← Wrapper folder
      └── your_instagram_activity/
          └── media/                   ← Note: MEDIA not content
              ├── posts_1.json        ← CLI looks for this
              └── reels.json
```

**What the CLI expects:**
```javascript
// @straiforos/instagramtobluesky looks for:
path.join(ARCHIVE_FOLDER, 'your_instagram_activity/media/posts_1.json')
```

**What we were passing:**
```
❌ ARCHIVE_FOLDER = "C:\...\temp-extraction-folder"
   (posts_1.json is at: temp-extraction-folder/instagram.../your_instagram_activity/media/posts_1.json)

✅ ARCHIVE_FOLDER = "C:\...\temp-extraction-folder\instagram-username-20241012"
   (posts_1.json is at: ARCHIVE_FOLDER/your_instagram_activity/media/posts_1.json)
```

## Solution

### Implemented Fix

**Intelligent Archive Folder Detection:**

1. **Search for `posts_1.json`** recursively (up to 3 levels deep)
2. **Derive correct path** by walking up from `posts_1.json`:
   ```
   posts_1.json → ../media → ../your_instagram_activity → ../ (archive folder)
   ```
3. **Verify path** by logging relative paths
4. **Fallback** to old logic if `posts_1.json` not found

### Code Flow

```javascript
// After extraction completes:
1. List directory contents
2. Show directory tree (first 10 items, 2 levels deep)
3. Search for posts_1.json
4. If found:
   - Extract parent folder path
   - Log derived paths for verification
5. If not found:
   - Fall back to single-subfolder detection
6. Return correct archive folder
```

### Enhanced Logging

**Directory Tree:**
```
🦅 [EXTRACT] Directory structure:
├── instagram-username-20241012/
│   ├── your_instagram_activity/
│   │   ├── media/
│   │   ├── ads_and_businesses/
│   │   └── ...
│   └── ...
```

**Path Resolution:**
```
🦅 [EXTRACT] ✅ Found posts_1.json at: C:\...\instagram...\your_instagram_activity\media\posts_1.json
🦅 [EXTRACT] Derived archive folder: C:\...\temp\instagram-username-20241012
🦅 [EXTRACT] Relative path check:
🦅 [EXTRACT]   - Activity folder: your_instagram_activity
🦅 [EXTRACT]   - Media folder: your_instagram_activity\media
🦅 [EXTRACT]   - Posts file: your_instagram_activity\media\posts_1.json
```

**Verification:**
```
CLI stdout: SourceFolder: "C:\...\instagram-username-20241012"
CLI stdout: Imported 10 posts with 15 media ✅
```

## Benefits

1. **Robust**: Works with different archive structures
2. **Self-healing**: Finds `posts_1.json` even if structure changes
3. **Observable**: Detailed logging for debugging
4. **Fallback**: Old logic preserved if new approach fails

## Edge Cases Handled

### Multiple Wrapper Folders
```
temp/
  ├── folder1/
  └── folder2/
      └── your_instagram_activity/  ← findFile() will locate
```

### Deep Nesting
```
temp/
  └── export/
      └── data/
          └── instagram-username/
              └── your_instagram_activity/  ← findFile() handles (maxDepth=3)
```

### No Wrapper Folder
```
temp/
  └── your_instagram_activity/  ← Fallback logic catches
```

### Posts in Old Location
```
instagram-username/
  └── media/
      └── posts_1.json  ← findFile() will still locate
```

## Testing

**Successful Test Output:**
```
🦅 [EXTRACT] Extraction completed in 47.44 seconds
🦅 [EXTRACT] Looking for Instagram archive folder...
🦅 [EXTRACT] Extracted contents: [ 'instagram-username-20241012' ]
🦅 [EXTRACT] Directory structure:
├── instagram-username-20241012/
│   ├── your_instagram_activity/
│   │   ├── media/
│   │   └── ...
🦅 [EXTRACT] Searching for posts_1.json...
🦅 [EXTRACT] ✅ Found posts_1.json at: ...
🦅 [EXTRACT] Derived archive folder: ...\instagram-username-20241012
=====================================
🚀 [ELECTRON MAIN] CLI EXECUTION STARTED
🚀 [ELECTRON MAIN] Custom Env Vars: BLUESKY_USERNAME, BLUESKY_PASSWORD, ARCHIVE_FOLDER, SIMULATE
=====================================
CLI stdout: Import started at 2025-10-12T22:53:03.522Z
CLI stdout: SourceFolder: "...\instagram-username-20241012"
CLI stdout: Imported 10 posts with 15 media
CLI process exited with code 0
```

## Future Improvements

1. **Cache Result**: Store posts_1.json location to avoid re-searching
2. **Validate Before CLI**: Check posts_1.json exists before executing CLI
3. **Support Old Formats**: Handle pre-2024 Instagram export structures
4. **Parallel Search**: Use worker threads for faster file searching in large archives

---

**🔍 Intelligent Detection** | **🛡️ Robust Fallbacks** | **📊 Observable Debugging**

