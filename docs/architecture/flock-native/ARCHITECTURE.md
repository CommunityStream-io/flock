# 🦅 Flock Native - Architecture

## Overview

Flock Native uses a **service-delegated architecture** that keeps Electron-specific logic isolated from shared components. This ensures the shared library remains environment-agnostic while allowing native-specific functionality.

## Architecture Principles

### 1. **Shared Component Isolation**
- Shared components (`projects/shared/`) remain pure and environment-agnostic
- No Electron-specific code in the shared library
- Components work in both browser and Electron environments

### 2. **Service Delegation Pattern**
- Native-specific logic is implemented in **services** (see [`src/app/service/`](../../../projects/flock-native/src/app/service/))
- Services handle all Electron IPC communication
- Components delegate to services rather than directly accessing Electron APIs

### 3. **Native Component Wrappers**
- Create native-specific components when needed (see [`src/app/components/`](../../../projects/flock-native/src/app/components/))
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
- **Don't add Electron-specific code to shared components** in [`projects/shared/`](../../../projects/shared/)
- This breaks environment isolation and makes components non-portable
- Shared components should remain pure and work in all environments

#### ✅ **Correct Pattern: Service Delegation**
- **Native Service Implementation**: [`src/app/service/native-file-processor/native-file-processor.ts`](../../../projects/flock-native/src/app/service/native-file-processor/native-file-processor.ts)
- **Native Component**: [`src/app/components/native-file-upload/native-file-upload.ts`](../../../projects/flock-native/src/app/components/native-file-upload/native-file-upload.ts)
- **Electron Service**: [`src/app/service/electron/electron.service.ts`](../../../projects/flock-native/src/app/service/electron/electron.service.ts)
- Components delegate to services rather than directly accessing Electron APIs

## Service Layer Architecture

### Interface Implementation Pattern

All native services implement shared interfaces but provide Electron-specific implementations:

- **Shared Interface**: [`src/lib/services/interfaces/file.ts`](../../../projects/shared/src/lib/services/interfaces/file.ts)
- **Native Implementation**: [`src/app/service/native-file-processor/native-file-processor.ts`](../../../projects/flock-native/src/app/service/native-file-processor/native-file-processor.ts)
- **Bluesky Service**: [`src/app/service/bluesky/bluesky.ts`](../../../projects/flock-native/src/app/service/bluesky/bluesky.ts)
- **CLI Service**: [`src/app/service/cli/cli.service.ts`](../../../projects/flock-native/src/app/service/cli/cli.service.ts)

### Service Injection

Services are injected via Angular DI with appropriate tokens in:
- **App Configuration**: [`src/app/app.config.ts`](../../../projects/flock-native/src/app/app.config.ts)
- **Service Providers**: Configured with native implementations

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
- **Template**: [`src/app/components/native-file-upload/native-file-upload.html`](../../../projects/flock-native/src/app/components/native-file-upload/native-file-upload.html)
- User clicks file selection button

### 2. Component Delegates to Service
- **Component**: [`src/app/components/native-file-upload/native-file-upload.ts`](../../../projects/flock-native/src/app/components/native-file-upload/native-file-upload.ts)
- Component calls service method for file selection

### 3. Service Uses Electron API
- **File Processor**: [`src/app/service/native-file-processor/native-file-processor.ts`](../../../projects/flock-native/src/app/service/native-file-processor/native-file-processor.ts)
- Service handles Electron API communication

### 4. Electron Service Calls IPC
- **Electron Service**: [`src/app/service/electron/electron.service.ts`](../../../projects/flock-native/src/app/service/electron/electron.service.ts)
- Service accesses window.electronAPI exposed via preload

### 5. IPC Handler Executes
- **IPC Handlers**: [`electron/ipc-handlers.js`](../../../projects/flock-native/electron/ipc-handlers.js)
- **File Handlers**: [`electron/handlers/file-handlers.js`](../../../projects/flock-native/electron/handlers/file-handlers.js)
- Main process executes native file operations

## Type Safety

TypeScript definitions ensure type safety across the IPC boundary:

- **Electron Types**: [`src/app/types/electron.d.ts`](../../../projects/flock-native/src/app/types/electron.d.ts)
- Defines ElectronAPI interface and global window extensions
- Ensures type safety for all IPC communication

## Benefits of This Architecture

1. **🔒 Isolation**: Shared library remains environment-agnostic
2. **🔄 Reusability**: Shared components work in all environments
3. **🧪 Testability**: Services can be mocked easily
4. **🛡️ Type Safety**: Full TypeScript support across IPC
5. **🔧 Maintainability**: Clear separation of concerns
6. **📦 Scalability**: Easy to add new native features

## Adding New Native Features

### Step 1: Define IPC Handler
- **IPC Handlers**: [`electron/ipc-handlers.js`](../../../projects/flock-native/electron/ipc-handlers.js)
- **Specific Handlers**: [`electron/handlers/`](../../../projects/flock-native/electron/handlers/) (archive, file, cli, system)
- Add new handler for native functionality

### Step 2: Add TypeScript Types
- **Type Definitions**: [`src/app/types/electron.d.ts`](../../../projects/flock-native/src/app/types/electron.d.ts)
- Extend ElectronAPI interface with new methods
- Define parameter and return types

### Step 3: Implement Service Method
- **Service Implementation**: [`src/app/service/[feature]/[feature].service.ts`](../../../projects/flock-native/src/app/service/)
- Create new service or extend existing one
- Handle Electron API communication

### Step 4: Use in Components
- **Component**: [`src/app/components/[feature]/[feature].ts`](../../../projects/flock-native/src/app/components/)
- **Template**: [`src/app/components/[feature]/[feature].html`](../../../projects/flock-native/src/app/components/)
- Delegate to service for native functionality

## Testing Strategy

### Service Testing
- **Service Test Files**: [`src/app/service/*/**.spec.ts`](../../../projects/flock-native/src/app/service/)
- Mock Electron service dependencies
- Test service behavior and delegation patterns
- Example: [`src/app/service/native-file-processor/native-file-processor.spec.ts`](../../../projects/flock-native/src/app/service/native-file-processor/native-file-processor.spec.ts)

### Component Testing
- **Component Test Files**: [`src/app/components/*/**.spec.ts`](../../../projects/flock-native/src/app/components/)
- Mock service dependencies
- Test component delegation to services
- Example: [`src/app/components/native-file-upload/native-file-upload.spec.ts`](../../../projects/flock-native/src/app/components/native-file-upload/native-file-upload.spec.ts)

### Integration Testing
- **E2E Tests**: [`features/electron/`](../../../features/electron/) directory
- Test complete workflows with real Electron environment
- Validate IPC communication and native functionality

---

**🦅 Architecture that soars** | **🔒 Proper separation** | **🧩 Reusable components** | **🛡️ Type-safe IPC**

