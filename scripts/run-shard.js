#!/usr/bin/env node

const { exec } = require('child_process');
const path = require('path');

/**
 * Run a specific shard with parameters
 * Usage: node scripts/run-shard.js --shard=0 --total=4 [options]
 */

// Parse command line arguments
const args = process.argv.slice(2);
const options = {};

args.forEach(arg => {
    if (arg.startsWith('--')) {
        const [key, value] = arg.substring(2).split('=');
        options[key] = value;
    }
});

// Default values
const shardIndex = parseInt(options.shard || '0');
const totalShards = parseInt(options.total || '4');
const headless = options.headless !== 'false';
const debug = options.debug === 'true';
const ci = options.ci === 'true';

console.log(`🚀 Running shard ${shardIndex + 1}/${totalShards}`);
console.log(`📊 Options: headless=${headless}, debug=${debug}, ci=${ci}`);

// Build environment variables
const envVars = {
    SHARD_INDEX: shardIndex,
    SHARD_TOTAL: totalShards,
    HEADLESS: headless ? 'true' : 'false',
    DEBUG_TESTS: debug ? 'true' : 'false',
    CI: ci ? 'true' : 'false'
};

// Create environment variable string
const envString = Object.entries(envVars)
    .map(([key, value]) => `${key}=${value}`)
    .join(' ');

// Use the existing test:e2e approach but with shard environment variables
const command = `concurrently --kill-others --success first "ng serve flock-mirage --configuration=test --port=4200" "wait-on http://localhost:4200 && cross-env ${envString} wdio run wdio.conf.ts"`;

console.log('🔧 Starting Angular dev server and WebdriverIO tests...');
console.log(`📝 Command: ${command}`);

exec(command, { cwd: process.cwd() }, (error, stdout, stderr) => {
    if (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
    
    if (stderr) {
        console.error('❌ Stderr:', stderr);
    }
    
    console.log('✅ Shard completed successfully');
    console.log(stdout);
});
