#!/usr/bin/env node

/**
 * CI Monitoring Script
 * This script helps monitor CI progress when GitHub CLI is not available
 */

const fs = require('fs');
const { execSync } = require('child_process');

console.log('🔍 CI Monitoring Information...\n');

// Get current branch and commit info
try {
  const branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
  const commit = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim().slice(0, 7);
  const remoteUrl = execSync('git config --get remote.origin.url', { encoding: 'utf8' }).trim();
  
  console.log(`📍 Current Branch: ${branch}`);
  console.log(`🔗 Latest Commit: ${commit}`);
  console.log(`🌐 Repository: ${remoteUrl.replace('.git', '')}`);
  
  // Extract repo info for GitHub Actions URL
  const repoMatch = remoteUrl.match(/github\.com[/:]([^/]+)\/(.+?)(?:\.git)?$/);
  if (repoMatch) {
    const [, owner, repo] = repoMatch;
    const actionsUrl = `https://github.com/${owner}/${repo}/actions`;
    console.log(`🎬 GitHub Actions: ${actionsUrl}`);
    console.log(`📊 Branch Actions: ${actionsUrl}?query=branch%3A${encodeURIComponent(branch)}`);
  }
} catch (error) {
  console.log(`❌ Error getting git info: ${error.message}`);
}

// Check if there are any local test results
console.log('\n🔍 Checking for local test artifacts...');

const checkDirectory = (dir, description) => {
  if (fs.existsSync(dir)) {
    const files = fs.readdirSync(dir);
    if (files.length > 0) {
      console.log(`✅ ${description}: ${files.length} files found`);
      return true;
    } else {
      console.log(`⚠️  ${description}: Directory empty`);
      return false;
    }
  } else {
    console.log(`❌ ${description}: Directory not found`);
    return false;
  }
};

const hasAllureResults = checkDirectory('allure-results', 'Allure Results');
const hasLogs = checkDirectory('logs', 'Test Logs');

// Check for metrics artifacts
console.log('\n📊 Test Metrics & Telemetry:');
const metricsDir = 'logs/metrics';
if (fs.existsSync(metricsDir)) {
  const timeoutFiles = fs.readdirSync(metricsDir).filter(f => f.includes('timeout-telemetry'));
  const metricFiles = fs.readdirSync(metricsDir).filter(f => f.includes('test-metrics'));
  
  if (timeoutFiles.length > 0) {
    console.log(`✅ Timeout telemetry files: ${timeoutFiles.length} found`);
  } else {
    console.log(`⚠️  No timeout telemetry files found`);
  }
  
  if (metricFiles.length > 0) {
    console.log(`✅ Test metrics files: ${metricFiles.length} found`);
  } else {
    console.log(`⚠️  No test metrics files found`);
  }
} else {
  console.log('⚠️  Metrics directory not found');
}

// Check Docker setup
console.log('\n🐳 Docker Configuration Status:');
const dockerFiles = ['docker/Dockerfile.test'];
dockerFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} missing`);
  }
});

// Check CI workflow file
if (fs.existsSync('.github/workflows/ci.yml')) {
  console.log(`✅ CI workflow file exists`);
  
  // Check for CI configuration
  try {
    const workflow = fs.readFileSync('.github/workflows/ci.yml', 'utf8');
    const hasLint = workflow.includes('Waterproof feathers');
    const hasUnitTest = workflow.includes('Count the flock');
    const hasDockerBuild = workflow.includes('Build E2E Docker Image');
    const hasSmokeTests = workflow.includes('Quick flight check');
    const hasE2ETests = workflow.includes('Practice the murmuration');
    const hasTimeoutAnalysis = workflow.includes('Analyze Timeout Patterns');
    const hasAllureDeploy = workflow.includes('Deploy Allure Report');
    
    console.log(`   ${hasLint ? '✅' : '❌'} Lint job (Waterproof feathers)`);
    console.log(`   ${hasUnitTest ? '✅' : '❌'} Unit tests (Count the flock)`);
    console.log(`   ${hasDockerBuild ? '✅' : '❌'} Docker build (Build E2E Docker Image)`);
    console.log(`   ${hasSmokeTests ? '✅' : '❌'} Smoke tests (Quick flight check)`);
    console.log(`   ${hasE2ETests ? '✅' : '❌'} E2E tests (Practice the murmuration)`);
    console.log(`   ${hasTimeoutAnalysis ? '✅' : '❌'} Timeout analysis`);
    console.log(`   ${hasAllureDeploy ? '✅' : '❌'} Allure report deployment`);
  } catch (error) {
    console.log(`   ⚠️  Could not read workflow file: ${error.message}`);
  }
} else {
  console.log(`❌ CI workflow file missing`);
}

// Next steps
console.log('\n📋 Monitoring Next Steps:');
console.log('1. 🌐 Visit the GitHub Actions URL above to monitor workflow progress');
console.log('2. ✅ Check "Waterproof feathers (Lint)" job passes');
console.log('3. ✅ Check "Count the flock (Unit Test)" job passes');
console.log('4. 🐳 Wait for "Build E2E Docker Image" to complete');
console.log('5. 💨 Monitor "Quick flight check (Smoke Test)" shards (fast tests first)');
console.log('6. 🧪 Monitor "Practice the murmuration (E2E Test)" shards (full test suite)');
console.log('7. ⏱️  Check "Analyze Timeout Patterns" for performance insights');
console.log('8. 📊 Verify "Deploy Allure Report to GitHub Pages" publishes results');

console.log('\n💡 Expected Workflow Flow:');
console.log('   Lint & Unit Tests → Build Docker → Smoke Tests → E2E Tests → Timeout Analysis → Deploy Report');

console.log('\n🎯 What to Check for Failures:');
console.log('   • Lint errors → Check the "Waterproof feathers" job');
console.log('   • Unit test failures → Check the "Count the flock" job');
console.log('   • Docker build issues → Check the "Build E2E Docker Image" job');
console.log('   • Smoke test failures → Check individual "Quick flight check" shards');
console.log('   • E2E test failures → Check individual "Practice the murmuration" shards');
console.log('   • Timeout issues → Review "Analyze Timeout Patterns" output');
console.log('   • Report deployment → Check "Deploy Allure Report" job');

if (hasAllureResults) {
  console.log('\n✅ Local Allure results found! Generate report with:');
  console.log('   npm run allure:generate && npm run allure:serve');
}