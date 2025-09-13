#!/bin/bash

# Test script to verify shard 19 fix
# This script tests the improved port conflict handling

echo "=== TESTING SHARD 19 FIX ==="
echo "Testing improved port conflict handling and server startup..."

# Clean up any existing processes
echo "Cleaning up existing processes..."
if command -v tasklist >/dev/null 2>&1; then
    tasklist | findstr "ng serve" | awk '{print $2}' | xargs -r taskkill /F /PID 2>/dev/null || true
fi

# Test port availability checking
echo "Testing port availability checking..."
source run-sharded-tests.sh

# Test the port checking function
echo "Checking if port 4219 is available..."
if check_port_available 4219; then
    echo "✅ Port 4219 is available"
else
    echo "❌ Port 4219 is occupied"
fi

# Test finding available port
echo "Finding available port starting from 4219..."
available_port=$(find_available_port 4219)
if [ $? -eq 0 ]; then
    echo "✅ Found available port: $available_port"
else
    echo "❌ Could not find available port"
fi

# Test starting a single server
echo "Testing server startup for shard 19..."
if start_shard_server 19; then
    echo "✅ Shard 19 server started successfully"
    
    # Get the actual port used
    if [ -f "logs/servers/server-19.port" ]; then
        actual_port=$(cat "logs/servers/server-19.port")
        echo "Server is running on port: $actual_port"
        
        # Test if server is responding
        if curl -s http://localhost:${actual_port} > /dev/null 2>&1; then
            echo "✅ Server is responding on port $actual_port"
        else
            echo "❌ Server is not responding on port $actual_port"
        fi
    else
        echo "❌ Could not find port file for shard 19"
    fi
    
    # Clean up
    echo "Cleaning up test server..."
    stop_shard_server 19
else
    echo "❌ Failed to start shard 19 server"
fi

echo "=== TEST COMPLETE ==="
