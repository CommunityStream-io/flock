#!/bin/bash

# Local Docker E2E Test Runner
# Uses the same Docker approach as CI but runs locally

set -e

echo "=== LOCAL DOCKER E2E TEST RUNNER ==="
echo "This will run E2E tests using Docker containers locally..."

# Parse command line arguments
SHARD=1
TOTAL_SHARDS=19
BUILD_IMAGE=true
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
        --no-build)
            BUILD_IMAGE=false
            shift
            ;;
        --no-cleanup)
            CLEANUP=false
            shift
            ;;
        --help|-h)
            echo "Local Docker E2E Test Runner"
            echo ""
            echo "Usage: $0 [options]"
            echo ""
            echo "Options:"
            echo "  --shard N           Run specific shard (default: 1)"
            echo "  --total-shards N    Total number of shards (default: 19)"
            echo "  --no-build          Skip Docker image build"
            echo "  --no-cleanup        Skip cleanup after tests"
            echo "  --help, -h          Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0                           # Run shard 1/19"
            echo "  $0 --shard 5                 # Run shard 5/19"
            echo "  $0 --shard 1 --no-build      # Skip image build"
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
    docker-compose -f docker-compose.test.yml down --remove-orphans 2>/dev/null || true
fi

# Build Docker image if requested
if [ "$BUILD_IMAGE" = true ]; then
    echo "🏗️  Building Docker image..."
    docker build -f docker/Dockerfile.test -t e2e-test-local .
    if [ $? -eq 0 ]; then
        echo "✅ Docker image built successfully"
    else
        echo "❌ Docker image build failed"
        exit 1
    fi
fi

# Create directories
echo "📁 Creating directories..."
mkdir -p logs/metrics allure-results

# Run the test
echo "🚀 Running shard ${SHARD}/${TOTAL_SHARDS} in Docker container..."
docker run -it --rm \
  -v "$(pwd)/logs:/app/logs" \
  -v "$(pwd)/allure-results:/app/allure-results" \
  -e CI=true \
  -e HEADLESS=true \
  -e TIMEOUT_TELEMETRY=true \
  -e SHARD=${SHARD} \
  -e TOTAL_SHARDS=${TOTAL_SHARDS} \
  -e NODE_ENV=test \
  e2e-test-local \
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
    echo "✅ Docker test PASSED! Shard ${SHARD} completed successfully"
    echo "📊 Check logs in: logs/"
    echo "📊 Check Allure results in: allure-results/"
else
    echo "❌ Docker test FAILED! Exit code: $exit_code"
    echo "📊 Check logs in: logs/"
fi

echo "=== DOCKER TEST COMPLETE ==="
exit $exit_code
