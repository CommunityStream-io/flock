# E2E Testing Support Files

This directory contains support files for E2E testing configuration:

- **`tsconfig.json`** - E2E-specific TypeScript configuration for the test directory
- **`types.d.ts`** - Global type declarations for WebdriverIO globals and extensions

## Main E2E Configuration

The main WebdriverIO configuration is located at the root level:
- **`../wdio.conf.ts`** - Main WebdriverIO configuration
- **`../tsconfig.e2e.json`** - E2E TypeScript configuration

## Usage

All E2E tests should be run from the root directory using the npm scripts:

```bash
npm run test:e2e
npm run test:e2e:headless
npm run test:e2e:watch
```