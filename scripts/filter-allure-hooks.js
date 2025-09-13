#!/usr/bin/env node

/**
 * Allure Hook Failure Filter
 * 
 * This script filters out phantom hook failures from Allure results.
 * These failures are caused by a known issue with WebdriverIO and Allure Reporter
 * where the reporter creates "hook:" test results that always fail.
 */

const fs = require('fs');
const path = require('path');

const ALLURE_RESULTS_DIR = 'allure-results';

function filterHookFailures() {
    console.log('🔧 Filtering out phantom hook failures from Allure results...');
    
    if (!fs.existsSync(ALLURE_RESULTS_DIR)) {
        console.log('❌ Allure results directory not found:', ALLURE_RESULTS_DIR);
        return;
    }
    
    const files = fs.readdirSync(ALLURE_RESULTS_DIR);
    const resultFiles = files.filter(file => file.endsWith('-result.json'));
    
    let totalFiles = 0;
    let hookFailuresRemoved = 0;
    let validTests = 0;
    
    resultFiles.forEach(file => {
        const filePath = path.join(ALLURE_RESULTS_DIR, file);
        
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const result = JSON.parse(content);
            
            totalFiles++;
            
            // Check if this is a phantom hook failure
            if (result.name === 'hook:' && result.status === 'failed' && 
                (!result.statusDetails || Object.keys(result.statusDetails).length === 0) &&
                (!result.steps || result.steps.length === 0) &&
                (!result.attachments || result.attachments.length === 0)) {
                
                // This is a phantom hook failure - remove it
                fs.unlinkSync(filePath);
                hookFailuresRemoved++;
                console.log(`🗑️  Removed phantom hook failure: ${file}`);
            } else {
                validTests++;
            }
        } catch (error) {
            console.warn(`⚠️  Error processing file ${file}:`, error.message);
        }
    });
    
    console.log('📊 Filter Results:');
    console.log(`   📁 Total result files processed: ${totalFiles}`);
    console.log(`   🗑️  Phantom hook failures removed: ${hookFailuresRemoved}`);
    console.log(`   ✅ Valid tests remaining: ${validTests}`);
    console.log(`   📈 Success rate: ${((validTests / totalFiles) * 100).toFixed(1)}%`);
    
    if (hookFailuresRemoved > 0) {
        console.log('✅ Successfully filtered out phantom hook failures!');
    } else {
        console.log('ℹ️  No phantom hook failures found.');
    }
}

// Run the filter
filterHookFailures();
