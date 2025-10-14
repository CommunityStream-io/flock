# Multi-Platform E2E Testing Architecture

## Overview

A scalable E2E testing framework that supports:
- **Multiple Application Types**: Web (Mirage), Desktop (Native/Electron), Mobile (future)
- **Multiple OS**: Windows, macOS, Linux
- **Shared Core Requirements**: Common user flows and business logic
- **Platform-Specific Variations**: Native dialogs, OS-specific behavior, architecture differences

## Architecture Principles

### 1. **Separation of Concerns**
```
features/
├── core/              # Platform-agnostic business logic tests
├── web/               # Web-specific tests (Mirage)
├── electron/          # Electron-specific tests (Native)
└── mobile/            # Future: Mobile-specific tests
```

### 2. **Composition over Duplication**
Reuse step definitions, page objects, and test utilities across platforms where possible.

### 3. **Configuration-Driven**
Use environment variables and config files to target different platforms without code changes.

## Directory Structure

```
flock/
├── features/
│   ├── core/                          # Shared core features
│   │   ├── auth/                      # Authentication flows
│   │   │   ├── login.feature          # Core login scenario
│   │   │   └── logout.feature
│   │   ├── upload/                    # File upload flows
│   │   │   ├── validation.feature     # Core validation logic
│   │   │   └── selection.feature
│   │   └── config/                    # Configuration management
│   │       └── settings.feature
│   │
│   ├── web/                           # Web-specific (Mirage)
│   │   ├── auth/
│   │   │   └── web-login.feature      # @web @platform:web
│   │   ├── upload/
│   │   │   └── web-file-input.feature # HTML file input
│   │   └── demo/
│   │       └── demo-mode.feature      # Demo-specific behavior
│   │
│   ├── electron/                      # Electron-specific (Native)
│   │   ├── auth/
│   │   │   └── electron-login.feature # @electron @platform:electron
│   │   ├── upload/
│   │   │   └── native-dialog.feature  # Native OS dialogs
│   │   ├── ipc/
│   │   │   ├── cli-integration.feature
│   │   │   └── main-renderer-comm.feature
│   │   ├── window/
│   │   │   ├── multi-window.feature
│   │   │   └── window-state.feature
│   │   └── os/                        # OS-specific scenarios
│   │       ├── windows.feature        # @os:windows
│   │       ├── macos.feature          # @os:macos
│   │       └── linux.feature          # @os:linux
│   │
│   ├── pageobjects/
│   │   ├── base/                      # Base classes
│   │   │   ├── BasePage.ts
│   │   │   └── BaseComponent.ts
│   │   ├── adapters/                  # Platform adapters
│   │   │   ├── WebAdapter.ts
│   │   │   ├── ElectronAdapter.ts
│   │   │   └── PlatformAdapter.interface.ts
│   │   ├── pages/
│   │   │   ├── LoginPage.ts           # Uses adapter pattern
│   │   │   ├── UploadPage.ts
│   │   │   └── ConfigPage.ts
│   │   └── components/
│   │       ├── FileUpload.component.ts
│   │       └── AuthForm.component.ts
│   │
│   ├── step-definitions/
│   │   ├── core/                      # Shared steps
│   │   │   ├── auth.steps.ts
│   │   │   ├── upload.steps.ts
│   │   │   └── navigation.steps.ts
│   │   ├── web/                       # Web-specific steps
│   │   │   └── web-specific.steps.ts
│   │   └── electron/                  # Electron-specific steps
│   │       ├── ipc.steps.ts
│   │       ├── dialog.steps.ts
│   │       └── window.steps.ts
│   │
│   └── support/
│       ├── adapters/
│       │   ├── platform.factory.ts    # Factory to create adapters
│       │   └── platform.types.ts
│       ├── config/
│       │   ├── timeout-config.ts      # Per-platform timeouts
│       │   ├── web.config.ts
│       │   └── electron.config.ts
│       └── hooks/
│           ├── common.hooks.ts        # Shared hooks
│           ├── web.hooks.ts
│           └── electron.hooks.ts
│
├── wdio.conf.ts                       # Base config
├── wdio.web.conf.ts                   # Web (Mirage) config
├── wdio.electron.conf.ts              # Electron (Native) config
└── wdio.electron.{os}.conf.ts         # OS-specific Electron configs
```

## Platform Adapter Pattern

