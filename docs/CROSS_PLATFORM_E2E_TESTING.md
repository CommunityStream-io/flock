# Cross-Platform E2E Testing

This document describes the cross-platform End-to-End (E2E) testing infrastructure for Flock Native Electron application.

## Overview

Flock Native supports three major desktop platforms:
- **Windows** (Phase 1) - `.exe` portable executable
- **macOS** (Phase 2) - Intel x64 and Apple Silicon ARM64
- **Linux** (Phase 3) - AppImage, `.deb`, and `.rpm` packages

The cross-platform E2E test suite validates that the Electron application works correctly on all supported platforms.

## Test Configurations

### Platform-Specific Configurations

Each platform has its own WebdriverIO configuration file:

1. **`wdio.electron.windows.conf.ts`** - Windows-specific configuration
   - App path: `dist/electron/win-unpacked/Flock Native.exe`
   - Platform tag: `@os:windows`

2. **`wdio.electron.macos.conf.ts`** - macOS-specific configuration
   - App path (Intel): `dist/electron/mac/Flock Native.app/Contents/MacOS/Flock Native`
   - App path (ARM): `dist/electron/mac-arm64/Flock Native.app/Contents/MacOS/Flock Native`
   - Platform tag: `@os:macos`
   - Auto-detects architecture (x64 vs arm64)

3. **`wdio.electron.linux.conf.ts`** - Linux-specific configuration
   - App path: `dist/electron/linux-unpacked/flock-native`
   - Platform tag: `@os:linux`

4. **`wdio.electron.conf.ts`** - Generic cross-platform configuration
   - Auto-detects platform and selects appropriate app path
   - Useful for local development

### Tag-Based Platform Filtering

Tests can be tagged to run on specific platforms:

```gherkin
@os:windows
Scenario: Windows-specific test
  # This test only runs on Windows

@os:macos
Scenario: macOS-specific test
  # This test only runs on macOS

@os:linux
Scenario: Linux-specific test
  # This test only runs on Linux

# No @os tag = runs on all platforms
Scenario: Cross-platform test
  # This test runs on Windows, macOS, and Linux
```

## NPM Scripts

### Local Development

Run tests on your current platform:

```bash
# Windows
npm run e2e:electron:windows

# macOS (auto-detects Intel vs ARM)
npm run e2e:electron:macos

# macOS Intel specifically
npm run e2e:electron:macos:intel

# macOS ARM specifically
npm run e2e:electron:macos:arm

# Linux
npm run e2e:electron:linux

# Auto-detect platform
npm run e2e:electron
```

### CI/CD

CI-optimized scripts with environment flags:

```bash
# Windows CI
npm run e2e:ci:electron:windows

# macOS CI
npm run e2e:ci:electron:macos

# Linux CI
npm run e2e:ci:electron:linux

# Legacy (Windows)
npm run e2e:ci:electron
```

## GitHub Actions Workflow

The cross-platform E2E test workflow is defined in `.github/workflows/e2e-cross-platform.yml`.

### Manual Trigger

You can manually trigger the workflow and select which platforms to test:

1. Go to **Actions** tab in GitHub
2. Select **Cross-Platform E2E Tests** workflow
3. Click **Run workflow**
4. Choose platforms (comma-separated): `windows,macos,linux`

### Automatic Trigger

The workflow automatically runs on:
- Pushes to `main` or `develop` branches
- Changes to Electron-related files:
  - `projects/flock-native/**`
  - `features/electron/**`
  - `wdio.electron*.conf.ts`
  - `electron-builder-*.json`

### Workflow Jobs

1. **Test Windows** (`runs-on: windows-latest`)
   - Builds Windows portable `.exe`
   - Runs Windows E2E tests
   - Uploads test results and screenshots

2. **Test macOS Intel** (`runs-on: macos-13`)
   - Builds macOS x64 `.dmg` and `.zip`
   - Runs macOS E2E tests on Intel
   - Uploads test results and screenshots

