#!/bin/bash

# Docker E2E Testing Script
# This script provides commands for local Docker-based E2E testing

set -e

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

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
    print_success "Docker is running"
}

# Function to build the E2E Docker image
build_image() {
    print_status "Building E2E Docker image..."
    docker build -f Dockerfile.e2e -t flock-e2e:latest .
    print_success "Docker image built successfully"
}

# Function to run the application in Docker
run_app() {
    print_status "Starting application in Docker..."
    docker run -d \
        --name flock-e2e-app \
        -p 4200:4200 \
        -e NODE_ENV=production \
        -e CI=true \
        -e HEADLESS=true \
        flock-e2e:latest
    
    print_status "Waiting for application to be ready..."
    timeout 60 bash -c 'until curl -f http://localhost:4200 > /dev/null 2>&1; do sleep 2; done'
    print_success "Application is ready at http://localhost:4200"
}

# Function to run E2E tests
run_tests() {
    local shard=${1:-1}
    local total_shards=${2:-17}
    
    print_status "Running E2E tests (shard $shard/$total_shards)..."
    
    # Create allure-results directory if it doesn't exist
    mkdir -p allure-results
    
    docker run --rm \
        --network host \
        -e CI=true \
        -e HEADLESS=true \
        -e BASE_URL=http://localhost:4200 \
        -v "$(pwd)/allure-results:/app/allure-results" \
        flock-e2e:latest \
        wdio run wdio.conf.ts --shard=$shard/$total_shards
    
    print_success "E2E tests completed"
}

# Function to run all tests with Docker Compose
run_compose() {
    print_status "Running E2E tests with Docker Compose..."
    docker-compose -f docker-compose.e2e.yml up --build --abort-on-container-exit
    print_success "Docker Compose E2E tests completed"
}

# Function to generate Allure report
generate_report() {
    print_status "Generating Allure report..."
    
    if [ ! -d "allure-results" ]; then
        print_error "No allure-results directory found. Run tests first."
        exit 1
    fi
    
    # Install Allure if not already installed
    if ! command -v allure &> /dev/null; then
        print_status "Installing Allure command line..."
        npm install -g allure-commandline
    fi
    
    allure generate allure-results --clean -o allure-report
    print_success "Allure report generated in allure-report/"
}

# Function to open Allure report
open_report() {
    if [ ! -d "allure-report" ]; then
        print_error "No allure-report directory found. Generate report first."
        exit 1
    fi
    
    print_status "Opening Allure report..."
    if command -v allure &> /dev/null; then
        allure open allure-report
    else
        print_warning "Allure command line not found. Opening report directory..."
        if command -v open &> /dev/null; then
            open allure-report/index.html
        elif command -v xdg-open &> /dev/null; then
            xdg-open allure-report/index.html
        else
            print_status "Please open allure-report/index.html in your browser"
        fi
    fi
}

# Function to cleanup Docker containers
cleanup() {
    print_status "Cleaning up Docker containers..."
    docker stop flock-e2e-app 2>/dev/null || true
    docker rm flock-e2e-app 2>/dev/null || true
    docker-compose -f docker-compose.e2e.yml down 2>/dev/null || true
    print_success "Cleanup completed"
}

# Function to show help
show_help() {
    echo "Docker E2E Testing Script"
    echo ""
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  build              Build the E2E Docker image"
    echo "  app                Run the application in Docker"
    echo "  test [shard] [total]  Run E2E tests (default: shard 1/17)"
    echo "  compose            Run all tests with Docker Compose"
    echo "  report             Generate Allure report"
    echo "  open               Open Allure report in browser"
    echo "  cleanup            Clean up Docker containers"
    echo "  full               Build, run app, test, and generate report"
    echo "  help               Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 build                    # Build Docker image"
    echo "  $0 app                      # Start application"
    echo "  $0 test 5 17               # Run shard 5 of 17"
    echo "  $0 full                    # Complete workflow"
}

# Main script logic
case "${1:-help}" in
    "build")
        check_docker
        build_image
        ;;
    "app")
        check_docker
        run_app
        ;;
    "test")
        check_docker
        run_tests "$2" "$3"
        ;;
    "compose")
        check_docker
        run_compose
        ;;
    "report")
        generate_report
        ;;
    "open")
        open_report
        ;;
    "cleanup")
        cleanup
        ;;
    "full")
        check_docker
        build_image
        run_app
        run_tests
        generate_report
        open_report
        ;;
    "help"|*)
        show_help
        ;;
esac
