#!/bin/bash
# Script to build and push the electron-windows-base Docker image

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
DOCKER_USERNAME="${DOCKER_USERNAME:-}"
IMAGE_NAME="electron-windows-base"
TAG="${TAG:-latest}"
FULL_IMAGE_NAME="${DOCKER_USERNAME}/${IMAGE_NAME}:${TAG}"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Build Electron Windows Base Image${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker Desktop.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker is running${NC}"

# Check for Docker username
if [ -z "$DOCKER_USERNAME" ]; then
    echo -e "${RED}❌ DOCKER_USERNAME environment variable not set${NC}"
    echo -e "${YELLOW}   Set your Docker Hub username:${NC}"
    echo -e "${YELLOW}   export DOCKER_USERNAME=your_username${NC}"
    echo -e "${YELLOW}   OR${NC}"
    echo -e "${YELLOW}   DOCKER_USERNAME=your_username ./docker/build-base-image.sh${NC}"
    echo ""
    exit 1
fi

echo -e "${GREEN}✅ Docker username: ${DOCKER_USERNAME}${NC}"
echo -e "${GREEN}✅ Image name: ${FULL_IMAGE_NAME}${NC}"
echo ""

# Build the base image
echo -e "${BLUE}🐳 Building base image...${NC}"
echo -e "${YELLOW}   This may take several minutes...${NC}"
docker build -f docker/Dockerfile.electron-windows-base -t "${FULL_IMAGE_NAME}" .

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Base image built successfully${NC}"
else
    echo -e "${RED}❌ Base image build failed${NC}"
    exit 1
fi

# Test the image
echo ""
echo -e "${BLUE}🧪 Testing the base image...${NC}"
docker run --rm "${FULL_IMAGE_NAME}" wine --version
docker run --rm "${FULL_IMAGE_NAME}" node --version
docker run --rm "${FULL_IMAGE_NAME}" npm --version

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Base image test passed${NC}"
else
    echo -e "${RED}❌ Base image test failed${NC}"
    exit 1
fi

# Ask if user wants to push to Docker Hub
echo ""
echo -e "${YELLOW}📤 Do you want to push this image to Docker Hub? (y/N)${NC}"
read -r response
if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    echo ""
    echo -e "${BLUE}📤 Pushing to Docker Hub...${NC}"
    docker push "${FULL_IMAGE_NAME}"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Image pushed successfully${NC}"
        echo ""
        echo -e "${GREEN}🎉 Base image is now available at:${NC}"
        echo -e "${GREEN}   docker pull ${FULL_IMAGE_NAME}${NC}"
        echo ""
        echo -e "${BLUE}📝 Usage in other projects:${NC}"
        echo -e "${BLUE}   FROM ${FULL_IMAGE_NAME}${NC}"
        echo -e "${BLUE}   # Add your project-specific steps here${NC}"
    else
        echo -e "${RED}❌ Push failed${NC}"
        echo -e "${YELLOW}   Make sure you're logged in: docker login${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}⏭️  Skipping push to Docker Hub${NC}"
    echo ""
    echo -e "${BLUE}📝 To push later:${NC}"
    echo -e "${BLUE}   docker push ${FULL_IMAGE_NAME}${NC}"
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  ✅ Base Image Build Complete${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${GREEN}📁 Local image: ${FULL_IMAGE_NAME}${NC}"
echo -e "${GREEN}📦 Size: $(docker images ${FULL_IMAGE_NAME} --format "table {{.Size}}" | tail -n 1)${NC}"
echo ""
echo -e "${BLUE}🚀 Next steps:${NC}"
echo -e "${BLUE}   1. Update your project's Dockerfile to use this base image${NC}"
echo -e "${BLUE}   2. Test the updated Dockerfile${NC}"
echo -e "${BLUE}   3. Push to Docker Hub if needed${NC}"
