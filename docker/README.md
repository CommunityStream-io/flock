# Electron Docker Build Images

This directory contains Docker configurations for building Electron applications.

> **Note:** As of 2025, the Windows builds in CI/CD use native Windows runners instead of Wine-based Linux containers for better performance and faster application startup. The Wine-based setup is maintained for local development on Linux/macOS if needed.

## Files

- `Dockerfile.electron-windows-base` - Base image with Wine, Node.js, and all dependencies
- `Dockerfile.electron-build` - Project-specific Dockerfile that uses the base image
- `docker-compose.electron-build.yml` - Docker Compose configuration for building
- `build-base-image.sh` - Script to build and push the base image to Docker Hub

## Base Image Features

The `electron-windows-base` image includes:

- **Node.js 20** - Latest LTS version
- **Wine** - Windows compatibility layer for Linux
- **Wine32/Wine64** - Both 32-bit and 64-bit Wine support
- **Mono** - .NET runtime for Windows applications
- **Native dependencies** - Python, make, g++, libvips-dev for native modules
- **Build tools** - fakeroot, dpkg, rpm for packaging
- **xvfb** - Virtual display for headless operation
- **cabextract** - For extracting Windows CAB files

## Building the Base Image

1. **Set your Docker Hub username**:
   ```bash
   export DOCKER_USERNAME=your_username
   ```

2. **Build and optionally push the base image**:
   ```bash
   ./docker/build-base-image.sh
   ```

3. **The script will**:
   - Build the base image
   - Test Wine, Node.js, and npm
   - Ask if you want to push to Docker Hub
   - Provide usage instructions

## Using the Base Image

Once built and pushed, other projects can use this base image:

```dockerfile
FROM straiforos/electron-windows-base:latest

# Add your project-specific steps here
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Build Windows app with Wine
RUN xvfb-run npx electron-builder --win --publish never
```

## Benefits

- **Faster builds** - Base image is pre-built with all dependencies
- **Consistent environment** - Same Wine setup across projects
- **Reusable** - Share the base image across multiple Electron projects
- **Smaller project images** - Only add project-specific code
- **Version control** - Tag different versions of the base image

## Environment Variables

The base image sets these environment variables:

- `WINEARCH=win64` - Use 64-bit Wine
- `WINEPREFIX=/root/.wine` - Wine prefix location
- `NODE_ENV=production` - Node.js environment
- `CI=true` - CI environment flag

## Troubleshooting

### Wine not found
If you get `wine64: not found`, make sure the base image was built correctly:
```bash
docker run --rm your_username/electron-windows-base wine --version
```

### Sharp module issues
The base image includes `libvips-dev` and build tools for native modules like `sharp`.

### Permission issues
Make sure Docker has permission to access the build context and output directories.

## Updating the Base Image

To update the base image with new dependencies:

1. Modify `Dockerfile.electron-windows-base`
2. Rebuild with a new tag:
   ```bash
   TAG=v2.0.0 ./docker/build-base-image.sh
   ```
3. Update projects to use the new tag:
   ```dockerfile
   FROM straiforos/electron-windows-base:v2.0.0
   ```

## CI/CD Integration

### Current Setup (Recommended)

- **Windows builds**: Native `windows-latest` runners on GitHub Actions
- **macOS builds**: Native `macos-latest` runners on GitHub Actions  
- **Linux builds**: Native `ubuntu-latest` runners on GitHub Actions

### Legacy Wine-based Setup (Local Development)

The Wine-based Docker images can still be used for local development:

- **GitHub Actions** - Use `ubuntu-latest` runner with Wine container
- **GitLab CI** - Use `docker` executor
- **Jenkins** - Use Docker pipeline
- **Azure DevOps** - Use Docker tasks

For local development, use:
```bash
npm run pack:win:docker
```

This uses the Wine-based Docker setup locally, while CI/CD uses native Windows runners.

## License

This base image is provided as-is for building Electron Windows applications.
