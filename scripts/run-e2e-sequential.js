#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Find all feature files
const featuresDir = path.join(__dirname, '..', 'features');
const featureFiles = [];

function findFeatureFiles(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            findFeatureFiles(filePath);
        } else if (file.endsWith('.feature')) {
            featureFiles.push(filePath);
        }
    }
}

findFeatureFiles(featuresDir);

console.log(`Found ${featureFiles.length} feature files to run sequentially`);

// Run each feature file one at a time
let passed = 0;
let failed = 0;

for (let i = 0; i < featureFiles.length; i++) {
    const featureFile = featureFiles[i];
    const relativePath = path.relative(process.cwd(), featureFile);
    
    console.log(`\n[${i + 1}/${featureFiles.length}] Running: ${relativePath}`);
    
    try {
        const command = `cross-env HEADLESS=true wdio run wdio.conf.ts --spec="${featureFile}"`;
        execSync(command, { 
            stdio: 'inherit',
            cwd: process.cwd()
        });
        console.log(`✅ PASSED: ${relativePath}`);
        passed++;
    } catch (error) {
        console.log(`❌ FAILED: ${relativePath}`);
        failed++;
    }
}

console.log(`\n📊 Sequential Test Results:`);
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(`📁 Total: ${featureFiles.length}`);

process.exit(failed > 0 ? 1 : 0);
