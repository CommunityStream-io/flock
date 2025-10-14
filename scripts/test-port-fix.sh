#!/bin/bash

# Simple test script to verify port conflict fixes
echo "=== TESTING PORT CONFLICT FIXES ==="

# Source the functions from the main script
source run-sharded-tests.sh

# Test port availability checking
echo "Testing port 4201 availability..."
if check_port_available 4201; then
    echo "✅ Port 4201 is available"
else
    echo "❌ Port 4201 is occupied"
fi

# Test port finding
echo "Finding available port starting from 4201..."
port1=$(find_available_port 4201)
echo "Found port: $port1"

echo "Finding another available port starting from 4202..."
port2=$(find_available_port 4202)
echo "Found port: $port2"

echo "Finding another available port starting from 4203..."
port3=$(find_available_port 4203)
echo "Found port: $port3"

# Verify ports are different
if [ "$port1" != "$port2" ] && [ "$port2" != "$port3" ] && [ "$port1" != "$port3" ]; then
    echo "✅ All ports are unique: $port1, $port2, $port3"
else
    echo "❌ Port conflict detected: $port1, $port2, $port3"
fi

echo "=== TEST COMPLETE ==="

