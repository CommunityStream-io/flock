# GitHub Actions CI

Simple CI validation for the Bluesky Migration Tool (Electron Desktop App).

## What It Does

The CI workflow automatically validates your code by running:

1. **Tests** - `npm test` (Angular tests with CLI integration)
2. **Linting** - `npm run lint` (ESLint checks)
3. **Build** - `npm run build` (Angular compilation)
4. **Electron Build** - `npm run electron-build` (Desktop app compilation)

## When It Runs

- Push to `main` branch
- Pull requests targeting `main` branch

## How It Works

1. Checks out your code (including CLI submodule)
2. Sets up Node.js 24.5.0
3. Builds CLI extensions (instagram-to-bluesky)
4. Installs Angular dependencies (with caching)
5. Runs all validation steps in parallel
6. Fails if any step fails

## That's It!

Simple, focused, and effective. No complex matrix testing or advanced features - just the essential validation you need to ensure your Electron desktop app builds correctly and your CLI integration works properly.
