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

// Check Docker setup
console.log('\n🐳 Docker Configuration Status:');
const dockerFiles = ['docker/Dockerfile.test', 'wdio.docker.conf.ts'];
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
  
  // Check for Docker-related configuration
  try {
    const workflow = fs.readFileSync('.github/workflows/ci.yml', 'utf8');
    const hasDockerBuild = workflow.includes('build-e2e-image');
    const hasContainerJobs = workflow.includes('container:');
    const hasAllureUpload = workflow.includes('allure-results');
    
    console.log(`   ${hasDockerBuild ? '✅' : '❌'} Docker build job configured`);
    console.log(`   ${hasContainerJobs ? '✅' : '❌'} Container-based execution`);
    console.log(`   ${hasAllureUpload ? '✅' : '❌'} Allure artifact upload`);
  } catch (error) {
    console.log(`   ⚠️  Could not read workflow file: ${error.message}`);
  }
} else {
  console.log(`❌ CI workflow file missing`);
}

// Next steps
console.log('\n📋 Monitoring Next Steps:');
console.log('1. 🌐 Visit the GitHub Actions URL above to monitor workflow progress');
console.log('2. 🔄 Look for "Build E2E Docker Image" job to complete successfully');
console.log('3. 🧪 Monitor "Practice the murmuration (E2E Test)" jobs for each shard');
console.log('4. 📊 Check for "Upload Allure results as artifact" steps');
console.log('5. 🚀 Verify "Deploy Allure Report to GitHub Pages" job');

console.log('\n💡 Expected Workflow Flow:');
console.log('   Build Docker → Matrix E2E Tests → Upload Artifacts → Deploy Report');

if (hasAllureResults) {
  console.log('\n✅ Local Allure results found! Generate report with:');
  console.log('   npm run allure:generate && npm run allure:serve');
}