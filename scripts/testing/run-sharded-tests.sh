#!/bin/bash

# Sharded E2E Test Runner with Tag Support
# Supports the new tag hierarchy: @smoke, @core, @web, @electron, @auth, @upload, @config, etc.

# Set environment variable for sharded tests to reduce logging
export SHARDED_TESTS=true
export DEBUG_TESTS=false
export TIMEOUT_TELEMETRY=true
export CHROMEDRIVER_PATH="./node_modules/chromedriver/lib/chromedriver/chromedriver.exe"

# Parse command line arguments
AUTO_SERVE_ALLURE=false
SKIP_ALLURE=false
TRACK_PERFORMANCE=false
ANALYZE_TIMEOUTS=true
FAIL_FAST=false  # Default to false - run all shards even if one fails
TEST_TAGS=""     # Default: run all tests (no tag filter)
PLATFORM=""      # Default: auto-detect or use default platform

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
        --track-performance)
            TRACK_PERFORMANCE=true
            shift
            ;;
        --skip-timeout-analysis)
            ANALYZE_TIMEOUTS=false
            shift
            ;;
        --fail-fast)
            FAIL_FAST=true
            shift
            ;;
        --tags)
            TEST_TAGS="$2"
            shift 2
            ;;
        --platform)
            PLATFORM="$2"
            shift 2
            ;;
        --smoke)
            TEST_TAGS="@smoke"
            shift
            ;;
        --core)
            TEST_TAGS="@core"
            shift
            ;;
        --web)
            PLATFORM="web"
            TEST_TAGS="@web or @core"
            shift
            ;;
        --electron)
            PLATFORM="electron"
            TEST_TAGS="@electron or @core"
            shift
            ;;
        --auth)
            TEST_TAGS="@auth"
            shift
            ;;
        --upload)
            TEST_TAGS="@upload"
            shift
            ;;
        --config)
            TEST_TAGS="@config"
            shift
            ;;
        --regression)
            TEST_TAGS="@regression or not @skip"
            shift
            ;;
        --help|-h)
            echo "Sharded E2E Test Runner with Tag Support"
            echo ""
            echo "Usage: $0 [options]"
            echo ""
            echo "Options:"
            echo "  --serve-allure          Automatically serve Allure report after completion"
            echo "  --skip-allure           Skip Allure report generation and serving"
            echo "  --track-performance     Enable detailed performance timing tracking"
            echo "  --skip-timeout-analysis Skip timeout telemetry analysis"
            echo "  --fail-fast             Stop all shards on first failure (default: false)"
            echo ""
            echo "Tag Options (NEW):"
            echo "  --tags \"<expression>\"   Run tests matching tag expression (e.g., '@smoke and @auth')"
            echo "  --platform <platform>   Run tests for specific platform (web, electron)"
            echo "  --smoke                 Run smoke tests (@smoke) - fastest feedback (~3 min)"
            echo "  --core                  Run core tests (@core) - essential functionality (~8 min)"
            echo "  --web                   Run web platform tests (@web or @core)"
            echo "  --electron              Run electron platform tests (@electron or @core)"
            echo "  --auth                  Run authentication tests (@auth)"
            echo "  --upload                Run upload tests (@upload)"
            echo "  --config                Run configuration tests (@config)"
            echo "  --regression            Run full regression suite (@regression or not @skip)"
            echo ""
            echo "Examples:"
            echo "  $0                                    # Run all tests (no tag filter)"
            echo "  $0 --smoke                            # Run smoke tests only"
            echo "  $0 --core --fail-fast                 # Run core tests, stop on failure"
            echo "  $0 --web --serve-allure               # Run web tests with report"
            echo "  $0 --config --skip-allure             # Run config tests without Allure"
            echo "  $0 --tags '@auth and @validation'     # Run auth validation tests"
            echo "  $0 --tags '@config and @smoke'        # Run config smoke tests"
            echo "  $0 --regression --track-performance   # Full regression with performance tracking"
            echo ""
            echo "Tag Hierarchy:"
            echo "  Suite Level:  @smoke, @core, @regression, @integration"
            echo "  Platform:     @web, @electron"
            echo "  Feature:      @auth, @upload, @config"
            echo "  Execution:    @parallel, @serial"
            echo "  Special:      @accessibility, @performance, @ui, @edge-case"
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
if [ -n "$TEST_TAGS" ]; then
    echo "🏷️  Tag filter: $TEST_TAGS"
