#!/bin/bash

# Docker Build Performance Testing Script
# Measures build time, image size, and layer cache efficiency

set -e

echo "🐳 Docker Build Performance Testing"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to measure time
measure_time() {
    local start_time=$(date +%s)
    "$@"
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    echo $duration
}

# Function to get image size in MB
get_image_size() {
    docker images --format "table {{.Size}}" "$1" | tail -n +2 | head -1
}

# Function to get image size in bytes
get_image_size_bytes() {
    docker images --format "{{.Size}}" "$1" | tail -n +2 | head -1 | sed 's/[^0-9.]*//g'
}

# Clean up any existing images
print_status "Cleaning up existing images..."
docker rmi flock-e2e-base:test 2>/dev/null || true
docker rmi flock-e2e-runtime:test 2>/dev/null || true

# Test 1: Base image build
print_status "Testing base image build..."
echo "Building base image (Chrome + ChromeDriver)..."
BASE_BUILD_TIME=$(measure_time docker build -f Dockerfile.test --target base -t flock-e2e-base:test .)
print_success "Base image build completed in ${BASE_BUILD_TIME} seconds"

# Test 2: Runtime image build
print_status "Testing runtime image build..."
echo "Building runtime image (Angular app + E2E tests)..."
RUNTIME_BUILD_TIME=$(measure_time docker build -f Dockerfile.test --target runtime -t flock-e2e-runtime:test .)
print_success "Runtime image build completed in ${RUNTIME_BUILD_TIME} seconds"

# Test 3: Total build time
TOTAL_BUILD_TIME=$((BASE_BUILD_TIME + RUNTIME_BUILD_TIME))
print_success "Total build time: ${TOTAL_BUILD_TIME} seconds"

# Test 4: Image sizes
print_status "Analyzing image sizes..."
BASE_SIZE=$(get_image_size "flock-e2e-base:test")
RUNTIME_SIZE=$(get_image_size "flock-e2e-runtime:test")

print_success "Base image size: $BASE_SIZE"
print_success "Runtime image size: $RUNTIME_SIZE"

# Test 5: Layer cache efficiency (rebuild test)
print_status "Testing layer cache efficiency..."
echo "Rebuilding to test cache efficiency..."

# Clean build cache for runtime only
docker rmi flock-e2e-runtime:test 2>/dev/null || true

# Rebuild runtime (should use cached base)
CACHED_BUILD_TIME=$(measure_time docker build -f Dockerfile.test --target runtime -t flock-e2e-runtime:test .)
CACHE_SAVINGS=$((RUNTIME_BUILD_TIME - CACHED_BUILD_TIME))
CACHE_EFFICIENCY=$((CACHED_BUILD_TIME * 100 / RUNTIME_BUILD_TIME))

print_success "Cached build time: ${CACHED_BUILD_TIME} seconds"
print_success "Cache savings: ${CACHE_SAVINGS} seconds"
print_success "Cache efficiency: ${CACHE_EFFICIENCY}%"

# Test 6: Performance targets validation
print_status "Validating performance targets..."

# Target: <1.5 minutes (90 seconds)
if [ $TOTAL_BUILD_TIME -lt 90 ]; then
    print_success "✅ Build time target met: ${TOTAL_BUILD_TIME}s < 90s"
else
    print_warning "⚠️  Build time target missed: ${TOTAL_BUILD_TIME}s >= 90s"
fi

# Target: 80%+ cache efficiency
if [ $CACHE_EFFICIENCY -ge 80 ]; then
    print_success "✅ Cache efficiency target met: ${CACHE_EFFICIENCY}% >= 80%"
else
    print_warning "⚠️  Cache efficiency target missed: ${CACHE_EFFICIENCY}% < 80%"
fi

# Test 7: Functionality test
print_status "Testing basic functionality..."
echo "Starting container to test basic functionality..."

# Start container in background
CONTAINER_ID=$(docker run -d --name flock-test-container flock-e2e-runtime:test sleep 30)

# Wait a moment for container to start
sleep 5

# Check if container is running
if docker ps | grep -q flock-test-container; then
    print_success "✅ Container started successfully"
else
    print_error "❌ Container failed to start"
fi

# Clean up test container
docker rm -f flock-test-container 2>/dev/null || true

# Summary
echo ""
echo "📊 Performance Summary"
echo "====================="
echo "Base build time:     ${BASE_BUILD_TIME}s"
echo "Runtime build time:  ${RUNTIME_BUILD_TIME}s"
echo "Total build time:    ${TOTAL_BUILD_TIME}s"
echo "Cached build time:   ${CACHED_BUILD_TIME}s"
echo "Cache efficiency:    ${CACHE_EFFICIENCY}%"
echo "Base image size:     $BASE_SIZE"
echo "Runtime image size:  $RUNTIME_SIZE"

# Performance recommendations
echo ""
echo "💡 Optimization Recommendations"
echo "==============================="

if [ $TOTAL_BUILD_TIME -ge 90 ]; then
    echo "• Consider further reducing build context size"
    echo "• Optimize RUN commands to reduce layer count"
    echo "• Use multi-stage builds more efficiently"
fi

if [ $CACHE_EFFICIENCY -lt 80 ]; then
    echo "• Improve layer caching by copying package.json first"
    echo "• Separate dependency installation from source code copying"
    echo "• Use .dockerignore to exclude unnecessary files"
fi

echo ""
print_success "Performance testing completed!"

# Clean up test images
print_status "Cleaning up test images..."
docker rmi flock-e2e-base:test 2>/dev/null || true
docker rmi flock-e2e-runtime:test 2>/dev/null || true

print_success "Test cleanup completed!"

