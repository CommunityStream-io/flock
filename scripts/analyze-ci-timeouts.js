#!/usr/bin/env node

/**
 * CI-Specific Timeout Analysis Script
 * 
 * This script analyzes timeout telemetry data from CI runs
 * and provides actionable insights for fixing flaky tests.
 */

const fs = require('fs').promises;
const path = require('path');

class CITimeoutAnalyzer {
  constructor() {
    this.metricsDir = 'logs/metrics';
    this.results = {
      totalFiles: 0,
      totalTimeouts: 0,
      totalEvents: 0,
      shardAnalysis: {},
      patternAnalysis: {},
      criticalIssues: [],
      recommendations: [],
      ciContext: {
        runNumber: process.env.GITHUB_RUN_NUMBER || 'local',
        sha: process.env.GITHUB_SHA || 'unknown',
        ref: process.env.GITHUB_REF_NAME || 'unknown',
        actor: process.env.GITHUB_ACTOR || 'unknown'
      }
    };
  }

  async analyze() {
    console.log('🔍 Starting CI Timeout Telemetry Analysis...\n');
    console.log(`📋 CI Context: Run ${this.results.ciContext.runNumber}, Commit ${this.results.ciContext.sha.substring(0, 7)}, Branch ${this.results.ciContext.ref}\n`);
    
    try {
      // Find all timeout telemetry files
      const files = await this.findTelemetryFiles();
      console.log(`📁 Found ${files.length} telemetry files to analyze\n`);
      
      if (files.length === 0) {
        console.log('⚠️  No timeout telemetry files found in logs/metrics/');
        console.log('   This could indicate:');
        console.log('   - Tests completed without timeouts');
        console.log('   - Timeout telemetry not properly enabled');
        console.log('   - Files not uploaded as artifacts');
        console.log('   - Tests failed before generating telemetry');
        console.log('\n✅ Skipping timeout analysis (this is expected in some scenarios)');
        process.exit(0);
      }
      
      // Analyze each file
      for (const file of files) {
        await this.analyzeFile(file);
      }
      
      // Generate comprehensive analysis
      this.generateAnalysis();
      
      // Display results
      this.displayResults();
      
      // Generate CI-specific recommendations
      this.generateCIRecommendations();
      
      // Generate GitHub Actions summary
      this.generateGitHubSummary();
      
    } catch (error) {
      console.error('❌ Analysis failed:', error.message);
      process.exit(1);
    }
  }

  async findTelemetryFiles() {
    try {
      const files = await fs.readdir(this.metricsDir);
      return files
        .filter(file => file.startsWith('timeout-telemetry-') && file.endsWith('.json'))
        .map(file => path.join(this.metricsDir, file))
        .sort();
    } catch (error) {
      if (error.code === 'ENOENT') {
        return [];
      }
      throw error;
    }
  }

  async analyzeFile(filePath) {
    try {
      const data = JSON.parse(await fs.readFile(filePath, 'utf8'));
      this.results.totalFiles++;
      
      if (data.events && data.events.length > 0) {
        this.results.totalEvents += data.events.length;
        this.results.totalTimeouts += data.events.filter(e => !e.success).length;
        
        // Analyze by shard
        const shardId = data.events[0]?.context?.shardId || 'unknown';
        if (!this.results.shardAnalysis[shardId]) {
          this.results.shardAnalysis[shardId] = {
            totalEvents: 0,
            totalTimeouts: 0,
            operations: {},
            patterns: []
          };
        }
        
        this.results.shardAnalysis[shardId].totalEvents += data.events.length;
        this.results.shardAnalysis[shardId].totalTimeouts += data.events.filter(e => !e.success).length;
        
        // Analyze operations
        data.events.forEach(event => {
          const operationKey = `${event.operation}_${event.timeoutType}`;
          if (!this.results.shardAnalysis[shardId].operations[operationKey]) {
            this.results.shardAnalysis[shardId].operations[operationKey] = {
              total: 0,
              timeouts: 0,
              avgDuration: 0,
              maxDuration: 0
            };
          }
          
          const op = this.results.shardAnalysis[shardId].operations[operationKey];
          op.total++;
          if (!event.success) op.timeouts++;
          op.avgDuration = (op.avgDuration * (op.total - 1) + event.actualDuration) / op.total;
          op.maxDuration = Math.max(op.maxDuration, event.actualDuration);
        });
      }
      
      // Analyze patterns from analysis data
      if (data.analysis) {
        this.analyzePatterns(data.analysis, shardId);
      }
      
    } catch (error) {
      console.warn(`⚠️  Failed to analyze file ${filePath}: ${error.message}`);
    }
  }

