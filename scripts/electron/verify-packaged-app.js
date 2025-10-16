#!/usr/bin/env node

/**
 * Verification script for packaged Electron app
 * This simulates the path resolution logic used in ipc-handlers.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Flock Native - Path Resolution Test\n');
console.log('==========================================\n');

// Simulate Electron app environment
const isPackaged = true;
const appPath = path.join(process.cwd(), 'resources', 'app.asar');
const appRoot = appPath;

console.log('📁 Simulating Packaged Environment:');
console.log('   isPackaged:', isPackaged);
console.log('   appPath:', appPath);
console.log('   appRoot:', appRoot);
console.log('');

// The CLI path we're trying to resolve
const cliRelativePath = 'node_modules/@straiforos/instagramtobluesky/dist/main.js';
console.log('🎯 Target CLI Path:', cliRelativePath);
console.log('');

// Simulate the path resolution logic from ipc-handlers.js (lines 384-424)
console.log('🔧 Path Resolution (following ipc-handlers.js logic):');
console.log('');

const possiblePaths = [];

if (isPackaged) {
  // Option 1: .asar.unpacked next to .asar file
  if (appPath.includes('.asar')) {
    const option1 = path.join(appPath + '.unpacked', cliRelativePath);
    possiblePaths.push(option1);
    console.log('Option 1 (appPath + .unpacked):', option1);
  } else {
    // Option 2: app.asar.unpacked in resources folder
    const option2a = path.join(appPath, '..', 'app.asar.unpacked', cliRelativePath);
    const option2b = path.join(appPath, 'app.asar.unpacked', cliRelativePath);
    possiblePaths.push(option2a, option2b);
    console.log('Option 2a (appPath/../app.asar.unpacked):', option2a);
    console.log('Option 2b (appPath/app.asar.unpacked):', option2b);
  }
  
  // Option 3: Regular path (fallback)
  const option3 = path.join(appRoot, cliRelativePath);
  possiblePaths.push(option3);
  console.log('Option 3 (appRoot):', option3);
}

console.log('');
console.log('🔍 Checking which paths exist:');
console.log('');

let resolvedPath = null;
for (const testPath of possiblePaths) {
  const exists = fs.existsSync(testPath);
  console.log(exists ? '✅' : '❌', testPath);
  
  if (exists && !resolvedPath) {
    resolvedPath = testPath;
  }
}

console.log('');
if (resolvedPath) {
  console.log('✅ RESOLVED PATH:', resolvedPath);
  
  // Try to read the file to verify it's valid
  try {
    const content = fs.readFileSync(resolvedPath, 'utf8');
    const firstLine = content.split('\n')[0];
    console.log('   First line:', firstLine);
    console.log('   File size:', (content.length / 1024).toFixed(2), 'KB');
  } catch (err) {
    console.log('   ⚠️ Could not read file:', err.message);
  }
} else {
  console.log('❌ NO PATH FOUND - CLI will fail to execute!');
  console.log('');
  console.log('Troubleshooting:');
  console.log('  1. Run "node scripts/diagnose-packaged-app.js" to check file structure');
  console.log('  2. Verify asarUnpack in package.json includes @straiforos/instagramtobluesky');
  console.log('  3. Check if resources/app.asar.unpacked exists');
  console.log('  4. Rebuild the app: npm run pack:win:docker');
}

console.log('');
console.log('==========================================');
console.log('');

// Test fork command simulation
console.log('🚀 Simulating Fork Command:');
console.log('');

if (resolvedPath) {
  console.log('Command: fork()');
  console.log('   scriptPath:', resolvedPath);
  console.log('   scriptArgs: []');
  console.log('   options: { cwd, env, silent: true, windowsHide: true }');
  console.log('');
  console.log('✅ This should work if Node.js can execute the script');
} else {
  console.log('❌ Cannot simulate - no valid path found');
}

console.log('');
console.log('✅ Verification Complete');
