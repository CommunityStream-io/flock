# 🎨 Extraction Progress Component

## Overview

Custom progress component for Instagram archive extraction with real-time updates.

## Features

- **Real-time Progress Bar**: 0-100% with Material Design styling
- **File Count Display**: "2,090 / 5,543 files" with locale formatting
- **Status Messages**: Live updates during extraction
- **Completion State**: Success icon and styled completion message
- **Animated Loading**: Rotating hourglass icon during extraction

## Component Structure

### Files Created
- `extraction-progress.component.ts` - Component logic with signals
- `extraction-progress.component.html` - Template with Material components
- `extraction-progress.component.css` - Responsive styling

### Data Flow

```
Electron Main Process
  └── IPC Progress Events
      └── ElectronService.onProgress()
          └── ExtractionProgressComponent Signals
              └── Template Updates (Real-time)
```

### Progress Events

The component listens to these IPC events:

**Starting:**
```typescript
{
  type: 'extraction',
  status: 'starting',
  message: 'Starting extraction of 245.32 MB archive...'
}
```

**Progress:**
```typescript
{
  type: 'extraction',
  status: 'progress',
  percentage: 45,
  filesProcessed: 2090,
  totalFiles: 5543,
  message: 'Extracting files... 45%'
}
```

**Complete:**
```typescript
{
  type: 'extraction',
  status: 'complete',
  message: 'Extraction complete (47.44s)',
  duration: '47.44'
}
```

**Error:**
```typescript
{
  type: 'extraction',
  status: 'error',
  message: 'Failed to extract archive'
}
```

## Usage

The component is automatically displayed during extraction:

```typescript
// NativeFileProcessor sets the component
this.splashScreenLoading.setComponent(ExtractionProgressComponent);

// extractArchive() runs...

// Component is reset after completion
this.splashScreenLoading.setComponent(null);
```

## Styling

- **Material Design Tokens**: Uses theme colors for consistency
- **Responsive**: Adapts to mobile and desktop
- **Animations**: Smooth progress bar transitions, rotating loading icon
- **Accessibility**: Proper ARIA labels, semantic HTML

### Theme Colors

- Primary: Progress percentage, loading icon
- Tertiary: Completion state (success)
- Surface containers: Status message backgrounds

## What It Displays

1. **Header Section**
   - Folder/zip icon
   - "Extracting Instagram Archive" title

2. **Progress Section**
   - Material progress bar (determinate mode)
   - Percentage (large, primary color)
   - File count (monospace font)

3. **Status Section**
   - Icon (hourglass while extracting, checkmark when complete)
   - Status message (updates in real-time)
   - Styled background (changes color when complete)

## Example Output

**During Extraction:**
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

**On Completion:**
```
┌─────────────────────────────────────┐
│ 📁 Extracting Instagram Archive     │
│                                     │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ 100%          │
│                    5,543 / 5,543   │
│                                     │
│ ✅ Extraction complete (47.44s)     │
└─────────────────────────────────────┘
```

## Performance

- **Signals**: Used for reactive state management
- **Update Throttling**: Progress updates every 10th file (in IPC handler)
- **Minimal Re-renders**: Only affected elements update

## Future Enhancements

- **Extraction Speed**: Show MB/s or files/s
- **Time Remaining**: Estimate based on current speed
- **File Names**: Show currently extracting file (optional)
- **Pause/Cancel**: Add ability to cancel extraction
- **Multiple Archives**: Queue system for batch extraction

---

**🎨 Beautiful UI** | **📊 Real-time Updates** | **🚀 Performant**

