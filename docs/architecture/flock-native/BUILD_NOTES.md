# Build Notes for Flock Native

## Local Windows Build Issue

### Symptom
When running `npx electron-builder --win` locally on Windows, you may encounter:
```
ERROR: Cannot create symbolic link : A required privilege is not held by the client
```

### Cause
electron-builder requires symbolic link creation privileges when extracting the winCodeSign tool. This requires either:
1. Administrator privileges
2. Windows Developer Mode enabled

### Workaround Options

#### Option 1: Enable Developer Mode (Recommended for local testing)
1. Open Settings → Update & Security → For Developers
2. Turn on "Developer Mode"
3. Restart your terminal/IDE
4. Try the build again

#### Option 2: Run as Administrator
1. Right-click your terminal/IDE
2. Select "Run as Administrator"
3. Run the build command

#### Option 3: Use GitHub Actions (Recommended for production)
GitHub Actions has proper permissions and will build successfully. This is the primary method for creating releases.

### Production Builds
All production builds are handled by GitHub Actions (`.github/workflows/release.yml`) which runs on GitHub's infrastructure with proper permissions. Local builds are only needed for testing.

**CI/CD Build Strategy:**
- **Windows**: Native `windows-latest` runners (no Wine) for faster application startup
- **macOS**: Native `macos-latest` runners for universal binaries
- **Linux**: Native `ubuntu-latest` runners for AppImage, DEB, RPM packages

The Windows builds no longer use Wine-based containers, resulting in better runtime performance and faster application startup times.

## Build Commands

### Full Production Build (all platforms)
```bash
npm run pack:all
```

### Platform-Specific Builds
```bash
npm run pack:win     # Windows
npm run pack:mac     # macOS  
npm run pack:linux   # Linux
```

### Directory Build (faster, no installers)
```bash
npm run pack:win:dir
```

## Testing the Built App

After building, the packaged app will be in:
- **Windows**: `dist/electron/win-unpacked/Flock Native.exe`
- **macOS**: `dist/electron/mac/Flock Native.app`
- **Linux**: `dist/electron/linux-unpacked/flock-native`

Installers will be in `dist/electron/`:
- **Windows**: `Flock Native Setup 0.0.0.exe`, `Flock Native 0.0.0.exe` (portable)
- **macOS**: `Flock Native-0.0.0-universal.dmg`
- **Linux**: `Flock-Native-0.0.0.AppImage`, `flock-native_0.0.0_amd64.deb`, etc.

