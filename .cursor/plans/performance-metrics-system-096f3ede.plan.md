<!-- 096f3ede-084c-4766-850b-1aa38f32cab7 b730e4e8-7006-415f-957d-d8568b470f4f -->
# Performance Metrics System Implementation

## Overview

Create a self-contained `PerformanceTracker` class integrated into the `ElectronApp` main class to track timing and resource usage for all operations without requiring Sentry references throughout the codebase.

## Architecture

### Core Component: PerformanceTracker Class

Create `projects/flock-native/electron/performance-tracker.js` with:

- Track operation timing (start/end)
- Monitor resource usage (memory, CPU)
- Generate performance spans for Sentry
- Log detailed metrics to console/electron-log
- Support nested operation tracking (parent/child spans)
- Automatic metric aggregation and reporting

### Key Features

- **Automatic Resource Tracking**: Capture memory and CPU at operation start/end
- **Sentry Integration**: Generate performance transactions/spans without requiring Sentry in handlers
- **Dual Logging**: Send to both Sentry and electron-log
- **Zero Configuration**: Works in both dev and production
- **Nested Operations**: Track operation breakdowns (e.g., extract-archive → validate → extract → verify)

## Implementation Steps

### 1. Create PerformanceTracker Class

**File**: `projects/flock-native/electron/performance-tracker.js`

Key methods:

```javascript
class PerformanceTracker {
  constructor(sentryInstance, logger)
  
  // Start tracking an operation
  startOperation(name, category, metadata = {})
  
  // End tracking and record metrics
  endOperation(operationId)
  
  // Start a child operation under a parent
  startChildOperation(parentId, name, metadata = {})
  
  // Get resource usage snapshot
  getResourceSnapshot()
  
  // Send metrics to Sentry and logs
  reportMetrics(operationData)
}
```

Track for each operation:

- Start/end timestamps
- Duration
- Memory usage (before/after, delta)
- CPU usage
- Operation category (startup, ipc, handler)
- Parent/child relationships
- Custom metadata

### 2. Integrate into ElectronApp Main Class

**File**: `projects/flock-native/electron/main.js`

Add PerformanceTracker to the class:

```javascript
class ElectronApp {
  constructor() {
    // ... existing properties
    this.performanceTracker = null;
  }
  
  async initialize() {
    // Track startup performance
    const startupOp = this.createPerformanceTracker();
    const startupId = startupOp.startOperation('app-startup', 'startup');
    
    // Track each init phase
    const sentryId = startupOp.startChildOperation(startupId, 'sentry-init');
    await this.initializeSentry();
    startupOp.endOperation(sentryId);
    
    // ... track other phases
    
    startupOp.endOperation(startupId);
  }
  
  createPerformanceTracker() {
    if (!this.performanceTracker) {
      this.performanceTracker = new PerformanceTracker(
        this.sentrySetup?.getSentry(),
        this.loggingSetup?.getLogger()
      );
    }
    return this.performanceTracker;
  }
  
  getPerformanceTracker() {
    return this.performanceTracker;
  }
}
```

Track these startup phases:

- `sentry-init`: Sentry initialization
- `logging-init`: Logging setup
- `window-manager-init`: Window manager creation
- `lifecycle-init`: Lifecycle manager setup
- `ipc-init`: IPC handlers registration

### 3. Create IPC Performance Wrapper

**File**: `projects/flock-native/electron/handlers/performance-wrapper.js`

Wrapper to automatically track all IPC handlers:

```javascript
function wrapIpcHandler(handlerName, handlerFn, performanceTracker) {
  return async (event, ...args) => {
    const opId = performanceTracker.startOperation(
      handlerName,
      'ipc-handler',
      { args: sanitizeArgs(args) }
    );
    
    try {
      const result = await handlerFn(event, ...args);
      performanceTracker.endOperation(opId, { success: true });
      return result;
    } catch (error) {
      performanceTracker.endOperation(opId, { success: false, error: error.message });
      throw error;
    }
  };
}

module.exports = { wrapIpcHandler };
```

### 4. Update IPC Handler Coordinator

**File**: `projects/flock-native/electron/ipc-handlers.js`

Modify to accept and pass performance tracker:

```javascript
function setupIpcHandlers(mainWindow, sentryInstance, performanceTracker) {
  // Pass tracker to all handler modules
  setupFileHandlers(mainWindow, Sentry, performanceTracker);
  setupArchiveHandlers(mainWindow, Sentry, performanceTracker);
  setupCliHandlers(mainWindow, Sentry, performanceTracker);
  setupSystemHandlers(mainWindow, Sentry, performanceTracker);
}
```

### 5. Update Individual Handler Modules

**Files**:

- `projects/flock-native/electron/handlers/file-handlers.js`
- `projects/flock-native/electron/handlers/archive-handlers.js`
- `projects/flock-native/electron/handlers/cli-handlers.js`
- `projects/flock-native/electron/handlers/system-handlers.js`

For each handler:

