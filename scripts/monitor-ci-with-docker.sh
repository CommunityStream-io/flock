#!/bin/bash

# Enhanced CI Monitoring Script with Docker Performance Integration
# Monitors GitHub Actions workflow runs and Docker build performance

set -e

# Configuration
WORKFLOW_NAME="Feathering the Nest"
POLL_INTERVAL=15  # seconds
MAX_WAIT_TIME=1800  # 30 minutes
ARTIFACTS_DIR="logs/ci-artifacts"
PERFORMANCE_DIR="logs/docker-performance"
SKIP_TELEMETRY=true  # Skip telemetry by default until fewer failures
FAIL_FAST=false
MONITOR_DOCKER=true  # Enable Docker performance monitoring
DOCKER_THRESHOLD=90  # Docker build time threshold in seconds

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --skip-telemetry)
            SKIP_TELEMETRY=true
            shift
            ;;
        --enable-telemetry)
            SKIP_TELEMETRY=false
            shift
            ;;
        --skip-docker)
            MONITOR_DOCKER=false
            shift
            ;;
        --enable-docker)
            MONITOR_DOCKER=true
            shift
            ;;
        --docker-threshold)
            DOCKER_THRESHOLD="$2"
            shift 2
            ;;
        --fail-fast)
            FAIL_FAST=true
            shift
            ;;
        -h|--help)
            echo "Usage: $0 [OPTIONS]"
            echo "Options:"
            echo "  --skip-telemetry      Skip telemetry analysis and artifact downloading (default)"
            echo "  --enable-telemetry    Enable telemetry analysis and artifact downloading"
            echo "  --skip-docker         Skip Docker performance monitoring"
            echo "  --enable-docker       Enable Docker performance monitoring (default)"
            echo "  --docker-threshold N  Set Docker build time threshold in seconds (default: 90)"
            echo "  --fail-fast           Exit immediately if Docker build fails"
            echo "  -h, --help           Show this help message"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

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

# Function to check if gh CLI is available
check_gh_cli() {
    if ! command -v gh &> /dev/null; then
        print_status $RED "❌ GitHub CLI (gh) is not installed or not in PATH"
        print_status $YELLOW "Install it from: https://cli.github.com/"
        exit 1
    fi
    
    # Check if authenticated
    if ! gh auth status &> /dev/null; then
        print_status $RED "❌ Not authenticated with GitHub CLI"
        print_status $YELLOW "Run: gh auth login"
        exit 1
    fi
}

# Function to check if Docker is available
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_status $RED "❌ Docker is not installed or not in PATH"
        return 1
    fi
    
    if ! docker info &> /dev/null; then
        print_status $RED "❌ Docker daemon is not running"
        return 1
    fi
    
    return 0
}

# Function to get the latest workflow run
get_latest_run() {
    local run_id=$(gh run list --workflow="$WORKFLOW_NAME" --limit=1 --json databaseId --jq '.[0].databaseId')
    echo $run_id
}

# Function to get run status
get_run_status() {
    local run_id=$1
    gh run view $run_id --json status,conclusion --jq '.status + ":" + (.conclusion // "null")'
}

# Function to get failed jobs
get_failed_jobs() {
    local run_id=$1
    gh run view $run_id --json jobs --jq '.jobs[] | select(.conclusion == "failure") | {id: .databaseId, name: .name}'
}

# Function to check if Docker build failed
check_docker_build_failed() {
    local run_id=$1
    local build_job=$(gh run view $run_id --json jobs --jq '.jobs[] | select(.name == "Build E2E Docker Image") | .conclusion')
    
    if [ "$build_job" = "failure" ]; then
        return 0  # Docker build failed
    else
        return 1  # Docker build not failed (yet)
    fi
}

# Function to check if Docker build is in progress
check_docker_build_in_progress() {
    local run_id=$1
    local build_job=$(gh run view $run_id --json jobs --jq '.jobs[] | select(.name == "Build E2E Docker Image") | .status')
    
    if [ "$build_job" = "in_progress" ]; then
        return 0  # Docker build in progress
    else
        return 1  # Docker build not in progress
    fi
}

