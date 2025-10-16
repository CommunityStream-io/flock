# Cross-Platform E2E Testing - Quick Start Guide v2

## 🚀 Implementation Complete!

The WebDriverIO Electron service has been configured for cross-platform testing. This guide shows you how to use it.

## ✅ What's Been Set Up

### 1. **Platform-Specific Configurations**

- ✅ `wdio.electron.windows.conf.ts` - Windows (.exe) testing
- ✅ `wdio.electron.macos.conf.ts` - macOS (.app) testing
- ✅ `wdio.electron.linux.conf.ts` - Linux (AppImage/deb/rpm) testing

### 2. **NPM Scripts**

```bash
# Windows
npm run e2e:electron:windows        # Test existing build
npm run e2e:electron:windows:build  # Build & test

# macOS
npm run e2e:electron:macos          # Test existing build
npm run e2e:electron:macos:build    # Build & test

# Linux
npm run e2e:electron:linux          # Test existing build
npm run e2e:electron:linux:build    # Build & test
```

### 3. **GitHub Actions Workflow**

- ✅ `.github/workflows/e2e-cross-platform.yml`
- Runs on Windows, macOS, and Linux runners
- Aggregates results into unified Allure report

## 🎯 Quick Start

### Option 1: Run All Platforms (CI)

```bash
# Push to GitHub - workflow runs automatically
git push origin your-branch
```

The workflow will:
1. Build native apps for Windows, macOS, and Linux
2. Run E2E tests on each platform
3. Generate cross-platform Allure report
4. Display results summary in GitHub Actions

### Option 2: Run Locally (Single Platform)

#### Windows

```bash
# Build and test
npm run e2e:electron:windows:build

# View results
npm run allure:serve
```

#### macOS

```bash
# Build and test
npm run e2e:electron:macos:build

# View results
npm run allure:serve
```

#### Linux

```bash
# Build and test
npm run e2e:electron:linux:build

# View results
npm run allure:serve
```

## 📋 Configuration Example

Here's how the Electron service is configured for each platform:

### Windows Configuration

```typescript
capabilities: [
  {
    browserName: "electron",
    "wdio:electronServiceOptions": {
      appBinaryPath: "./dist/electron/win-unpacked/Flock Native.exe",
      appArgs: ["--disable-dev-shm-usage"],
    },
  },
]
```

### macOS Configuration

```typescript
capabilities: [
  {
    browserName: "electron",
    "wdio:electronServiceOptions": {
      appBinaryPath: "./dist/electron/mac/Flock Native.app/Contents/MacOS/Flock Native",
      appArgs: ["--disable-dev-shm-usage"],
    },
  },
]
```

### Linux Configuration

```typescript
capabilities: [
  {
    browserName: "electron",
    "wdio:electronServiceOptions": {
      appBinaryPath: "./dist/electron/linux-unpacked/flock-native",
      appArgs: [
        "--disable-dev-shm-usage",
        "--no-sandbox", // Required for CI
      ],
    },
  },
]
```

## 🏷️ Using Platform Tags

Tag your feature files to control where tests run:

```gherkin
# Runs on all platforms
@core @electron
Feature: Basic window functionality

# Windows-only
@electron @os:windows
Scenario: Test Windows native file dialog

# macOS-only
@electron @os:macos
Scenario: Test macOS menu bar integration

# Linux-only
@electron @os:linux
Scenario: Test Linux system tray
```

## 🔧 Environment Variables

Customize test execution with environment variables:

```bash
# Custom build directory
ELECTRON_BUILD_DIR=custom/path npm run e2e:electron:windows

# Custom binary path
ELECTRON_BINARY_PATH=/path/to/app.exe npm run e2e:electron:windows

# Run specific tests
TEST_TAGS='@smoke and @electron' npm run e2e:electron:windows

# Debug mode (non-headless)
HEADLESS=false npm run e2e:electron:windows
```

## 📊 Viewing Results

### Local

```bash
# Serve Allure report
npm run allure:serve

# Or open static report
npm run allure:generate
npm run allure:open
```

### GitHub Actions

1. Go to Actions tab
2. Select "Cross-Platform E2E Tests" workflow
3. Click on latest run
4. View summary showing:
   - ✅ Windows: Passed
   - ✅ macOS: Passed
   - ✅ Linux: Passed
5. Download artifacts for detailed reports

## 🐛 Troubleshooting

### Binary Not Found

```bash
# Windows
ls dist/electron/win-unpacked/

# macOS
ls dist/electron/mac/

# Linux
ls dist/electron/linux-unpacked/
```

If missing, rebuild:
```bash
npm run pack:win:dir   # Windows
npm run pack:mac       # macOS
npm run pack:linux     # Linux
```

### ChromeDriver Version Mismatch

Update chromedriver to match Electron version:

```bash
npm install chromedriver@latest --save-dev
```

### Permission Denied (Linux)

```bash
chmod +x dist/electron/linux-unpacked/flock-native
```

## 📚 Next Steps

1. **Add Platform-Specific Tests**
   - Create features in `features/electron/`
   - Tag with appropriate `@os:` tags

2. **Optimize CI Pipeline**
   - Enable/disable platforms via workflow inputs
   - Add test sharding for faster execution

3. **Enhance Reporting**
   - Add screenshots on failure (already configured)
   - Add video recording for debugging

## 🔗 Related Documentation

- [Full Implementation Guide](./CROSS_PLATFORM_E2E_IMPLEMENTATION.md)
- [Cross-Platform Research](./CROSS_PLATFORM_E2E_RESEARCH.md)
- [WebDriverIO Electron Service](https://webdriver.io/docs/wdio-electron-service/)

## 💡 Key Differences from Web Tests

| Aspect | Web Tests | Electron Tests |
|--------|-----------|---------------|
| **Runner** | Chrome browser | Native Electron app |
| **Base URL** | `http://localhost:4200` | `app:///` |
| **Service** | None (browser) | `wdio-electron-service` |
| **Binary** | N/A | Platform-specific path |
| **Build Step** | `ng serve` | `electron-builder` |

## ✨ What You Get

- ✅ **Windows Testing**: Portable .exe builds
- ✅ **macOS Testing**: Universal .app bundles (Intel + Apple Silicon)
- ✅ **Linux Testing**: AppImage, deb, and rpm packages
- ✅ **Unified Reporting**: Combined Allure reports
- ✅ **CI Integration**: Automated testing on all platforms
- ✅ **Local Testing**: Easy development workflow

## 🎉 Start Testing!

```bash
# Quick test on your current platform
npm run e2e:electron:windows:build  # Windows
npm run e2e:electron:macos:build    # macOS
npm run e2e:electron:linux:build    # Linux
```

Happy testing! 🚀