  analyzePatterns(analysis, shardId) {
    if (analysis.patterns) {
      analysis.patterns.forEach(pattern => {
        const patternKey = `${pattern.operation}_${pattern.timeoutType}`;
        if (!this.results.patternAnalysis[patternKey]) {
          this.results.patternAnalysis[patternKey] = {
            totalFrequency: 0,
            totalTimeoutRate: 0,
            shards: new Set(),
            avgDuration: 0,
            maxDuration: 0
          };
        }
        
        const pat = this.results.patternAnalysis[patternKey];
        pat.totalFrequency += pattern.frequency;
        pat.totalTimeoutRate += pattern.timeoutRate;
        pat.shards.add(shardId);
        pat.avgDuration = (pat.avgDuration + pattern.averageDuration) / 2;
        pat.maxDuration = Math.max(pat.maxDuration, pattern.averageDuration);
      });
    }
    
    if (analysis.criticalIssues) {
      this.results.criticalIssues.push(...analysis.criticalIssues.map(issue => ({
        ...issue,
        shard: shardId
      })));
    }
  }

  generateAnalysis() {
    // Calculate overall timeout rate
    this.results.overallTimeoutRate = this.results.totalEvents > 0 
      ? this.results.totalTimeouts / this.results.totalEvents 
      : 0;
    
    // Identify problematic shards
    this.results.problematicShards = Object.entries(this.results.shardAnalysis)
      .filter(([shard, data]) => data.totalTimeouts > 0)
      .sort((a, b) => b[1].totalTimeouts - a[1].totalTimeouts);
    
    // Identify top timeout patterns
    this.results.topPatterns = Object.entries(this.results.patternAnalysis)
      .map(([pattern, data]) => ({
        pattern,
        frequency: data.totalFrequency,
        timeoutRate: data.totalTimeoutRate / data.shards.size,
        shardCount: data.shards.size,
        avgDuration: data.avgDuration,
        maxDuration: data.maxDuration
      }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 10);
  }

  displayResults() {
    console.log('📊 CI TIMEOUT TELEMETRY ANALYSIS RESULTS');
    console.log('=========================================\n');
    
    // Overall summary
    console.log('📈 Overall Summary');
    console.log('------------------');
    console.log(`Total Files Analyzed: ${this.results.totalFiles}`);
    console.log(`Total Events: ${this.results.totalEvents}`);
    console.log(`Total Timeouts: ${this.results.totalTimeouts}`);
    console.log(`Overall Timeout Rate: ${(this.results.overallTimeoutRate * 100).toFixed(2)}%\n`);
    
    // Shard analysis
    if (this.results.problematicShards.length > 0) {
      console.log('🔍 Shard Analysis');
      console.log('-----------------');
      this.results.problematicShards.forEach(([shard, data]) => {
        const timeoutRate = data.totalEvents > 0 ? (data.totalTimeouts / data.totalEvents * 100).toFixed(1) : '0.0';
        console.log(`Shard ${shard}: ${data.totalTimeouts}/${data.totalEvents} timeouts (${timeoutRate}%)`);
      });
      console.log('');
    }
    
    // Top patterns
    if (this.results.topPatterns.length > 0) {
      console.log('🎯 Top Timeout Patterns');
      console.log('------------------------');
      this.results.topPatterns.slice(0, 5).forEach((pattern, index) => {
        console.log(`${index + 1}. ${pattern.pattern}`);
        console.log(`   Frequency: ${pattern.frequency} timeouts`);
        console.log(`   Timeout Rate: ${(pattern.timeoutRate * 100).toFixed(1)}%`);
        console.log(`   Avg Duration: ${pattern.avgDuration.toFixed(0)}ms`);
        console.log(`   Affected Shards: ${pattern.shardCount}`);
        console.log('');
      });
    }
    
    // Critical issues
    if (this.results.criticalIssues.length > 0) {
      console.log('🚨 Critical Issues');
      console.log('------------------');
      this.results.criticalIssues.forEach((issue, index) => {
        console.log(`${index + 1}. ${issue.type.toUpperCase()}`);
        console.log(`   Description: ${issue.description}`);
        console.log(`   Frequency: ${issue.frequency} occurrences`);
        console.log(`   Impact: ${issue.impact.toUpperCase()}`);
        console.log(`   Shard: ${issue.shard}`);
        console.log('');
      });
    }
  }

  generateCIRecommendations() {
    console.log('💡 CI-Specific Recommendations');
    console.log('--------------------------------');
    
    const recommendations = [];
    
    // High timeout rate
    if (this.results.overallTimeoutRate > 0.3) {
      recommendations.push('🔧 HIGH TIMEOUT RATE: Consider increasing global timeouts or optimizing wait strategies');
    }
    
    // Shard-specific issues
    const shardWithMostTimeouts = this.results.problematicShards[0];
    if (shardWithMostTimeouts && shardWithMostTimeouts[1].totalTimeouts > 5) {
      recommendations.push(`🔧 SHARD ${shardWithMostTimeouts[0]} ISSUES: This shard has ${shardWithMostTimeouts[1].totalTimeouts} timeouts - investigate resource contention`);
    }
    
    // Pattern-specific recommendations
    this.results.topPatterns.slice(0, 3).forEach(pattern => {
      if (pattern.timeoutRate > 0.5) {
        recommendations.push(`🔧 ${pattern.pattern.toUpperCase()}: High timeout rate (${(pattern.timeoutRate * 100).toFixed(1)}%) - review timeout configuration`);
      }
      
      if (pattern.avgDuration > 5000) {
        recommendations.push(`🔧 ${pattern.pattern.toUpperCase()}: Consistently slow (${pattern.avgDuration.toFixed(0)}ms avg) - consider optimization`);
      }
    });
    
    // CI-specific recommendations
    if (this.results.totalTimeouts > 0) {
      recommendations.push('🔧 CI OPTIMIZATION: Consider reducing concurrent shards or adding delays between test starts');
      recommendations.push('🔧 RESOURCE MONITORING: Monitor CI runner resources during test execution');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('✅ No specific recommendations - timeout patterns look normal for CI environment');
    }
    
    recommendations.forEach((rec, index) => {
      console.log(`${index + 1}. ${rec}`);
    });
    
    console.log('\n📋 Next Steps:');
    console.log('1. Review the timeout patterns above');
    console.log('2. Check specific shard artifacts for detailed context');
    console.log('3. Consider adjusting timeout configurations in timeout-config.ts');
    console.log('4. Monitor CI runner resources and consider reducing concurrent shards');
    console.log('5. Implement retry mechanisms for problematic operations');
  }

  generateGitHubSummary() {
    // Generate GitHub Actions summary
    const summaryFile = process.env.GITHUB_STEP_SUMMARY;
    if (summaryFile) {
      const summary = `
## 🔍 Timeout Analysis Summary

**Run:** ${this.results.ciContext.runNumber}  
**Commit:** ${this.results.ciContext.sha.substring(0, 7)}  
**Branch:** ${this.results.ciContext.ref}  

### 📊 Results
- **Total Timeouts:** ${this.results.totalTimeouts}
- **Timeout Rate:** ${(this.results.overallTimeoutRate * 100).toFixed(2)}%
- **Problematic Shards:** ${this.results.problematicShards.length}

### 🎯 Top Issues
${this.results.topPatterns.slice(0, 3).map((pattern, index) => 
  `${index + 1}. **${pattern.pattern}** - ${pattern.frequency} timeouts (${(pattern.timeoutRate * 100).toFixed(1)}% rate)`
).join('\n')}

### 💡 Recommendations
${this.results.recommendations.slice(0, 3).map((rec, index) => 
  `${index + 1}. ${rec}`
).join('\n')}

---
*Generated by CI Timeout Analysis*
      `.trim();
      
      try {
        require('fs').writeFileSync(summaryFile, summary);
        console.log('\n📋 GitHub Actions summary generated');
      } catch (error) {
        console.log('\n⚠️  Could not generate GitHub Actions summary:', error.message);
      }
    }
  }
}

// Main execution
async function main() {
  const analyzer = new CITimeoutAnalyzer();
  await analyzer.analyze();
  // Exit successfully
  process.exit(0);
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = CITimeoutAnalyzer;
