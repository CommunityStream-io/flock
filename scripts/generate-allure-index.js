#!/usr/bin/env node

/**
 * Generate Allure Report Index for Multi-Branch GitHub Pages
 * 
 * This script creates a navigation index.html for Allure reports organized by branch and run.
 * It can be used both locally and in CI/CD pipelines.
 * 
 * Usage:
 *   node scripts/generate-allure-index.js --branch main --run-id 1234567 --sha abc1234 --report-dir ./allure-report --output-dir ./reports
 * 
 * Environment Variables:
 *   GITHUB_HEAD_REF - Branch name (for PRs)
 *   GITHUB_REF - Branch reference (for pushes)
 *   GITHUB_RUN_ID - CI run ID
 *   GITHUB_SHA - Commit SHA
 */

const fs = require('fs');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
const options = {};

for (let i = 0; i < args.length; i += 2) {
  const key = args[i].replace('--', '');
  const value = args[i + 1];
  options[key] = value;
}

// Get branch name from environment or arguments
function getBranchName() {
  if (options.branch) return options.branch;
  
  // Try GitHub environment variables
  const headRef = process.env.GITHUB_HEAD_REF;
  const ref = process.env.GITHUB_REF;
  
  if (headRef) return headRef;
  if (ref) return ref.replace('refs/heads/', '');
  
  // Fallback to git command
  try {
    const { execSync } = require('child_process');
    return execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
  } catch (error) {
    return 'unknown';
  }
}

// Get run ID from environment or arguments
function getRunId() {
  return options['run-id'] || process.env.GITHUB_RUN_ID || Date.now().toString();
}

// Get SHA from environment or arguments
function getSha() {
  const sha = options.sha || process.env.GITHUB_SHA;
  return sha ? sha.substring(0, 7) : 'unknown';
}

// Sanitize branch name for URL
function sanitizeBranchName(branchName) {
  return branchName.replace(/[\/\\]/g, '-').replace(/[^a-zA-Z0-9\-_]/g, '');
}