# Function to show Docker build progress with layer information
show_docker_build_progress() {
    local run_id=$1
    print_status $PURPLE "🐳 Docker build in progress - monitoring layer timing..."
    
    # Get build job details
    local build_job_id=$(gh run view $run_id --json jobs --jq '.jobs[] | select(.name == "Build E2E Docker Image") | .databaseId')
    
    if [ -n "$build_job_id" ] && [ "$build_job_id" != "null" ]; then
        print_status $BLUE "📊 Build job ID: $build_job_id"
        print_status $BLUE "🔗 View build logs: https://github.com/CommunityStream-io/flock/actions/runs/$run_id"
        
        # Try to get build progress from logs (if available)
        print_status $PURPLE "⏱️  Monitoring build progress..."
        print_status $PURPLE "   - Base image layers (Chrome + ChromeDriver)"
        print_status $PURPLE "   - Dependencies installation"
        print_status $PURPLE "   - Angular build process"
        print_status $PURPLE "   - Runtime image assembly"
    fi
}

# Function to run Docker performance test
run_docker_performance_test() {
    if [ "$MONITOR_DOCKER" = "false" ]; then
        return 0
    fi
    
    print_status $PURPLE "🐳 Running Docker performance test..."
    print_status $PURPLE "📊 This will measure build layers, image loading, and matrix run simulation"
    
    # Check if Docker is available
    if ! check_docker; then
        print_status $YELLOW "⚠️  Docker not available, skipping performance test"
        return 1
    fi
    
    # Run the Docker performance monitoring script
    if [ -f "scripts/monitor-docker-performance.sh" ]; then
        if ./scripts/monitor-docker-performance.sh --threshold $DOCKER_THRESHOLD; then
            print_status $GREEN "✅ Docker performance test completed"
            print_status $PURPLE "📈 Performance metrics saved to logs/docker-performance/"
            return 0
        else
            print_status $RED "❌ Docker performance test failed"
            return 1
        fi
    else
        print_status $YELLOW "⚠️  Docker performance script not found"
        return 1
    fi
}

# Function to download artifacts from a job
download_job_artifacts() {
    local job_id=$1
    local job_name=$2
    
    print_status $BLUE "📥 Downloading artifacts from job: $job_name"
    
    # Create job-specific directory
    local job_dir="$ARTIFACTS_DIR/job-$job_id"
    mkdir -p "$job_dir"
    
    # Download artifacts
    if gh run download $run_id --dir "$job_dir" --job $job_id 2>/dev/null; then
        print_status $GREEN "✅ Downloaded artifacts for job: $job_name"
        
        # List what was downloaded
        if [ -d "$job_dir" ] && [ "$(ls -A "$job_dir" 2>/dev/null)" ]; then
            print_status $BLUE "📁 Artifacts downloaded:"
            find "$job_dir" -type f -name "*.json" | while read file; do
                local size=$(du -h "$file" | cut -f1)
                print_status $BLUE "   - $(basename "$file") ($size)"
            done
        else
            print_status $YELLOW "⚠️  No artifacts found for job: $job_name"
        fi
    else
        print_status $YELLOW "⚠️  No artifacts available for job: $job_name"
    fi
}

# Function to analyze timeout artifacts
analyze_timeout_artifacts() {
    print_status $BLUE "🔍 Analyzing timeout artifacts..."
    
    if [ ! -d "$ARTIFACTS_DIR" ]; then
        print_status $YELLOW "⚠️  No artifacts directory found"
        return
    fi
    
    # Find all timeout telemetry files
    local timeout_files=$(find "$ARTIFACTS_DIR" -name "timeout-telemetry-*.json" -type f 2>/dev/null || true)
    
    if [ -z "$timeout_files" ]; then
        print_status $YELLOW "⚠️  No timeout telemetry files found in artifacts"
        return
    fi
    
    print_status $GREEN "📊 Found timeout telemetry files:"
    echo "$timeout_files" | while read file; do
        local size=$(du -h "$file" | cut -f1)
        print_status $BLUE "   - $(basename "$file") ($size)"
    done
    
    # Copy files to logs/metrics for analysis
    mkdir -p logs/metrics
    echo "$timeout_files" | while read file; do
        cp "$file" logs/metrics/
    done
    
    # Run timeout analysis
    print_status $BLUE "🔍 Running timeout analysis..."
    if command -v npm &> /dev/null; then
        npm run analyze:timeouts:ci || print_status $YELLOW "⚠️  Timeout analysis failed"
    else
        print_status $YELLOW "⚠️  npm not available, skipping analysis"
    fi
}

