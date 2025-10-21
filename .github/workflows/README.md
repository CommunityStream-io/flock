# GitHub Actions CI

Simple CI validation for the Bluesky Migration Tool (Electron Desktop App).

## Workflows

### 1. Main CI Workflow (`ci.yml`)

The CI workflow automatically validates your code by running:

1. **Tests** - `npm test` (Angular tests with CLI integration)
2. **Linting** - `npm run lint` (ESLint checks)
3. **Build** - `npm run build` (Angular compilation)
4. **Electron Build** - `npm run electron-build` (Desktop app compilation)

**When It Runs:**
- Push to `main` branch
- Pull requests targeting `main` branch

### 2. Cross-Platform E2E Tests (`e2e-cross-platform.yml`)

Tests the Electron app across Windows, macOS, and Linux platforms.

**When It Runs:**
- Manually triggered via workflow_dispatch
- Push to `main` or `develop` branches (affecting Electron code)

**What It Does:**
- 🪟 **Windows Tests** - Builds and tests on `windows-latest`
- 🍎 **macOS Intel Tests** - Builds and tests on `macos-13`
- 🍏 **macOS ARM Tests** - Builds and tests on `macos-latest` (M1/M2)
- 🐧 **Linux Tests** - Builds and tests on `ubuntu-latest` with Xvfb
- 📊 **Result Aggregation** - Combines results from all platforms

**Manual Trigger:**
1. Go to **Actions** tab
2. Select **Cross-Platform E2E Tests**
3. Click **Run workflow**
4. Choose platforms: `windows,macos,linux` (default: all)

**Test Results:**
- Individual platform test results uploaded as artifacts
- Screenshots on failure
- Unified Allure report for cross-platform analysis

For detailed information, see [Cross-Platform E2E Testing Documentation](../../docs/CROSS_PLATFORM_E2E_TESTING.md).

## How It Works

1. Checks out your code (including CLI submodule)
2. Sets up Node.js 24.5.0
3. Builds CLI extensions (instagram-to-bluesky)
4. Installs Angular dependencies (with caching)
5. Runs all validation steps in parallel
6. Fails if any step fails

## That's It!

Simple, focused, and effective. No complex matrix testing or advanced features - just the essential validation you need to ensure your Electron desktop app builds correctly and your CLI integration works properly.
