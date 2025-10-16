# Cross-Platform E2E Testing Implementation Guide

## Overview

This guide documents the implementation of cross-platform E2E tests for the Flock Electron application using WebDriverIO's Electron service. The tests run against native builds for Windows (.exe), macOS (.app), and Linux (AppImage/deb/rpm).

## Architecture

### WebDriverIO Electron Service

We use the `wdio-electron-service` package which provides native Electron application testing capabilities:

```typescript
capabilities: [
  {
    browserName: "electron",
    "wdio:electronServiceOptions": {
      appBinaryPath: "./path/to/built/electron/app.exe",
      appArgs: ["--disable-dev-shm-usage"],
    },
  },
]
```

### Platform-Specific Configurations

#### 1. **Windows Configuration** (`wdio.electron.windows.conf.ts`)

- **Binary Path**: `dist/electron/win-unpacked/Flock Native.exe`
- **Tag Expression**: `(@core or @electron) and not @skip and (not @os or @os:windows)`
- **Package Script**: `npm run pack:win:dir`
- **Test Script**: `npm run e2e:electron:windows:build`

#### 2. **macOS Configuration** (`wdio.electron.macos.conf.ts`)

- **Binary Path**: `dist/electron/mac/Flock Native.app/Contents/MacOS/Flock Native`
- **Tag Expression**: `(@core or @electron) and not @skip and (not @os or @os:macos)`
- **Package Script**: `npm run pack:mac`
- **Test Script**: `npm run e2e:electron:macos:build`

#### 3. **Linux Configuration** (`wdio.electron.linux.conf.ts`)

- **Binary Path**: `dist/electron/linux-unpacked/flock-native` (auto-detects AppImage or unpacked)
- **Tag Expression**: `(@core or @electron) and not @skip and (not @os or @os:linux)`
- **Package Script**: `npm run pack:linux`
- **Test Script**: `npm run e2e:electron:linux:build`

## Test Organization

### Feature File Tags

Use tags to control which tests run on which platforms:

```gherkin
# Runs on all platforms
@core @electron
Feature: Window state management

# Windows-only test
@electron @os:windows
Scenario: Test Windows-specific behavior

# macOS-only test
@electron @os:macos
Scenario: Test macOS-specific behavior

# Linux-only test
@electron @os:linux
Scenario: Test Linux-specific behavior
```

### Test Structure

```
features/
├── core/                    # Tests that run on all platforms
│   ├── auth/
│   ├── config/
│   └── upload/
├── electron/                # Electron-specific tests
│   ├── ipc/                 # IPC communication tests
│   ├── upload/              # Native dialog tests
│   └── window/              # Window management tests
└── web/                     # Web-only tests (excluded from Electron)
```

## GitHub Actions Workflow

### Workflow Structure

The `.github/workflows/e2e-cross-platform.yml` workflow runs tests on all three platforms:

```yaml
jobs:
  e2e-windows:
    runs-on: windows-latest
    steps:
      - Build Windows .exe
      - Run Windows E2E tests

  e2e-macos:
    runs-on: macos-latest
    steps:
      - Build macOS .app
      - Run macOS E2E tests

  e2e-linux:
    runs-on: ubuntu-latest
    steps:
      - Build Linux AppImage
      - Run Linux E2E tests

  aggregate-results:
    needs: [e2e-windows, e2e-macos, e2e-linux]
    steps:
      - Combine all test results
      - Generate unified Allure report
```

### Triggers

- **Push**: All branches (including `cursor/**` for agent branches)
- **Pull Request**: PRs to `main` branch
- **Manual**: `workflow_dispatch` for on-demand runs

## Running Tests Locally

### Prerequisites

```bash
# Install dependencies
npm ci

# Build shared library
npm run build:shared

# Build native app
npm run build:native
```

### Windows Tests

```bash
# Build Windows executable and run tests
npm run e2e:electron:windows:build

# Or run tests against existing build
npm run e2e:electron:windows
```

### macOS Tests

```bash
# Build macOS app and run tests
npm run e2e:electron:macos:build

# Or run tests against existing build
npm run e2e:electron:macos
```

### Linux Tests

```bash
# Build Linux packages and run tests
npm run e2e:electron:linux:build

# Or run tests against existing build
npm run e2e:electron:linux
```

## Configuration Options

### Environment Variables

- `ELECTRON_BUILD_DIR`: Override default build directory
- `ELECTRON_BINARY_PATH`: Specify exact binary path
- `TEST_TAGS`: Override Cucumber tag expression
- `HEADLESS`: Run in headless mode (default: true in CI)
- `CI`: Enable CI-specific timeouts and retry logic

