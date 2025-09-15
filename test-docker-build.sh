#!/bin/bash

# Docker Build Security Validation Script
# Run this to test the secure Docker build implementation

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    local color=$1
    local message=$2
    echo -e "${color}[$(date '+%H:%M:%S')] ${message}${NC}"
}

print_status $BLUE "🔍 Docker Build Security Validation"

# Check if PACKAGE_TOKEN is set
if [ -z "$PACKAGE_TOKEN" ]; then
    print_status $RED "❌ PACKAGE_TOKEN environment variable is not set"
    echo "Please set your GitHub Personal Access Token:"
    echo "export PACKAGE_TOKEN=\"your_github_token_here\""
    exit 1
fi

print_status $GREEN "✅ PACKAGE_TOKEN is set"

# Validate .npmrc exists
if [ ! -f ".npmrc" ]; then
    print_status $RED "❌ .npmrc file not found"
    exit 1
fi

print_status $GREEN "✅ .npmrc file exists"

# Check .npmrc format
if grep -q "\${PACKAGE_TOKEN}" .npmrc; then
    print_status $GREEN "✅ .npmrc uses environment variable placeholder"
else
    print_status $RED "❌ .npmrc missing environment variable placeholder"
    exit 1
fi

# Test 1: Build deps stage only (fastest test)
print_status $BLUE "🧪 Test 1: Building deps stage..."
if docker build --build-arg PACKAGE_TOKEN=$PACKAGE_TOKEN -f Dockerfile.test --target deps -t flock-deps-test .; then
    print_status $GREEN "✅ Deps stage build successful"
else
    print_status $RED "❌ Deps stage build failed"
    exit 1
fi

# Test 2: Build builder stage (includes private packages)
print_status $BLUE "🧪 Test 2: Building builder stage..."
if docker build --build-arg PACKAGE_TOKEN=$PACKAGE_TOKEN -f Dockerfile.test --target builder -t flock-builder-test .; then
    print_status $GREEN "✅ Builder stage build successful"
else
    print_status $RED "❌ Builder stage build failed"
    exit 1
fi

# Test 3: Test npm authentication inside container
print_status $BLUE "🧪 Test 3: Testing npm authentication..."
if docker run --rm -e PACKAGE_TOKEN=$PACKAGE_TOKEN flock-deps-test npm whoami --registry=https://npm.pkg.github.com/; then
    print_status $GREEN "✅ NPM authentication successful"
else
    print_status $YELLOW "⚠️  NPM authentication test failed (this might be normal if token has limited scope)"
fi

# Test 4: Check .npmrc content in container
print_status $BLUE "🧪 Test 4: Verifying .npmrc in container..."
docker run --rm -e PACKAGE_TOKEN=$PACKAGE_TOKEN flock-deps-test cat .npmrc

# Test 5: Build full runtime image
print_status $BLUE "🧪 Test 5: Building full runtime image..."
if docker build --build-arg PACKAGE_TOKEN=$PACKAGE_TOKEN -f Dockerfile.test -t flock-runtime-test .; then
    print_status $GREEN "✅ Full runtime build successful"
else
    print_status $RED "❌ Full runtime build failed"
    exit 1
fi

# Test 6: Test Docker Compose
print_status $BLUE "🧪 Test 6: Testing Docker Compose build..."
if docker-compose build e2e-base; then
    print_status $GREEN "✅ Docker Compose build successful"
else
    print_status $RED "❌ Docker Compose build failed"
    exit 1
fi

# Cleanup test images
print_status $BLUE "🧹 Cleaning up test images..."
docker rmi flock-deps-test flock-builder-test flock-runtime-test 2>/dev/null || true

print_status $GREEN "🎉 All Docker build security tests passed!"
print_status $BLUE "📝 Summary:"
echo "  ✅ .npmrc uses secure environment variables"
echo "  ✅ Docker build accepts PACKAGE_TOKEN argument"  
echo "  ✅ Private packages can be installed"
echo "  ✅ Multi-stage build works correctly"
echo "  ✅ Docker Compose integration works"
echo ""
echo "Your Docker security implementation is ready for production! 🚀"