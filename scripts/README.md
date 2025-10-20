# Scripts Directory

This directory contains utility scripts for building and releasing Flock Native.

## Available Scripts

### `upload-arm64-build.sh`

Uploads locally built ARM64 macOS packages to a GitHub release.

**Usage:**
```bash
# Upload to latest release (uses version from package.json)
./scripts/upload-arm64-build.sh

# Upload to specific release
./scripts/upload-arm64-build.sh v0.6.7
```

**Prerequisites:**
- GitHub CLI (`gh`) installed and authenticated
- ARM64 build artifacts in `dist/electron/`
- Target release must exist

**What it does:**
1. Checks for ARM64 build artifacts (DMG and ZIP)
2. Verifies the target release exists
3. Optionally replaces existing ARM64 assets
4. Uploads the new ARM64 build to the release

**Example workflow:**
```bash
# 1. Build ARM64 version locally
npm run pack:mac:arm

# 2. Upload to release
./scripts/upload-arm64-build.sh v0.6.7

# 3. Verify upload
gh release view v0.6.7
```

## Build Strategy

See [BUILD_STRATEGY.md](../docs/BUILD_STRATEGY.md) for detailed information about our build approach, including why ARM64 builds must be done locally rather than in Docker containers.