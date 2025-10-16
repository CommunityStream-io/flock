# 🦅 Flock Native - Desktop Application

> *"Like the eagle soaring high above the mountains, Flock Native provides the highest vantage point with full desktop power."*

## Overview

Flock Native is the Electron-based desktop variant of the Flock migration tool. It provides native file system access, CLI integration, and offline processing capabilities for migrating Instagram data to Bluesky.

## Architecture

Flock Native uses a multi-process Electron architecture:

- **Main Process** (`electron/main.js`) - Node.js environment with full system access
- **Renderer Process** (Angular app) - Isolated browser environment
- **IPC Communication** (`electron/preload.js` + `electron/ipc-handlers.js`) - Secure bridge between processes

## Features

### ✅ Implemented

- 🦅 **Electron Infrastructure** - Multi-process architecture with secure IPC
- 📂 **Native File Picker** - OS-native file selection dialog
- 🔍 **File Validation** - Instagram archive structure validation
- 📦 **Archive Extraction** - Native Node.js ZIP extraction
- 🚀 **CLI Integration** - Ready for `@straiforos/instagramtobluesky` CLI
- 📊 **Progress Monitoring** - Real-time IPC-based progress updates
- 🔧 **Service Layer** - Environment-aware native services
- 🎨 **Shared Components** - Full integration with shared library
- 📝 **Logger Service** - Eagle-themed console logging
- 🧭 **Router Integration** - Step-based navigation with guards

### 🚧 Coming Soon

- 🔑 Auth step with native credential storage
- ⚙️ Config step with native preferences
- 🔄 Migrate step with CLI execution
- ✅ Complete step with native notifications

## Getting Started

### Prerequisites

```bash
# Node.js 18+ and npm
node --version  # Should be 18.x or higher
npm --version
```

### Installation

```bash
# Install dependencies (from project root)
npm install
```

### Development

```bash
# Start the development server and launch Electron
npm run start:native

# This command does the following:
# 1. Starts Angular dev server on port 4201
# 2. Waits for the server to be ready
# 3. Launches Electron with the app
```

The application will automatically:
- Open a native window (1200x900)
- Load the Angular app from `http://localhost:4201`
- Enable Chrome DevTools for debugging
- Hot-reload on code changes (Angular side)

### Building for Production

```bash
# Build the Angular app for production
npm run build:native

# Output will be in dist/flock-native/browser/
```

### Running Electron Only

```bash
# Run Electron in development mode (assumes Angular server is running)
npm run electron:dev
```

## Project Structure

```
projects/flock-native/
├── electron/                       # Electron main process
│   ├── main.js                    # Main process entry point
│   ├── preload.js                 # Preload script (IPC bridge)
│   └── ipc-handlers.js            # IPC request handlers
├── src/
│   ├── app/
│   │   ├── service/               # Native services
│   │   │   ├── native-file-processor.ts  # File operations via IPC
│   │   │   ├── console-logger.ts         # Eagle-themed logger
│   │   │   ├── electron.service.ts       # Electron API wrapper
│   │   │   ├── cli.service.ts            # CLI execution
│   │   │   ├── bluesky.ts                # Bluesky API integration
│   │   │   └── router-logging.ts         # Router event logging
│   │   ├── types/
│   │   │   └── electron.d.ts      # TypeScript definitions for Electron API
│   │   ├── app.ts                 # Root component
│   │   ├── app.html               # Root template
│   │   ├── app.config.ts          # App configuration & providers
│   │   └── app.routes.ts          # Route definitions
│   ├── main.ts                    # Angular bootstrap
│   └── styles.scss                # Global styles
├── public/                        # Static assets
└── README.md                      # This file
```

## Architecture

Flock Native uses a **service-delegated architecture** that keeps Electron-specific logic isolated:

- **Shared components** remain environment-agnostic (no Electron code)
- **Native services** handle all Electron IPC communication
- **Native components** delegate to services rather than accessing Electron directly

See [`ARCHITECTURE.md`](./ARCHITECTURE.md) for detailed architecture documentation.

## Services

### NativeFileProcessor

Implements the `FileService` interface using Electron IPC for native file operations.

```typescript
// Automatically uses native file picker via service
const file = await fileProcessor.selectFile();

// Validates archive structure using native Node.js
const result = await fileProcessor.validateArchive(file);

// Extracts using Node.js (not browser JSZip)
const success = await fileProcessor.extractArchive();
```

### ElectronService

Provides type-safe access to Electron APIs.

```typescript
// Check environment
if (electronService.isElectron()) {
  // Get API reference
  const api = electronService.getAPI();
  
  // Use IPC methods
  const result = await api.selectFile();
}
```

### CLIService

Handles CLI command execution for future migration integration.

```typescript
// Execute CLI command
const processId = await cliService.execute('command', ['--args']);

// Monitor output
cliService.output$.subscribe(data => {
  console.log(data);
});

// Cancel process
await cliService.cancel(processId);
```

### ConsoleLogger

Eagle-themed console logging service.

```typescript
logger.log('General log message');        // 🦅 LOG: ...
logger.error('Error message');             // 🦅 ERROR: ...
logger.warn('Warning message');            // 🦅 WARN: ...
logger.workflow('Workflow message');       // 🦅 WORKFLOW: ...
logger.instrument('App name');             // 🦅 INSTRUMENT: ...
```

