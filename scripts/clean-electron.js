#!/usr/bin/env node

/**
 * Clean Electron build artifacts
 * Handles locked files by killing Electron processes first
 */

const { execSync, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ELECTRON_DIST = path.join(__dirname, '..', 'dist', 'electron');
const MAX_RETRIES = 5;
const RETRY_DELAY = 2000; // ms

/**
 * Sleep for specified milliseconds
 */
function sleep(ms) {
  const start = Date.now();
  while (Date.now() - start < ms) {
    // Busy wait
  }
}

/**
 * Kill all Electron processes
 */
function killElectronProcesses() {
  console.log('🔍 Checking for running Electron processes...');
  
  let killed = false;
  
  try {
    if (process.platform === 'win32') {
      // Windows: Kill Electron and Flock processes forcefully
      const processesToKill = [
        'electron.exe',
        'Flock Native.exe',
        'chrome.exe',  // ChromeDriver from tests
        'chromedriver.exe'
      ];
      
      processesToKill.forEach(proc => {
        try {
          execSync(`taskkill /F /IM "${proc}" /T 2>nul`, { stdio: 'ignore' });
          console.log(`✅ Killed ${proc} processes`);
          killed = true;
        } catch (e) {
          // Process not found, ignore
        }
      });
      
      // Also try to kill by window title
      try {
        execSync('taskkill /F /FI "WINDOWTITLE eq Flock Native*" /T 2>nul', { stdio: 'ignore' });
      } catch (e) {
        // Ignore
      }
    } else if (process.platform === 'darwin') {
      // macOS
      try {
        execSync('pkill -9 Electron', { stdio: 'ignore' });
        execSync('pkill -9 "Flock Native"', { stdio: 'ignore' });
        console.log('✅ Killed Electron processes');
        killed = true;
      } catch (e) {
        // Process not found, ignore
      }
    } else {
      // Linux
      try {
        execSync('pkill -9 electron', { stdio: 'ignore' });
        execSync('pkill -9 flock-native', { stdio: 'ignore' });
        console.log('✅ Killed Electron processes');
        killed = true;
      } catch (e) {
        // Process not found, ignore
      }
    }
    
    if (!killed) {
      console.log('ℹ️  No Electron processes found');
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
      
      // Use platform-specific deletion
      if (process.platform === 'win32') {
        // Windows: Use rmdir /s /q for more aggressive deletion
        try {
          execSync(`rmdir /s /q "${dirPath}"`, { stdio: 'ignore' });
          console.log(`✅ Successfully deleted: ${dirPath}`);
          return true;
        } catch (e) {
          // If that fails, try PowerShell
          try {
            execSync(`powershell -Command "Remove-Item -Path '${dirPath}' -Recurse -Force -ErrorAction SilentlyContinue"`, { stdio: 'ignore' });
            console.log(`✅ Successfully deleted: ${dirPath}`);
            return true;
          } catch (e2) {
            throw new Error(`Windows deletion failed: ${e.message}`);
          }
        }
      } else {
        // Unix: Use rm -rf
        try {
          execSync(`rm -rf "${dirPath}"`, { stdio: 'ignore' });
          console.log(`✅ Successfully deleted: ${dirPath}`);
          return true;
        } catch (e) {
          // Fallback to Node.js fs
          if (fs.rmSync) {
            fs.rmSync(dirPath, { recursive: true, force: true, maxRetries: 3 });
          } else {
            const rimraf = require('rimraf').sync;
            rimraf(dirPath);
          }
          console.log(`✅ Successfully deleted: ${dirPath}`);
          return true;
        }
      }
    } catch (error) {
      console.warn(`⚠️  Attempt ${attempt} failed:`, error.message);
      
      if (attempt < retries) {
        console.log(`⏳ Waiting ${RETRY_DELAY}ms before retry...`);
        sleep(RETRY_DELAY);
        
        // Try killing processes again
        killElectronProcesses();
        
        // Give OS time to release file handles
        sleep(1000);
      }
    }
  }
  
  console.error(`❌ Failed to delete after ${retries} attempts: ${dirPath}`);
  console.error('💡 Try these steps:');
  console.error('   1. Close all Electron apps manually');
  console.error('   2. Close any file explorers viewing the dist folder');
  console.error('   3. Wait a few seconds and try again');
  console.error('   4. Restart your computer if the issue persists');
  return false;
}

/**
 * Main function
 */
function main() {
  console.log('🧹 Cleaning Electron build artifacts...\n');
  
  // Kill any running Electron processes
  killElectronProcesses();
  
  // Wait for processes to fully terminate and release file handles
  console.log('⏳ Waiting for processes to terminate...');
  sleep(2000);  // Give Windows more time to release file handles
  
  // Delete the dist/electron directory
  const success = deleteDirectory(ELECTRON_DIST);
  
  if (success) {
    console.log('\n✅ Electron build artifacts cleaned successfully!');
    console.log(`📁 Cleaned: ${ELECTRON_DIST}`);
    process.exit(0);
  } else {
    console.log('\n❌ Failed to clean Electron build artifacts');
    console.log(`📁 Target: ${ELECTRON_DIST}`);
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

