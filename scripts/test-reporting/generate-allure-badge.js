#!/usr/bin/env node

/**
 * Allure Badge Generator
 * 
 * This script generates a badge showing E2E test success percentage
 * that links to the Allure report at https://communitystream-io.github.io/flock/
 */

const fs = require('fs');
const path = require('path');

const ALLURE_RESULTS_DIR = 'allure-results';
const BADGE_OUTPUT_DIR = 'badges';

function generateBadgeData() {
    console.log('🎨 Generating Allure badge data...');
    
    if (!fs.existsSync(ALLURE_RESULTS_DIR)) {
        console.log('❌ No Allure results found. Run tests first!');
        return null;
    }
    
    // Count test results
    const resultFiles = fs.readdirSync(ALLURE_RESULTS_DIR)
        .filter(file => file.endsWith('-result.json'));
    
    let totalTests = 0;
    let passedTests = 0;
    let failedTests = 0;
    let skippedTests = 0;
    
    resultFiles.forEach(file => {
        try {
            const content = fs.readFileSync(path.join(ALLURE_RESULTS_DIR, file), 'utf8');
            const result = JSON.parse(content);
            
            // Skip hook failures
            if (result.name === 'hook:' && result.status === 'failed') {
                return;
            }
            
            totalTests++;
            
            switch (result.status) {
                case 'passed':
                    passedTests++;
                    break;
                case 'failed':
                    failedTests++;
                    break;
                case 'skipped':
                    skippedTests++;
                    break;
            }
        } catch (error) {
            console.warn(`⚠️  Error processing file ${file}:`, error.message);
        }
    });
    
    const successRate = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;
    
    return {
        totalTests,
        passedTests,
        failedTests,
        skippedTests,
        successRate,
        timestamp: new Date().toISOString()
    };
}

function generateShieldsBadge(data) {
    if (!data) return null;
    
    const { successRate, totalTests, passedTests, failedTests } = data;
    
    // Determine badge color based on success rate
    let color = 'red';
    if (successRate >= 90) color = 'green';
    else if (successRate >= 80) color = 'yellow';
    else if (successRate >= 70) color = 'orange';
    
    // Generate shields.io badge URL
    const badgeUrl = `https://img.shields.io/badge/E2E%20Tests-${successRate}%25%20(${passedTests}/${totalTests})-${color}?style=flat-square&logo=allure&logoColor=white`;
    
    return {
        url: badgeUrl,
        markdown: `[![E2E Tests](${badgeUrl})](https://communitystream-io.github.io/flock/)`,
        html: `<a href="https://communitystream-io.github.io/flock/"><img src="${badgeUrl}" alt="E2E Tests"></a>`
    };
}

function generateCustomBadge(data) {
    if (!data) return null;
    
    const { successRate, totalTests, passedTests, failedTests, timestamp } = data;
    
    // Create SVG badge
    const width = 200;
    const height = 20;
    const padding = 4;
    const textColor = '#ffffff';
    const backgroundColor = successRate >= 90 ? '#4caf50' : successRate >= 80 ? '#ff9800' : '#f44336';
    
    const svg = `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${width}" height="${height}" fill="${backgroundColor}" rx="3"/>
  <text x="${padding + 10}" y="${height - padding - 2}" font-family="Arial, sans-serif" font-size="11" fill="${textColor}">
    E2E Tests: ${successRate}% (${passedTests}/${totalTests})
  </text>
</svg>`.trim();
    
    return {
        svg,
        markdown: `[![E2E Tests](data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')})](https://communitystream-io.github.io/flock/)`,
        html: `<a href="https://communitystream-io.github.io/flock/"><img src="data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}" alt="E2E Tests"></a>`
    };
}

function saveBadgeFiles(badgeData) {
    if (!badgeData) return;
    
    // Ensure output directory exists
    if (!fs.existsSync(BADGE_OUTPUT_DIR)) {
        fs.mkdirSync(BADGE_OUTPUT_DIR, { recursive: true });
    }
    
    // Save shields.io badge
    const shieldsBadge = generateShieldsBadge(badgeData);
    if (shieldsBadge) {
        fs.writeFileSync(
            path.join(BADGE_OUTPUT_DIR, 'allure-badge-shields.json'),
            JSON.stringify(shieldsBadge, null, 2)
        );
        
        fs.writeFileSync(
            path.join(BADGE_OUTPUT_DIR, 'allure-badge-shields.md'),
            shieldsBadge.markdown
        );
        
        fs.writeFileSync(
            path.join(BADGE_OUTPUT_DIR, 'allure-badge-shields.html'),
            shieldsBadge.html
        );
    }
    
    // Save custom SVG badge
    const customBadge = generateCustomBadge(badgeData);
    if (customBadge) {
        fs.writeFileSync(
            path.join(BADGE_OUTPUT_DIR, 'allure-badge.svg'),
            customBadge.svg
        );
        
        fs.writeFileSync(
            path.join(BADGE_OUTPUT_DIR, 'allure-badge.md'),
            customBadge.markdown
        );
        
        fs.writeFileSync(
            path.join(BADGE_OUTPUT_DIR, 'allure-badge.html'),
            customBadge.html
        );
    }
    
    console.log('✅ Badge files generated in badges/ directory');
}

function main() {
    console.log('🎨 Allure Badge Generator');
    console.log('========================\n');
    
    const data = generateBadgeData();
    if (!data) {
        process.exit(1);
    }
    
    console.log('📊 Test Results:');
    console.log(`   Total Tests: ${data.totalTests}`);
    console.log(`   Passed: ${data.passedTests}`);
    console.log(`   Failed: ${data.failedTests}`);
    console.log(`   Skipped: ${data.skippedTests}`);
    console.log(`   Success Rate: ${data.successRate}%\n`);
    
    saveBadgeFiles(data);
    
    // Display badge options
    const shieldsBadge = generateShieldsBadge(data);
    const customBadge = generateCustomBadge(data);
    
    console.log('🎯 Badge Options:');
    console.log('================\n');
    
    if (shieldsBadge) {
        console.log('1. Shields.io Badge (Recommended):');
        console.log(`   ${shieldsBadge.markdown}\n`);
    }
    
    if (customBadge) {
        console.log('2. Custom SVG Badge:');
        console.log(`   ${customBadge.markdown}\n`);
    }
    
    console.log('📁 Files generated:');
    console.log('   - badges/allure-badge-shields.json');
    console.log('   - badges/allure-badge-shields.md');
    console.log('   - badges/allure-badge-shields.html');
    console.log('   - badges/allure-badge.svg');
    console.log('   - badges/allure-badge.md');
    console.log('   - badges/allure-badge.html');
    console.log('\n🌐 Allure Report: https://communitystream-io.github.io/flock/');
}

if (require.main === module) {
    main();
}

module.exports = { generateBadgeData, generateShieldsBadge, generateCustomBadge };
