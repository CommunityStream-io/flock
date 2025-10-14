#!/usr/bin/env node

/**
 * Verify Sentry Setup
 * 
 * This script checks if your Sentry configuration is correct and all
 * necessary environment variables are set.
 * 
 * Usage: node scripts/verify-sentry-setup.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Sentry Setup...\n');

const checks = {
  passed: [],
  warnings: [],
  failed: []
};

// Check 1: Environment files exist
console.log('1️⃣ Checking environment files...');
const envFiles = [
  'projects/flock-native/src/environments/environment.ts',
  'projects/flock-native/src/environments/environment.prod.ts',
  'projects/flock-native/src/environments/environment.interface.ts',
  'projects/flock-mirage/src/environments/environment.ts',
  'projects/flock-mirage/src/environments/environment.prod.ts',
  'projects/flock-mirage/src/environments/environment.interface.ts'
];

let allEnvFilesExist = true;
for (const file of envFiles) {
  const filePath = path.join(process.cwd(), file);
  if (!fs.existsSync(filePath)) {
    checks.failed.push(`Environment file missing: ${file}`);
    allEnvFilesExist = false;
  }
}

if (allEnvFilesExist) {
  checks.passed.push('All environment files exist');
}

// Check 2: Production environment files have placeholders
console.log('2️⃣ Checking production environment placeholders...');

const prodEnvFiles = [
  {
    file: 'projects/flock-native/src/environments/environment.prod.ts',
    placeholder: '${NATIVE_SENTRY_DSN}'
  },
  {
    file: 'projects/flock-mirage/src/environments/environment.prod.ts',
    placeholder: '${MIRAGE_SENTRY_DSN}'
  }
];

for (const {file, placeholder} of prodEnvFiles) {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    if (content.includes(placeholder)) {
      checks.passed.push(`Production env has placeholder: ${file}`);
    } else {
      checks.warnings.push(`Production env missing placeholder ${placeholder}: ${file}`);
    }
  }
}

// Check 3: Package.json has asarUnpack for Sentry
console.log('3️⃣ Checking package.json configuration...');

const packageJsonPath = path.join(process.cwd(), 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  if (packageJson.build && packageJson.build.asarUnpack) {
    const hasSentryUnpack = packageJson.build.asarUnpack.some(pattern => 
      pattern.includes('@sentry')
    );
    
    if (hasSentryUnpack) {
      checks.passed.push('package.json has @sentry in asarUnpack');
    } else {
      checks.failed.push('package.json missing @sentry in asarUnpack array');
    }
  } else {
    checks.failed.push('package.json missing build.asarUnpack configuration');
  }
  
  // Check for @sentry/cli
  if (packageJson.devDependencies && packageJson.devDependencies['@sentry/cli']) {
    checks.passed.push('@sentry/cli installed in devDependencies');
  } else {
    checks.warnings.push('@sentry/cli not found in devDependencies (needed for source map uploads)');
  }
  
  // Check for sentry upload scripts
  if (packageJson.scripts) {
    if (packageJson.scripts['sentry:upload:all']) {
      checks.passed.push('Source map upload scripts configured');
    } else {
      checks.warnings.push('Source map upload scripts not configured');
    }
  }
}

// Check 4: Angular.json has source maps and file replacements
console.log('4️⃣ Checking angular.json configuration...');

const angularJsonPath = path.join(process.cwd(), 'angular.json');
if (fs.existsSync(angularJsonPath)) {
  const angularJson = JSON.parse(fs.readFileSync(angularJsonPath, 'utf8'));
  
  // Check flock-native
  const nativeConfig = angularJson.projects?.['flock-native']?.architect?.build?.configurations?.production;
  if (nativeConfig) {
    if (nativeConfig.sourceMap && nativeConfig.sourceMap.scripts) {
      checks.passed.push('flock-native has source maps enabled');
    } else {
      checks.warnings.push('flock-native missing source map configuration');
    }
    
    if (nativeConfig.fileReplacements && nativeConfig.fileReplacements.length > 0) {
      checks.passed.push('flock-native has file replacements configured');
    } else {
      checks.warnings.push('flock-native missing file replacements');
    }
  }
  
  // Check flock-mirage
  const mirageConfig = angularJson.projects?.['flock-mirage']?.architect?.build?.configurations?.production;
  if (mirageConfig) {
    if (mirageConfig.sourceMap && mirageConfig.sourceMap.scripts) {
      checks.passed.push('flock-mirage has source maps enabled');
    } else {
      checks.warnings.push('flock-mirage missing source map configuration');
    }
    
    if (mirageConfig.fileReplacements && mirageConfig.fileReplacements.length > 0) {
      checks.passed.push('flock-mirage has file replacements configured');
    } else {
      checks.warnings.push('flock-mirage missing file replacements');
    }
  }
}

// Check 5: Injection script exists
console.log('5️⃣ Checking DSN injection script...');

const injectionScriptPath = path.join(process.cwd(), 'scripts/inject-sentry-dsn.js');
if (fs.existsSync(injectionScriptPath)) {
  checks.passed.push('DSN injection script exists');
} else {
  checks.failed.push('DSN injection script not found: scripts/inject-sentry-dsn.js');
}

// Check 6: Environment variables (for local dev)
console.log('6️⃣ Checking environment variables...');

const envVars = {
  'NATIVE_SENTRY_DSN': 'For flock-native renderer (optional in dev)',
  'NATIVE_SENTRY_DSN_MAIN': 'For Electron main process (optional in dev)',
  'MIRAGE_SENTRY_DSN': 'For flock-mirage web app (optional in dev)',
  'SENTRY_AUTH_TOKEN': 'For source map uploads (optional, only needed for uploads)',
  'SENTRY_ORG': 'Your Sentry organization (optional, only needed for uploads)'
};

let hasAnyDsn = false;
for (const [varName, description] of Object.entries(envVars)) {
  if (process.env[varName]) {
    checks.passed.push(`Environment variable set: ${varName}`);
    hasAnyDsn = true;
  } else {
    // Only warning for DSNs, not required for local dev
    if (varName.includes('DSN') && !varName.includes('AUTH')) {
      checks.warnings.push(`${varName} not set - ${description}`);
    }
  }
}

if (!hasAnyDsn) {
  checks.warnings.push('No Sentry DSN environment variables set (dev DSNs from code will be used)');
}

// Print results
console.log('\n' + '='.repeat(60));
console.log('📊 Verification Results\n');

if (checks.passed.length > 0) {
  console.log('✅ Passed Checks:');
  checks.passed.forEach(msg => console.log(`   ✓ ${msg}`));
  console.log('');
}

if (checks.warnings.length > 0) {
  console.log('⚠️  Warnings:');
  checks.warnings.forEach(msg => console.log(`   • ${msg}`));
  console.log('');
}

if (checks.failed.length > 0) {
  console.log('❌ Failed Checks:');
  checks.failed.forEach(msg => console.log(`   ✗ ${msg}`));
  console.log('');
}

console.log('='.repeat(60));
console.log(`\nSummary: ${checks.passed.length} passed, ${checks.warnings.length} warnings, ${checks.failed.length} failed\n`);

if (checks.failed.length > 0) {
  console.error('❌ Setup verification failed. Please fix the issues above.\n');
  process.exit(1);
} else if (checks.warnings.length > 0) {
  console.log('⚠️  Setup is functional but has warnings. Review the warnings above.\n');
  console.log('💡 Tip: Set environment variables or GitHub Secrets for production builds.\n');
} else {
  console.log('✅ Sentry setup is complete and properly configured!\n');
}

console.log('📚 For more information, see docs/SENTRY_SETUP.md\n');

