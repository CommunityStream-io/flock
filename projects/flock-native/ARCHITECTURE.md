# 🦅 Flock Native - Architecture

## Overview

Flock Native uses a **service-delegated architecture** that keeps Electron-specific logic isolated from shared components. This ensures the shared library remains environment-agnostic while allowing native-specific functionality.

## Architecture Principles

### 1. **Shared Component Isolation**
- Shared components (`projects/shared/`) remain pure and environment-agnostic
- No Electron-specific code in the shared library
- Components work in both browser and Electron environments

### 2. **Service Delegation Pattern**
- Native-specific logic is implemented in **services** (e.g., `NativeFileProcessor`)
- Services handle all Electron IPC communication
- Components delegate to services rather than directly accessing Electron APIs

### 3. **Native Component Wrappers**
- Create native-specific components when needed (e.g., `NativeFileUploadControl`)
- These components delegate to native services
- Keep the same interface as shared components for consistency

## Architecture Layers

```
┌─────────────────────────────────────────────────────────┐
│                  Electron Main Process                   │
│              (Node.js + Full System Access)              │
│                                                           │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐    │
│  │ main.js     │  │ ipc-        │  │ File System  │    │
│  │             │─▶│ handlers.js │─▶│ & CLI Access │    │
│  └─────────────┘  └─────────────┘  └──────────────┘    │
└─────────────────────────┬───────────────────────────────┘
                          │ IPC (contextBridge)
                          ▼
┌─────────────────────────────────────────────────────────┐
│                Electron Renderer Process                 │
│            (Angular App in Browser Context)              │
│                                                           │
│  ┌──────────────────────────────────────────────────┐   │
│  │           Angular Application Layer               │   │
│  │  ┌────────────────┐  ┌────────────────┐         │   │
│  │  │ Native         │  │ Native Upload  │         │   │
│  │  │ Components     │─▶│ Step          │         │   │
│  │  └────────────────┘  └────────────────┘         │   │
│  └──────────────────────┬───────────────────────────┘   │
│                         │                                │
│  ┌──────────────────────▼───────────────────────────┐   │
│  │              Service Layer                        │   │
│  │  ┌──────────────────┐  ┌──────────────────┐     │   │
│  │  │ NativeFile       │  │ Electron         │     │   │
│  │  │ Processor        │◀─│ Service          │     │   │
│  │  └──────────────────┘  └──────────────────┘     │   │
│  │  ┌──────────────────┐  ┌──────────────────┐     │   │
│  │  │ CLI Service      │  │ Console Logger   │     │   │
│  │  └──────────────────┘  └──────────────────┘     │   │
│  └──────────────────────────────────────────────────┘   │
│                                                           │
│  ┌──────────────────────────────────────────────────┐   │
│  │          Shared Library Integration               │   │
│  │  ┌────────────────┐  ┌────────────────┐         │   │
│  │  │ Layout         │  │ Landing Page   │         │   │
│  │  │ Component      │  │                │         │   │
│  │  └────────────────┘  └────────────────┘         │   │
│  │  ┌────────────────┐  ┌────────────────┐         │   │
│  │  │ Step           │  │ Router         │         │   │
│  │  │ Navigation     │  │ Guards         │         │   │
│  │  └────────────────┘  └────────────────┘         │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

## Component Architecture

### Shared vs Native Components

#### ❌ **Anti-Pattern: Modifying Shared Components**
```typescript
// DON'T: Add Electron-specific code to shared components
@Component({
  selector: 'shared-file-upload-control',
  // ...
})
export class FileUploadControl {
  openFileDialog() {
    if (window.electronAPI) {  // ❌ Breaks environment isolation
      // Electron-specific code
    }
  }
}
```

#### ✅ **Correct Pattern: Service Delegation**
```typescript
// Native Service handles Electron specifics
@Injectable()
export class NativeFileProcessor implements FileService {
  async selectFile(): Promise<File | null> {
    const api = this.electronService.getAPI();
    const result = await api.selectFile();
    // Handle native file selection
  }
}

// Native Component delegates to service
@Component({
  selector: 'native-file-upload-control',
  // ...
})
export class NativeFileUploadControl {
  private fileProcessor = inject(NativeFileProcessor);
  
  async openFileDialog() {
    // Delegate to service - no Electron code here
    const file = await this.fileProcessor.selectFile();
  }
}
```

## Service Layer Architecture

### Interface Implementation Pattern

All native services implement shared interfaces but provide Electron-specific implementations:

```typescript
// Shared interface (projects/shared/src/lib/services/interfaces/file.ts)
export interface FileService {
  archivedFile: File | null;
  validateArchive(file: File): Promise<ValidationResult>;
  extractArchive(): Promise<boolean>;
}

