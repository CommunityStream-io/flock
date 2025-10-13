#!/usr/bin/env node

/**
 * Clean Electron build artifacts
 * Handles locked files by killing Electron processes first
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ELECTRON_DIST = path.join(__dirname, '..', 'dist', 'electron');
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // ms

/**
 * Kill all Electron processes
 */
function killElectronProcesses() {
  console.log('🔍 Checking for running Electron processes...');
  
  try {
    if (process.platform === 'win32') {
      // Windows: Kill Electron and Flock processes
      try {
        execSync('taskkill /F /IM electron.exe /T', { stdio: 'ignore' });
        console.log('✅ Killed electron.exe processes');
      } catch (e) {
        // Process not found, ignore
      }
      
      try {
        execSync('taskkill /F /IM "Flock Native.exe" /T', { stdio: 'ignore' });
        console.log('✅ Killed "Flock Native.exe" processes');
      } catch (e) {
        // Process not found, ignore
      }
    } else if (process.platform === 'darwin') {
      // macOS
      try {
        execSync('pkill -9 Electron', { stdio: 'ignore' });
        execSync('pkill -9 "Flock Native"', { stdio: 'ignore' });
        console.log('✅ Killed Electron processes');
      } catch (e) {
        // Process not found, ignore
      }
    } else {
      // Linux
      try {
        execSync('pkill -9 electron', { stdio: 'ignore' });
        execSync('pkill -9 flock-native', { stdio: 'ignore' });
        console.log('✅ Killed Electron processes');
      } catch (e) {
        // Process not found, ignore
      }
    }
  } catch (error) {
    console.warn('⚠️  Could not kill all Electron processes:', error.message);
  }
}

/**
 * Delete directory with retries
 */
function deleteDirectory(dirPath, retries = MAX_RETRIES) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      if (!fs.existsSync(dirPath)) {
        console.log(`✅ Directory already clean: ${dirPath}`);
        return true;
      }

      console.log(`🗑️  Attempt ${attempt}/${retries}: Deleting ${dirPath}...`);
      
      // Use fs.rmSync (Node 14.14+) or fallback to rimraf
      if (fs.rmSync) {
        fs.rmSync(dirPath, { recursive: true, force: true });
      } else {
        // Fallback to rimraf for older Node versions
        const rimraf = require('rimraf').sync;
        rimraf(dirPath);
      }
      
      console.log(`✅ Successfully deleted: ${dirPath}`);
      return true;
    } catch (error) {
      console.warn(`⚠️  Attempt ${attempt} failed:`, error.message);
      
      if (attempt < retries) {
        console.log(`⏳ Waiting ${RETRY_DELAY}ms before retry...`);
        // Synchronous sleep
        const start = Date.now();
        while (Date.now() - start < RETRY_DELAY) {
          // Busy wait
        }
        
        // Try killing processes again
        killElectronProcesses();
      }
    }
  }
  
  console.error(`❌ Failed to delete after ${retries} attempts: ${dirPath}`);
  console.error('💡 Please close any running Electron apps and try again');
  return false;
}

/**
 * Main function
 */
function main() {
  console.log('🧹 Cleaning Electron build artifacts...\n');
  
  // Kill any running Electron processes
  killElectronProcesses();
  
  // Wait a moment for processes to fully terminate
  const start = Date.now();
  while (Date.now() - start < 500) {
    // Busy wait for 500ms
  }
  
  // Delete the dist/electron directory
  const success = deleteDirectory(ELECTRON_DIST);
  
  if (success) {
    console.log('\n✅ Electron build artifacts cleaned successfully!');
    process.exit(0);
  } else {
    console.log('\n❌ Failed to clean Electron build artifacts');
    process.exit(1);
  }
}

// Run
try {
  main();
} catch (error) {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
}

