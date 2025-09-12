#!/bin/bash

# Sharded E2E Test Runner
# Mimics CI workflow with separate log files for each shard

echo "=== SHARDED E2E TEST RUNNER ==="
echo "Starting sharded test execution..."

# Create logs directory and clean up old logs
mkdir -p logs
echo "Cleaning up old logs..."
rm -f logs/shard-*.log logs/shard-*.pid logs/shard-*.exit logs/server-*.pid logs/server-*.log

# Function to start a server for a specific shard
start_shard_server() {
    local shard_num=$1
    local port=$((4200 + shard_num))
    local log_file="logs/server-${shard_num}.log"
    
    echo "Starting Angular dev server for shard ${shard_num} on port ${port}..."
    npx ng serve flock-mirage --configuration=test --port=${port} --host=0.0.0.0 > "${log_file}" 2>&1 &
    local server_pid=$!
    echo "Server for shard ${shard_num} started with PID: ${server_pid}"
    echo "${server_pid}" > "logs/server-${shard_num}.pid"
    
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
    if [ -f "logs/server-${shard_num}.pid" ]; then
        local server_pid=$(cat logs/server-${shard_num}.pid)
        echo "Stopping server for shard ${shard_num} (PID: ${server_pid})..."
        kill $server_pid 2>/dev/null || true
        rm -f logs/server-${shard_num}.pid
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
    local log_file="logs/shard-${shard_num}.log"
    
    echo "Starting shard ${shard_num}/${total_shards} on port ${port} - logging to ${log_file}"
    
    # Start the server for this shard first
    if ! start_shard_server $shard_num; then
        echo "Failed to start server for shard ${shard_num}"
        return 1
    fi
    
    # Run the shard with increased timeouts and log to file
    # Update the baseUrl to use the shard-specific port
    npx cross-env CI=true HEADLESS=true BASE_URL=http://localhost:${port} wdio run wdio.conf.ts --shard=${shard_num}/${total_shards} > "${log_file}" 2>&1 &
    
    local pid=$!
    echo "Shard ${shard_num} started with PID: ${pid}"
    echo "${pid}" > "logs/shard-${shard_num}.pid"
}

# Function to wait for all shards to complete
wait_for_shards() {
    local total_shards=$1
    echo "Waiting for all ${total_shards} shards to complete..."
    
    for i in $(seq 1 $total_shards); do
        if [ -f "logs/shard-${i}.pid" ]; then
            local pid=$(cat "logs/shard-${i}.pid")
            echo "Waiting for shard ${i} (PID: ${pid})..."
            wait $pid
            local exit_code=$?
            echo "Shard ${i} completed with exit code: ${exit_code}"
            echo "${exit_code}" > "logs/shard-${i}.exit"
        fi
    done
}

# Function to generate summary
generate_summary() {
    local total_shards=$1
    echo "=== SHARD EXECUTION SUMMARY ==="
    
    local passed=0
    local failed=0
    
    for i in $(seq 1 $total_shards); do
        if [ -f "logs/shard-${i}.exit" ]; then
            local exit_code=$(cat "logs/shard-${i}.exit")
            if [ "$exit_code" -eq 0 ]; then
                echo "✅ Shard ${i}: PASSED"
                ((passed++))
            else
                echo "❌ Shard ${i}: FAILED (exit code: ${exit_code})"
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
}

# Main execution
TOTAL_SHARDS=19  # Use 19 shards - one per feature file

echo "Running ${TOTAL_SHARDS} shards in parallel, each with its own server..."

# Start all shards (each will start its own server)
for i in $(seq 1 $TOTAL_SHARDS); do
    run_shard $i $TOTAL_SHARDS
    sleep 3  # Small delay between shard starts to avoid port conflicts
done

# Wait for all shards to complete
wait_for_shards $TOTAL_SHARDS

# Stop all servers
stop_all_servers $TOTAL_SHARDS

# Generate summary
generate_summary $TOTAL_SHARDS

echo "=== SHARDED TEST EXECUTION COMPLETE ==="
echo "Check individual logs in logs/ directory for detailed results"
echo "Each shard ran on its own port: 4201-4219"
