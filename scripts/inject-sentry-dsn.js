#!/usr/bin/env node

/**
 * Inject Sentry DSN environment variables into built files
 * 
 * This script replaces placeholder strings like ${NATIVE_SENTRY_DSN} with actual
 * environment variable values in the production builds.
 * 
 * Usage: node scripts/inject-sentry-dsn.js
 * 
 * Environment variables:
 * - NATIVE_SENTRY_DSN: DSN for flock-native renderer process
 * - MIRAGE_SENTRY_DSN: DSN for flock-mirage web app
 */

const fs = require('fs');
const path = require('path');

const replacements = [
  {
    name: 'flock-native (renderer)',
    file: 'dist/flock-native/browser/main.js',
    placeholder: '${NATIVE_SENTRY_DSN}',
    envVar: 'NATIVE_SENTRY_DSN'
  },
  {
    name: 'flock-mirage (web)',
    file: 'dist/flock-mirage/browser/main.js',
    placeholder: '${MIRAGE_SENTRY_DSN}',
    envVar: 'MIRAGE_SENTRY_DSN'
  }
];

console.log('🔧 Injecting Sentry DSNs into production builds...\n');

let successCount = 0;
let errorCount = 0;

for (const config of replacements) {
  const filePath = path.join(process.cwd(), config.file);
  const envValue = process.env[config.envVar];
  
  // Check if file exists
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  ${config.name}: File not found - ${config.file}`);
    console.log(`    Skipping (file may not be built yet)\n`);
    continue;
  }
  
  // Check if environment variable is set
  if (!envValue) {
    console.log(`⚠️  ${config.name}: Environment variable ${config.envVar} not set`);
    console.log(`    Using placeholder (Sentry will be disabled)\n`);
    // Don't treat this as an error, just continue
    continue;
  }
  
  try {
    // Read file
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if placeholder exists
    if (!content.includes(config.placeholder)) {
      console.log(`ℹ️  ${config.name}: Placeholder not found in ${config.file}`);
      console.log(`    File may have already been processed or uses different format\n`);
      continue;
    }
    
    // Replace placeholder
    const newContent = content.replace(
      new RegExp(config.placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
      envValue
    );
    
    // Write file
    fs.writeFileSync(filePath, newContent, 'utf8');
    
    console.log(`✅ ${config.name}: Injected ${config.envVar}`);
    console.log(`    File: ${config.file}\n`);
    successCount++;
  } catch (error) {
    console.error(`❌ ${config.name}: Failed to inject DSN`);
    console.error(`    Error: ${error.message}\n`);
    errorCount++;
  }
}

console.log('─'.repeat(60));
console.log(`Summary: ${successCount} successful, ${errorCount} errors`);

if (errorCount > 0) {
  console.error('\n❌ Some DSN injections failed. Build may not work correctly.');
  process.exit(1);
}

console.log('✅ DSN injection complete!\n');

