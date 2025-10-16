# Cross-Platform E2E Test Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                    GitHub Actions Workflow Trigger                  │
│                                                                      │
│  • Manual (workflow_dispatch) - Select platforms                   │
│  • Automatic (push to main/develop affecting Electron code)        │
└──────────────────────┬──────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     Platform Matrix Jobs                            │
└─────────────────────────────────────────────────────────────────────┘
           │                │                 │                │
           ▼                ▼                 ▼                ▼
    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
    │ Windows  │    │  macOS   │    │  macOS   │    │  Linux   │
    │ Latest   │    │  Intel   │    │   ARM    │    │ Latest   │
    │          │    │ (macos-13│    │(macos-   │    │          │
    │          │    │)         │    │ latest)  │    │          │
    └────┬─────┘    └────┬─────┘    └────┬─────┘    └────┬─────┘
         │               │               │               │
         │               │               │               │
         ▼               ▼               ▼               ▼
    ┌─────────────────────────────────────────────────────────┐
    │              Build Electron App                         │
    │  • npm run build:native                                 │
    │  • Setup sharp for platform                             │
    │  • npm run pack:{platform}                              │
    └───────────────────┬─────────────────────────────────────┘
                        │
                        ▼
    ┌─────────────────────────────────────────────────────────┐
    │           Verify Platform Build                         │
    │  Windows:  dist/electron/win-unpacked/*.exe             │
    │  macOS:    dist/electron/mac*/*.app                     │
    │  Linux:    dist/electron/linux-unpacked/binary          │
    └───────────────────┬─────────────────────────────────────┘
                        │
                        ▼
    ┌─────────────────────────────────────────────────────────┐
    │      Run Platform-Specific E2E Tests                    │
    │  • Load wdio.electron.{platform}.conf.ts                │
    │  • Filter tests by @os:{platform} tag                   │
    │  • Execute WebdriverIO + Cucumber tests                 │
    │  • Capture screenshots on failures                      │
    └───────────────────┬─────────────────────────────────────┘
                        │
                        ▼
    ┌─────────────────────────────────────────────────────────┐
    │          Upload Test Artifacts                          │
    │  • allure-results-{platform}-{run_number}               │
    │  • screenshots-{platform}-{run_number} (on failure)     │
    └───────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   Aggregate Results Job                             │
│                                                                      │
│  1. Download all platform artifacts                                │
│  2. Merge allure-results from all platforms                        │
│  3. Generate unified Allure report                                 │
│  4. Create cross-platform summary table                            │
│  5. Upload consolidated artifacts                                  │
└─────────────────────────────────────────────────────────────────────┘
```

## Local Development Flow

```
Developer runs:
npm run e2e:electron:windows  (on Windows)
npm run e2e:electron:macos    (on macOS)
npm run e2e:electron:linux    (on Linux)
         │
         ▼
