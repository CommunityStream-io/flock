#!/bin/bash

# Docker Container Startup Script for E2E Testing
# Sets up npm authentication and starts the Angular dev server

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

# Check if PACKAGE_TOKEN is set
if [ -z "$PACKAGE_TOKEN" ]; then
    print_status $RED "❌ PACKAGE_TOKEN environment variable is not set"
    exit 1
fi

# Set up npm authentication
print_status $BLUE "🔐 Setting up npm authentication..."
echo "//npm.pkg.github.com/:_authToken=$PACKAGE_TOKEN" > ~/.npmrc
echo "@straiforos:registry=https://npm.pkg.github.com/" >> ~/.npmrc
print_status $GREEN "✅ npm authentication configured"

# Install private packages at runtime
print_status $BLUE "📦 Installing private packages..."
npm install @straiforos/instagramtobluesky@^0.7.5
print_status $GREEN "✅ Private packages installed"

# Start Angular dev server
print_status $BLUE "🚀 Starting Angular dev server..."
npx ng serve flock-mirage --configuration=test --port=4200 --host=0.0.0.0 &
SERVER_PID=$!

# Wait for server to be ready
print_status $YELLOW "⏳ Waiting for server to be ready..."
timeout 60 bash -c 'until curl -f http://localhost:4200; do sleep 2; done'
print_status $GREEN "✅ Server ready!"

# Run E2E tests
print_status $BLUE "🧪 Running E2E tests..."
npx cross-env CI=true HEADLESS=true BASE_URL=http://localhost:4200 SHARDED_TESTS=true TIMEOUT_TELEMETRY=true wdio run wdio.conf.ts --shard=$SHARD/$TOTAL_SHARDS

# Clean up
print_status $BLUE "🧹 Cleaning up..."
kill $SERVER_PID 2>/dev/null || true
# Remove npm authentication file for security
rm -f ~/.npmrc
print_status $GREEN "✅ Startup script completed successfully"
