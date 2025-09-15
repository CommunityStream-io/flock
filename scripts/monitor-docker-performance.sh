#!/bin/bash

# Docker Build Performance Monitoring Script
# Monitors Docker build performance and integrates with CI/CD pipeline

set -e

# Configuration
POLL_INTERVAL=30  # seconds
MAX_WAIT_TIME=1800  # 30 minutes
PERFORMANCE_DIR="logs/docker-performance"
DOCKER_IMAGES=("flock-e2e-base" "flock-e2e-runtime")
BASELINE_METRICS_FILE="logs/docker-performance/baseline-metrics.json"
CURRENT_METRICS_FILE="logs/docker-performance/current-metrics.json"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --baseline)
            BASELINE_MODE=true
            shift
            ;;
        --compare)
            COMPARE_MODE=true
            shift
            ;;
        --continuous)
            CONTINUOUS_MODE=true
            shift
            ;;
        --threshold)
            THRESHOLD="$2"
            shift 2
            ;;
        -h|--help)
            echo "Usage: $0 [--baseline] [--compare] [--continuous] [--threshold SECONDS]"
            echo "  --baseline      Record baseline performance metrics"
            echo "  --compare       Compare current build with baseline"
            echo "  --continuous    Monitor continuously (for CI/CD)"
            echo "  --threshold     Set performance threshold in seconds (default: 90)"
            echo "  -h, --help      Show this help message"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Set default threshold if not provided
THRESHOLD=${THRESHOLD:-90}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    local color=$1
    local message=$2
    echo -e "${color}[$(date '+%H:%M:%S')] ${message}${NC}"
}

# Function to check if Docker is available
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_status $RED "❌ Docker is not installed or not in PATH"
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        print_status $RED "❌ Docker daemon is not running"
        print_status $YELLOW "Start Docker Desktop or Docker daemon"
        exit 1
    fi
}

# Function to measure build time
measure_build_time() {
    local target=$1
    local tag=$2
    local start_time=$(date +%s)
    
    print_status $BLUE "🔨 Building $target stage..."
    
    if docker build -f Dockerfile.test --target $target -t $tag . > /dev/null 2>&1; then
        local end_time=$(date +%s)
        local duration=$((end_time - start_time))
        echo $duration
    else
        print_status $RED "❌ Build failed for $target"
        return 1
    fi
}

# Function to get image size in MB
get_image_size_mb() {
    local image=$1
    local size_bytes=$(docker images --format "{{.Size}}" $image | tail -n +2 | head -1 | sed 's/[^0-9.]*//g')
    
    # Convert to MB (assuming size is in MB format like "123.4MB")
    if [[ $size_bytes == *"MB" ]]; then
        echo $size_bytes | sed 's/MB//'
    elif [[ $size_bytes == *"GB" ]]; then
        # Convert GB to MB
        local gb=$(echo $size_bytes | sed 's/GB//')
        echo "$(echo "$gb * 1024" | bc -l)"
    else
        echo "0"
    fi
}

# Function to get image size in bytes (for precise comparison)
get_image_size_bytes() {
    local image=$1
    docker images --format "{{.Size}}" $image | tail -n +2 | head -1
}