// Generate the main index.html
function generateIndexHtml(branches) {
  const currentDate = new Date().toISOString();
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Flock E2E Test Reports</title>
    <style>
        * { box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            margin: 0; 
            padding: 20px; 
            background: #f8f9fa; 
            line-height: 1.6;
        }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white; 
            padding: 30px; 
            border-radius: 10px; 
            margin-bottom: 30px; 
            text-align: center;
        }
        .header h1 { margin: 0 0 10px 0; font-size: 2.5em; }
        .header p { margin: 0; opacity: 0.9; font-size: 1.1em; }
        .stats { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
            gap: 20px; 
            margin-bottom: 30px; 
        }
        .stat-card { 
            background: white; 
            padding: 20px; 
            border-radius: 8px; 
            box-shadow: 0 2px 4px rgba(0,0,0,0.1); 
            text-align: center;
        }
        .stat-number { font-size: 2em; font-weight: bold; color: #667eea; }
        .stat-label { color: #666; margin-top: 5px; }
        .branch { 
            background: white; 
            margin: 20px 0; 
            padding: 20px; 
            border-radius: 8px; 
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            border-left: 4px solid #28a745;
        }
        .branch h2 { 
            margin: 0 0 15px 0; 
            color: #333; 
            display: flex; 
            align-items: center; 
            gap: 10px;
        }
        .branch-icon { font-size: 1.2em; }
        .runs { display: grid; gap: 10px; }
        .run { 
            padding: 15px; 
            background: #f8f9fa; 
            border-radius: 6px; 
            border: 1px solid #e9ecef;
            transition: all 0.2s ease;
        }
        .run:hover { 
            background: #e9ecef; 
            transform: translateY(-1px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        .run a { 
            text-decoration: none; 
            color: #0366d6; 
            display: block;
        }
        .run a:hover { text-decoration: underline; }
        .run-header { 
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
            margin-bottom: 5px;
        }
        .run-id { font-weight: bold; color: #333; }
        .run-date { color: #666; font-size: 0.9em; }
        .run-sha { 
            font-family: monospace; 
            background: #e9ecef; 
            padding: 2px 6px; 
            border-radius: 3px; 
            font-size: 0.8em;
        }
        .status { 
            display: inline-block; 
            padding: 4px 8px; 
            border-radius: 4px; 
            font-size: 0.8em; 
            font-weight: bold; 
            text-transform: uppercase;
        }
        .status.latest { background: #d4edda; color: #155724; }
        .status.success { background: #d4edda; color: #155724; }
        .status.failure { background: #f8d7da; color: #721c24; }
        .status.pending { background: #fff3cd; color: #856404; }
        .footer { 
            text-align: center; 
            margin-top: 40px; 
            padding: 20px; 
            color: #666; 
            border-top: 1px solid #e9ecef;
        }
        @media (max-width: 768px) {
            .header h1 { font-size: 2em; }
            .stats { grid-template-columns: 1fr; }
            .run-header { flex-direction: column; align-items: flex-start; gap: 5px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Flock E2E Test Reports</h1>
            <p>Comprehensive test execution history across all branches and commits</p>
        </div>
        
        <div class="stats">
            <div class="stat-card">
                <div class="stat-number">${branches.length}</div>
                <div class="stat-label">Branches</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${branches.reduce((total, branch) => total + branch.runs.length, 0)}</div>
                <div class="stat-label">Total Runs</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${branches.filter(branch => branch.runs.some(run => run.isLatest)).length}</div>
                <div class="stat-label">Active Branches</div>
            </div>
        </div>
        
        ${branches.map(branch => `
        <div class="branch">
            <h2>
                <span class="branch-icon">🌿</span>
                ${branch.name}
                ${branch.runs.some(run => run.isLatest) ? '<span class="status latest">Latest</span>' : ''}
            </h2>
            <div class="runs">
                ${branch.runs.map(run => `
                <div class="run">
                    <a href="${branch.sanitizedName}/${run.runId}-${run.sha}/index.html">
                        <div class="run-header">
                            <span class="run-id">Run #${run.runId}</span>
                            <span class="run-date">${run.date}</span>
                        </div>
                        <div class="run-sha">${run.sha}</div>
                    </a>
                </div>
                `).join('')}
            </div>
        </div>
        `).join('')}
        
        <div class="footer">
            <p>Generated on ${currentDate} | <a href="https://github.com/CommunityStream-io/flock">View Source</a></p>
        </div>
    </div>
</body>
</html>`;
}

// Main function
function main() {
  const reportDir = options['report-dir'] || './allure-report';
  const outputDir = options['output-dir'] || './reports';
  const branchName = getBranchName();
  const runId = getRunId();
  const sha = getSha();
  
  console.log(`🔧 Generating Allure index for branch: ${branchName}, run: ${runId}, sha: ${sha}`);
  
  // Create output directory
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Create branch-specific directory
  const sanitizedBranchName = sanitizeBranchName(branchName);
  const branchDir = path.join(outputDir, sanitizedBranchName);
  const runDir = path.join(branchDir, `${runId}-${sha}`);
  
  if (!fs.existsSync(branchDir)) {
    fs.mkdirSync(branchDir, { recursive: true });
  }
  
  if (!fs.existsSync(runDir)) {
    fs.mkdirSync(runDir, { recursive: true });
  }
  
  // Copy Allure report to branch-specific location
  if (fs.existsSync(reportDir)) {
    console.log(`📁 Copying report from ${reportDir} to ${runDir}`);
    const { execSync } = require('child_process');
    execSync(`cp -r ${reportDir}/* ${runDir}/`, { stdio: 'inherit' });
  } else {
    console.log(`⚠️  Report directory ${reportDir} not found, creating placeholder`);
    fs.writeFileSync(path.join(runDir, 'index.html'), '<h1>Report not found</h1>');
  }
  
  // Load existing branches data
  let branches = [];
  const branchesFile = path.join(outputDir, 'branches.json');
  
  if (fs.existsSync(branchesFile)) {
    try {
      branches = JSON.parse(fs.readFileSync(branchesFile, 'utf8'));
    } catch (error) {
      console.log('⚠️  Could not load existing branches data, starting fresh');
    }
  }
  
  // Update or add current branch
  let branchIndex = branches.findIndex(b => b.name === branchName);
  if (branchIndex === -1) {
    branches.push({
      name: branchName,
      sanitizedName: sanitizedBranchName,
      runs: []
    });
    branchIndex = branches.length - 1;
  }
  
  // Add current run
  const currentRun = {
    runId,
    sha,
    date: new Date().toISOString(),
    isLatest: true
  };
  
  // Mark all other runs as not latest
  branches[branchIndex].runs.forEach(run => run.isLatest = false);
  
  // Add current run
  branches[branchIndex].runs.unshift(currentRun);
  
  // Keep only last 10 runs per branch
  branches[branchIndex].runs = branches[branchIndex].runs.slice(0, 10);
  
  // Save branches data
  fs.writeFileSync(branchesFile, JSON.stringify(branches, null, 2));
  
  // Generate index.html
  const indexHtml = generateIndexHtml(branches);
  fs.writeFileSync(path.join(outputDir, 'index.html'), indexHtml);
  
  console.log(`✅ Generated index.html with ${branches.length} branches`);
  console.log(`📊 Total runs: ${branches.reduce((total, branch) => total + branch.runs.length, 0)}`);
  console.log(`🌐 Report available at: ${outputDir}/index.html`);
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { main, generateIndexHtml, getBranchName, getRunId, getSha, sanitizeBranchName };
