#!/usr/bin/env node

/**
 * Test the Allure Hook Filter
 * 
 * This script tests the hook filter by running it on the current Allure results
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Allure Hook Filter...');

// Check if allure-results directory exists
if (!fs.existsSync('allure-results')) {
    console.log('❌ No allure-results directory found. Run tests first.');
    process.exit(1);
}

// Count files before filtering
const filesBefore = fs.readdirSync('allure-results').filter(f => f.endsWith('-result.json'));
const hookFailuresBefore = filesBefore.filter(file => {
    try {
        const content = fs.readFileSync(path.join('allure-results', file), 'utf8');
        const result = JSON.parse(content);
        return result.name === 'hook:' && result.status === 'failed';
    } catch (error) {
        return false;
    }
});

console.log(`📊 Before filtering:`);
console.log(`   📁 Total result files: ${filesBefore.length}`);
console.log(`   🗑️  Hook failures: ${hookFailuresBefore.length}`);

// Run the filter
try {
    execSync('node scripts/test-reporting/filter-allure-hooks.js', { stdio: 'inherit' });
    
    // Count files after filtering
    const filesAfter = fs.readdirSync('allure-results').filter(f => f.endsWith('-result.json'));
    const hookFailuresAfter = filesAfter.filter(file => {
        try {
            const content = fs.readFileSync(path.join('allure-results', file), 'utf8');
            const result = JSON.parse(content);
            return result.name === 'hook:' && result.status === 'failed';
        } catch (error) {
            return false;
        }
    });
    
    console.log(`\n📊 After filtering:`);
    console.log(`   📁 Total result files: ${filesAfter.length}`);
    console.log(`   🗑️  Hook failures: ${hookFailuresAfter.length}`);
    console.log(`   ✅ Files removed: ${filesBefore.length - filesAfter.length}`);
    
    if (hookFailuresAfter.length === 0) {
        console.log('✅ Success! All hook failures have been filtered out.');
    } else {
        console.log('⚠️  Some hook failures remain. Check the filter logic.');
    }
    
} catch (error) {
    console.error('❌ Error running hook filter:', error.message);
    process.exit(1);
}