1. Add `performanceTracker` parameter to `setup*Handlers()` function
2. Wrap each `ipcMain.handle()` with performance tracking
3. Add internal operation breakdowns for complex handlers

Example for `archive-handlers.js`:

```javascript
function setupArchiveHandlers(mainWindow, Sentry, performanceTracker) {
  ipcMain.handle('extract-archive', async (event, filePath, outputPath) => {
    const parentOp = performanceTracker.startOperation('extract-archive', 'ipc-handler');
    
    try {
      // Track validation phase
      const validateOp = performanceTracker.startChildOperation(parentOp, 'validate-file');
      // ... validation code
      performanceTracker.endOperation(validateOp);
      
      // Track extraction phase
      const extractOp = performanceTracker.startChildOperation(parentOp, 'extract-zip');
      // ... extraction code
      performanceTracker.endOperation(extractOp);
      
      // Track verification phase
      const verifyOp = performanceTracker.startChildOperation(parentOp, 'verify-structure');
      // ... verification code
      performanceTracker.endOperation(verifyOp);
      
      performanceTracker.endOperation(parentOp, { success: true });
      return result;
    } catch (error) {
      performanceTracker.endOperation(parentOp, { success: false, error: error.message });
      throw error;
    }
  });
}
```

### 6. Update Main.js IPC Setup

**File**: `projects/flock-native/electron/main.js`

Update `setupIpcHandlers()` method to pass performance tracker:

```javascript
setupIpcHandlers() {
  // ... existing code
  
  this.windowManager.createMainWindow = () => {
    const window = originalCreateWindow();
    
    // Pass performance tracker along with Sentry
    setupIpcHandlers(
      window,
      this.sentrySetup?.getSentry(),
      this.performanceTracker
    );
    
    return window;
  };
}
```

### 7. Add Performance Reporting

**File**: `projects/flock-native/electron/performance-tracker.js`

Implement reporting methods:

- Log to console with color-coded output
- Send to electron-log for file persistence
- Create Sentry transactions for performance monitoring
- Generate summary reports (avg, min, max, p95 per operation)

## Metrics Tracked

### Per Operation

- **Timing**: Start time, end time, duration (ms)
- **Memory**: Heap used before/after, RSS before/after, delta
- **CPU**: CPU percentage during operation
- **Metadata**: Operation name, category, parent, custom data
- **Result**: Success/failure, error message if failed

### Categories

- `startup`: App initialization phases
- `ipc-handler`: Top-level IPC handler calls
- `operation`: Internal handler operations (sub-tasks)
- `window`: Window creation and loading

## Output Format

### Console/Log Output

```
⏱️  [PERF] extract-archive completed in 2,345ms
    ├─ Memory: 125MB → 342MB (+217MB)
    ├─ CPU: 45%
    ├─ Breakdown:
    │  ├─ validate-file: 23ms
    │  ├─ extract-zip: 2,156ms
    │  └─ verify-structure: 166ms
    └─ Status: Success
```

### Sentry Transaction

- Transaction name: Operation category (e.g., "app-startup", "ipc-handler")
- Spans: Each operation and sub-operation
- Tags: Operation name, success/failure, environment
- Measurements: Memory delta, CPU usage

## Files to Create

1. `projects/flock-native/electron/performance-tracker.js` - Core tracker class
2. `projects/flock-native/electron/handlers/performance-wrapper.js` - IPC wrapper utilities

## Files to Modify

1. `projects/flock-native/electron/main.js` - Integrate tracker, track startup
2. `projects/flock-native/electron/ipc-handlers.js` - Pass tracker to handlers
3. `projects/flock-native/electron/handlers/file-handlers.js` - Add tracking
4. `projects/flock-native/electron/handlers/archive-handlers.js` - Add tracking + breakdowns
5. `projects/flock-native/electron/handlers/cli-handlers.js` - Add tracking + breakdowns
6. `projects/flock-native/electron/handlers/system-handlers.js` - Add tracking
7. `projects/flock-native/electron/app-lifecycle.js` - Track window creation/loading

## Benefits

- ✅ Self-contained in ElectronApp class - no scattered Sentry references
- ✅ Automatic tracking - minimal code changes in handlers
- ✅ Comprehensive metrics - timing + resources
- ✅ Dual output - Sentry + logs
- ✅ Nested operation tracking - see full breakdown
- ✅ Zero configuration - works out of the box

### To-dos

- [ ] Create PerformanceTracker class with timing, resource tracking, and reporting
- [ ] Integrate PerformanceTracker into ElectronApp main class and track startup phases
- [ ] Create IPC performance wrapper utilities for automatic handler tracking
- [ ] Update ipc-handlers.js to pass performance tracker to all handler modules
- [ ] Add performance tracking to file-handlers.js
- [ ] Add performance tracking with operation breakdowns to archive-handlers.js
- [ ] Add performance tracking with operation breakdowns to cli-handlers.js
- [ ] Add performance tracking to system-handlers.js
- [ ] Add window creation/loading performance tracking to app-lifecycle.js
- [ ] Test the performance tracking system in both dev and production modes