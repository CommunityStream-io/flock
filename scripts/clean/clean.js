#!/usr/bin/env node

/**
 * Clean build artifacts and temporary files
 * Handles locked files by killing processes first
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');
const MAX_RETRIES = 5;
const RETRY_DELAY = 2000;

const DIRECTORIES_TO_CLEAN = [
  { path: 'dist', desc: 'Build output' },
  { path: 'coverage', desc: 'Test coverage' },
  { path: 'allure-results', desc: 'Allure results' },
  { path: 'allure-report', desc: 'Allure reports' },
  { path: 'logs', desc: 'Log files' }
];

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
 * Kill all processes that might lock files
 */
function killProcesses() {
  console.log('🔍 Checking for processes that might lock files...\n');
  
  let killed = false;
  
  try {
    if (process.platform === 'win32') {
      // Windows: Just kill Electron and test processes, not Node.js
      const processesToKill = [
        'electron.exe',
        'Flock Native.exe',
        'chrome.exe',
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
    } else if (process.platform === 'darwin') {
      try {
        execSync('pkill -9 Electron 2>/dev/null', { stdio: 'ignore' });
        execSync('pkill -9 "Flock Native" 2>/dev/null', { stdio: 'ignore' });
        console.log('✅ Killed Electron processes');
        killed = true;
      } catch (e) {
        // Process not found, ignore
      }
    } else {
      try {
        execSync('pkill -9 electron 2>/dev/null', { stdio: 'ignore' });
        execSync('pkill -9 flock-native 2>/dev/null', { stdio: 'ignore' });
        console.log('✅ Killed Electron processes');
        killed = true;
      } catch (e) {
        // Process not found, ignore
      }
    }
    
    if (!killed) {
      console.log('ℹ️  No processes found that might lock files');
    }
  } catch (error) {
    console.warn('⚠️  Could not kill all processes:', error.message);
  }
  
  console.log();
}

/**
 * Delete directory with retries
 */
function deleteDirectory(dirPath, retries = MAX_RETRIES) {
  const relativePath = path.relative(ROOT_DIR, dirPath);
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      if (!fs.existsSync(dirPath)) {
        return true;  // Already clean
      }

      if (attempt > 1) {
        console.log(`   🗑️  Attempt ${attempt}/${retries}: Deleting ${relativePath}...`);
      }
      
      if (process.platform === 'win32') {
        // Windows: Use rmdir /s /q
        try {
          execSync(`rmdir /s /q "${dirPath}" 2>nul`, { stdio: 'ignore' });
          return true;
        } catch (e) {
          // Try PowerShell as fallback
          try {
            execSync(`powershell -Command "Remove-Item -Path '${dirPath}' -Recurse -Force -ErrorAction SilentlyContinue"`, { stdio: 'ignore' });
            return true;
          } catch (e2) {
            throw new Error(`Deletion failed: ${e.message}`);
          }
        }
      } else {
        // Unix: Use rm -rf
        execSync(`rm -rf "${dirPath}"`, { stdio: 'ignore' });
        return true;
      }
    } catch (error) {
      if (attempt < retries) {
        console.log(`   ⚠️  Failed, retrying in ${RETRY_DELAY / 1000}s...`);
        sleep(RETRY_DELAY);
        killProcesses();
        sleep(1000);
      } else {
        return false;
      }
    }
  }
  
  return false;
}

/**
 * Main function
 */
function main() {
  console.log('🧹 Cleaning build artifacts and temporary files...\n');
  
  // Kill processes that might lock files
  killProcesses();
  
  // Give OS time to release file handles
  console.log('⏳ Waiting for file handles to be released...\n');
  sleep(2000);
  
  // Clean each directory
  let allSuccess = true;
  const cleaned = [];
  const failed = [];
  
  for (const { path: dirPath, desc } of DIRECTORIES_TO_CLEAN) {
    const fullPath = path.join(ROOT_DIR, dirPath);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`✅ ${desc.padEnd(20)} (already clean)`);
      continue;
    }
    
    console.log(`🗑️  ${desc.padEnd(20)} (${dirPath})`);
    const success = deleteDirectory(fullPath);
    
    if (success) {
      cleaned.push(dirPath);
      console.log(`   ✅ Deleted successfully`);
    } else {
      failed.push(dirPath);
      allSuccess = false;
      console.log(`   ❌ Failed to delete`);
    }
    console.log();
  }
  
  // Summary
  console.log('=' .repeat(60));
  if (allSuccess) {
    console.log('✅ All artifacts cleaned successfully!');
    if (cleaned.length > 0) {
      console.log(`📁 Cleaned: ${cleaned.join(', ')}`);
    }
    process.exit(0);
  } else {
    console.log('❌ Some artifacts could not be cleaned');
    if (cleaned.length > 0) {
      console.log(`✅ Cleaned: ${cleaned.join(', ')}`);
    }
    if (failed.length > 0) {
      console.log(`❌ Failed: ${failed.join(', ')}`);
      console.log('\n💡 Try these steps:');
      console.log('   1. Close all Electron apps and IDEs');
      console.log('   2. Close file explorers viewing these folders');
      console.log('   3. Wait a few seconds and try again');
      console.log('   4. Restart your computer if the issue persists');
    }
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

