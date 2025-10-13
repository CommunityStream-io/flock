# 🎛️ Test Mode Radio Button Toggles

## Feature

The config form now has radio-button-style toggles for test modes - only one test mode can be active at a time, giving a nice UX for selecting between different test data sets.

## UI Behavior

### Toggle Exclusivity

When you enable one test mode toggle, the other test mode toggle automatically disables:

```
[ON]  Test Video Mode
[OFF] Test Mixed Media Mode
[ON]  Simulation Mode         ← Independent, can combine with test modes
```

Click "Test Mixed Media Mode":

```
[OFF] Test Video Mode          ← Automatically disabled
[ON]  Test Mixed Media Mode
[ON]  Simulation Mode
```

### Why Toggles Instead of Radio Buttons?

- **Toggles look cooler** ✨ (user's request!)
- **Better UX**: Clear on/off state
- **Material Design**: Consistent with Angular Material
- **Deselectable**: Can turn off by clicking again (radio buttons can't)

## Implementation

### 1. Config Service

**File:** `projects/shared/src/lib/services/config.ts`

Added `testMode` signal to track which test mode is active:

```typescript
private testModeSignal = signal<'none' | 'video' | 'mixed'>('none');

public get testMode(): 'none' | 'video' | 'mixed' {
  return this.testModeSignal();
}

public setTestMode(mode: 'none' | 'video' | 'mixed'): void {
  this.testModeSignal.set(mode);
  // Keep legacy signal in sync
  this.testVideoModeSignal.set(mode === 'video');
}
```

**Why keep `testVideoModeSignal`?**
- Backwards compatibility
- Legacy code still works
- Gradually migrate to `testMode`

### 2. Config Component

**File:** `projects/shared/src/lib/steps/config/config.ts`

Added form controls and radio-button behavior:

```typescript
public configForm = new FormGroup({
  // ...
  testVideoMode: new FormControl<boolean>(false),
  testMixedMediaMode: new FormControl<boolean>(false),
  simulationMode: new FormControl<boolean>(false)
});

private setupTestModeRadioBehavior(): void {
  // Watch testVideoMode
  this.configForm.get('testVideoMode')?.valueChanges.pipe(
    takeUntil(this.destroy$)
  ).subscribe((value) => {
    if (value) {
      // Disable others without triggering valueChanges
      this.configForm.get('testMixedMediaMode')?.setValue(false, { emitEvent: false });
    }
  });

  // Watch testMixedMediaMode
  this.configForm.get('testMixedMediaMode')?.valueChanges.pipe(
    takeUntil(this.destroy$)
  ).subscribe((value) => {
    if (value) {
      // Disable others without triggering valueChanges
      this.configForm.get('testVideoMode')?.setValue(false, { emitEvent: false });
    }
  });
}
```

**Key detail:** `{ emitEvent: false }`
- Prevents infinite loop
- Doesn't trigger `valueChanges` subscription
- Silent update

### 3. Save Configuration

```typescript
private saveConfiguration(): void {
  // Handle test mode - only one can be active
  if (formValue.testVideoMode) {
    this.configService.setTestMode('video');
  } else if (formValue.testMixedMediaMode) {
    this.configService.setTestMode('mixed');
  } else {
    this.configService.setTestMode('none');
  }
}
```

### 4. Load Configuration

```typescript
private loadConfiguration(): void {
  const testMode = this.configService.testMode;
  this.configForm.patchValue({
    // ...
    testVideoMode: testMode === 'video',
    testMixedMediaMode: testMode === 'mixed',
    // ...
  });
}
```

### 5. CLI Service

**File:** `projects/flock-native/src/app/service/cli.service.ts`

Updated to use `testMode` instead of `testVideoMode`:

```typescript
async executeMigration(
  archivePath: string,
  options: {
    // ...
    testMode?: 'none' | 'video' | 'mixed';
  }
): Promise<string> {
  // ...
  
  if (options.testMode === 'video') {
    env['ARCHIVE_FOLDER'] = 'projects/flock-native/transfer/test_video';
  } else if (options.testMode === 'mixed') {
    env['ARCHIVE_FOLDER'] = 'projects/flock-native/transfer/test_mixed_media';
  }
}
```

### 6. Migrate Resolver

**File:** `projects/flock-native/src/app/resolvers/migrate-run.resolver.ts`

Pass `testMode` to CLI:

```typescript
const processId = await cliService.executeMigration(archivePath, {
  // ...
  testMode: configService.testMode
});
```

## HTML Template

**File:** `projects/shared/src/lib/steps/config/config.html`

```html
<mat-slide-toggle 
  id="testVideoMode"
  formControlName="testVideoMode"
  class="toggle-option">
  <div class="toggle-content">
    <label for="testVideoMode">
      <h4>Test Video Mode</h4>
      <p>Use pre-defined test video data (1 post with 1 video)</p>
    </label>
  </div>
</mat-slide-toggle>

<mat-slide-toggle 
  id="testMixedMediaMode"
  formControlName="testMixedMediaMode"
  class="toggle-option">
  <div class="toggle-content">
    <label for="testMixedMediaMode">
      <h4>Test Mixed Media Mode</h4>
      <p>Use pre-defined test data with images and videos (multiple posts)</p>
    </label>
  </div>
</mat-slide-toggle>
```

## User Flow

1. **Open Config step**
2. **Enable "Test Video Mode"**
   - Toggle switches ON
   - "Test Mixed Media Mode" is OFF
3. **Click "Test Mixed Media Mode"**
   - Toggle switches ON
   - "Test Video Mode" automatically switches OFF
4. **Click "Test Mixed Media Mode" again**
   - Toggle switches OFF
   - No test mode active (falls back to user's archive)

## Testing

### Test Case 1: Radio Button Behavior

```
1. Enable Test Video Mode
   ✅ testVideoMode = true
   ✅ testMixedMediaMode = false
   ✅ configService.testMode = 'video'

2. Enable Test Mixed Media Mode
   ✅ testVideoMode = false (auto-disabled)
   ✅ testMixedMediaMode = true
   ✅ configService.testMode = 'mixed'

3. Disable Test Mixed Media Mode
   ✅ testVideoMode = false
   ✅ testMixedMediaMode = false
   ✅ configService.testMode = 'none'
```

### Test Case 2: Simulation Mode Independence

```
Enable all modes:
✅ testVideoMode = true
✅ simulationMode = true

Enable Test Mixed Media Mode:
✅ testVideoMode = false (auto-disabled)
✅ testMixedMediaMode = true
✅ simulationMode = true (still ON!)
```

Simulation mode is independent and can combine with any test mode.

## Benefits

1. **Clear UX**: Only one test data source at a time
2. **No confusion**: Can't accidentally enable multiple test modes
3. **Cool toggles**: Better than boring radio buttons 😎
4. **Flexible**: Can still disable all test modes to use real archive
5. **Extensible**: Easy to add more test modes in the future

## Files Modified

- `projects/shared/src/lib/services/config.ts` - Added `testMode` signal
- `projects/shared/src/lib/steps/config/config.ts` - Radio button behavior
- `projects/shared/src/lib/steps/config/config.html` - Added Test Mixed Media toggle
- `projects/flock-native/src/app/service/cli.service.ts` - Handle test modes
- `projects/flock-native/src/app/resolvers/migrate-run.resolver.ts` - Pass testMode
- `projects/flock-native/transfer/test_mixed_media/` - New test data
- `projects/flock-native/transfer/README.md` - Updated docs

---

**🎛️ Radio-Style Toggles** | **✨ Cool UX** | **🎬 Multiple Test Modes**

