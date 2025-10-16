# 🎬 Mixed Media Mode Implementation

## Summary

Added **Test Mixed Media Mode** to the app with radio-button-style toggles in the Config form. Users can now choose between different test data sets for migration testing.

## What Was Added

### 1. Test Data

Copied `test_mixed_media/` from the source repo and restructured it:

```
projects/flock-native/transfer/test_mixed_media/
├── README.md
├── your_instagram_activity/
│   └── media/
│       ├── posts_1.json          # Multiple posts
│       ├── reels.json
│       └── posts/
│           └── 202407/
│               ├── *.jpg          # Images
│               ├── *.webp         # Images
│               └── *.mp4          # Videos
├── posts.json (legacy)
└── reels.json (legacy)
```

**Contents:**
- Multiple posts (not just 1)
- Mix of images and videos
- Organized in subdirectories (`posts/202407/`)
- More comprehensive than test_video

### 2. Config Service Updates

**File:** `projects/shared/src/lib/services/config.ts`

Added `testMode` to replace boolean flags:

```typescript
private testModeSignal = signal<'none' | 'video' | 'mixed'>('none');

public get testMode(): 'none' | 'video' | 'mixed' {
  return this.testModeSignal();
}

public setTestMode(mode: 'none' | 'video' | 'mixed'): void {
  this.testModeSignal.set(mode);
}
```

**Benefits:**
- Single source of truth
- Only one test mode active at a time
- Easy to add more modes
- Type-safe

### 3. Config Form Updates

**File:** `projects/shared/src/lib/steps/config/config.ts`

Added radio-button behavior:

```typescript
// Form controls
testVideoMode: new FormControl<boolean>(false),
testMixedMediaMode: new FormControl<boolean>(false),

// Radio-button behavior
private setupTestModeRadioBehavior(): void {
  // When video mode is enabled, disable mixed media
  // When mixed media is enabled, disable video mode
}
```

**Files:** `projects/shared/src/lib/steps/config/config.html`

Added new toggle:

```html
<mat-slide-toggle formControlName="testMixedMediaMode">
  <h4>Test Mixed Media Mode</h4>
  <p>Use pre-defined test data with images and videos (multiple posts)</p>
</mat-slide-toggle>
```

### 4. CLI Service Updates

**File:** `projects/flock-native/src/app/service/cli.service.ts`

Handle mixed media mode:

```typescript
if (options.testMode === 'video') {
  env['ARCHIVE_FOLDER'] = 'projects/flock-native/transfer/test_video';
} else if (options.testMode === 'mixed') {
  env['ARCHIVE_FOLDER'] = 'projects/flock-native/transfer/test_mixed_media';
}
```

### 5. Resolver Updates

**File:** `projects/flock-native/src/app/resolvers/migrate-run.resolver.ts`

Pass `testMode` instead of `testVideoMode`:

```typescript
const processId = await cliService.executeMigration(archivePath, {
  // ...
  testMode: configService.testMode
});
```

## UI Behavior

### Radio Button Toggles

Toggles act like radio buttons - only one test mode can be active:

| Action | Test Video | Test Mixed Media |
|--------|-----------|------------------|
| Initial | OFF | OFF |
| Enable Video | **ON** | OFF (unchanged) |
| Enable Mixed | OFF (auto) | **ON** |
| Disable Mixed | OFF | OFF |

### Simulation Mode

Simulation mode is **independent** and works with any test mode:

```
✅ Test Video + Simulation = Process test video, don't upload
✅ Test Mixed + Simulation = Process test mixed media, don't upload
✅ Simulation only = Process user's archive, don't upload
❌ Test Video + Test Mixed = Not possible (radio button behavior)
```

## Test Data Comparison

| Feature | Test Video | Test Mixed Media |
|---------|-----------|------------------|
| **Posts** | 1 | ~10-15 |
| **Images** | 0 | ~7 |
| **Videos** | 1 | ~3 |
| **Size** | ~2-3 MB | ~8-10 MB |
| **Processing Time** | ~3 sec | ~15-30 sec |
| **Subdirectories** | No | Yes (`posts/202407/`) |
| **Use Case** | Quick smoke test | Comprehensive test |

