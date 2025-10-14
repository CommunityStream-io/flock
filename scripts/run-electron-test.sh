#!/bin/bash
# Script to run Electron app with logging
# Usage: ./run-electron-test.sh

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Create logs directory if it doesn't exist
LOGS_DIR="logs"
mkdir -p "$LOGS_DIR"

# Generate timestamp for log file
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
LOG_FILE="$LOGS_DIR/electron-test-${TIMESTAMP}.log"

# Electron executable path
ELECTRON_EXE="dist/electron/win-unpacked/Flock Native.exe"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Flock Electron Manual Test Runner${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if executable exists
if [ ! -f "$ELECTRON_EXE" ]; then
    echo -e "${YELLOW}⚠️  Electron executable not found at: $ELECTRON_EXE${NC}"
    echo -e "${YELLOW}   Run: npm run pack:win:dir${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Found Electron executable${NC}"
echo -e "${GREEN}📁 Executable: $ELECTRON_EXE${NC}"
echo -e "${GREEN}📝 Log file: $LOG_FILE${NC}"
echo ""

# Check if CLI package is unpacked
CLI_PATH="dist/electron/win-unpacked/resources/app.asar.unpacked/node_modules/@straiforos/instagramtobluesky/dist/main.js"
if [ -f "$CLI_PATH" ]; then
    echo -e "${GREEN}✅ CLI package unpacked correctly${NC}"
    echo -e "${GREEN}   Path: $CLI_PATH${NC}"
else
    echo -e "${YELLOW}⚠️  CLI package not found at expected location${NC}"
    echo -e "${YELLOW}   Expected: $CLI_PATH${NC}"
fi

echo ""
echo -e "${BLUE}🚀 Starting Electron app...${NC}"
echo -e "${BLUE}   Output will be logged to: $LOG_FILE${NC}"
echo -e "${BLUE}   Press Ctrl+C to stop${NC}"
echo ""
echo -e "${YELLOW}📋 What to Test:${NC}"
echo -e "  1. Upload test archive from: projects/flock-native/transfer/test_video/"
echo -e "  2. Enter test credentials"
echo -e "  3. Enable 'Simulation Mode'"
echo -e "  4. Watch for: 'Execution Method: fork (Node.js)'"
echo -e "  5. Verify CLI executes without exit code -4058"
echo ""
echo "========================================" | tee "$LOG_FILE"
echo "Electron Test Session: $TIMESTAMP" | tee -a "$LOG_FILE"
echo "Fix: Using fork() instead of spawn() for CLI" | tee -a "$LOG_FILE"
echo "========================================" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

# Run the Electron app with output piped to both console and log file
"$ELECTRON_EXE" 2>&1 | tee -a "$LOG_FILE"

# Capture exit code
EXIT_CODE=${PIPESTATUS[0]}

echo "" | tee -a "$LOG_FILE"
echo "========================================" | tee -a "$LOG_FILE"
echo "Electron app exited with code: $EXIT_CODE" | tee -a "$LOG_FILE"
echo "========================================" | tee -a "$LOG_FILE"

if [ $EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✅ App exited successfully${NC}"
else
    echo -e "${YELLOW}⚠️  App exited with error code: $EXIT_CODE${NC}"
fi

echo -e "${GREEN}📝 Full log saved to: $LOG_FILE${NC}"
echo ""
echo -e "${BLUE}To view the log:${NC}"
echo -e "  cat $LOG_FILE"
echo -e "  tail -f $LOG_FILE"
echo ""

exit $EXIT_CODE