# Function to run performance test
run_performance_test() {
    local test_id=$(date +%Y%m%d_%H%M%S)
    local results_file="$PERFORMANCE_DIR/test-$test_id.json"
    
    print_status $BLUE "🧪 Running Docker build performance test..."
    print_status $BLUE "📊 Test ID: $test_id"
    
    # Create performance directory
    mkdir -p "$PERFORMANCE_DIR"
    
    # Clean up any existing test images
    for image in "${DOCKER_IMAGES[@]}"; do
        docker rmi $image:test 2>/dev/null || true
    done
    
    # Measure base build time
    print_status $BLUE "🔨 Building base image..."
    local base_start=$(date +%s)
    if ! docker build -f Dockerfile.test --target base -t flock-e2e-base:test . > /dev/null 2>&1; then
        print_status $RED "❌ Base build failed"
        return 1
    fi
    local base_end=$(date +%s)
    local base_time=$((base_end - base_start))
    
    # Measure runtime build time
    print_status $BLUE "🔨 Building runtime image..."
    local runtime_start=$(date +%s)
    if ! docker build -f Dockerfile.test --target runtime -t flock-e2e-runtime:test . > /dev/null 2>&1; then
        print_status $RED "❌ Runtime build failed"
        return 1
    fi
    local runtime_end=$(date +%s)
    local runtime_time=$((runtime_end - runtime_start))
    
    # Calculate total time
    local total_time=$((base_time + runtime_time))
    
    # Get image sizes
    local base_size=$(get_image_size_mb "flock-e2e-base:test")
    local runtime_size=$(get_image_size_mb "flock-e2e-runtime:test")
    
    # Test cache efficiency (rebuild runtime)
    print_status $BLUE "🔄 Testing cache efficiency..."
    docker rmi flock-e2e-runtime:test 2>/dev/null || true
    
    local cache_start=$(date +%s)
    if ! docker build -f Dockerfile.test --target runtime -t flock-e2e-runtime:test . > /dev/null 2>&1; then
        print_status $RED "❌ Cached build failed"
        return 1
    fi
    local cache_end=$(date +%s)
    local cache_time=$((cache_end - cache_start))
    
    # Calculate cache efficiency
    local cache_savings=$((runtime_time - cache_time))
    local cache_efficiency=0
    if [ $runtime_time -gt 0 ]; then
        cache_efficiency=$((cache_time * 100 / runtime_time))
    fi
    
    # Create results JSON
    cat > "$results_file" << EOF
{
    "test_id": "$test_id",
    "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "build_times": {
        "base": $base_time,
        "runtime": $runtime_time,
        "total": $total_time,
        "cached": $cache_time
    },
    "image_sizes": {
        "base_mb": $base_size,
        "runtime_mb": $runtime_size
    },
    "cache_efficiency": {
        "percentage": $cache_efficiency,
        "savings_seconds": $cache_savings
    },
    "performance_targets": {
        "total_time_threshold": $THRESHOLD,
        "cache_efficiency_threshold": 80,
        "total_time_passed": $([ $total_time -lt $THRESHOLD ] && echo "true" || echo "false"),
        "cache_efficiency_passed": $([ $cache_efficiency -ge 80 ] && echo "true" || echo "false")
    }
}
EOF
    
    # Display results
    print_status $GREEN "✅ Performance test completed!"
    print_status $BLUE "📊 Results:"
    print_status $BLUE "   Base build time:     ${base_time}s"
    print_status $BLUE "   Runtime build time:  ${runtime_time}s"
    print_status $BLUE "   Total build time:    ${total_time}s"
    print_status $BLUE "   Cached build time:   ${cache_time}s"
    print_status $BLUE "   Cache efficiency:    ${cache_efficiency}%"
    print_status $BLUE "   Base image size:     ${base_size}MB"
    print_status $BLUE "   Runtime image size:  ${runtime_size}MB"
    
    # Check performance targets
    if [ $total_time -lt $THRESHOLD ]; then
        print_status $GREEN "✅ Build time target met: ${total_time}s < ${THRESHOLD}s"
    else
        print_status $RED "❌ Build time target missed: ${total_time}s >= ${THRESHOLD}s"
    fi
    
    if [ $cache_efficiency -ge 80 ]; then
        print_status $GREEN "✅ Cache efficiency target met: ${cache_efficiency}% >= 80%"
    else
        print_status $RED "❌ Cache efficiency target missed: ${cache_efficiency}% < 80%"
    fi
    
    # Save as current metrics
    cp "$results_file" "$CURRENT_METRICS_FILE"
    
    print_status $BLUE "📁 Results saved to: $results_file"
    
    # Clean up test images
    for image in "${DOCKER_IMAGES[@]}"; do
        docker rmi $image:test 2>/dev/null || true
    done
    
    return 0
}

# Function to record baseline metrics
record_baseline() {
    print_status $BLUE "📊 Recording baseline performance metrics..."
    
    if run_performance_test; then
        cp "$CURRENT_METRICS_FILE" "$BASELINE_METRICS_FILE"
        print_status $GREEN "✅ Baseline metrics recorded: $BASELINE_METRICS_FILE"
    else
        print_status $RED "❌ Failed to record baseline metrics"
        return 1
    fi
}

# Function to compare with baseline
compare_with_baseline() {
    if [ ! -f "$BASELINE_METRICS_FILE" ]; then
        print_status $RED "❌ No baseline metrics found. Run with --baseline first."
        return 1
    fi
    
    print_status $BLUE "📊 Comparing with baseline metrics..."
    
    if ! run_performance_test; then
        print_status $RED "❌ Failed to run performance test"
        return 1
    fi
    
    # Load baseline and current metrics
    local baseline_total=$(jq -r '.build_times.total' "$BASELINE_METRICS_FILE")
    local current_total=$(jq -r '.build_times.total' "$CURRENT_METRICS_FILE")
    local baseline_cache=$(jq -r '.cache_efficiency.percentage' "$BASELINE_METRICS_FILE")
    local current_cache=$(jq -r '.cache_efficiency.percentage' "$CURRENT_METRICS_FILE")
    
    # Calculate differences
    local time_diff=$((current_total - baseline_total))
    local cache_diff=$((current_cache - baseline_cache))
    
    print_status $PURPLE "📈 Performance Comparison:"
    print_status $PURPLE "   Build time change:    ${time_diff}s (${current_total}s vs ${baseline_total}s)"
    print_status $PURPLE "   Cache efficiency:     ${cache_diff}% (${current_cache}% vs ${baseline_cache}%)"
    
    # Determine if performance improved or degraded
    if [ $time_diff -lt 0 ]; then
        print_status $GREEN "✅ Build time improved by $((time_diff * -1))s"
    elif [ $time_diff -gt 0 ]; then
        print_status $RED "❌ Build time degraded by ${time_diff}s"
    else
        print_status $YELLOW "⚠️  Build time unchanged"
    fi
    
    if [ $cache_diff -gt 0 ]; then
        print_status $GREEN "✅ Cache efficiency improved by ${cache_diff}%"
    elif [ $cache_diff -lt 0 ]; then
        print_status $RED "❌ Cache efficiency degraded by $((cache_diff * -1))%"
    else
        print_status $YELLOW "⚠️  Cache efficiency unchanged"
    fi
}

