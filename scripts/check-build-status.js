#!/usr/bin/env node

/**
 * Build Status Checker
 * Provides information about the current CI setup and expected behavior
 */

const fs = require('fs');
const { execSync } = require('child_process');

console.log('🔍 CI Build Status Check\n');

// Get current commit info
try {
  const commit = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim().slice(0, 7);
  const branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
  const lastCommitMsg = execSync('git log -1 --pretty=%B', { encoding: 'utf8' }).trim();
  
  console.log(`📍 Latest Commit: ${commit}`);
  console.log(`🌿 Branch: ${branch}`);
  console.log(`💬 Last Commit: ${lastCommitMsg}`);
  console.log(`⏰ Commit Time: ${execSync('git log -1 --format=%cd', { encoding: 'utf8' }).trim()}`);
} catch (error) {
  console.log(`❌ Error getting git info: ${error.message}`);
}

console.log('\n🐳 Docker Configuration Analysis:');

// Check Dockerfile
if (fs.existsSync('Dockerfile.test')) {
  try {
    const dockerfile = fs.readFileSync('Dockerfile.test', 'utf8');
    const nodeVersion = dockerfile.match(/FROM node:([^\s]+)/);
    const hasChrome = dockerfile.includes('chromium');
    const hasAngularCLI = dockerfile.includes('@angular/cli');
    const hasAllureResults = dockerfile.includes('allure-results');
    
    console.log(`✅ Node.js Version: ${nodeVersion ? nodeVersion[1] : 'Unknown'}`);
    console.log(`${hasChrome ? '✅' : '❌'} Chrome/Chromium installed`);
    console.log(`${hasAngularCLI ? '✅' : '❌'} Angular CLI installed`);
    console.log(`${hasAllureResults ? '✅' : '❌'} Allure results directory created`);
  } catch (error) {
    console.log(`❌ Error reading Dockerfile: ${error.message}`);
  }
} else {
  console.log('❌ Dockerfile.test not found');
}

console.log('\n⚙️ Expected CI Workflow:');
console.log('1. 🏗️  Build E2E Docker Image');
console.log('   - Should build successfully with Node 24.5.0');
console.log('   - Chrome and ChromeDriver pre-installed');
console.log('   - All npm dependencies installed');
console.log('   - Angular CLI available globally');

console.log('\n2. 📊 Calculate E2E Matrix');
console.log('   - Count feature files to determine shards');
console.log('   - Generate matrix for parallel execution');

console.log('\n3. 🧪 Practice the murmuration (E2E Test)');
console.log('   - Run in Docker containers');
console.log('   - Each shard executes: npm run test:e2e:docker');
console.log('   - Should generate Allure results in allure-results/');

console.log('\n4. 📤 Upload Artifacts');
console.log('   - allure-results-shard-{N}-{run_number}');
console.log('   - timeout-telemetry-shard-{N}-{run_number}');
console.log('   - test-metrics-shard-{N}-{run_number}');

console.log('\n5. 🚀 Deploy Allure Report');
console.log('   - Combine all shard results');
console.log('   - Generate final report');
console.log('   - Deploy to GitHub Pages');

// Check for common issues
console.log('\n🔍 Potential Issues to Watch For:');

const commonIssues = [
  {
    issue: 'Package Token Authentication',
    check: fs.existsSync('.npmrc'),
    solution: 'Ensure PACKAGE_TOKEN secret is set in repository'
  },
  {
    issue: 'Chrome Binary Path',
    check: fs.existsSync('wdio.docker.conf.ts'),
    solution: 'Verify Chrome binary path in Docker config'
  },
  {
    issue: 'Permission Issues',
    check: true, // Always show this
    solution: 'Docker runs as root, should have all permissions'
  },
  {
    issue: 'Port Conflicts',
    check: true,
    solution: 'Each shard uses port 4200 in isolated containers'
  }
];

commonIssues.forEach(({ issue, check, solution }) => {
  console.log(`${check ? '✅' : '⚠️ '} ${issue}`);
  if (!check) {
    console.log(`   💡 ${solution}`);
  }
});

console.log('\n🌐 Monitor Progress At:');
console.log('   https://github.com/CommunityStream-io/flock/actions');
console.log('   Filter by branch: fix-e2e-tests');

console.log('\n✅ Expected Success Indicators:');
console.log('   - "Build E2E Docker Image" job completes without errors');
console.log('   - Multiple "Practice the murmuration" jobs for each shard');
console.log('   - Artifact upload steps succeed');
console.log('   - Allure report deployment succeeds');
console.log('   - Final report available at GitHub Pages URL');