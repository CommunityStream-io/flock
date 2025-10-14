#!/usr/bin/env node
/**
 * Analyze E2E Feature File Complexity
 * Identifies long-running tests that should be broken down into smaller suites
 */

const fs = require('fs');
const path = require('path');

const FEATURES_DIR = path.join(__dirname, '../features');

function getAllFeatureFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
            getAllFeatureFiles(filePath, fileList);
        } else if (file.endsWith('.feature')) {
            fileList.push(filePath);
        }
    });
    
    return fileList;
}

function analyzeFeatureFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const relativePath = path.relative(process.cwd(), filePath);
    
    // Count scenarios
    const scenarios = (content.match(/^\s*(Scenario|Scenario Outline):/gm) || []).length;
    
    // Count steps (Given, When, Then, And, But)
    const steps = (content.match(/^\s*(Given|When|Then|And|But)\s/gm) || []).length;
    
    // Count examples in scenario outlines
    const exampleBlocks = (content.match(/^\s*Examples:/gm) || []).length;
    const exampleRows = (content.match(/^\s*\|.*\|/gm) || []).length - (exampleBlocks * 2); // Subtract header rows
    
    // Estimate test time (rough heuristic)
    const estimatedSteps = scenarios * 5 + exampleRows * 5; // Average 5 steps per scenario
    const estimatedTimeSeconds = estimatedSteps * 2; // ~2 seconds per step
    
    // Check for tags
    const tags = [...new Set((content.match(/@[\w-]+/g) || []))];
    
    // Check for Background
    const hasBackground = content.includes('Background:');
    
    // File size
    const sizeKB = fs.statSync(filePath).size / 1024;
    
    return {
        path: relativePath,
        scenarios,
        steps,
        exampleRows,
        estimatedTimeSeconds,
        estimatedTimeMinutes: (estimatedTimeSeconds / 60).toFixed(1),
        tags,
        hasBackground,
        sizeKB: sizeKB.toFixed(1),
        complexity: scenarios + (exampleRows / 10) + (steps / 20)
    };
}

console.log('🔍 Analyzing E2E Test Complexity...\n');
console.log('=' .repeat(100));

const featureFiles = getAllFeatureFiles(FEATURES_DIR);
const analyses = featureFiles.map(analyzeFeatureFile);

// Sort by complexity (descending)
analyses.sort((a, b) => b.complexity - a.complexity);

console.log(`\n📊 Found ${analyses.length} feature files\n`);

// Summary stats
const totalScenarios = analyses.reduce((sum, a) => sum + a.scenarios, 0);
const totalSteps = analyses.reduce((sum, a) => sum + a.steps, 0);
const totalExamples = analyses.reduce((sum, a) => sum + a.exampleRows, 0);
const totalEstimatedMinutes = analyses.reduce((sum, a) => sum + parseFloat(a.estimatedTimeMinutes), 0);

console.log('📈 Overall Statistics:');
console.log(`   Total Scenarios: ${totalScenarios}`);
console.log(`   Total Steps: ${totalSteps}`);
console.log(`   Total Example Rows: ${totalExamples}`);
console.log(`   Estimated Total Time: ${totalEstimatedMinutes.toFixed(1)} minutes`);
console.log('');

// Top 10 most complex
console.log('\n🔴 TOP 10 MOST COMPLEX TESTS (Break these down!)');
console.log('=' .repeat(100));
console.log(`${'File'.padEnd(60)} ${'Scenarios'.padStart(9)} ${'Steps'.padStart(7)} ${'Examples'.padStart(9)} ${'Est. Time'.padStart(10)}`);
console.log('-'.repeat(100));

analyses.slice(0, 10).forEach(a => {
    const file = a.path.length > 58 ? '...' + a.path.slice(-55) : a.path;
    console.log(
        `${file.padEnd(60)} ` +
        `${a.scenarios.toString().padStart(9)} ` +
        `${a.steps.toString().padStart(7)} ` +
        `${a.exampleRows.toString().padStart(9)} ` +
        `${(a.estimatedTimeMinutes + ' min').padStart(10)}`
    );
});

// Group by category
console.log('\n\n📁 BY CATEGORY:');
console.log('=' .repeat(100));

const categories = {};
analyses.forEach(a => {
    const category = a.path.split(/[/\\]/)[1] || 'root';
    if (!categories[category]) {
        categories[category] = {
            files: 0,
            scenarios: 0,
            steps: 0,
            estimatedMinutes: 0
        };
    }
    categories[category].files++;
    categories[category].scenarios += a.scenarios;
    categories[category].steps += a.steps;
    categories[category].estimatedMinutes += parseFloat(a.estimatedTimeMinutes);
});

Object.entries(categories)
    .sort((a, b) => b[1].estimatedMinutes - a[1].estimatedMinutes)
    .forEach(([cat, stats]) => {
        console.log(`\n📂 ${cat}/`);
        console.log(`   Files: ${stats.files} | Scenarios: ${stats.scenarios} | Steps: ${stats.steps} | Est. Time: ${stats.estimatedMinutes.toFixed(1)} min`);
    });

// Recommendations
console.log('\n\n💡 RECOMMENDATIONS:');
console.log('=' .repeat(100));

const longTests = analyses.filter(a => parseFloat(a.estimatedTimeMinutes) > 5);
const manyScenarios = analyses.filter(a => a.scenarios > 10);
const largeFiles = analyses.filter(a => a.sizeKB > 10);

if (longTests.length > 0) {
    console.log(`\n⏰ ${longTests.length} tests estimated to take > 5 minutes:`);
    longTests.forEach(a => {
        console.log(`   - ${a.path} (${a.estimatedTimeMinutes} min, ${a.scenarios} scenarios)`);
    });
    console.log('\n   💡 Consider breaking these into smaller test suites or using @smoke tags');
}

if (manyScenarios.length > 0) {
    console.log(`\n📝 ${manyScenarios.length} files with > 10 scenarios:`);
    manyScenarios.forEach(a => {
        console.log(`   - ${a.path} (${a.scenarios} scenarios)`);
    });
    console.log('\n   💡 Split into multiple feature files by theme (e.g., happy-path, error-handling, edge-cases)');
}

if (largeFiles.length > 0) {
    console.log(`\n📄 ${largeFiles.length} large files (> 10 KB):`);
    largeFiles.forEach(a => {
        console.log(`   - ${a.path} (${a.sizeKB} KB, ${a.scenarios} scenarios)`);
    });
    console.log('\n   💡 Large files are harder to maintain - consider splitting by functionality');
}

// Tagging suggestions
console.log('\n\n🏷️  TAGGING STRATEGY:');
console.log('=' .repeat(100));

const allTags = new Set();
analyses.forEach(a => a.tags.forEach(t => allTags.add(t)));

console.log(`\nCurrently using ${allTags.size} unique tags:`);
console.log([...allTags].sort().join(', '));

console.log('\n💡 Suggested test suite split:');
console.log('   @smoke       - Critical path tests (< 5 min total)');
console.log('   @regression  - Full test suite');
console.log('   @slow        - Tests > 30 seconds');
console.log('   @parallel    - Tests safe to run in parallel');
console.log('   @serial      - Tests that must run sequentially');
console.log('   @auth        - Authentication tests');
console.log('   @upload      - File upload tests');
console.log('   @config      - Configuration tests');
console.log('   @ui          - UI interaction tests');
console.log('   @api         - API/CLI integration tests');

console.log('\n\n✅ Analysis complete!');
console.log('=' .repeat(100));

