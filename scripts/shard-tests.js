#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Test Sharding Utility
 * 
 * This script distributes feature files across multiple shards for parallel execution.
 * It supports both file-based and scenario-based sharding strategies.
 */

class TestSharder {
    constructor() {
        this.featuresDir = path.join(__dirname, '..', 'features');
        this.outputDir = path.join(__dirname, '..', 'shard-results');
    }

    /**
     * Get all feature files from the features directory
     */
    getAllFeatureFiles() {
        const featureFiles = [];
        
        const scanDirectory = (dir) => {
            const items = fs.readdirSync(dir);
            
            for (const item of items) {
                const fullPath = path.join(dir, item);
                const stat = fs.statSync(fullPath);
                
                if (stat.isDirectory()) {
                    scanDirectory(fullPath);
                } else if (item.endsWith('.feature')) {
                    featureFiles.push(fullPath);
                }
            }
        };
        
        scanDirectory(this.featuresDir);
        return featureFiles;
    }

    /**
     * Distribute feature files across shards
     * @param {number} totalShards - Total number of shards
     * @param {string} strategy - 'round-robin' or 'domain-based'
     */
    distributeFeatures(totalShards, strategy = 'domain-based') {
        const featureFiles = this.getAllFeatureFiles();
        const shards = Array.from({ length: totalShards }, () => []);
        
        if (strategy === 'domain-based') {
            // Group features by domain (directory)
            const domainGroups = {};
            featureFiles.forEach(file => {
                const relativePath = path.relative(this.featuresDir, file);
                const domain = path.dirname(relativePath);
                if (!domainGroups[domain]) {
                    domainGroups[domain] = [];
                }
                domainGroups[domain].push(file);
            });
            
            // Distribute domain groups across shards
            const domains = Object.keys(domainGroups);
            domains.forEach((domain, index) => {
                const shardIndex = index % totalShards;
                shards[shardIndex].push(...domainGroups[domain]);
            });
        } else {
            // Round-robin distribution
            featureFiles.forEach((file, index) => {
                const shardIndex = index % totalShards;
                shards[shardIndex].push(file);
            });
        }
        
        return shards;
    }

    /**
     * Create shard configuration files
     */
    createShardConfigs(totalShards, strategy = 'domain-based') {
        const shards = this.distributeFeatures(totalShards, strategy);
        
        // Ensure output directory exists
        if (!fs.existsSync(this.outputDir)) {
            fs.mkdirSync(this.outputDir, { recursive: true });
        }
        
        const shardConfigs = [];
        
        shards.forEach((files, index) => {
            if (files.length === 0) return;
            
            const shardConfig = {
                shardIndex: index,
                totalShards: totalShards,
                files: files,
                fileCount: files.length,
                // Create relative paths for WebdriverIO
                specs: files.map(file => path.relative(process.cwd(), file))
            };
            
            // Write shard info to file
            const shardInfoPath = path.join(this.outputDir, `shard-${index + 1}.json`);
            fs.writeFileSync(shardInfoPath, JSON.stringify(shardConfig, null, 2));
            
            shardConfigs.push(shardConfig);
            
            console.log(`Shard ${index + 1}/${totalShards}: ${files.length} files`);
            files.forEach(file => {
                const relativePath = path.relative(this.featuresDir, file);
                console.log(`  - ${relativePath}`);
            });
        });
        
        return shardConfigs;
    }

    /**
     * Generate package.json scripts for sharding
     */
    generateShardScripts(totalShards) {
        const scripts = {};
        
        // Individual shard scripts
        for (let i = 1; i <= totalShards; i++) {
            scripts[`test:e2e:shard:${i}`] = `cross-env SHARD_INDEX=${i - 1} SHARD_TOTAL=${totalShards} HEADLESS=true wdio run wdio.shard.conf.ts`;
            scripts[`test:e2e:shard:${i}:debug`] = `cross-env SHARD_INDEX=${i - 1} SHARD_TOTAL=${totalShards} HEADLESS=true DEBUG_TESTS=true wdio run wdio.shard.conf.ts`;
        }
        
        // Parallel execution scripts
        const shardCommands = Array.from({ length: totalShards }, (_, i) => `npm run test:e2e:shard:${i + 1}`).join(' && ');
        scripts[`test:e2e:sharded:${totalShards}`] = `concurrently --kill-others --success first "ng serve flock-mirage --configuration=test --port=4200" "wait-on http://localhost:4200 && ${shardCommands}"`;
        
        // CI sharded execution
        const ciShardCommands = Array.from({ length: totalShards }, (_, i) => `npm run test:e2e:shard:${i + 1}`).join(' && ');
        scripts[`test:e2e:sharded:${totalShards}:ci`] = `concurrently --kill-others --success first "ng serve flock-mirage --configuration=test --port=4200 --host=0.0.0.0" "node scripts/health-check.js && ${ciShardCommands}"`;
        
        return scripts;
    }