else
    echo "🏷️  Tag filter: None (running all tests)"
fi
if [ -n "$PLATFORM" ]; then
    echo "🖥️  Platform: $PLATFORM"
else
    echo "🖥️  Platform: Auto-detect"
fi

# Create organized log directories and clean up old logs
mkdir -p logs/servers logs/shards logs/exits
echo "Cleaning up old logs..."
rm -f logs/servers/* logs/shards/* logs/exits/*

# Clean up any existing Angular dev servers
echo "Cleaning up any existing Angular dev servers..."
if command -v tasklist >/dev/null 2>&1; then
    # Windows
    tasklist | findstr "ng serve" | awk '{print $2}' | xargs -r taskkill /F /PID 2>/dev/null || true
elif command -v pkill >/dev/null 2>&1; then
    # Linux/macOS
    pkill -f "ng serve" 2>/dev/null || true
fi
echo "Cleanup completed"

# Create Allure directories only if not skipping
if [ "$SKIP_ALLURE" = false ]; then
    mkdir -p allure-results
    echo "Cleaning up old Allure results..."
    rm -rf allure-results/*
fi

# Initialize performance tracking if enabled
if [ "$TRACK_PERFORMANCE" = true ]; then
    mkdir -p logs
    PERFORMANCE_LOG="logs/performance.log"
    echo "=== PERFORMANCE TRACKING ENABLED ===" > "$PERFORMANCE_LOG"
    echo "Start time: $(date)" >> "$PERFORMANCE_LOG"
    echo "Allure enabled: $([ "$SKIP_ALLURE" = true ] && echo "NO" || echo "YES")" >> "$PERFORMANCE_LOG"
    echo "Auto serve: $([ "$AUTO_SERVE_ALLURE" = true ] && echo "YES" || echo "NO")" >> "$PERFORMANCE_LOG"
    OVERALL_START_TIME=$(date +%s)
fi

# Function to check if a port is available
check_port_available() {
    local port=$1
    if command -v netstat >/dev/null 2>&1; then
        # Windows netstat - check for LISTENING state
        netstat -ano | grep ":${port}" | grep "LISTENING" >/dev/null 2>&1 && return 1 || return 0
    elif command -v ss >/dev/null 2>&1; then
        # Linux ss - check for listening state
        ss -tuln | grep ":${port}" | grep "LISTEN" >/dev/null 2>&1 && return 1 || return 0
    else
        # Fallback to curl test
        curl -s http://localhost:${port} >/dev/null 2>&1 && return 1 || return 0
    fi
}

# Global array to track used ports
declare -a USED_PORTS=()

# Function to find an available port starting from the base port
find_available_port() {
    local base_port=$1
    local port=$base_port
    local max_attempts=50
    
    for i in $(seq 0 $max_attempts); do
        # Check if port is available AND not already assigned to another shard
        if check_port_available $port && [[ ! " ${USED_PORTS[@]} " =~ " ${port} " ]]; then
            # Mark port as used
            USED_PORTS+=($port)
            echo $port
            return 0
        fi
        port=$((port + 1))
    done
    
    echo "ERROR: Could not find available port starting from ${base_port}"
    return 1
}

# Function to start a server for a specific shard
start_shard_server() {
    local shard_num=$1
    local base_port=$((4200 + shard_num))
    local log_file="logs/servers/server-${shard_num}.log"
    
    # Find an available port
    local port=$(find_available_port $base_port)
    if [ $? -ne 0 ]; then
        echo "ERROR: Could not find available port for shard ${shard_num}"
        return 1
    fi
    
    # If port is different from expected, log it
    if [ "$port" -ne "$base_port" ]; then
        echo "WARNING: Port ${base_port} was occupied, using port ${port} for shard ${shard_num}"
    fi
    
    echo "Starting Angular dev server for shard ${shard_num} on port ${port}..."
    npx ng serve flock-mirage --configuration=test --port=${port} --host=0.0.0.0 > "${log_file}" 2>&1 &
    local server_pid=$!
    echo "Server for shard ${shard_num} started with PID: ${server_pid} on port ${port}"
    echo "${server_pid}" > "logs/servers/server-${shard_num}.pid"
    echo "${port}" > "logs/servers/server-${shard_num}.port"
    
    # Wait for server to be ready with enhanced validation
    echo "Waiting for shard ${shard_num} server to be ready on port ${port}..."
    local max_attempts=30
    local attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        # Check if process is still running
        if ! kill -0 $server_pid 2>/dev/null; then
            echo "ERROR: Server process for shard ${shard_num} died unexpectedly"
            return 1
        fi
        
        # Check if server is responding
        if curl -s http://localhost:${port} > /dev/null 2>&1; then
            echo "Server for shard ${shard_num} is ready on port ${port}!"
            return 0
        fi
        
        # Check for port conflict in logs
        if grep -q "Port ${port} is already in use" "${log_file}" 2>/dev/null; then
            echo "ERROR: Port ${port} conflict detected for shard ${shard_num}"
            return 1
        fi
        
        sleep 2
        ((attempt++))
        echo "Attempt ${attempt}/${max_attempts}: Shard ${shard_num} server not ready yet..."
    done
    
    echo "ERROR: Server for shard ${shard_num} failed to start after ${max_attempts} attempts"
    echo "Last few lines of server log:"
    tail -5 "${log_file}" 2>/dev/null || echo "Could not read server log"
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
    local log_file="logs/shards/shard-${shard_num}.log"
    local timing_file="logs/shards/shard-${shard_num}.timing"
    local exit_file="logs/exits/shard-${shard_num}.exit"
    
    # Get the actual port used by the server
    local port
    if [ -f "logs/servers/server-${shard_num}.port" ]; then
        port=$(cat "logs/servers/server-${shard_num}.port")
    else
        port=$((4200 + shard_num))
        echo "WARNING: Could not find port file for shard ${shard_num}, using default port ${port}"
    fi
    
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
    # Conditionally disable Allure reporter for faster execution when not needed
    local allure_env=""
    if [ "$SKIP_ALLURE" = true ]; then
        allure_env="SKIP_ALLURE_REPORTER=true"
    fi
    
    # Add tag filter if specified
    local tag_env=""
    if [ -n "$TEST_TAGS" ]; then
        tag_env="TEST_TAGS=\"$TEST_TAGS\""
    fi
    
    # Add platform if specified
    local platform_env=""
    local config_file="wdio.conf.ts"
    if [ -n "$PLATFORM" ]; then
        platform_env="PLATFORM=$PLATFORM"
        if [ "$PLATFORM" = "web" ]; then
            config_file="wdio.web.conf.ts"
        elif [ "$PLATFORM" = "electron" ]; then
            config_file="wdio.electron.conf.ts"
        fi
    fi
    
    npx cross-env CI=true HEADLESS=true BASE_URL=http://localhost:${port} SHARDED_TESTS=true DEBUG_TESTS=false TIMEOUT_TELEMETRY=true ${allure_env} ${tag_env} ${platform_env} wdio run ${config_file} --shard=${shard_num}/${total_shards} > "${log_file}" 2> "logs/shards/shard-${shard_num}.browser.log"
    
    local exit_code=$?
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    echo "Shard ${shard_num} completed with exit code: ${exit_code} (duration: ${duration}s)"
    echo "Shard ${shard_num} completed at: $(date)" >> "${timing_file}"
    echo "Shard ${shard_num} total duration: ${duration}s" >> "${timing_file}"
    echo "${exit_code}" > "${exit_file}"
    
    # Allure results are automatically written to allure-results/ by WebdriverIO
    # No need for nested shard directories - all shards write to the same directory
    if [ "$SKIP_ALLURE" = false ]; then
        echo "✅ Shard ${shard_num} Allure results written to allure-results/"
        if [ "$TRACK_PERFORMANCE" = true ]; then
            local allure_files=$(find allure-results -type f 2>/dev/null | wc -l)
            echo "📊 Shard ${shard_num} generated ${allure_files} Allure result files" >> "$PERFORMANCE_LOG"
        fi
    fi
    
    return $exit_code
}


# Function to analyze Allure results from single directory (simplified approach)
analyze_allure_results() {
    local total_shards=$1
    echo "=== ANALYZING ALLURE RESULTS ==="
    
    # Check if allure-results directory exists and has content
    if [ -d "allure-results" ] && [ "$(ls -A allure-results 2>/dev/null)" ]; then
        local total_files=$(find "allure-results" -type f 2>/dev/null | wc -l)
        local json_files=$(find "allure-results" -name "*.json" 2>/dev/null | wc -l)
        local result_files=$(find "allure-results" -name "*-result.json" 2>/dev/null | wc -l)
        local container_files=$(find "allure-results" -name "*-container.json" 2>/dev/null | wc -l)
        local attachment_files=$(find "allure-results" -name "*-attachment.*" 2>/dev/null | wc -l)
        
        echo "📊 ALLURE RESULTS ANALYSIS:"
        echo "   📁 Total files: ${total_files}"
        echo "   📄 JSON files: ${json_files}"
        echo "   🧪 Test result files: ${result_files}"
        echo "   📦 Container files: ${container_files}"
        echo "   📎 Attachment files: ${attachment_files}"
        echo "   📂 Directory: allure-results/"
        
        # Show sample files
        echo "   📋 Sample files:"
        find "allure-results" -type f 2>/dev/null | head -5 | while read file; do
            echo "      - $(basename "$file")"
        done
        if [ $total_files -gt 5 ]; then
            echo "      ... and $((total_files - 5)) more files"
        fi
        
        # Performance tracking
        if [ "$TRACK_PERFORMANCE" = true ]; then
            echo "📊 Total Allure files generated: ${total_files}" >> "$PERFORMANCE_LOG"
            echo "📊 Test results: ${result_files}, Containers: ${container_files}, Attachments: ${attachment_files}" >> "$PERFORMANCE_LOG"
        fi
        
    else
        echo "⚠️  No Allure results found in allure-results/"
        echo "   This could mean:"
        echo "   - Tests didn't run successfully"
        echo "   - Allure reporter is not configured properly"
        echo "   - Results are being written to a different directory"
        
        # Create fallback for empty results
        mkdir -p allure-results
        cat > allure-results/fallback-result.json << 'EOF'
{
    "name": "No test results available",
    "status": "skipped",
    "start": 0,
    "stop": 0,
    "uuid": "fallback-result"
}
EOF
    fi
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
    
    # Generate the final report from single directory
    echo "Generating final Allure report..."
    allure generate allure-results -o allure-report-combined --clean
    
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
    
    # Use global counters for performance tracking
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
# Adjust shard count based on test scope
if [ "$TEST_TAGS" = "@smoke" ]; then
    TOTAL_SHARDS=2  # Smoke tests are fast, use fewer shards
elif [ "$TEST_TAGS" = "@core" ]; then
    TOTAL_SHARDS=3  # Core tests benefit from 3 shards
elif [ "$TEST_TAGS" = "@regression or not @skip" ] || [ -z "$TEST_TAGS" ]; then
    TOTAL_SHARDS=4  # Full regression or all tests use 4 shards
else
    TOTAL_SHARDS=3  # Default to 3 shards for other test sets
fi

echo "Running ${TOTAL_SHARDS} shards in parallel, each with its own server..."
if [ -n "$TEST_TAGS" ]; then
    echo "Each shard will run tests matching: $TEST_TAGS"
fi

# Pre-download ChromeDriver to avoid rate limiting during shard startup
echo "=== PRE-DOWNLOADING CHROMEDRIVER ==="
echo "Downloading ChromeDriver to avoid rate limiting during shard startup..."
if command -v npm >/dev/null 2>&1; then
    npm install chromedriver@latest --no-save
    if [ $? -eq 0 ]; then
        echo "✅ ChromeDriver pre-downloaded successfully"
    else
        echo "⚠️  ChromeDriver pre-download failed, but continuing..."
    fi
else
    echo "⚠️  npm not found, skipping ChromeDriver pre-download"
fi
echo ""

# Run all shards in parallel
if [ "$FAIL_FAST" = true ]; then
    echo "Starting all ${TOTAL_SHARDS} shards in parallel (fail-fast enabled - will stop on first failure)..."
else
    echo "Starting all ${TOTAL_SHARDS} shards in parallel (fail-fast disabled - all shards will run to completion)..."
fi

# Start all shards in background with staggered startup to avoid ChromeDriver throttling
# Initialize global counters for performance tracking
passed=0
failed=0

pids=()
echo "Starting shards with 3-second stagger to avoid ChromeDriver rate limiting..."

for i in $(seq 1 $TOTAL_SHARDS); do
    run_shard $i $TOTAL_SHARDS &
    pids+=($!)
    
    # Stagger startup to avoid ChromeDriver download throttling
    if [ $i -lt $TOTAL_SHARDS ]; then
        echo "Started shard ${i}, waiting 3 seconds before next shard..."
        sleep 3
    fi
done

echo "Started ${#pids[@]} shards with PIDs: ${pids[*]}"

# Wait for shards to complete and check for failures
failed_shard=""
timeout_counter=0
max_timeout=300  # 5 minutes max wait time per shard

while [ ${#pids[@]} -gt 0 ] && [ $timeout_counter -lt $max_timeout ]; do
    for i in "${!pids[@]}"; do
        if ! kill -0 "${pids[$i]}" 2>/dev/null; then
            # Process has finished, check exit code
            wait "${pids[$i]}" 2>/dev/null
            exit_code=$?
            shard_num=$((i + 1))
            
            if [ "$exit_code" -ne 0 ]; then
                if [ "$FAIL_FAST" = true ]; then
                    echo "❌ Shard ${shard_num} failed with exit code ${exit_code} - stopping execution (fail-fast enabled)"
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
                    echo "❌ Shard ${shard_num} failed with exit code ${exit_code} (continuing with other shards)"
                    failed_shard=$shard_num
                fi
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
    # Analyze Allure results from single directory (simplified approach)
    analyze_allure_results $TOTAL_SHARDS
    
    # Filter out phantom hook failures
    echo "🔧 Filtering out phantom hook failures..."
    node scripts/filter-allure-hooks.js
    
    # Analyze timeout telemetry
    if [ "$ANALYZE_TIMEOUTS" = true ]; then
        echo "🔍 Analyzing timeout telemetry..."
        if command -v node >/dev/null 2>&1; then
            node scripts/analyze-timeout-telemetry.js
        else
            echo "⚠️  Node.js not found - skipping timeout analysis"
        fi
    else
        echo "⏭️  Skipping timeout analysis (--skip-timeout-analysis flag)"
    fi
    
    # If any shard failed, show error but still try to generate reports
    if [ -n "$failed_shard" ]; then
        if [ "$FAIL_FAST" = true ]; then
            echo "❌ Execution stopped due to shard ${failed_shard} failure (fail-fast enabled)"
        else
            echo "⚠️  One or more shards failed (fail-fast disabled - all shards ran to completion)"
        fi
        echo "⚠️  Some tests may have failed, but attempting to generate reports anyway..."
    fi
fi

echo "=== SHARDED TEST EXECUTION COMPLETE ==="
if [ -n "$TEST_TAGS" ]; then
    echo "🏷️  Executed tests with tags: $TEST_TAGS"
fi
if [ -n "$PLATFORM" ]; then
    echo "🖥️  Platform: $PLATFORM"
fi
echo "Check organized logs in logs/ directory for detailed results:"
echo "  📁 logs/servers/ - Angular dev server logs for each shard"
echo "  📁 logs/shards/  - Test execution logs, timing metrics, and browser logs"
echo "  📁 logs/exits/   - Exit codes for each shard"
if [ "$SKIP_ALLURE" = false ]; then
    echo "  📁 allure-results/ - Individual shard Allure results"
    echo "  📁 allure-results-combined/ - Combined Allure results"
fi
echo "Each shard ran on its own port: 4201-42$((TOTAL_SHARDS + 1))9"
echo ""

# Handle Allure report serving based on options
if [ "$SKIP_ALLURE" = true ]; then
    echo "📊 Allure reports skipped (--skip-allure flag)"
elif [ "$AUTO_SERVE_ALLURE" = true ]; then
    echo "🚀 Automatically serving Allure report (--serve-allure flag)..."
    serve_allure_report
else
    # Non-interactive mode - just generate the report
    echo "📊 Generating Allure report (non-interactive mode)..."
    echo "📊 Report generated at: allure-report-combined/"
    echo "   To serve later: allure open allure-report-combined --port 8080"
fi

# Final performance tracking
if [ "$TRACK_PERFORMANCE" = true ]; then
    overall_end_time=$(date +%s)
    overall_duration=$((overall_end_time - OVERALL_START_TIME))
    echo "=== PERFORMANCE SUMMARY ===" >> "$PERFORMANCE_LOG"
    echo "Total execution time: ${overall_duration}s" >> "$PERFORMANCE_LOG"
    echo "End time: $(date)" >> "$PERFORMANCE_LOG"
    echo "Shards passed: ${passed}" >> "$PERFORMANCE_LOG"
    echo "Shards failed: ${failed}" >> "$PERFORMANCE_LOG"
    echo "Performance log saved to: $PERFORMANCE_LOG"
fi

# Exit with appropriate code
if [ -n "$failed_shard" ]; then
    exit 1
fi
