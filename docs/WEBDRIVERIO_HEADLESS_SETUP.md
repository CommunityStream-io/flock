# WebdriverIO Headless Mode Configuration

This document explains how to use the optional headless mode for WebdriverIO tests in the Flock project.

## Overview

The WebdriverIO configuration has been updated to support optional headless mode. When enabled, Chrome will run without a visible UI, which is ideal for:
- CI/CD pipelines
- Automated testing environments
- Running tests in the background
- Server environments without display

## Configuration

The headless mode is controlled by the `HEADLESS` environment variable in the WebdriverIO configuration files:
- `wdio.conf.ts` (root)
- `test/wdio.conf.ts`

When `HEADLESS=true`, the following Chrome arguments are automatically added:
- `--headless`: Runs Chrome without visible UI
- `--no-sandbox`: Disables Chrome's sandbox (needed for CI environments)
- `--disable-dev-shm-usage`: Prevents shared memory issues in Docker/CI
- `--disable-gpu`: Disables GPU acceleration (recommended for headless)
- `--window-size=1920,1080`: Sets consistent window size for testing

## Available NPM Scripts

### Standard Mode (with visible browser)
```bash
npm run test:e2e          # Run E2E tests with visible Chrome
npm run test:e2e:watch    # Run E2E tests in watch mode with visible Chrome
npm run e2e               # Alias for test:e2e
```

### Headless Mode (no visible browser)
```bash
npm run test:e2e:headless          # Run E2E tests in headless mode
npm run test:e2e:watch:headless    # Run E2E tests in watch mode with headless mode
npm run e2e:headless               # Alias for test:e2e:headless
```

## Environment Variable Control

You can also control headless mode manually by setting the environment variable:

### Windows (Command Prompt)
```cmd
set HEADLESS=true
npm run test:e2e
```

### Windows (PowerShell)
```powershell
$env:HEADLESS="true"
npm run test:e2e
```

### Linux/macOS
```bash
export HEADLESS=true
npm run test:e2e
```

### Cross-platform (using cross-env)
```bash
npx cross-env HEADLESS=true npm run test:e2e
```

## Use Cases

### Development
- Use standard mode (`npm run test:e2e`) to see the browser and debug visually
- Use watch mode (`npm run test:e2e:watch`) for continuous testing during development

### CI/CD Pipelines
- Use headless mode (`npm run test:e2e:headless`) for automated testing
- No display requirements
- Faster execution
- Better resource utilization

### Server Environments
- Use headless mode when running tests on servers without display
- Ideal for Docker containers and cloud environments

## Troubleshooting

### Chrome Crashes in Headless Mode
If Chrome crashes in headless mode, ensure you have the latest ChromeDriver version:
```bash
npm update chromedriver
```

### Memory Issues
If you encounter memory issues in headless mode, the configuration already includes:
- `--disable-dev-shm-usage` to prevent shared memory issues
- `--no-sandbox` for better stability in CI environments

### Performance
Headless mode typically runs faster than standard mode due to:
- No UI rendering overhead
- Reduced memory usage
- Better resource utilization

## Configuration Files

The headless configuration is applied in both:
- `wdio.conf.ts` (root configuration)
- `test/wdio.conf.ts` (test-specific configuration)

Both files are kept in sync to ensure consistent behavior across different test execution contexts.
