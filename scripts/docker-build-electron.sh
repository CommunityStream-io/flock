#!/bin/bash
# Docker-based Electron build script
# Avoids Windows file locking issues by building in a container

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Flock Electron Docker Build${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker Desktop.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker is running${NC}"
echo ""

# Check for PACKAGE_TOKEN environment variable
if [ -z "$PACKAGE_TOKEN" ]; then
    echo -e "${RED}❌ PACKAGE_TOKEN environment variable not set${NC}"
    echo -e "${YELLOW}   This is required to download @straiforos/instagramtobluesky from GitHub Packages${NC}"
    echo ""
    echo -e "${BLUE}To fix:${NC}"
    echo -e "  export PACKAGE_TOKEN=your_github_token"
    echo -e "  OR"
    echo -e "  PACKAGE_TOKEN=your_token npm run pack:win:docker"
    echo ""
    exit 1
fi

echo -e "${GREEN}✅ PACKAGE_TOKEN is set${NC}"
echo ""

# Kill any running Electron processes on host
echo -e "${YELLOW}🔪 Killing any locked Electron processes on host...${NC}"
taskkill //F //IM "Flock Native.exe" 2>nul || true
taskkill //F //IM "electron.exe" 2>nul || true
sleep 2

# Clean old dist directory if it exists
if [ -d "dist/electron" ]; then
    echo -e "${YELLOW}🧹 Cleaning old build artifacts...${NC}"
    rm -rf dist/electron/* || true
fi

echo ""
echo -e "${BLUE}🐳 Building Docker image...${NC}"
docker-compose -f docker/docker-compose.electron-build.yml build

echo ""
echo -e "${BLUE}🔨 Running Electron build in Docker container...${NC}"
echo -e "${BLUE}   This may take a few minutes...${NC}"
echo ""

# Run the build
docker-compose -f docker/docker-compose.electron-build.yml up --abort-on-container-exit

# Check if build succeeded
if [ -f "dist/electron/win-unpacked/Flock Native.exe" ]; then
    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}  ✅ Build Successful!${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    echo -e "${GREEN}📁 Output: dist/electron/win-unpacked/Flock Native.exe${NC}"
    echo ""
    
    # Show file size
    FILE_SIZE=$(du -h "dist/electron/win-unpacked/Flock Native.exe" | cut -f1)
    echo -e "${GREEN}📊 Size: ${FILE_SIZE}${NC}"
    
    # Check for unpacked CLI
    if [ -d "dist/electron/win-unpacked/resources/app.asar.unpacked" ]; then
        echo -e "${GREEN}✅ CLI package unpacked correctly${NC}"
    else
        echo -e "${YELLOW}⚠️  Warning: app.asar.unpacked not found${NC}"
    fi
    
    echo ""
    echo -e "${BLUE}🚀 To run the app:${NC}"
    echo -e "   ./scripts/run-electron-test.sh"
    echo -e "   OR"
    echo -e '   "dist/electron/win-unpacked/Flock Native.exe"'
    echo ""
    
    # Cleanup
    echo -e "${BLUE}🧹 Cleaning up Docker containers...${NC}"
    docker-compose -f docker/docker-compose.electron-build.yml down
    
    exit 0
else
    echo ""
    echo -e "${RED}========================================${NC}"
    echo -e "${RED}  ❌ Build Failed${NC}"
    echo -e "${RED}========================================${NC}"
    echo ""
    echo -e "${RED}Check the Docker logs above for errors${NC}"
    echo ""
    
    # Cleanup
    docker-compose -f docker/docker-compose.electron-build.yml down
    
    exit 1
fi

