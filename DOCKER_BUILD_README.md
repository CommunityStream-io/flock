# Docker-Based Electron Build

**Purpose**: Avoid Windows file locking issues by building Electron app in an isolated Docker container

---

## Quick Start

```bash
npm run pack:win:docker
```

That's it! The script handles everything automatically.

---

## What It Does

1. ✅ Kills any locked Electron processes on host
2. ✅ Cleans old build artifacts
3. ✅ Builds Docker image with all dependencies
4. ✅ Runs Electron build inside container
5. ✅ Outputs to `dist/electron/` via volume mount
6. ✅ Cleans up Docker containers

---

## Files Created

| File | Purpose |
|------|---------|
| `Dockerfile.electron-build` | Docker image with Node, Wine, and build tools |
| `docker-compose.electron-build.yml` | Container orchestration with volume mounts |
| `scripts/docker-build-electron.sh` | Build automation script |

---

## Requirements

- Docker Desktop (Windows/Mac/Linux)
- Docker must be running

**Check Docker**:
```bash
docker info
```

---

## Benefits

### ✅ No File Locking
Build happens in isolated container - Windows can't lock files

### ✅ Consistent Environment
Same build environment every time, regardless of host OS

### ✅ Clean Builds
Each build starts fresh, avoiding cached dependency issues

### ✅ Cross-Platform
Can build Windows .exe from Linux/Mac using Wine

---

## Build Process

```
Host (Windows)
│
├─ npm run pack:win:docker
│
└─ Docker Container (Linux)
    │
    ├─ Install dependencies
    ├─ Build Angular app
    ├─ Run electron-builder with Wine
    │
    └─ Output to volume
        │
        └─ dist/electron/ (mounted from host)
```

---

## Commands

### Build for Windows (Docker)
```bash
npm run pack:win:docker
```

### Build for Windows (Local - may lock)
```bash
npm run pack:win:dir
```

### Manual Docker Build
```bash
# Build image
docker-compose -f docker-compose.electron-build.yml build

# Run build
docker-compose -f docker-compose.electron-build.yml up

# Clean up
docker-compose -f docker-compose.electron-build.yml down
```

---

## Output

**Success**:
```
dist/electron/
├── win-unpacked/
│   ├── Flock Native.exe           # Main executable
│   ├── resources/
│   │   ├── app.asar               # Packed application
│   │   └── app.asar.unpacked/     # Unpacked CLI & assets
│   │       └── node_modules/
│   │           └── @straiforos/
│   │               └── instagramtobluesky/
│   └── ...
└── builder-effective-config.yaml
```

---

## Troubleshooting

### Docker not running
```bash
# Windows: Start Docker Desktop from Start Menu
# Or check services:
net start com.docker.service
```

### Build fails with Wine errors
Wine is used to build Windows executables on Linux. If you see Wine errors:
```bash
# Clean everything and rebuild
docker-compose -f docker-compose.electron-build.yml down -v
npm run pack:win:docker
```

### Volume mount issues
```bash
# On Windows, ensure Docker has access to the drive
# Docker Desktop → Settings → Resources → File Sharing
# Add: C:\Users\trifo\Documents\flock
```

### Old files still locked
```bash
# Kill all Electron processes manually
taskkill /F /IM "Flock Native.exe"
taskkill /F /IM electron.exe

# Wait a few seconds
sleep 3

# Try build again
npm run pack:win:docker
```

---

## Performance

**First Build**: ~5-10 minutes (downloads Docker image, Wine, dependencies)

**Subsequent Builds**: ~2-3 minutes (uses cached layers)

**Optimization**:
- Node modules cached in Docker volume
- Docker image layers cached
- Angular build artifacts reused

---

## Comparison

| Method | Pros | Cons |
|--------|------|------|
| **Local Build** (`pack:win:dir`) | Fast, direct | File locking issues |
| **Docker Build** (`pack:win:docker`) | No file locking, consistent | Slower first build |

**Recommendation**: Use Docker build to avoid file locking, especially on Windows.

---

## Development Workflow

```bash
# 1. Make code changes
# 2. Build with Docker
npm run pack:win:docker

# 3. Test the build
./run-electron-test.sh

# 4. If issues, check logs
cat logs/electron-test-*.log

# 5. Repeat
```

---

## CI/CD Integration

```yaml
# GitHub Actions example
- name: Build Electron App (Docker)
  run: npm run pack:win:docker
  
- name: Upload Artifact
  uses: actions/upload-artifact@v3
  with:
    name: electron-windows
    path: dist/electron/win-unpacked/
```

---

**Status**: ✅ Ready to use - run `npm run pack:win:docker`