### Interface
```typescript
// features/support/adapters/PlatformAdapter.interface.ts
export interface PlatformAdapter {
  platform: 'web' | 'electron' | 'mobile';
  os?: 'windows' | 'macos' | 'linux';
  
  // File operations
  selectFile(path: string): Promise<void>;
  selectFiles(paths: string[]): Promise<void>;
  
  // Navigation
  navigateTo(route: string): Promise<void>;
  
  // Authentication
  authenticate(username: string, password: string): Promise<void>;
  
  // Platform-specific
  executeNativeAction?(action: string, params?: any): Promise<any>;
  sendIpcMessage?(channel: string, data: any): Promise<any>;
}
```

### Web Adapter Implementation
```typescript
// features/support/adapters/WebAdapter.ts
export class WebAdapter implements PlatformAdapter {
  platform = 'web' as const;
  
  async selectFile(path: string): Promise<void> {
    // Use standard HTML file input
    const input = await $('input[type="file"]');
    await input.setValue(path);
  }
  
  async navigateTo(route: string): Promise<void> {
    await browser.url(`http://localhost:4200${route}`);
  }
  
  async authenticate(username: string, password: string): Promise<void> {
    // Web demo mode - mock authentication
    await $('#username').setValue(username);
    await $('#password').setValue(password);
    await $('button[type="submit"]').click();
  }
}
```

### Electron Adapter Implementation
```typescript
// features/support/adapters/ElectronAdapter.ts
export class ElectronAdapter implements PlatformAdapter {
  platform = 'electron' as const;
  os: 'windows' | 'macos' | 'linux';
  
  constructor() {
    this.os = this.detectOS();
  }
  
  async selectFile(path: string): Promise<void> {
    // Use Electron dialog API
    await this.sendIpcMessage('dialog:showOpenDialog', {
      properties: ['openFile'],
      filters: [{ name: 'Archives', extensions: ['zip'] }],
      defaultPath: path
    });
  }
  
  async navigateTo(route: string): Promise<void> {
    // Electron uses app:// protocol
    await browser.url(`app:///${route}`);
  }
  
  async authenticate(username: string, password: string): Promise<void> {
    // Real Bluesky authentication via IPC
    const result = await this.sendIpcMessage('auth:login', {
      username,
      password
    });
    
    if (!result.success) {
      throw new Error(`Authentication failed: ${result.error}`);
    }
  }
  
  async sendIpcMessage(channel: string, data: any): Promise<any> {
    return await browser.electron.execute((electron, args) => {
      return electron.ipcRenderer.invoke(args.channel, args.data);
    }, { channel, data });
  }
  
  private detectOS(): 'windows' | 'macos' | 'linux' {
    const platform = process.platform;
    if (platform === 'win32') return 'windows';
    if (platform === 'darwin') return 'macos';
    return 'linux';
  }
}
```

### Factory
```typescript
// features/support/adapters/platform.factory.ts
export class PlatformFactory {
  static createAdapter(): PlatformAdapter {
    const platform = process.env.PLATFORM || 'web';
    
    switch (platform) {
      case 'web':
        return new WebAdapter();
      case 'electron':
        return new ElectronAdapter();
      default:
        throw new Error(`Unknown platform: ${platform}`);
    }
  }
}
```

## Page Object Pattern with Adapter

```typescript
// features/pageobjects/pages/UploadPage.ts
import { PlatformFactory } from '../support/adapters/platform.factory';

export class UploadPage {
  private adapter = PlatformFactory.createAdapter();
  
  async selectFile(filePath: string): Promise<void> {
    // Adapter handles platform-specific implementation
    await this.adapter.selectFile(filePath);
  }
  
  async clickUploadButton(): Promise<void> {
    // Common UI interaction - same across platforms
    await $('button.upload-btn').click();
  }
  
  async getSelectedFileName(): Promise<string> {
    // Common UI element
    return await $('.file-name').getText();
  }
}
```

## Feature Files with Tags

### Core Feature (Platform-Agnostic)
```gherkin
# features/core/upload/validation.feature
@core @upload
Feature: File Validation
  As a user
  I want my uploaded files to be validated
  So that only valid archives are processed

  @smoke
  Scenario: Valid file passes validation
    Given I am on the upload page
    When I select a valid Instagram archive
    Then the file should be validated successfully
    And I should see a success message
    
  @error-handling
  Scenario: Invalid file fails validation  
    Given I am on the upload page
    When I select an invalid file
    Then the file should fail validation
    And I should see an error message
