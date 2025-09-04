#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Setup script for E2E test sharding
 * 
 * This script sets up the sharding infrastructure and creates initial configurations.
 */

console.log('🚀 Setting up E2E test sharding...\n');

// Ensure scripts directory exists
const scriptsDir = path.join(__dirname);
if (!fs.existsSync(scriptsDir)) {
    fs.mkdirSync(scriptsDir, { recursive: true });
    console.log('📁 Created scripts directory');
}

// Ensure shard-results directory exists
const shardResultsDir = path.join(__dirname, '..', 'shard-results');
if (!fs.existsSync(shardResultsDir)) {
    fs.mkdirSync(shardResultsDir, { recursive: true });
    console.log('📁 Created shard-results directory');
}

// Make shard-tests.js executable
const shardTestsPath = path.join(scriptsDir, 'shard-tests.js');
if (fs.existsSync(shardTestsPath)) {
    try {
        fs.chmodSync(shardTestsPath, '755');
        console.log('🔧 Made shard-tests.js executable');
    } catch (error) {
        console.log('⚠️  Could not make shard-tests.js executable (this is OK on Windows)');
    }
}

// Create initial shard configurations
console.log('\n📊 Creating initial shard configurations...');
try {
    execSync('node scripts/shard-tests.js create 4 domain-based', { 
        stdio: 'inherit',
        cwd: path.join(__dirname, '..')
    });
    console.log('✅ Shard configurations created successfully');
} catch (error) {
    console.error('❌ Failed to create shard configurations:', error.message);
    process.exit(1);
}

// Display shard information
console.log('\n📋 Shard Distribution:');
const shardFiles = fs.readdirSync(shardResultsDir).filter(file => file.endsWith('.json'));
shardFiles.forEach(file => {
    const shardPath = path.join(shardResultsDir, file);
    const shardInfo = JSON.parse(fs.readFileSync(shardPath, 'utf8'));
    console.log(`  ${file.replace('.json', '')}: ${shardInfo.fileCount} files`);
    shardInfo.files.forEach(filePath => {
        const relativePath = path.relative(path.join(__dirname, '..', 'features'), filePath);
        console.log(`    - ${relativePath}`);
    });
});

// Display available commands
console.log('\n🎯 Available Commands:');
console.log('  npm run test:e2e:sharded:parallel    # Run all shards in parallel');
console.log('  npm run test:e2e:sharded             # Run all shards sequentially');
console.log('  npm run test:e2e:shard:1             # Run shard 1 only');
console.log('  npm run test:e2e:shard:2             # Run shard 2 only');
console.log('  npm run test:e2e:shard:3             # Run shard 3 only');
console.log('  npm run test:e2e:shard:4             # Run shard 4 only');
console.log('  npm run test:e2e:shard:create        # Recreate shard configurations');

console.log('\n🔧 Advanced Commands:');
console.log('  node scripts/shard-tests.js create 6 domain-based  # Create 6 shards');
console.log('  node scripts/shard-tests.js run 0 4 --headless     # Run shard 0 of 4');
console.log('  node scripts/shard-tests.js run-all 4 --headless   # Run all 4 shards');

console.log('\n📚 Documentation:');
console.log('  See docs/testing/E2E_SHARDING.md for detailed information');

console.log('\n✅ Sharding setup complete!');
console.log('💡 Tip: Start with "npm run test:e2e:sharded:parallel" to see the speed improvement');
