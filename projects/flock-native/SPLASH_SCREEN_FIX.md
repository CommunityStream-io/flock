# 🎨 Extraction Progress Component Not Showing

## Problem

The `ExtractionProgressComponent` wasn't displaying in the splash screen during archive extraction.

## Root Cause

**Timing issue** between setting the component and showing the splash screen.

### The Flow

1. **Resolver calls** `splashScreenLoading.show('Extracting Instagram Archive')` 
   - Splash screen appears with default butterfly animation
2. **Then calls** `fileService.extractArchive()`
3. **Inside extractArchive** calls `splashScreenLoading.setComponent(ExtractionProgressComponent)`
   - Component is set, but splash was already shown without it

### Why This Happens

The `SplashScreenLoading` service has two separate concerns:
- `show(message)` - Shows splash screen and sets loading state
- `setComponent(component)` - Sets custom component to display

When `show()` is called BEFORE `setComponent()`, the splash renders with the default UI, and the component change doesn't trigger a re-render in some cases.

## Solution

**Call both `setComponent()` AND `show()` inside the service method** to ensure the component is registered before the splash displays.

### Code Change

**In `NativeFileProcessor.extractArchive()`:**

```typescript
// Set custom progress component for extraction
// Must set component AND show it for the component to be displayed
this.splashScreenLoading.setComponent(ExtractionProgressComponent);
this.splashScreenLoading.show('Preparing extraction...');  // ✅ Call show() after setComponent()
```

## Why This Works

### Before (Not Working)

```
Resolver:
  splashScreenLoading.show('Extracting...')  → Splash shows with butterfly
  fileService.extractArchive() →
    Inside extractArchive:
      setComponent(ExtractionProgressComponent)  → Component set but splash already rendered
```

### After (Working)

```
Resolver:
  splashScreenLoading.show('Extracting...')  → Splash shows with butterfly (initial)
  fileService.extractArchive() →
    Inside extractArchive:
      setComponent(ExtractionProgressComponent)  → Register component
      show('Preparing extraction...')            → Re-trigger splash with component ✅
```

## How the Splash Screen Works

### Splash Screen Template

```html
<!-- Default butterfly animation -->
<div class="butterfly">...</div>
<span>{{ message | async }}</span>

<!-- Custom component rendered here -->
@if (component | async; as cmp) {
  <ng-container *ngComponentOutlet="cmp"></ng-container>
}
```

### Component Observable

The splash screen subscribes to `component` observable:

```typescript
export class SplashScreen {
  splashScreenLoading = inject(SplashScreenLoading);
  public component = this.splashScreenLoading.component.asObservable();
}
```

When `setComponent()` is called, the `BehaviorSubject` emits the new component, and the `NgComponentOutlet` dynamically renders it.

## Alternative Solutions Considered

### Option A: Set Component in Resolver (Not Chosen)

```typescript
// In extract-archive-resolver.ts
splashScreenLoading.setComponent(ExtractionProgressComponent);
splashScreenLoading.show('Extracting Instagram Archive');
```

**Why not:**
- Couples the resolver to the native implementation
- Violates service-delegated architecture
- Would need different resolvers for different apps

### Option B: Use Factory (Not Needed)

```typescript
// In FileService interface
getProgressComponent?(): Type<unknown>;
```

**Why not:**
- Over-engineered for this use case
- Current solution is simpler

### Option C: Delay show() in Resolver (Not Ideal)

```typescript
// In resolver
setTimeout(() => splashScreenLoading.show('...'), 100);
```

**Why not:**
- Race conditions
- Brittle timing-dependent code

## Best Practice

For custom splash screen components:

```typescript
// 1. Set component first
splashScreenLoading.setComponent(YourCustomComponent);

// 2. Then show the splash
splashScreenLoading.show('Your message');

// 3. Component will render inside the splash screen
```

## Files Modified

- `projects/flock-native/src/app/service/native-file-processor.ts` - Added `show()` call after `setComponent()`

## Testing

After fix, you should see:

1. Initial splash with butterfly (brief)
2. Extraction progress component appears
3. Real-time progress updates (percentage, file counts)
4. Completion message

**Expected UI:**

```
┌─────────────────────────────────────┐
│ 📁 Extracting Instagram Archive     │
│                                     │
│ ▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░ 45%          │
│                    2,090 / 5,543   │
│                                     │
│ ⌛ Extracting files... 45%          │
└─────────────────────────────────────┘
```

---

**🎨 Progress Component Now Showing!** | **📊 Real-time Updates** | **🚀 Better UX**