    /**
     * Run a specific shard
     */
    runShard(shardIndex, totalShards, options = {}) {
        const env = {
            ...process.env,
            SHARD_INDEX: shardIndex,
            SHARD_TOTAL: totalShards,
            HEADLESS: options.headless ? 'true' : 'false',
            DEBUG_TESTS: options.debug ? 'true' : 'false',
            CI: options.ci ? 'true' : 'false'
        };
        
        const command = `wdio run wdio.shard.conf.ts`;
        
        console.log(`Running shard ${shardIndex + 1}/${totalShards}...`);
        console.log(`Environment: ${JSON.stringify(env, null, 2)}`);
        
        try {
            execSync(command, { 
                env, 
                stdio: 'inherit',
                cwd: process.cwd()
            });
            console.log(`✅ Shard ${shardIndex + 1} completed successfully`);
        } catch (error) {
            console.error(`❌ Shard ${shardIndex + 1} failed:`, error.message);
            process.exit(1);
        }
    }

    /**
     * Run all shards in parallel
     */
    async runAllShards(totalShards, options = {}) {
        const { spawn } = require('child_process');
        const processes = [];
        
        console.log(`Starting ${totalShards} shards in parallel...`);
        
        for (let i = 0; i < totalShards; i++) {
            const env = {
                ...process.env,
                SHARD_INDEX: i,
                SHARD_TOTAL: totalShards,
                HEADLESS: options.headless ? 'true' : 'false',
                DEBUG_TESTS: options.debug ? 'true' : 'false',
                CI: options.ci ? 'true' : 'false'
            };
            
            const process = spawn('npx', ['wdio', 'run', 'wdio.shard.conf.ts'], {
                env,
                stdio: 'pipe',
                cwd: process.cwd()
            });
            
            process.stdout.on('data', (data) => {
                console.log(`[Shard ${i + 1}] ${data.toString()}`);
            });
            
            process.stderr.on('data', (data) => {
                console.error(`[Shard ${i + 1}] ${data.toString()}`);
            });
            
            processes.push(process);
        }
        
        // Wait for all processes to complete
        const results = await Promise.allSettled(
            processes.map(process => new Promise((resolve, reject) => {
                process.on('close', (code) => {
                    if (code === 0) resolve(code);
                    else reject(new Error(`Process exited with code ${code}`));
                });
            }))
        );
        
        const failures = results.filter(result => result.status === 'rejected');
        if (failures.length > 0) {
            console.error(`❌ ${failures.length} shards failed`);
            process.exit(1);
        } else {
            console.log(`✅ All ${totalShards} shards completed successfully`);
        }
    }
}

// CLI interface
if (require.main === module) {
    const args = process.argv.slice(2);
    const command = args[0];
    const sharder = new TestSharder();
    
    switch (command) {
        case 'create':
            const totalShards = parseInt(args[1]) || 4;
            const strategy = args[2] || 'domain-based';
            console.log(`Creating ${totalShards} shards using ${strategy} strategy...`);
            sharder.createShardConfigs(totalShards, strategy);
            break;
            
        case 'run':
            const shardIndex = parseInt(args[1]) || 0;
            const totalShardsRun = parseInt(args[2]) || 4;
            const headless = args.includes('--headless');
            const debug = args.includes('--debug');
            const ci = args.includes('--ci');
            sharder.runShard(shardIndex, totalShardsRun, { headless, debug, ci });
            break;
            
        case 'run-all':
            const totalShardsAll = parseInt(args[1]) || 4;
            const headlessAll = args.includes('--headless');
            const debugAll = args.includes('--debug');
            const ciAll = args.includes('--ci');
            sharder.runAllShards(totalShardsAll, { headless: headlessAll, debug: debugAll, ci: ciAll });
            break;
            
        case 'scripts':
            const totalShardsScripts = parseInt(args[1]) || 4;
            const scripts = sharder.generateShardScripts(totalShardsScripts);
            console.log('Add these scripts to your package.json:');
            console.log(JSON.stringify(scripts, null, 2));
            break;
            
        default:
            console.log(`
Test Sharding Utility

Usage:
  node scripts/shard-tests.js create [totalShards] [strategy]  - Create shard configurations
  node scripts/shard-tests.js run [shardIndex] [totalShards] [options]  - Run specific shard
  node scripts/shard-tests.js run-all [totalShards] [options]  - Run all shards in parallel
  node scripts/shard-tests.js scripts [totalShards]  - Generate package.json scripts

Options:
  --headless  - Run in headless mode
  --debug     - Enable debug logging
  --ci        - Enable CI mode

Examples:
  node scripts/shard-tests.js create 4 domain-based
  node scripts/shard-tests.js run 0 4 --headless
  node scripts/shard-tests.js run-all 4 --headless --ci
            `);
    }
}

module.exports = TestSharder;