# Function to monitor workflow
monitor_workflow() {
    local run_id=$1
    local start_time=$(date +%s)
    local docker_test_run=false
    
    print_status $BLUE "🔍 Monitoring workflow run: $run_id"
    print_status $BLUE "⏱️  Polling every ${POLL_INTERVAL}s for up to ${MAX_WAIT_TIME}s"
    print_status $BLUE "📋 Workflow: $WORKFLOW_NAME"
    print_status $BLUE "🔗 View on GitHub: https://github.com/CommunityStream-io/flock/actions/runs/$run_id"
    
    if [ "$MONITOR_DOCKER" = "true" ]; then
        print_status $PURPLE "🐳 Docker performance monitoring: ENABLED (threshold: ${DOCKER_THRESHOLD}s)"
    else
        print_status $YELLOW "🐳 Docker performance monitoring: DISABLED"
    fi
    echo
    
    while true; do
        local current_time=$(date +%s)
        local elapsed=$((current_time - start_time))
        
        if [ $elapsed -gt $MAX_WAIT_TIME ]; then
            print_status $YELLOW "⏰ Maximum wait time reached (${MAX_WAIT_TIME}s)"
            break
        fi
        
        local status=$(get_run_status $run_id)
        local current_status=$(echo $status | cut -d: -f1)
        local conclusion=$(echo $status | cut -d: -f2)
        
        # Check for Docker build failure if fail-fast is enabled
        if [ "$FAIL_FAST" = "true" ]; then
            if check_docker_build_failed $run_id; then
                print_status $RED "❌ Docker build failed! Exiting immediately (--fail-fast enabled)"
                print_status $BLUE "🔗 View build logs: https://github.com/CommunityStream-io/flock/actions/runs/$run_id"
                exit 1
            fi
        fi
        
        # Show Docker build progress when in progress
        if [ "$MONITOR_DOCKER" = "true" ]; then
            if check_docker_build_in_progress $run_id; then
                if [ "$docker_test_run" = "false" ]; then
                    show_docker_build_progress $run_id
                    print_status $PURPLE "🐳 Running performance test during build..."
                    if run_docker_performance_test; then
                        docker_test_run=true
                    fi
                else
                    print_status $PURPLE "🐳 Docker build still in progress..."
                fi
            fi
        fi
        
        case $current_status in
            "completed")
                if [ "$conclusion" = "success" ]; then
                    print_status $GREEN "✅ Workflow completed successfully!"
                    
                    # Run final Docker performance test if not already run
                    if [ "$MONITOR_DOCKER" = "true" ] && [ "$docker_test_run" = "false" ]; then
                        print_status $PURPLE "🐳 Running final Docker performance test..."
                        run_docker_performance_test
                    fi
                    break
                elif [ "$conclusion" = "failure" ]; then
                    print_status $RED "❌ Workflow failed!"
                    handle_failed_workflow $run_id
                    break
                else
                    print_status $YELLOW "⚠️  Workflow completed with status: $conclusion"
                    break
                fi
                ;;
            "in_progress")
                print_status $BLUE "🔄 Workflow in progress... (${elapsed}s elapsed)"
                ;;
            "queued")
                print_status $YELLOW "⏳ Workflow queued... (${elapsed}s elapsed)"
                ;;
            *)
                print_status $YELLOW "❓ Unknown status: $current_status"
                ;;
        esac
        
        sleep $POLL_INTERVAL
    done
}

# Function to handle failed workflow
handle_failed_workflow() {
    local run_id=$1
    
    print_status $RED "🔍 Analyzing failed workflow..."
    
    # Get failed jobs
    local failed_jobs=$(get_failed_jobs $run_id)
    
    if [ -z "$failed_jobs" ]; then
        print_status $YELLOW "⚠️  No failed jobs found"
        return
    fi
    
    print_status $RED "❌ Failed jobs found:"
    echo "$failed_jobs" | jq -r '.name' | while read job_name; do
        print_status $RED "   - $job_name"
    done
    
    if [ "$SKIP_TELEMETRY" = "false" ]; then
        # Download artifacts from failed jobs
        echo "$failed_jobs" | jq -r '.id' | while read job_id; do
            local job_name=$(echo "$failed_jobs" | jq -r --arg id "$job_id" 'select(.id == ($id | tonumber)) | .name')
            download_job_artifacts $job_id "$job_name"
        done
        
        # Analyze timeout artifacts
        analyze_timeout_artifacts
    else
        print_status $YELLOW "⏭️  Skipping telemetry analysis (--skip-telemetry flag set)"
    fi
}

