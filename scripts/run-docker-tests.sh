#!/bin/bash

# Docker-based E2E Test Runner
# Uses pre-installed ChromeDriver to eliminate download issues

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    local color=$1
    local message=$2
    echo -e "${color}[$(date '+%H:%M:%S')] ${message}${NC}"
}

# Default values
TOTAL_SHARDS=3
SHARD=1
BUILD_IMAGE=true
CLEANUP=true
TRACK_PERFORMANCE=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --shard)
            SHARD="$2"
            shift 2
            ;;
        --total-shards)
            TOTAL_SHARDS="$2"
            shift 2
            ;;
        --no-build)
            BUILD_IMAGE=false
            shift
            ;;
        --no-cleanup)
            CLEANUP=false
            shift
            ;;
        --track-performance)
            TRACK_PERFORMANCE=true
            shift
            ;;
        --help|-h)
            echo "Docker-based E2E Test Runner"
            echo ""
            echo "Usage: $0 [options]"
            echo ""
            echo "Options:"
            echo "  --shard N           Run specific shard (default: 1)"
            echo "  --total-shards N    Total number of shards (default: 3)"
            echo "  --no-build          Skip Docker image build"
            echo "  --no-cleanup        Skip cleanup after tests"
            echo "  --track-performance Enable performance tracking"
            echo "  --help, -h          Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0                           # Run shard 1/3 with full build"
            echo "  $0 --shard 2 --no-build     # Run shard 2, skip image build"
            echo "  $0 --track-performance      # Run with performance tracking"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

print_status $BLUE "=== DOCKER-BASED E2E TEST RUNNER ==="
print_status $BLUE "Shard: ${SHARD}/${TOTAL_SHARDS}"
print_status $BLUE "Build Image: ${BUILD_IMAGE}"
print_status $BLUE "Track Performance: ${TRACK_PERFORMANCE}"

# Clean up any existing containers
if [ "$CLEANUP" = true ]; then
    print_status $YELLOW "🧹 Cleaning up existing containers..."
    docker-compose down --remove-orphans 2>/dev/null || true
fi

# Build Docker image if requested
if [ "$BUILD_IMAGE" = true ]; then
    print_status $BLUE "🏗️  Building Docker image with pre-installed ChromeDriver..."
    if [ -z "$PACKAGE_TOKEN" ]; then
        print_status $RED "❌ PACKAGE_TOKEN environment variable is required for private packages"
        exit 1
    fi
    docker build --build-arg PACKAGE_TOKEN="$PACKAGE_TOKEN" -f docker/Dockerfile.test -t flock-e2e-docker:latest .
    if [ $? -eq 0 ]; then
        print_status $GREEN "✅ Docker image built successfully"
    else
        print_status $RED "❌ Docker image build failed"
        exit 1
    fi
fi

# Create directories
print_status $BLUE "📁 Creating directories..."
mkdir -p logs/servers logs/shards logs/exits allure-results

# Performance tracking
if [ "$TRACK_PERFORMANCE" = true ]; then
    START_TIME=$(date +%s)
    print_status $YELLOW "⏱️  Performance tracking enabled"
fi

# Run the test in Docker container
print_status $BLUE "🚀 Running shard ${SHARD}/${TOTAL_SHARDS} in Docker container..."
print_status $YELLOW "Using pre-installed ChromeDriver to eliminate download issues"

docker run -it --rm \
  -v "$(pwd)/logs:/app/logs" \
  -v "$(pwd)/allure-results:/app/allure-results" \
  -e CI=true \
  -e HEADLESS=true \
  -e TIMEOUT_TELEMETRY=true \
  -e SHARD=${SHARD} \
  -e TOTAL_SHARDS=${TOTAL_SHARDS} \
  -e NODE_ENV=test \
  -e PACKAGE_TOKEN=${PACKAGE_TOKEN} \
  flock-e2e-docker:latest \
  sh -c "
    echo 'Starting Angular dev server in background...' &&
    npx ng serve flock-mirage --configuration=test --port=4200 --host=0.0.0.0 &
    SERVER_PID=\$! &&
    echo 'Waiting for server to be ready...' &&
    timeout 60 sh -c 'until curl -f http://localhost:4200; do sleep 2; done' &&
    echo 'Server ready! Running tests with pre-installed ChromeDriver...' &&
    npx cross-env CI=true HEADLESS=true BASE_URL=http://localhost:4200 SHARDED_TESTS=true TIMEOUT_TELEMETRY=true wdio run wdio.docker.conf.ts --shard=${SHARD}/${TOTAL_SHARDS} &&
    echo 'Tests completed! Stopping server...' &&
    kill \$SERVER_PID 2>/dev/null || true
  "

exit_code=$?

# Performance tracking
if [ "$TRACK_PERFORMANCE" = true ]; then
    END_TIME=$(date +%s)
    DURATION=$((END_TIME - START_TIME))
    print_status $YELLOW "⏱️  Total execution time: ${DURATION} seconds"
fi

if [ $exit_code -eq 0 ]; then
    print_status $GREEN "✅ Docker test PASSED! Shard ${SHARD} completed successfully"
    print_status $GREEN "📊 Check logs in: logs/"
    print_status $GREEN "📊 Check Allure results in: allure-results/"
else
    print_status $RED "❌ Docker test FAILED! Exit code: $exit_code"
    print_status $RED "📊 Check logs in: logs/"
fi

print_status $BLUE "=== DOCKER TEST COMPLETE ==="
exit $exit_code
