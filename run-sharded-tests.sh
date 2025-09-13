#!/bin/bash

# Sharded E2E Test Runner
# Mimics CI workflow with separate log files for each shard

# Set environment variable for sharded tests to reduce logging
export SHARDED_TESTS=true
export DEBUG_TESTS=false

# Parse command line arguments
AUTO_SERVE_ALLURE=false
SKIP_ALLURE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --serve-allure)
            AUTO_SERVE_ALLURE=true
            shift
            ;;
        --skip-allure)
            SKIP_ALLURE=true
            shift
            ;;
        --help|-h)
            echo "Sharded E2E Test Runner with Allure Integration"
            echo ""
            echo "Usage: $0 [options]"
            echo ""
            echo "Options:"
            echo "  --serve-allure    Automatically serve Allure report after completion"
            echo "  --skip-allure     Skip Allure report generation and serving"
            echo "  --help, -h        Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0                # Run tests with interactive Allure options"
            echo "  $0 --serve-allure # Run tests and automatically serve report"
            echo "  $0 --skip-allure  # Run tests without Allure reports"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

echo "=== SHARDED E2E TEST RUNNER ==="
echo "Starting sharded test execution..."

# Create organized log directories and clean up old logs
mkdir -p logs/servers logs/shards logs/exits
echo "Cleaning up old logs..."
rm -f logs/servers/* logs/shards/* logs/exits/*

# Create Allure directories only if not skipping
if [ "$SKIP_ALLURE" = false ]; then
    mkdir -p allure-results allure-reports
    echo "Cleaning up old Allure results..."
    rm -rf allure-results/* allure-reports/*
fi

# Function to start a server for a specific shard
start_shard_server() {
    local shard_num=$1
    local port=$((4200 + shard_num))
    local log_file="logs/servers/server-${shard_num}.log"
    
    echo "Starting Angular dev server for shard ${shard_num} on port ${port}..."
    npx ng serve flock-mirage --configuration=test --port=${port} --host=0.0.0.0 > "${log_file}" 2>&1 &
    local server_pid=$!
    echo "Server for shard ${shard_num} started with PID: ${server_pid}"
    echo "${server_pid}" > "logs/servers/server-${shard_num}.pid"
    
    # Wait for server to be ready
    echo "Waiting for shard ${shard_num} server to be ready..."
    local max_attempts=30
    local attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        if curl -s http://localhost:${port} > /dev/null 2>&1; then
            echo "Server for shard ${shard_num} is ready on port ${port}!"
            return 0
        fi
        sleep 2
        ((attempt++))
        echo "Attempt ${attempt}/${max_attempts}: Shard ${shard_num} server not ready yet..."
    done
    
    echo "ERROR: Server for shard ${shard_num} failed to start after ${max_attempts} attempts"
    return 1
}

# Function to stop a server for a specific shard
stop_shard_server() {
    local shard_num=$1
    if [ -f "logs/servers/server-${shard_num}.pid" ]; then
        local server_pid=$(cat logs/servers/server-${shard_num}.pid)
        echo "Stopping server for shard ${shard_num} (PID: ${server_pid})..."
        kill $server_pid 2>/dev/null || true
        rm -f logs/servers/server-${shard_num}.pid
    fi
}

# Function to stop all shard servers
stop_all_servers() {
    local total_shards=$1
    for i in $(seq 1 $total_shards); do
        stop_shard_server $i
    done
}

# Function to run a single shard
run_shard() {
    local shard_num=$1
    local total_shards=$2
    local port=$((4200 + shard_num))
    local log_file="logs/shards/shard-${shard_num}.log"
    local timing_file="logs/shards/shard-${shard_num}.timing"
    local exit_file="logs/exits/shard-${shard_num}.exit"
    
    # Record start time
    local start_time=$(date +%s)
    echo "Starting shard ${shard_num}/${total_shards} on port ${port} - logging to ${log_file}"
    echo "Shard ${shard_num} started at: $(date)" > "${timing_file}"
    
    # Start the server for this shard first
    if ! start_shard_server $shard_num; then
        echo "Failed to start server for shard ${shard_num}"
        local end_time=$(date +%s)
        local duration=$((end_time - start_time))
        echo "Shard ${shard_num} failed after ${duration}s (server startup failed)" >> "${timing_file}"
        echo "1" > "${exit_file}"
        return 1
    fi
    
    # Run the shard with increased timeouts and log to file
    # Update the baseUrl to use the shard-specific port
    # Redirect browser logs to separate file to reduce clutter
    npx cross-env CI=true HEADLESS=true BASE_URL=http://localhost:${port} SHARDED_TESTS=true DEBUG_TESTS=false wdio run wdio.conf.ts --shard=${shard_num}/${total_shards} > "${log_file}" 2> "logs/shards/shard-${shard_num}.browser.log"
    
    local exit_code=$?
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    echo "Shard ${shard_num} completed with exit code: ${exit_code} (duration: ${duration}s)"
    echo "Shard ${shard_num} completed at: $(date)" >> "${timing_file}"
    echo "Shard ${shard_num} total duration: ${duration}s" >> "${timing_file}"
    echo "${exit_code}" > "${exit_file}"
    
    # Generate Allure report for this shard (similar to CI pipeline) - only if not skipping
    if [ "$SKIP_ALLURE" = false ]; then
        echo "Generating Allure report for shard ${shard_num}..."
        if command -v allure &> /dev/null; then
            # Ensure allure-results directory exists for this shard
            mkdir -p "allure-results/shard-${shard_num}"
            
            # Copy any existing allure results to shard-specific directory
            if [ -d "allure-results" ] && [ "$(ls -A allure-results 2>/dev/null | grep -v "shard-" | head -1)" ]; then
                cp -r allure-results/* "allure-results/shard-${shard_num}/" 2>/dev/null || true
            fi
            
            # Generate report for this shard
            allure generate "allure-results/shard-${shard_num}" -o "allure-reports/shard-${shard_num}" --clean 2>/dev/null || echo "Warning: Failed to generate Allure report for shard ${shard_num}"
        else
            echo "Warning: Allure command not found. Install with: npm install -g allure-commandline"
        fi
    fi
    
    return $exit_code
}


# Function to combine Allure results from all shards (mimics CI e2e-report job)
combine_allure_results() {
    local total_shards=$1
    echo "=== COMBINING ALLURE RESULTS ==="
    
    # Create combined results directory
    mkdir -p allure-results-combined
    
    # Copy results from each shard
    local shards_with_results=0
    for i in $(seq 1 $total_shards); do
        if [ -d "allure-results/shard-${i}" ] && [ "$(ls -A allure-results/shard-${i} 2>/dev/null)" ]; then
            echo "Copying results from shard ${i}..."
            cp -r allure-results/shard-${i}/* allure-results-combined/ 2>/dev/null || true
            ((shards_with_results++))
        fi
    done
    
    # Create fallback if no results found (similar to CI pipeline)
    if [ $shards_with_results -eq 0 ] || [ ! "$(ls -A allure-results-combined 2>/dev/null)" ]; then
        echo "No Allure results found, creating fallback..."
        mkdir -p allure-results-combined
        cat > allure-results-combined/fallback-result.json << 'EOF'
{
    "name": "No test results available",
    "status": "skipped",
    "start": 0,
    "stop": 0,
    "uuid": "fallback-result"
}
EOF
    fi
    
    echo "Combined results from ${shards_with_results} shards into allure-results-combined/"
}

# Function to generate final Allure report and serve it locally
serve_allure_report() {
    echo "=== GENERATING FINAL ALLURE REPORT ==="
    
    if ! command -v allure &> /dev/null; then
        echo "❌ Allure command not found. Install with: npm install -g allure-commandline"
        echo "📋 To install Allure:"
        echo "   1. Install Java 8+: https://adoptopenjdk.net/"
        echo "   2. Run: npm install -g allure-commandline"
        return 1
    fi
    
    # Generate the combined report
    echo "Generating combined Allure report..."
    allure generate allure-results-combined -o allure-report-combined --clean
    
    if [ $? -eq 0 ]; then
        echo "✅ Combined Allure report generated successfully!"
        echo "📊 Report location: allure-report-combined/"
        
        # Serve the report locally
        echo "🌐 Starting Allure report server..."
        echo "   Access the report at: http://localhost:8080"
        echo "   Press Ctrl+C to stop the server"
        echo ""
        
        # Try to open the report in the default browser (platform-specific)
        if command -v xdg-open &> /dev/null; then
            # Linux
            xdg-open http://localhost:8080 &
        elif command -v open &> /dev/null; then
            # macOS
            open http://localhost:8080 &
        elif command -v start &> /dev/null; then
            # Windows
            start http://localhost:8080 &
        fi
        
        # Serve the report
        allure open allure-report-combined --port 8080
    else
        echo "❌ Failed to generate combined Allure report"
        return 1
    fi
}

# Function to generate summary
generate_summary() {
    local total_shards=$1
    echo "=== SHARD EXECUTION SUMMARY ==="
    
    local passed=0
    local failed=0
    local total_duration=0
    
    for i in $(seq 1 $total_shards); do
        if [ -f "logs/exits/shard-${i}.exit" ]; then
            local exit_code=$(cat "logs/exits/shard-${i}.exit")
            local duration="N/A"
            
            # Try to get duration from timing file
            if [ -f "logs/shards/shard-${i}.timing" ]; then
                local duration_line=$(grep "total duration:" "logs/shards/shard-${i}.timing" | cut -d' ' -f4)
                if [ -n "$duration_line" ] && [ "$duration_line" -eq "$duration_line" ] 2>/dev/null; then
                    duration="${duration_line}s"
                    total_duration=$((total_duration + duration_line))
                fi
            fi
            
            if [ "$exit_code" -eq 0 ]; then
                echo "✅ Shard ${i}: PASSED (${duration})"
                ((passed++))
            else
                echo "❌ Shard ${i}: FAILED (exit code: ${exit_code}, ${duration})"
                ((failed++))
            fi
        else
            echo "⚠️  Shard ${i}: NO EXIT CODE FOUND"
        fi
    done
    
    echo "=== FINAL RESULTS ==="
    echo "Passed: ${passed}"
    echo "Failed: ${failed}"
    echo "Total: ${total_shards}"
    echo "Total Duration: ${total_duration}s"
    echo ""
    echo "=== LOG DIRECTORY STRUCTURE ==="
    echo "📁 logs/servers/ - Angular dev server logs"
    echo "📁 logs/shards/  - Test execution logs, timing, and browser logs"
    echo "📁 logs/exits/   - Exit codes for each shard"
    echo "📁 allure-results/ - Individual shard Allure results"
    echo "📁 allure-reports/ - Individual shard Allure reports"
    echo "📁 allure-results-combined/ - Combined Allure results (all shards)"
    echo "📁 allure-report-combined/ - Final combined Allure report"
}

# Main execution
TOTAL_SHARDS=19  # Use 19 shards - one per feature file

echo "Running ${TOTAL_SHARDS} shards in parallel, each with its own server..."

# Run all shards in parallel with fail-fast behavior
echo "Starting all ${TOTAL_SHARDS} shards in parallel (fail-fast)..."

# Start all shards in background
pids=()
for i in $(seq 1 $TOTAL_SHARDS); do
    run_shard $i $TOTAL_SHARDS &
    pids+=($!)
done

echo "Started ${#pids[@]} shards with PIDs: ${pids[*]}"

# Wait for any shard to complete and check for failures
failed_shard=""
timeout_counter=0
max_timeout=300  # 5 minutes max wait time

while [ ${#pids[@]} -gt 0 ] && [ $timeout_counter -lt $max_timeout ]; do
    for i in "${!pids[@]}"; do
        if ! kill -0 "${pids[$i]}" 2>/dev/null; then
            # Process has finished, check exit code
            wait "${pids[$i]}" 2>/dev/null
            exit_code=$?
            shard_num=$((i + 1))
            
            if [ "$exit_code" -ne 0 ]; then
                echo "❌ Shard ${shard_num} failed with exit code ${exit_code} - stopping execution (fail-fast)"
                failed_shard=$shard_num
                # Kill all remaining processes and record their exit codes
                for j in "${!pids[@]}"; do
                    if [ $j -ne $i ]; then
                        remaining_shard=$((j + 1))
                        echo "Killing shard ${remaining_shard} (PID: ${pids[$j]})..."
                        kill "${pids[$j]}" 2>/dev/null || true
                        echo "130" > "logs/exits/shard-${remaining_shard}.exit"  # SIGTERM exit code
                    fi
                done
                break 2
            else
                echo "✅ Shard ${shard_num} passed"
            fi
            
            # Remove completed process from array
            unset 'pids[$i]'
        fi
    done
    
    # Increment timeout counter
    ((timeout_counter++))
    sleep 1
done

# Handle timeout
if [ $timeout_counter -ge $max_timeout ]; then
    echo "⚠️  Timeout reached (${max_timeout}s) - killing remaining processes"
    for i in "${!pids[@]}"; do
        shard_num=$((i + 1))
        echo "Killing timed out shard ${shard_num} (PID: ${pids[$i]})..."
        kill "${pids[$i]}" 2>/dev/null || true
        echo "124" > "logs/exits/shard-${shard_num}.exit"  # Timeout exit code
    done
    failed_shard="timeout"
fi

# Stop all servers
stop_all_servers $TOTAL_SHARDS

# Generate summary (always show, even on failure)
generate_summary $TOTAL_SHARDS

# Handle Allure report generation based on options
if [ "$SKIP_ALLURE" = true ]; then
    echo "⏭️  Skipping Allure report generation (--skip-allure flag)"
else
    # Combine Allure results from all shards (similar to CI e2e-report job)
    combine_allure_results $TOTAL_SHARDS
    
    # If any shard failed, show error but still try to generate reports
    if [ -n "$failed_shard" ]; then
        echo "❌ Execution stopped due to shard ${failed_shard} failure (fail-fast)"
        echo "⚠️  Some tests may have failed, but attempting to generate reports anyway..."
    fi
fi

echo "=== SHARDED TEST EXECUTION COMPLETE ==="
echo "Check organized logs in logs/ directory for detailed results:"
echo "  📁 logs/servers/ - Angular dev server logs for each shard"
echo "  📁 logs/shards/  - Test execution logs, timing metrics, and browser logs"
echo "  📁 logs/exits/   - Exit codes for each shard"
if [ "$SKIP_ALLURE" = false ]; then
    echo "  📁 allure-results/ - Individual shard Allure results"
    echo "  📁 allure-results-combined/ - Combined Allure results"
fi
echo "Each shard ran on its own port: 4201-4219"
echo ""

# Handle Allure report serving based on options
if [ "$SKIP_ALLURE" = true ]; then
    echo "📊 Allure reports skipped (--skip-allure flag)"
elif [ "$AUTO_SERVE_ALLURE" = true ]; then
    echo "🚀 Automatically serving Allure report (--serve-allure flag)..."
    serve_allure_report
else
    # Interactive mode - ask user if they want to serve the Allure report
    echo "🌐 Allure Report Options:"
    echo "   1. Serve combined report locally (opens browser automatically)"
    echo "   2. Skip serving report (you can serve manually later)"
    echo "   3. Generate report only (no serving)"
    echo ""
    read -p "Choose option (1-3): " choice

    case $choice in
        1)
            serve_allure_report
            ;;
        2)
            echo "📊 To serve the report later, run:"
            echo "   allure open allure-report-combined --port 8080"
            ;;
        3)
            echo "📊 Report generated at: allure-report-combined/"
            echo "   To serve later: allure open allure-report-combined --port 8080"
            ;;
        *)
            echo "📊 Invalid choice. Report generated at: allure-report-combined/"
            echo "   To serve later: allure open allure-report-combined --port 8080"
            ;;
    esac
fi

# Exit with appropriate code
if [ -n "$failed_shard" ]; then
    exit 1
fi