## User Flow

1. **Open Config step**
2. **See three toggles:**
   - Test Video Mode (OFF)
   - Test Mixed Media Mode (OFF)
   - Simulation Mode (OFF)
3. **Enable "Test Mixed Media Mode"**
   - Toggle turns ON
   - If "Test Video Mode" was ON, it automatically turns OFF
4. **Optionally enable "Simulation Mode"**
   - Independent toggle, can combine
5. **Start migration**
   - CLI uses `test_mixed_media/` instead of user's archive
   - Processes multiple posts with images and videos

## Logs

### Expected Output

```
🦅 [CLIService] Test mode: mixed
🦅 [CLIService] Test data path: projects/flock-native/transfer/test_mixed_media
🦅 [CLIService] Note: Using proper archive structure (not CLI test mode)

🚀 [ELECTRON MAIN] Resolving relative path: projects/flock-native/transfer/test_mixed_media
🚀 [ELECTRON MAIN] Resolved to: C:\...\flock\projects\flock-native\transfer\test_mixed_media

CLI stdout: Import started at 2025-10-12T...
CLI stdout: SourceFolder: "C:\...\flock\projects\flock-native\transfer\test_mixed_media"
CLI stdout: Imported 15 posts with 20 media
CLI process exited with code 0
```

(Numbers will vary based on actual test data)

## Files Modified

### Shared Library
- `projects/shared/src/lib/services/config.ts`
- `projects/shared/src/lib/steps/config/config.ts`
- `projects/shared/src/lib/steps/config/config.html`

### Native App
- `projects/flock-native/src/app/service/cli.service.ts`
- `projects/flock-native/src/app/resolvers/migrate-run.resolver.ts`

### Test Data
- `projects/flock-native/transfer/test_mixed_media/` (new)
- `projects/flock-native/transfer/test_mixed_media/README.md` (new)
- `projects/flock-native/transfer/README.md` (updated)

### Documentation
- `projects/flock-native/TEST_MODE_RADIO_BUTTONS.md` (new)
- `projects/flock-native/MIXED_MEDIA_MODE_IMPLEMENTATION.md` (this file)

## Testing Checklist

- [x] Config form loads correctly
- [ ] Enabling Test Video Mode disables Test Mixed Media Mode
- [ ] Enabling Test Mixed Media Mode disables Test Video Mode
- [ ] Can disable all test modes
- [ ] Simulation Mode works independently
- [ ] CLI receives correct testMode value
- [ ] test_mixed_media path resolves correctly
- [ ] Migration processes test data successfully
- [ ] Multiple posts are uploaded (if simulate=false)
- [ ] Images and videos both work

## Future Enhancements

### Potential Test Modes to Add

1. **Test Image Mode**: Single image post
2. **Test Images Mode**: Carousel (multiple images)
3. **Test Reels Mode**: Only reels/stories
4. **Test Large Archive**: Performance testing with many posts

### How to Add New Test Mode

1. **Add test data:**
   ```bash
   mkdir -p projects/flock-native/transfer/test_NEW/your_instagram_activity/media
   # Add posts_1.json, media files, etc.
   ```

2. **Update ConfigService:**
   ```typescript
   private testModeSignal = signal<'none' | 'video' | 'mixed' | 'NEW'>('none');
   ```

3. **Update Config form:**
   ```html
   <mat-slide-toggle formControlName="testNEWMode">
     <h4>Test NEW Mode</h4>
   </mat-slide-toggle>
   ```

4. **Update radio button behavior:**
   ```typescript
   this.configForm.get('testNEWMode')?.valueChanges.subscribe((value) => {
     if (value) {
       // Disable other test modes
     }
   });
   ```

5. **Update CLIService:**
   ```typescript
   else if (options.testMode === 'NEW') {
     env['ARCHIVE_FOLDER'] = 'projects/flock-native/transfer/test_NEW';
   }
   ```

6. **Rebuild shared:**
   ```bash
   npm run build:shared
   ```

---

**🎬 Mixed Media Mode** | **🎛️ Radio Button Toggles** | **✨ Cool UX** | **✅ Implemented**

