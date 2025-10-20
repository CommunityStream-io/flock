# Self-Hosted Runner & Build Strategy

## Overview

This document explains our build strategy for Flock Native, particularly focusing on ARM64 builds and why we use a self-hosted runner.

## Build Architecture

### ✅ **Local ARM64 Builds** (Recommended)
- **Command**: `npm run pack:mac:arm`
- **Platform**: Native macOS on Apple Silicon (M1/M2/M3)
- **Result**: Proper ARM64 binaries, correct app bundles
- **Status**: ✅ Working perfectly

### ❌ **Docker ARM64 Builds** (Not Supported)
- **Command**: `docker run ... npm run pack:mac:arm`
- **Platform**: Linux container with macOS toolchain
- **Result**: Corrupted app bundles, missing macOS frameworks
- **Status**: ❌ Will not work - Docker cannot build proper macOS apps

## Why Docker Doesn't Work for macOS

1. **Missing macOS SDK**: Docker containers don't have access to macOS frameworks
2. **Architecture Mismatch**: Linux containers can't create proper macOS app bundles
3. **File Permissions**: Containerized builds corrupt macOS app structure
4. **Framework Dependencies**: macOS apps require native macOS libraries

## Current Build Strategy

| Platform | Build Method | Runner | Status |
|----------|-------------|--------|---------|
| **Windows** | Docker + Wine | GitHub Hosted | ✅ Working |
| **macOS Intel** | Native | GitHub Hosted (`macos-15-intel`) | ✅ Working |
| **macOS ARM64** | Native | Self-Hosted (`M3-Mac-ARM64`) | ✅ Working |
| **Linux** | Native | GitHub Hosted (`ubuntu-latest`) | ✅ Working |

## Self-Hosted Runner Setup

### Runner Configuration
- **Name**: `M3-Mac-ARM64`
- **Labels**: `self-hosted`, `arm64`, `local`
- **Location**: `/Users/stephentraiforos/dev/flock/.github/runner/`
- **Status**: Online and processing jobs

### Node.js Setup
The runner automatically switches to Node.js 20.19.5 for Angular compatibility:
```bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use 20.19.5
```

## Manual ARM64 Build Process

Since ARM64 builds require native macOS hardware, we use a hybrid approach:

1. **Automated**: Intel Mac, Windows, Linux builds via GitHub Actions
2. **Manual**: ARM64 builds via local script + upload to release

### Upload Script Usage

```bash
# Build locally
npm run pack:mac:arm

# Upload to latest release
./scripts/upload-arm64-build.sh

# Upload to specific release
./scripts/upload-arm64-build.sh v0.6.7
```

## Benefits of This Approach

- **Reliable ARM64 Builds**: Native compilation on actual Apple Silicon
- **Faster Builds**: Local hardware vs cloud runners
- **Cost Effective**: No GitHub Actions minutes for ARM builds
- **Full Control**: Complete control over build environment
- **Proper App Bundles**: No corruption from containerized builds

## Troubleshooting

### "App is Damaged" Warning
This is **not** a build issue - it's macOS Gatekeeper protecting users from unsigned apps.

**Solutions**:
1. **User Workaround**: Right-click → "Open" (instead of double-clicking)
2. **Terminal Fix**: `sudo xattr -rd com.apple.quarantine "/path/to/Flock Native.app"`
3. **Proper Fix**: Code signing with Apple Developer certificate

### Build Failures
- **Node.js Version**: Ensure Node 20+ is used (Angular requirement)
- **Dependencies**: Run `npm ci` before building
- **Permissions**: Ensure write access to `dist/electron/` directory

## Future Improvements

1. **Code Signing**: Implement Apple Developer certificate for distribution
2. **Notarization**: Add Apple notarization for seamless installation
3. **Automation**: Consider GitHub-hosted ARM64 runners when available
4. **CI Integration**: Automate the upload process further
