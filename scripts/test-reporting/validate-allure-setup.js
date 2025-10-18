#!/usr/bin/env node

/**
 * Allure Setup Validation Script
 * This script validates that WebdriverIO is properly configured to generate Allure results
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Validating Allure Setup for WebdriverIO...\n');

// Check if wdio config files exist
const configFiles = ['wdio.conf.ts', 'wdio.docker.conf.ts'];
const missingConfigs = [];

configFiles.forEach(configFile => {
  if (fs.existsSync(configFile)) {
    console.log(`✅ ${configFile} exists`);
    
    // Read and check for Allure reporter
    try {
      const content = fs.readFileSync(configFile, 'utf8');
      if (content.includes("'allure'") || content.includes('"allure"')) {
        console.log(`   ✅ Allure reporter configured in ${configFile}`);
      } else {
        console.log(`   ❌ Allure reporter NOT found in ${configFile}`);
      }
      
      if (content.includes('outputDir')) {
        const outputDirMatch = content.match(/outputDir:\s*['"](.*?)['"]/);
        if (outputDirMatch) {
          console.log(`   ✅ Output directory: ${outputDirMatch[1]}`);
        }
      }
    } catch (error) {
      console.log(`   ⚠️  Could not read ${configFile}: ${error.message}`);
    }
  } else {
    missingConfigs.push(configFile);
    console.log(`❌ ${configFile} is missing`);
  }
});

// Check if allure-results directory exists
const allureResultsDir = 'allure-results';
if (fs.existsSync(allureResultsDir)) {
  console.log(`\n✅ ${allureResultsDir} directory exists`);
  
  const files = fs.readdirSync(allureResultsDir);
  if (files.length > 0) {
    console.log(`   📊 Contains ${files.length} files:`);
    files.slice(0, 5).forEach(file => {
      console.log(`      - ${file}`);
    });
    if (files.length > 5) {
      console.log(`      ... and ${files.length - 5} more files`);
    }
  } else {
    console.log(`   ⚠️  Directory is empty`);
  }
} else {
  console.log(`\n⚠️  ${allureResultsDir} directory does not exist`);
  console.log(`   This is normal if tests haven't run yet.`);
}

// Check package.json for Allure dependencies
console.log('\n🔍 Checking dependencies...');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const allureDeps = Object.keys(packageJson.devDependencies || {}).filter(dep => 
    dep.includes('allure')
  );
  
  if (allureDeps.length > 0) {
    console.log('✅ Allure dependencies found:');
    allureDeps.forEach(dep => {
      console.log(`   - ${dep}: ${packageJson.devDependencies[dep]}`);
    });
  } else {
    console.log('❌ No Allure dependencies found');
  }
} catch (error) {
  console.log(`❌ Could not read package.json: ${error.message}`);
}

// Check environment variables that might affect Allure
console.log('\n🔍 Environment variables affecting Allure:');
const relevantEnvVars = ['SKIP_ALLURE_REPORTER', 'CI', 'HEADLESS'];
relevantEnvVars.forEach(envVar => {
  const value = process.env[envVar];
  if (value !== undefined) {
    console.log(`   ${envVar}=${value}`);
    
    if (envVar === 'SKIP_ALLURE_REPORTER' && value === 'true') {
      console.log('   ⚠️  SKIP_ALLURE_REPORTER is set to true - Allure will be disabled!');
    }
  }
});

// Check if Docker files exist
console.log('\n🔍 Checking Docker configuration...');
const dockerFiles = ['docker/Dockerfile.test', 'wdio.docker.conf.ts'];
dockerFiles.forEach(dockerFile => {
  if (fs.existsSync(dockerFile)) {
    console.log(`✅ ${dockerFile} exists`);
  } else {
    console.log(`❌ ${dockerFile} is missing`);
  }
});

// Summary
console.log('\n📋 SUMMARY:');
if (missingConfigs.length === 0) {
  console.log('✅ All WebdriverIO config files are present');
} else {
  console.log(`❌ Missing config files: ${missingConfigs.join(', ')}`);
}

console.log('\n💡 To generate Allure results:');
console.log('   1. Run tests: npm run test:e2e:docker (or test:e2e:shard)');
console.log('   2. Results will be in: allure-results/');
console.log('   3. Generate report: npm run allure:generate');
console.log('   4. View report: npm run allure:serve');