```

### Web-Specific Feature
```gherkin
# features/web/upload/web-file-input.feature
@web @platform:web @upload
Feature: Web File Input
  As a web user
  I want to use standard HTML file input
  So that I can select files from my browser

  Scenario: HTML file input accepts files
    Given I am on the web upload page
    When I click the file input button
    Then a file picker dialog should appear
    And I can select a file using standard web APIs
```

### Electron-Specific Feature
```gherkin
# features/electron/upload/native-dialog.feature
@electron @platform:electron @upload
Feature: Native File Dialog
  As a desktop user
  I want to use native OS file dialogs
  So that I have a familiar file selection experience

  @os:windows
  Scenario: Windows native dialog
    Given I am on the Electron upload page
    When I click the file selection button
    Then a native Windows file dialog should appear
    And the dialog should use Windows styling
    
  @os:macos
  Scenario: macOS native dialog
    Given I am on the Electron upload page
    When I click the file selection button
    Then a native macOS file dialog should appear
    And the dialog should use macOS styling
```

## WDIO Configuration Strategy

### Base Configuration
```typescript
// wdio.conf.ts
export const baseConfig: Options.Testrunner = {
  runner: 'local',
  specs: ['./features/**/*.feature'],
  exclude: [],
  maxInstances: 10,
  
  // Base capabilities - override in platform configs
  capabilities: [],
  
  logLevel: 'info',
  framework: 'cucumber',
  
  cucumberOpts: {
    require: [
      './features/step-definitions/**/*.ts',
      './features/support/**/*.ts'
    ],
    // Tag expression set by platform config
    tagExpression: '',
    timeout: 60000,
  },
};
```

### Web Configuration
```typescript
// wdio.web.conf.ts
import { baseConfig } from './wdio.conf';

export const config: Options.Testrunner = {
  ...baseConfig,
  
  baseUrl: 'http://localhost:4200',
  
  capabilities: [{
    browserName: 'chrome',
    'goog:chromeOptions': {
      args: ['--headless', '--disable-gpu']
    }
  }],
  
  cucumberOpts: {
    ...baseConfig.cucumberOpts,
    // Run core tests + web-specific tests
    tagExpression: '@core or @web',
  },
  
  specs: [
    './features/core/**/*.feature',
    './features/web/**/*.feature'
  ],
};
```

### Electron Configuration (Cross-Platform)
```typescript
// wdio.electron.conf.ts
import { baseConfig } from './wdio.conf';

const os = process.platform;
const electronBinary = {
  win32: 'dist/electron/win-unpacked/Flock Native.exe',
  darwin: 'dist/electron/mac/Flock Native.app/Contents/MacOS/Flock Native',
  linux: 'dist/electron/linux-unpacked/flock-native'
}[os];