// Native implementation (projects/flock-native/src/app/service/)
@Injectable()
export class NativeFileProcessor implements FileService {
  // Uses Electron IPC for all operations
  async validateArchive(file: File): Promise<ValidationResult> {
    const api = this.electronService.getAPI();
    return await api.validateArchive(this.getNativeFilePath(file));
  }
}
```

### Service Injection

Services are injected via Angular DI with appropriate tokens:

```typescript
// app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    // Native implementations
    { provide: FILE_PROCESSOR, useClass: NativeFileProcessor },
    { provide: LOGGER, useClass: ConsoleLogger },
    { provide: BLUESKY, useClass: Bluesky },
    // ...
  ],
};
```

## File Organization

```
projects/flock-native/
├── electron/                        # Main Process
│   ├── main.js                      # Electron entry point
│   ├── preload.js                   # IPC bridge
│   └── ipc-handlers.js              # IPC handlers
│
├── src/app/
│   ├── components/                  # Native-specific components
│   │   └── native-file-upload/      # Wraps native file selection
│   │       ├── native-file-upload.ts
│   │       ├── native-file-upload.html
│   │       └── native-file-upload.css
│   │
│   ├── service/                     # Native service implementations
│   │   ├── native-file-processor.ts # File operations via IPC
│   │   ├── electron.service.ts      # Electron API wrapper
│   │   ├── cli.service.ts           # CLI execution
│   │   ├── console-logger.ts        # Logger implementation
│   │   ├── bluesky.ts               # Bluesky integration
│   │   └── router-logging.ts        # Router event logging
│   │
│   ├── steps/                       # Native-specific steps
│   │   └── upload/                  # Native upload implementation
│   │       ├── upload.ts
│   │       ├── upload.html
│   │       └── upload.css
│   │
│   ├── types/                       # TypeScript definitions
│   │   └── electron.d.ts            # Electron API types
│   │
│   ├── app.ts                       # Root component
│   ├── app.config.ts                # App configuration
│   └── app.routes.ts                # Route definitions
```

## Data Flow Example: File Selection

### 1. User Interaction
```typescript
// native-file-upload.html
<button (click)="openFileDialog()">Choose Files</button>
```

### 2. Component Delegates to Service
```typescript
// native-file-upload.ts
async openFileDialog() {
  const file = await this.fileProcessor.selectFile();
  this.value = file;
}
```

### 3. Service Uses Electron API
```typescript
// native-file-processor.ts
async selectFile(): Promise<File | null> {
  const api = this.electronService.getAPI();
  const result = await api.selectFile();
  return this.createFileFromNative(result);
}
```

### 4. Electron Service Calls IPC
```typescript
// electron.service.ts
getAPI(): ElectronAPI {
  return window.electronAPI; // Exposed via preload
}
```

### 5. IPC Handler Executes
```javascript
// electron/ipc-handlers.js
ipcMain.handle('select-file', async () => {
  const result = await dialog.showOpenDialog({...});
  return { success: true, filePath: result.filePaths[0], ... };
});
```

## Type Safety

TypeScript definitions ensure type safety across the IPC boundary:

```typescript
// types/electron.d.ts
export interface ElectronAPI {
  selectFile(): Promise<FileSelectionResult>;
  validateArchive(path: string): Promise<ValidationResult>;
  // ... other methods
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}
```

## Benefits of This Architecture

1. **🔒 Isolation**: Shared library remains environment-agnostic
2. **🔄 Reusability**: Shared components work in all environments
3. **🧪 Testability**: Services can be mocked easily
4. **🛡️ Type Safety**: Full TypeScript support across IPC
5. **🔧 Maintainability**: Clear separation of concerns
6. **📦 Scalability**: Easy to add new native features

## Adding New Native Features

### Step 1: Define IPC Handler
```javascript
// electron/ipc-handlers.js
ipcMain.handle('new-feature', async (event, params) => {
  // Native implementation
  return result;
});
```

### Step 2: Add TypeScript Types
```typescript
// types/electron.d.ts
export interface ElectronAPI {
  newFeature(params: Params): Promise<Result>;
}
```

### Step 3: Implement Service Method
```typescript
// service/feature.service.ts
async executeFeature(params: Params): Promise<Result> {
  const api = this.electronService.getAPI();
  return await api.newFeature(params);
}
```

### Step 4: Use in Components
```typescript
// components/feature/feature.ts
async handleFeature() {
  const result = await this.featureService.executeFeature(params);
}
```

## Testing Strategy

### Service Testing
```typescript
describe('NativeFileProcessor', () => {
  it('should delegate to Electron API', async () => {
    const mockElectronService = jasmine.createSpyObj('ElectronService', ['getAPI']);
    const processor = new NativeFileProcessor(mockElectronService);
    // Test service behavior
  });
});
```

### Component Testing
```typescript
describe('NativeFileUploadControl', () => {
  it('should call file processor on open', async () => {
    const mockProcessor = jasmine.createSpyObj('FileProcessor', ['selectFile']);
    // Test component delegation
  });
});
```

---

**🦅 Architecture that soars** | **🔒 Proper separation** | **🧩 Reusable components** | **🛡️ Type-safe IPC**