### Examples

```bash
# Test specific build directory
ELECTRON_BUILD_DIR=custom/path npm run e2e:electron:windows

# Test specific binary
ELECTRON_BINARY_PATH=/path/to/app.exe npm run e2e:electron:windows

# Run only smoke tests
TEST_TAGS='@smoke and @electron' npm run e2e:electron:windows

# Run with debugging
HEADLESS=false npm run e2e:electron:windows
```

## Build Configuration

### Electron Builder Configuration

The `package.json` contains platform-specific build configurations:

```json
{
  "build": {
    "win": {
      "target": [{ "target": "portable", "arch": ["x64"] }]
    },
    "mac": {
      "target": [
        { "target": "dmg", "arch": ["x64", "arm64"] },
        { "target": "zip", "arch": ["x64", "arm64"] }
      ]
    },
    "linux": {
      "target": [
        { "target": "AppImage", "arch": ["x64"] },
        { "target": "deb", "arch": ["x64"] },
        { "target": "rpm", "arch": ["x64"] }
      ]
    }
  }
}
```

## Platform-Specific Considerations

### Windows

- Uses `.exe` portable executable
- No special permissions required
- Path: `dist/electron/win-unpacked/Flock Native.exe`

### macOS

- Uses `.app` bundle
- Executable is nested: `Flock Native.app/Contents/MacOS/Flock Native`
- Supports both Intel (x64) and Apple Silicon (arm64)
- Path: `dist/electron/mac/Flock Native.app`

### Linux

- Supports multiple package formats:
  - **AppImage**: Most portable, self-contained
  - **deb**: Debian/Ubuntu packages
  - **rpm**: RedHat/Fedora packages
- Requires `--no-sandbox` flag in CI environments
- Auto-detects available binary format
- Path: `dist/electron/linux-unpacked/flock-native`

## Debugging

### Viewing Test Output

```bash
# Run with verbose logging
npm run e2e:electron:windows 2>&1 | tee test-output.log

# View Allure report
npm run allure:serve
```

### Common Issues

#### 1. Binary Not Found

**Error**: `ENOENT: no such file or directory`

**Solution**:
```bash
# Verify binary exists
ls -lah dist/electron/*/

# Rebuild the binary
npm run pack:win:dir  # or pack:mac, pack:linux
```

#### 2. ChromeDriver Issues

**Error**: `Failed to create session`

**Solution**:
- Ensure ChromeDriver version matches Electron version
- Check `chromedriver` package version in `package.json`
- Electron uses Chromium internally, so versions must align

#### 3. Permission Errors (Linux)

**Error**: `Permission denied`

**Solution**:
```bash
# Make binary executable
chmod +x dist/electron/linux-unpacked/flock-native

# Or rebuild
npm run pack:linux
```

## CI/CD Integration

### Cost Optimization

Based on GitHub Actions pricing:

- **Linux**: Free (unlimited for public repos)
- **Windows**: ~$0.008/minute
- **macOS**: ~$0.08/minute

**Optimization Strategies**:
1. Run Linux tests on every push
2. Run Windows tests on main branch and PRs
3. Run macOS tests on main branch only
4. Cache dependencies to reduce build time

### Parallel Execution

The workflow uses `strategy.fail-fast: false` to ensure all platforms run even if one fails:

```yaml
strategy:
  fail-fast: false
```

## Future Enhancements

### Planned Features

1. **Android Testing** (Phase 4)
   - Cordova/Capacitor builds
   - Appium integration
   - Device farm (BrowserStack/AWS Device Farm)

2. **Test Sharding**
   - Distribute tests across multiple runners
   - Reduce overall execution time

3. **Visual Regression Testing**
   - Percy or Chromatic integration
   - Screenshot comparison across platforms

4. **Performance Benchmarking**
   - Measure startup time
   - Memory usage tracking
   - Compare across platforms

## Resources

- [WebDriverIO Electron Service Docs](https://webdriver.io/docs/wdio-electron-service/)
- [Electron Builder Docs](https://www.electron.build/)
- [GitHub Actions Pricing](https://docs.github.com/en/billing/managing-billing-for-github-actions/about-billing-for-github-actions)
- [Cross-Platform E2E Research](./CROSS_PLATFORM_E2E_RESEARCH.md)

## Support

For questions or issues:
1. Check the [Troubleshooting](#debugging) section
2. Review existing [GitHub Issues](https://github.com/CommunityStream-io/flock/issues)
3. Create a new issue with platform details and logs