## IPC Communication

The app uses a secure IPC architecture via `contextBridge`:

### Available IPC Channels

- **`select-file`** - Opens native file picker
- **`validate-archive`** - Validates Instagram archive
- **`extract-archive`** - Extracts ZIP archive
- **`read-file`** - Reads file contents
- **`execute-cli`** - Spawns CLI process
- **`cancel-cli`** - Terminates CLI process
- **`get-system-info`** - Returns system information
- **`get-paths`** - Returns system paths

### IPC Events

- **`progress`** - Progress updates (extraction, migration)
- **`cli-output`** - CLI stdout/stderr streams
- **`cli-error`** - CLI error events

## Debugging

### Renderer Process (Angular)

- Press `F12` or `Ctrl+Shift+I` to open Chrome DevTools
- DevTools opens automatically in development mode
- Use Angular DevTools browser extension

### Main Process (Node.js)

```bash
# Add to package.json for VSCode debugging
{
  "type": "node",
  "request": "launch",
  "name": "Electron Main",
  "runtimeExecutable": "${workspaceFolder}/node_modules/.bin/electron",
  "program": "${workspaceFolder}/projects/flock-native/electron/main.js",
  "protocol": "inspector"
}
```

### Logs

Console logs are visible in:
- **Renderer logs**: Chrome DevTools Console
- **Main process logs**: Terminal where `npm run start:native` was executed

## Testing

### Upload Flow Test

1. Start the app: `npm run start:native`
2. Navigate to landing page
3. Click "Get Started" or navigate to `/step/upload`
4. Click "Choose Files" button
5. **Expected**: Native OS file picker opens
6. Select an Instagram archive ZIP file
7. **Expected**: File name and size display
8. **Expected**: Console shows: `🦅 Native file selected: [filename]`
9. **Expected**: Validation runs automatically

### Console Validation

Open DevTools and verify logs:
```
🦅 INSTRUMENT: 🦅 Eagle ready to soar!
📊 Native Electron environment detected
🏔️ Eagle soaring with full desktop power
🦅 Using Electron native file picker
🦅 Native file selected: instagram-archive.zip
🦅 Archive validation result: ✅ Valid
```

## Environment Detection

The app automatically detects the Electron environment:

```typescript
// FileUploadControl automatically uses native picker
if (window.electronAPI?.isElectron) {
  // Electron native file picker
} else {
  // Browser HTML5 file input
}
```

This allows shared components to work in both native and web environments.

## Security

Following Electron security best practices:

- ✅ `nodeIntegration: false` - Renderer has no direct Node.js access
- ✅ `contextIsolation: true` - Isolates renderer context
- ✅ `sandbox: false` (required for file system access)
- ✅ `preload` script - Controlled API surface via `contextBridge`
- ✅ External links open in system browser

## Future Enhancements

### Planned Features

- **Auto-updates** - Electron builder with automatic updates
- **System tray** - Minimize to system tray
- **Notifications** - Native OS notifications for migration status
- **Offline mode** - Complete migration without internet
- **Multi-instance** - Handle multiple migrations simultaneously
- **Custom themes** - Native window theming
- **Drag & drop** - Drag ZIP files onto window

### CLI Integration

Ready for integration with `@straiforos/instagramtobluesky`:

```typescript
// Execute migration
const processId = await cliService.executeMigration(archivePath, {
  blueskyHandle: '@user.bsky.social',
  blueskyPassword: 'app-password',
  dateFrom: '2023-01-01',
  dateTo: '2024-01-01',
  dryRun: false
});

// Monitor progress
cliService.output$.subscribe(data => {
  const progress = cliService.parseProgress(data.data);
  if (progress) {
    console.log(`Migration ${progress.percentage}% complete`);
  }
});
```

## Troubleshooting

### Electron window doesn't open

```bash
# Ensure Angular dev server is running first
ng serve flock-native --port=4201

# In another terminal
npm run electron:dev
```

### Native file picker doesn't work

- Check console for: `📦 Electron API exposed to renderer process`
- Verify: `window.electronAPI !== undefined`
- Check main process logs for IPC handler registration

### Hot reload not working

- Electron must be restarted for main process changes
- Angular changes should hot-reload automatically
- If issues persist, restart both: `npm run start:native`

### Build errors

```bash
# Clean and rebuild
rm -rf dist/flock-native node_modules/.cache
npm run build:native
```

## Contributing

When adding new features:

1. **IPC Communication**: Add handlers in `electron/ipc-handlers.js`
2. **Type Definitions**: Update `src/app/types/electron.d.ts`
3. **Services**: Implement in `src/app/service/`
4. **Testing**: Manually test with real Electron window
5. **Documentation**: Update this README

## Resources

- [Electron Documentation](https://www.electronjs.org/docs/latest)
- [Angular Documentation](https://angular.dev)
- [Flock Architecture](../../docs/ARCHITECTURE.md)
- [Shared Library](../shared/README.md)

---

**🦅 Built with Electron + Angular** | **🏗️ Native desktop power** | **🔒 Secure IPC** | **📦 Full file system access**