# Function to generate combined report
generate_combined_report() {
    local report_file="logs/ci-docker-report-$(date +%Y%m%d_%H%M%S).md"
    
    print_status $BLUE "📝 Generating combined CI and Docker performance report..."
    
    cat > "$report_file" << EOF
# CI and Docker Performance Report

Generated: $(date)

## CI Workflow Status

- **Workflow**: $WORKFLOW_NAME
- **Run ID**: $(get_latest_run)
- **Status**: $(get_run_status $(get_latest_run))

## Docker Performance

EOF
    
    if [ -f "$PERFORMANCE_DIR/current-metrics.json" ]; then
        local total_time=$(jq -r '.build_times.total' "$PERFORMANCE_DIR/current-metrics.json" 2>/dev/null || echo "N/A")
        local cache_efficiency=$(jq -r '.cache_efficiency.percentage' "$PERFORMANCE_DIR/current-metrics.json" 2>/dev/null || echo "N/A")
        local base_size=$(jq -r '.image_sizes.base_mb' "$PERFORMANCE_DIR/current-metrics.json" 2>/dev/null || echo "N/A")
        local runtime_size=$(jq -r '.image_sizes.runtime_mb' "$PERFORMANCE_DIR/current-metrics.json" 2>/dev/null || echo "N/A")
        local base_load_time=$(jq -r '.image_loading_times.base_load_seconds' "$PERFORMANCE_DIR/current-metrics.json" 2>/dev/null || echo "N/A")
        local runtime_load_time=$(jq -r '.image_loading_times.runtime_load_seconds' "$PERFORMANCE_DIR/current-metrics.json" 2>/dev/null || echo "N/A")
        
        cat >> "$report_file" << EOF
- **Total Build Time**: ${total_time}s
- **Cache Efficiency**: ${cache_efficiency}%
- **Base Image Size**: ${base_size}MB
- **Runtime Image Size**: ${runtime_size}MB
- **Base Load Time**: ${base_load_time}s
- **Runtime Load Time**: ${runtime_load_time}s

### Performance Targets

- **Build Time Target**: <${DOCKER_THRESHOLD}s $([ "$total_time" != "N/A" ] && [ $total_time -lt $DOCKER_THRESHOLD ] && echo "✅ PASSED" || echo "❌ FAILED")
- **Cache Efficiency Target**: >80% $([ "$cache_efficiency" != "N/A" ] && [ $cache_efficiency -ge 80 ] && echo "✅ PASSED" || echo "❌ FAILED")

### Matrix Run Performance

- **Image Loading Time**: $([ "$base_load_time" != "N/A" ] && [ "$runtime_load_time" != "N/A" ] && echo "$((base_load_time + runtime_load_time))s total" || echo "N/A")
- **Base Image Load**: ${base_load_time}s
- **Runtime Image Load**: ${runtime_load_time}s

EOF
    else
        cat >> "$report_file" << EOF
- **Status**: No Docker performance data available

EOF
    fi
    
    cat >> "$report_file" << EOF
## Files

- CI artifacts: \`$ARTIFACTS_DIR/\`
- Docker performance: \`$PERFORMANCE_DIR/\`
- Combined report: \`$report_file\`

## Recommendations

- Monitor both CI and Docker performance regularly
- Set up alerts for performance regressions
- Track trends over time
- Optimize based on performance data
EOF
    
    print_status $GREEN "📄 Combined report generated: $report_file"
}

# Main execution
main() {
    print_status $BLUE "🚀 Enhanced CI Monitoring with Docker Performance"
    print_status $BLUE "================================================="
    
    # Check prerequisites
    check_gh_cli
    
    # Create directories
    mkdir -p "$ARTIFACTS_DIR"
    mkdir -p "$PERFORMANCE_DIR"
    
    # Get the latest run
    local run_id=$(get_latest_run)
    
    if [ -z "$run_id" ] || [ "$run_id" = "null" ]; then
        print_status $RED "❌ No workflow runs found"
        exit 1
    fi
    
    # Monitor the workflow
    monitor_workflow $run_id
    
    # Generate combined report
    generate_combined_report
    
    print_status $GREEN "🏁 Enhanced monitoring complete!"
    
    # Show summary
    if [ -d "$ARTIFACTS_DIR" ] && [ "$(ls -A "$ARTIFACTS_DIR" 2>/dev/null)" ]; then
        print_status $BLUE "📁 CI artifacts downloaded to: $ARTIFACTS_DIR"
    fi
    
    if [ -d "$PERFORMANCE_DIR" ] && [ "$(ls -A "$PERFORMANCE_DIR" 2>/dev/null)" ]; then
        print_status $PURPLE "🐳 Docker performance data in: $PERFORMANCE_DIR"
    fi
}

# Run main function
main "$@"
