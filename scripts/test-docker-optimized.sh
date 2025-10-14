#!/bin/bash

# Optimized Docker E2E Test Runner
# Uses multi-stage build with base image caching

set -e

echo "=== OPTIMIZED DOCKER E2E TEST RUNNER ==="
echo "This will build and test using optimized multi-stage Docker approach..."

# Parse command line arguments
SHARD=1
TOTAL_SHARDS=19
BUILD_BASE=true
BUILD_APP=true
CLEANUP=true

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
        --no-build-base)
            BUILD_BASE=false
            shift
            ;;
        --no-build-app)
            BUILD_APP=false
            shift
            ;;
        --no-cleanup)
            CLEANUP=false
            shift
            ;;
        --help|-h)
            echo "Optimized Docker E2E Test Runner"
            echo ""
            echo "Usage: $0 [options]"
            echo ""
            echo "Options:"
            echo "  --shard N           Run specific shard (default: 1)"
            echo "  --total-shards N    Total number of shards (default: 19)"
            echo "  --no-build-base     Skip base image build"
            echo "  --no-build-app      Skip app image build"
            echo "  --no-cleanup        Skip cleanup after tests"
            echo "  --help, -h          Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0                           # Run shard 1/19 with full build"
            echo "  $0 --shard 5 --no-build-base # Run shard 5, skip base build"
            echo "  $0 --no-build-app            # Skip app build, use existing"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Clean up any existing containers
if [ "$CLEANUP" = true ]; then
    echo "🧹 Cleaning up existing containers..."
    docker-compose down --remove-orphans 2>/dev/null || true
fi

# Build base image if requested
if [ "$BUILD_BASE" = true ]; then
    echo "🏗️  Building base image with Chrome and ChromeDriver..."
    docker build -f docker/Dockerfile.test --target base -t flock-e2e-base:latest .
    if [ $? -eq 0 ]; then
        echo "✅ Base image built successfully"
    else
        echo "❌ Base image build failed"
        exit 1
    fi
fi

# Build app image if requested
if [ "$BUILD_APP" = true ]; then
    echo "🏗️  Building app image with Angular app..."
    docker build -f docker/Dockerfile.test --target runtime -t flock-e2e-app:latest .
    if [ $? -eq 0 ]; then
        echo "✅ App image built successfully"
    else
        echo "❌ App image build failed"
        exit 1
    fi
fi

# Create directories
echo "📁 Creating directories..."
mkdir -p logs/metrics allure-results

# Run the test
echo "🚀 Running shard ${SHARD}/${TOTAL_SHARDS} in optimized Docker container..."
docker run -it --rm \
  -v "$(pwd)/logs:/app/logs" \
  -v "$(pwd)/allure-results:/app/allure-results" \
  -e CI=true \
  -e HEADLESS=true \
  -e TIMEOUT_TELEMETRY=true \
  -e SHARD=${SHARD} \
  -e TOTAL_SHARDS=${TOTAL_SHARDS} \
  -e NODE_ENV=test \
  flock-e2e-app:latest \
  sh -c "
    echo 'Starting Angular dev server in background...' &&
    npx ng serve flock-mirage --configuration=test --port=4200 --host=0.0.0.0 &
    SERVER_PID=\$! &&
    echo 'Waiting for server to be ready...' &&
    timeout 60 bash -c 'until curl -f http://localhost:4200; do sleep 2; done' &&
    echo 'Server ready! Running tests...' &&
    npx cross-env CI=true HEADLESS=true BASE_URL=http://localhost:4200 SHARDED_TESTS=true TIMEOUT_TELEMETRY=true wdio run wdio.conf.ts --shard=${SHARD}/${TOTAL_SHARDS} &&
    echo 'Tests completed! Stopping server...' &&
    kill \$SERVER_PID 2>/dev/null || true
  "

exit_code=$?

if [ $exit_code -eq 0 ]; then
    echo "✅ Optimized Docker test PASSED! Shard ${SHARD} completed successfully"
    echo "📊 Check logs in: logs/"
    echo "📊 Check Allure results in: allure-results/"
else
    echo "❌ Optimized Docker test FAILED! Exit code: $exit_code"
    echo "📊 Check logs in: logs/"
fi

echo "=== OPTIMIZED DOCKER TEST COMPLETE ==="
exit $exit_code
