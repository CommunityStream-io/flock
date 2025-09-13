#!/bin/bash

# Sharded E2E Test Runner
# Mimics CI workflow with separate log files for each shard

# Set environment variable for sharded tests to reduce logging
export SHARDED_TESTS=true
export DEBUG_TESTS=false

echo "=== SHARDED E2E TEST RUNNER ==="
echo "Starting sharded test execution..."

# Create organized log directories and clean up old logs
mkdir -p logs/servers logs/shards logs/exits
echo "Cleaning up old logs..."
rm -f logs/servers/* logs/shards/* logs/exits/*

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
    return $exit_code
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

# If any shard failed, exit with error code
if [ -n "$failed_shard" ]; then
    echo "❌ Execution stopped due to shard ${failed_shard} failure (fail-fast)"
    exit 1
fi

echo "=== SHARDED TEST EXECUTION COMPLETE ==="
echo "Check organized logs in logs/ directory for detailed results:"
echo "  📁 logs/servers/ - Angular dev server logs for each shard"
echo "  📁 logs/shards/  - Test execution logs, timing metrics, and browser logs"
echo "  📁 logs/exits/   - Exit codes for each shard"
echo "Each shard ran on its own port: 4201-4219"