┌─────────────────────────────┐
│  Auto-detect Platform       │
│  • Windows: win32           │
│  • macOS: darwin            │
│  • Linux: linux             │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│  Select Config File         │
│  • wdio.electron.windows.   │
│    conf.ts                  │
│  • wdio.electron.macos.     │
│    conf.ts                  │
│  • wdio.electron.linux.     │
│    conf.ts                  │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│  Determine App Path         │
│  • Windows:                 │
│    Flock Native.exe         │
│  • macOS (Intel):           │
│    Flock Native.app (x64)   │
│  • macOS (ARM):             │
│    Flock Native.app (arm64) │
│  • Linux:                   │
│    flock-native             │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│  Filter Tests by Tags       │
│  • @os:windows              │
│  • @os:macos                │
│  • @os:linux                │
│  • No tag = all platforms   │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│  Run WebdriverIO Tests      │
│  • Launch Electron app      │
│  • Execute Cucumber tests   │
│  • Generate Allure report   │
└─────────────────────────────┘
```

## Tag-Based Test Filtering

```
Feature File:
┌──────────────────────────────────────┐
│ @electron @upload @core              │
│ Feature: Native File Dialog          │
│                                      │
│ @os:windows                          │
│ Scenario: Windows native dialog     │ ◄── Only runs on Windows
│   ...                                │
│                                      │
│ @os:macos                            │
│ Scenario: macOS native dialog       │ ◄── Only runs on macOS
│   ...                                │
│                                      │
│ @os:linux                            │
│ Scenario: Linux native dialog       │ ◄── Only runs on Linux
│   ...                                │
│                                      │
│ Scenario: File dialog validates     │ ◄── Runs on ALL platforms
│   ...                                │     (no @os tag)
└──────────────────────────────────────┘
```

## Platform Build Outputs

```
dist/electron/
├── win-unpacked/              ◄── Windows
│   ├── Flock Native.exe
│   ├── resources/
│   └── ...
│
├── mac/                       ◄── macOS Intel (x64)
│   └── Flock Native.app/
│       └── Contents/
│           └── MacOS/
│               └── Flock Native
│
├── mac-arm64/                 ◄── macOS ARM (Apple Silicon)
│   └── Flock Native.app/
│       └── Contents/
│           └── MacOS/
│               └── Flock Native
│
└── linux-unpacked/            ◄── Linux
    ├── flock-native
    ├── resources/
    └── ...
```

## Configuration File Structure

```
wdio.electron.conf.ts         ◄── Generic (auto-detect)
├── getPlatformElectronPath() ├── Detects: win32, darwin, linux
├── getTagExpression()        └── Arch detection on macOS
└── config object

wdio.electron.windows.conf.ts ◄── Windows-specific
├── buildDir: 'dist/electron/win-unpacked'
├── appName: 'Flock Native.exe'
└── tagExpression: '@os:windows'

wdio.electron.macos.conf.ts   ◄── macOS-specific
├── buildDir: 'dist/electron/mac*' (arch-based)
├── appName: 'Flock Native.app/Contents/MacOS/Flock Native'
└── tagExpression: '@os:macos'

wdio.electron.linux.conf.ts   ◄── Linux-specific
├── buildDir: 'dist/electron/linux-unpacked'
├── appName: 'flock-native'
└── tagExpression: '@os:linux'
```

## Test Execution Flow

```
1. Load Configuration
   │
   ▼
2. Launch Electron App
   │
   ▼
3. Connect WebDriver
   │
   ▼
4. Parse Feature Files
   │
   ▼
5. Filter by Tags
   │
   ▼
6. Execute Scenarios
   │
   ▼
7. Generate Reports
   │
   ▼
8. Cleanup
```

## Supported Platforms & Architectures

```
┌──────────┬─────────────┬──────────────┬─────────────────┐
│ Platform │ Runner      │ Architecture │ E2E Build       │
├──────────┼─────────────┼──────────────┼─────────────────┤
│ Windows  │ windows-    │ x64          │ unpacked dir    │
│          │ latest      │              │ (.exe in dir)   │
├──────────┼─────────────┼──────────────┼─────────────────┤
│ macOS    │ macos-13    │ x64 (Intel)  │ unpacked dir    │
│ (Intel)  │             │              │ (.app in dir)   │
├──────────┼─────────────┼──────────────┼─────────────────┤
│ macOS    │ macos-      │ arm64        │ unpacked dir    │
│ (ARM)    │ latest      │ (M1/M2)      │ (.app in dir)   │
├──────────┼─────────────┼──────────────┼─────────────────┤
│ Linux    │ ubuntu-     │ x64          │ unpacked dir    │
│          │ latest      │              │ (binary in dir) │
└──────────┴─────────────┴──────────────┴─────────────────┘

Note: E2E tests use unpacked builds (--dir flag) for faster testing.
Production builds (.exe, .dmg, .AppImage, .deb, .rpm) are created
separately for distribution.
```
