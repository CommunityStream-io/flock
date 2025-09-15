#!/bin/bash

# CI Timeout Monitoring Script
# Monitors GitHub Actions workflow runs and downloads artifacts from failed jobs

set -e

# Configuration
WORKFLOW_NAME="Feathering the Nest"
POLL_INTERVAL=15  # seconds
MAX_WAIT_TIME=1800  # 30 minutes
ARTIFACTS_DIR="logs/ci-artifacts"
SKIP_TELEMETRY=false
FAIL_FAST=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --skip-telemetry)
            SKIP_TELEMETRY=true
            shift
            ;;
        --fail-fast)
            FAIL_FAST=true
            shift
            ;;
        -h|--help)
            echo "Usage: $0 [--skip-telemetry] [--fail-fast]"
            echo "  --skip-telemetry    Skip telemetry analysis and artifact downloading"
            echo "  --fail-fast         Exit immediately if Docker build fails"
            echo "  -h, --help         Show this help message"
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
    
    print_status $BLUE "🔍 Monitoring workflow run: $run_id"
    print_status $BLUE "⏱️  Polling every ${POLL_INTERVAL}s for up to ${MAX_WAIT_TIME}s"
    print_status $BLUE "📋 Workflow: $WORKFLOW_NAME"
    print_status $BLUE "🔗 View on GitHub: https://github.com/CommunityStream-io/flock/actions/runs/$run_id"
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
        
        case $current_status in
            "completed")
                if [ "$conclusion" = "success" ]; then
                    print_status $GREEN "✅ Workflow completed successfully!"
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

# Main execution
main() {
    print_status $BLUE "🚀 Starting CI Timeout Monitoring"
    print_status $BLUE "=================================="
    
    # Check prerequisites
    check_gh_cli
    
    # Create artifacts directory
    mkdir -p "$ARTIFACTS_DIR"
    
    # Get the latest run
    local run_id=$(get_latest_run)
    
    if [ -z "$run_id" ] || [ "$run_id" = "null" ]; then
        print_status $RED "❌ No workflow runs found"
        exit 1
    fi
    
    # Monitor the workflow
    monitor_workflow $run_id
    
    print_status $GREEN "🏁 Monitoring complete!"
    
    # Show summary
    if [ -d "$ARTIFACTS_DIR" ] && [ "$(ls -A "$ARTIFACTS_DIR" 2>/dev/null)" ]; then
        print_status $BLUE "📁 Artifacts downloaded to: $ARTIFACTS_DIR"
        print_status $BLUE "🔍 Run timeout analysis with: npm run analyze:timeouts:ci"
    fi
}

# Run main function
main "$@"