3. **Test macOS ARM** (`runs-on: macos-latest`)
   - Builds macOS ARM64 `.dmg` and `.zip`
   - Runs macOS E2E tests on Apple Silicon
   - Uploads test results and screenshots

4. **Test Linux** (`runs-on: ubuntu-latest`)
   - Sets up Xvfb virtual display
   - Builds Linux `.AppImage`, `.deb`, `.rpm`
   - Runs Linux E2E tests
   - Uploads test results and screenshots

5. **Aggregate Results**
   - Collects test results from all platforms
   - Generates unified Allure report
   - Creates cross-platform test summary

## Platform-Specific Considerations

### Windows
- Uses `Flock Native.exe` executable
- No special display setup needed
- PowerShell used for verification scripts

### macOS
- Uses `.app` bundle structure
- Separate builds for Intel (x64) and Apple Silicon (arm64)
- App binary path: `Flock Native.app/Contents/MacOS/Flock Native`
- Auto-detects architecture using `os.arch()`

### Linux
- Uses unpacked binary `flock-native`
- Requires Xvfb virtual display in CI
- Additional dependencies: `libgtk-3-0`, `libnotify-dev`, etc.
- Binary must be made executable (`chmod +x`)
- Additional args: `--no-sandbox` for CI environments

## Test Organization

Tests are organized in the `features/` directory:

```
features/
├── core/           # Core tests (run on all platforms)
│   ├── auth/
│   ├── config/
│   └── upload/
├── electron/       # Electron-specific tests
│   ├── ipc/
│   ├── upload/
│   └── window/
└── web/           # Web-only tests (not run on Electron)
```

## Environment Variables

- `PLATFORM=electron` - Enable Electron platform mode
- `CI=true` - CI environment flag
- `DEBUG_TESTS=true` - Enable verbose logging
- `TEST_TAGS` - Override tag expression (e.g., `@smoke`)
- `ELECTRON_BUILD_DIR` - Override build directory path
- `ELECTRON_APP_NAME` - Override app binary name

## Debugging

### Local Debugging

1. Build the app for your platform:
   ```bash
   npm run pack:win:dir      # Windows
   npm run pack:mac:intel    # macOS Intel
   npm run pack:mac:arm      # macOS ARM
   npm run pack:linux        # Linux
   ```

2. Run tests with debug logging:
   ```bash
   DEBUG_TESTS=true npm run e2e:electron:windows
   DEBUG_TESTS=true npm run e2e:electron:macos
   DEBUG_TESTS=true npm run e2e:electron:linux
   ```

### CI Debugging

Check workflow artifacts:
- Test results: `allure-results-{platform}-{run_number}`
- Screenshots: `screenshots-{platform}-{run_number}`
- Allure report: `allure-report-cross-platform-{run_number}`

## Future Enhancements

### Phase 4: Android (Planned)

Future support for Android platform testing:
- React Native or Capacitor-based mobile app
- Android Emulator or physical device testing
- Platform tag: `@os:android`
- Build outputs: `.apk` or `.aab`

### Potential Tools

- **Sauce Labs** - Considered but deemed too complex for current needs
- **BrowserStack** - Alternative cloud testing platform
- **Appium** - For mobile platform testing (Android/iOS)

## Troubleshooting

### Common Issues

1. **App binary not found**
   - Ensure the build step completed successfully
   - Check the build directory exists
   - Verify the app name matches the configuration

2. **Display issues on Linux**
   - Xvfb must be running: `Xvfb :99 -screen 0 1920x1080x24 &`
   - Set `DISPLAY=:99.0` environment variable

3. **macOS architecture mismatch**
   - Ensure sharp is installed for correct architecture
   - Run `npm run sharp:mac:intel` or `npm run sharp:mac:arm`

4. **Permission denied on Linux**
   - Make the binary executable: `chmod +x dist/electron/linux-unpacked/flock-native`

## References

- [WebdriverIO Electron Service](https://www.npmjs.com/package/wdio-electron-service)
- [Electron Builder](https://www.electron.build/)
- [Cucumber.js](https://cucumber.io/docs/cucumber/)
- [Allure Report](https://docs.qameta.io/allure/)