export const config: Options.Testrunner = {
  ...baseConfig,
  
  services: [['electron', {
    appPath: electronBinary,
    chromedriver: { port: 9515 }
  }]],
  
  capabilities: [{
    browserName: 'electron',
    'wdio:electronServiceOptions': {
      appPath: electronBinary
    }
  }],
  
  cucumberOpts: {
    ...baseConfig.cucumberOpts,
    // Run core tests + electron tests for current OS
    tagExpression: `(@core or @electron) and (@os:${os} or not @os)`,
  },
  
  specs: [
    './features/core/**/*.feature',
    './features/electron/**/*.feature'
  ],
};
```

## NPM Scripts Strategy

```json
{
  "scripts": {
    "// Core E2E": "",
    "e2e": "npm run e2e:web",
    "e2e:ci": "cross-env CI=true npm run e2e",
    
    "// Web (Mirage) Tests": "",
    "e2e:web": "cross-env PLATFORM=web wdio run wdio.web.conf.ts",
    "e2e:web:headless": "cross-env PLATFORM=web HEADLESS=true wdio run wdio.web.conf.ts",
    "e2e:web:debug": "cross-env PLATFORM=web DEBUG=true wdio run wdio.web.conf.ts",
    
    "// Electron (Native) Tests": "",
    "e2e:electron": "cross-env PLATFORM=electron wdio run wdio.electron.conf.ts",
    "e2e:electron:build": "npm run pack:win:dir && npm run e2e:electron",
    "e2e:electron:windows": "cross-env PLATFORM=electron OS=windows wdio run wdio.electron.conf.ts",
    "e2e:electron:macos": "cross-env PLATFORM=electron OS=macos wdio run wdio.electron.conf.ts",
    "e2e:electron:linux": "cross-env PLATFORM=electron OS=linux wdio run wdio.electron.conf.ts",
    
    "// Tag-Based Filtering": "",
    "e2e:core": "cross-env TEST_TAGS='@core' npm run e2e",
    "e2e:smoke": "cross-env TEST_TAGS='@smoke' npm run e2e",
    "e2e:auth": "cross-env TEST_TAGS='@auth' npm run e2e",
    "e2e:upload": "cross-env TEST_TAGS='@upload' npm run e2e",
    
    "// Platform + Tag Combinations": "",
    "e2e:web:smoke": "cross-env PLATFORM=web TEST_TAGS='@smoke and (@core or @web)' wdio run wdio.web.conf.ts",
    "e2e:electron:smoke": "cross-env PLATFORM=electron TEST_TAGS='@smoke and (@core or @electron)' wdio run wdio.electron.conf.ts",
    
    "// CI/CD Scripts": "",
    "e2e:ci:web": "cross-env CI=true PLATFORM=web npm run e2e:web:headless",
    "e2e:ci:electron": "cross-env CI=true PLATFORM=electron npm run e2e:electron:build",
    "e2e:ci:all": "npm run e2e:ci:web && npm run e2e:ci:electron"
  }
}
```

## Tag Strategy

### Platform Tags
- `@core` - Platform-agnostic business logic
- `@web` - Web-specific scenarios
- `@electron` - Electron-specific scenarios
- `@mobile` - Mobile-specific scenarios (future)

### OS Tags
- `@os:windows` - Windows-specific
- `@os:macos` - macOS-specific
- `@os:linux` - Linux-specific

### Feature Tags
- `@auth` - Authentication flows
- `@upload` - File upload features
- `@config` - Configuration management
- `@migration` - Migration process

### Priority Tags
- `@smoke` - Critical path tests
- `@regression` - Full regression suite
- `@wip` - Work in progress
- `@skip` - Temporarily skipped

### Example Tag Expressions
```bash
# Run all core tests on web
TEST_TAGS="@core and @web" npm run e2e:web

# Run smoke tests on Electron for Windows
TEST_TAGS="@smoke and @electron and @os:windows" npm run e2e:electron

# Run all upload tests across platforms
TEST_TAGS="@upload" npm run e2e

# Run everything except WIP and skipped
TEST_TAGS="not @wip and not @skip" npm run e2e
```

## CI/CD Integration

### GitHub Actions Example
```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  web-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run e2e:ci:web
      
  electron-windows:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run e2e:ci:electron
      
  electron-macos:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run e2e:ci:electron
      
  electron-linux:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run e2e:ci:electron
```

## Benefits of This Architecture

### 1. **Code Reuse**
- Core business logic tests run on all platforms
- Shared step definitions and page objects
- Common utilities and helpers

### 2. **Platform-Specific Testing**
- Test native features (dialogs, IPC, window management)
- Test OS-specific behavior
- Maintain platform-specific edge cases

### 3. **Scalability**
- Easy to add new platforms (mobile, PWA, etc.)
- Easy to add new OS support
- Modular structure grows with application

### 4. **Maintainability**
- Clear separation between shared and platform-specific code
- Adapter pattern isolates platform differences
- Tag-based filtering for targeted test runs

### 5. **CI/CD Friendly**
- Run platform-specific tests on platform-specific runners
- Parallel execution across platforms
- Tag-based filtering for fast feedback loops

## Migration Path

### Phase 1: Structure (Week 1)
1. Create directory structure
2. Move existing features to `core/` and `web/`
3. Add platform tags to features

### Phase 2: Adapters (Week 2)
1. Create platform adapter interfaces
2. Implement WebAdapter
3. Implement ElectronAdapter
4. Update page objects to use adapters

### Phase 3: Configuration (Week 3)
1. Split WDIO configs (base, web, electron)
2. Update npm scripts
3. Configure tag expressions

### Phase 4: Electron Features (Week 4)
1. Create electron-specific features
2. Implement electron-specific step definitions
3. Test on all OS

### Phase 5: CI/CD (Week 5)
1. Set up GitHub Actions workflows
2. Configure platform-specific runners
3. Add reporting and artifacts

## Next Steps

1. **Review and approve architecture**
2. **Create POC** with 1-2 features to validate approach
3. **Migrate existing tests** following phased approach
4. **Document team conventions** for writing platform-specific tests
5. **Set up CI/CD pipelines** for automated testing

---

**Last Updated**: October 13, 2025