# Function to monitor continuously
monitor_continuously() {
    print_status $BLUE "🔄 Starting continuous Docker performance monitoring..."
    print_status $BLUE "⏱️  Polling every ${POLL_INTERVAL}s for up to ${MAX_WAIT_TIME}s"
    
    local start_time=$(date +%s)
    local test_count=0
    
    while true; do
        local current_time=$(date +%s)
        local elapsed=$((current_time - start_time))
        
        if [ $elapsed -gt $MAX_WAIT_TIME ]; then
            print_status $YELLOW "⏰ Maximum monitoring time reached (${MAX_WAIT_TIME}s)"
            break
        fi
        
        test_count=$((test_count + 1))
        print_status $BLUE "🧪 Running performance test #$test_count..."
        
        if run_performance_test; then
            print_status $GREEN "✅ Test #$test_count completed successfully"
        else
            print_status $RED "❌ Test #$test_count failed"
        fi
        
        print_status $BLUE "⏳ Waiting ${POLL_INTERVAL}s before next test..."
        sleep $POLL_INTERVAL
    done
    
    print_status $GREEN "🏁 Continuous monitoring completed!"
    print_status $BLUE "📊 Total tests run: $test_count"
}

# Function to generate performance report
generate_report() {
    local report_file="$PERFORMANCE_DIR/performance-report-$(date +%Y%m%d_%H%M%S).md"
    
    print_status $BLUE "📝 Generating performance report..."
    
    cat > "$report_file" << EOF
# Docker Build Performance Report

Generated: $(date)

## Test Results

EOF
    
    if [ -f "$CURRENT_METRICS_FILE" ]; then
        local total_time=$(jq -r '.build_times.total' "$CURRENT_METRICS_FILE")
        local cache_efficiency=$(jq -r '.cache_efficiency.percentage' "$CURRENT_METRICS_FILE")
        local base_size=$(jq -r '.image_sizes.base_mb' "$CURRENT_METRICS_FILE")
        local runtime_size=$(jq -r '.image_sizes.runtime_mb' "$CURRENT_METRICS_FILE")
        
        cat >> "$report_file" << EOF
- **Total Build Time**: ${total_time}s
- **Cache Efficiency**: ${cache_efficiency}%
- **Base Image Size**: ${base_size}MB
- **Runtime Image Size**: ${runtime_size}MB

## Performance Targets

- **Build Time Target**: <${THRESHOLD}s $([ $total_time -lt $THRESHOLD ] && echo "✅ PASSED" || echo "❌ FAILED")
- **Cache Efficiency Target**: >80% $([ $cache_efficiency -ge 80 ] && echo "✅ PASSED" || echo "❌ FAILED")

EOF
    fi
    
    cat >> "$report_file" << EOF
## Recommendations

- Monitor build times regularly
- Track image size changes
- Optimize Dockerfile layers for better caching
- Use multi-stage builds efficiently

## Files

- Current metrics: \`$CURRENT_METRICS_FILE\`
- Baseline metrics: \`$BASELINE_METRICS_FILE\`
- All test results: \`$PERFORMANCE_DIR/\`
EOF
    
    print_status $GREEN "📄 Report generated: $report_file"
}

# Main execution
main() {
    print_status $BLUE "🚀 Docker Build Performance Monitor"
    print_status $BLUE "===================================="
    
    # Check prerequisites
    check_docker
    
    # Create performance directory
    mkdir -p "$PERFORMANCE_DIR"
    
    # Handle different modes
    if [ "$BASELINE_MODE" = "true" ]; then
        record_baseline
    elif [ "$COMPARE_MODE" = "true" ]; then
        compare_with_baseline
    elif [ "$CONTINUOUS_MODE" = "true" ]; then
        monitor_continuously
    else
        # Default: run single performance test
        run_performance_test
    fi
    
    # Generate report
    generate_report
    
    print_status $GREEN "🏁 Performance monitoring complete!"
}

# Run main function
main "$@"
