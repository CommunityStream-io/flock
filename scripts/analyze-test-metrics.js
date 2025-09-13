#!/usr/bin/env node

/**
 * Test Metrics Analysis Script
 * 
 * This script analyzes collected test metrics to provide insights
 * about test performance, reliability, and potential issues.
 * 
 * Usage:
 *   node scripts/analyze-test-metrics.js [metrics-file]
 * 
 * If no file is provided, it will look for the most recent metrics file.
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

class TestMetricsAnalyzer {
  constructor(metricsFile) {
    this.metricsFile = metricsFile;
    this.metrics = [];
  }

  async loadMetrics() {
    try {
      if (!this.metricsFile) {
        // Find the most recent metrics file in logs/metrics directory
        const files = glob.sync('logs/metrics/test-metrics-*.json');
        if (files.length === 0) {
          throw new Error('No metrics files found in logs/metrics directory. Run tests first to generate metrics.');
        }
        this.metricsFile = files.sort().pop();
        console.log(`📊 Using metrics file: ${this.metricsFile}`);
      }

      const data = fs.readFileSync(this.metricsFile, 'utf8');
      this.metrics = JSON.parse(data);
      
      if (!Array.isArray(this.metrics)) {
        throw new Error('Invalid metrics file format');
      }

      console.log(`📊 Loaded metrics for ${this.metrics.length} tests`);
    } catch (error) {
      console.error('❌ Failed to load metrics:', error.message);
      process.exit(1);
    }
  }

  generateReport() {
    if (this.metrics.length === 0) {
      console.log('⚠️ No metrics to analyze');
      return;
    }

    console.log('\n📈 Test Metrics Analysis Report');
    console.log('================================\n');

    this.analyzeTestResults();
    this.analyzePerformance();
    this.analyzeErrors();
    this.analyzeBrowserMetrics();
    this.analyzeMemoryUsage();
    this.generateRecommendations();
  }

  analyzeTestResults() {
    const totalTests = this.metrics.length;
    const passedTests = this.metrics.filter(m => m.status === 'passed').length;
    const failedTests = this.metrics.filter(m => m.status === 'failed').length;
    const skippedTests = this.metrics.filter(m => m.status === 'skipped').length;

    console.log('📊 Test Results Summary');
    console.log('------------------------');
    console.log(`Total Tests: ${totalTests}`);
    console.log(`✅ Passed: ${passedTests} (${((passedTests/totalTests)*100).toFixed(1)}%)`);
    console.log(`❌ Failed: ${failedTests} (${((failedTests/totalTests)*100).toFixed(1)}%)`);
    console.log(`⏭️ Skipped: ${skippedTests} (${((skippedTests/totalTests)*100).toFixed(1)}%)`);
    console.log('');
  }

  analyzePerformance() {
    const durations = this.metrics.map(m => m.duration || 0).filter(d => d > 0);
    const totalDuration = durations.reduce((sum, d) => sum + d, 0);
    const averageDuration = totalDuration / durations.length;
    const slowestTest = this.metrics.reduce((slowest, current) => 
      (current.duration || 0) > (slowest.duration || 0) ? current : slowest
    );

    console.log('⏱️ Performance Analysis');
    console.log('----------------------');
    console.log(`Total Duration: ${(totalDuration / 1000).toFixed(1)}s`);
    console.log(`Average Test Duration: ${averageDuration.toFixed(0)}ms`);
    console.log(`Slowest Test: ${slowestTest.testName} (${slowestTest.duration}ms)`);
    
    // Navigation performance
    const navTimes = this.metrics.map(m => m.navigation.averageNavigationTime).filter(t => t > 0);
    if (navTimes.length > 0) {
      const avgNavTime = navTimes.reduce((sum, t) => sum + t, 0) / navTimes.length;
      console.log(`Average Navigation Time: ${avgNavTime.toFixed(0)}ms`);
    }

    // Wait performance
    const waitTimes = this.metrics.map(m => m.interactions.averageWaitTime).filter(t => t > 0);
    if (waitTimes.length > 0) {
      const avgWaitTime = waitTimes.reduce((sum, t) => sum + t, 0) / waitTimes.length;
      console.log(`Average Wait Time: ${avgWaitTime.toFixed(0)}ms`);
    }
    console.log('');
  }

  analyzeErrors() {
    const totalErrors = this.metrics.reduce((sum, test) => 
      sum + test.errors.timeoutErrors + test.errors.elementNotFoundErrors + 
      test.errors.navigationErrors + test.errors.scriptErrors + 
      test.errors.networkErrors + test.errors.otherErrors, 0
    );

    const timeoutErrors = this.metrics.reduce((sum, test) => sum + test.errors.timeoutErrors, 0);
    const elementErrors = this.metrics.reduce((sum, test) => sum + test.errors.elementNotFoundErrors, 0);
    const navigationErrors = this.metrics.reduce((sum, test) => sum + test.errors.navigationErrors, 0);
    const scriptErrors = this.metrics.reduce((sum, test) => sum + test.errors.scriptErrors, 0);
    const networkErrors = this.metrics.reduce((sum, test) => sum + test.errors.networkErrors, 0);
    const otherErrors = this.metrics.reduce((sum, test) => sum + test.errors.otherErrors, 0);

    console.log('🚨 Error Analysis');
    console.log('-----------------');
    console.log(`Total Errors: ${totalErrors}`);
    console.log(`Timeout Errors: ${timeoutErrors} (${((timeoutErrors/totalErrors)*100).toFixed(1)}%)`);
    console.log(`Element Not Found: ${elementErrors} (${((elementErrors/totalErrors)*100).toFixed(1)}%)`);
    console.log(`Navigation Errors: ${navigationErrors} (${((navigationErrors/totalErrors)*100).toFixed(1)}%)`);
    console.log(`Script Errors: ${scriptErrors} (${((scriptErrors/totalErrors)*100).toFixed(1)}%)`);
    console.log(`Network Errors: ${networkErrors} (${((networkErrors/totalErrors)*100).toFixed(1)}%)`);
    console.log(`Other Errors: ${otherErrors} (${((otherErrors/totalErrors)*100).toFixed(1)}%)`);

    // Find most error-prone tests
    const errorProneTests = this.metrics
      .map(test => ({
        ...test,
        totalErrors: test.errors.timeoutErrors + test.errors.elementNotFoundErrors + 
                    test.errors.navigationErrors + test.errors.scriptErrors + 
                    test.errors.networkErrors + test.errors.otherErrors
      }))
      .sort((a, b) => b.totalErrors - a.totalErrors)
      .slice(0, 5);

    if (errorProneTests.some(test => test.totalErrors > 0)) {
      console.log('\nMost Error-Prone Tests:');
      errorProneTests.forEach((test, index) => {
        if (test.totalErrors > 0) {
          console.log(`  ${index + 1}. ${test.testName}: ${test.totalErrors} errors`);
        }
      });
    }
    console.log('');
  }

  analyzeBrowserMetrics() {
    const browsers = {};
    this.metrics.forEach(test => {
      const browserKey = `${test.browserInfo.name} ${test.browserInfo.version}`;
      if (!browsers[browserKey]) {
        browsers[browserKey] = { count: 0, totalDuration: 0, errors: 0 };
      }
      browsers[browserKey].count++;
      browsers[browserKey].totalDuration += test.duration || 0;
      browsers[browserKey].errors += test.errors.timeoutErrors + test.errors.elementNotFoundErrors + 
                                   test.errors.navigationErrors + test.errors.scriptErrors + 
                                   test.errors.networkErrors + test.errors.otherErrors;
    });

    console.log('🌐 Browser Analysis');
    console.log('-------------------');
    Object.entries(browsers).forEach(([browser, stats]) => {
      const avgDuration = stats.totalDuration / stats.count;
      const errorRate = (stats.errors / stats.count).toFixed(2);
      console.log(`${browser}:`);
      console.log(`  Tests: ${stats.count}`);
      console.log(`  Avg Duration: ${avgDuration.toFixed(0)}ms`);
      console.log(`  Error Rate: ${errorRate} errors/test`);
    });
    console.log('');
  }

  analyzeMemoryUsage() {
    const memoryTests = this.metrics.filter(test => test.memory.usedJSHeapSize > 0);
    if (memoryTests.length === 0) {
      console.log('🧠 Memory Analysis: No memory data available');
      console.log('');
      return;
    }

    const avgMemoryUsage = memoryTests.reduce((sum, test) => 
      sum + test.memory.usedJSHeapSize, 0) / memoryTests.length;
    const maxMemoryUsage = Math.max(...memoryTests.map(test => test.memory.usedJSHeapSize));
    const memoryLeaks = memoryTests.filter(test => test.memory.memoryLeaks > 0).length;

    console.log('🧠 Memory Analysis');
    console.log('------------------');
    console.log(`Average Memory Usage: ${(avgMemoryUsage / 1024 / 1024).toFixed(2)}MB`);
    console.log(`Max Memory Usage: ${(maxMemoryUsage / 1024 / 1024).toFixed(2)}MB`);
    console.log(`Potential Memory Leaks: ${memoryLeaks}`);
    console.log('');
  }

  generateRecommendations() {
    console.log('💡 Recommendations');
    console.log('------------------');

    const totalTests = this.metrics.length;
    const totalErrors = this.metrics.reduce((sum, test) => 
      sum + test.errors.timeoutErrors + test.errors.elementNotFoundErrors + 
      test.errors.navigationErrors + test.errors.scriptErrors + 
      test.errors.networkErrors + test.errors.otherErrors, 0
    );

    const timeoutErrors = this.metrics.reduce((sum, test) => sum + test.errors.timeoutErrors, 0);
    const elementErrors = this.metrics.reduce((sum, test) => sum + test.errors.elementNotFoundErrors, 0);
    const navigationErrors = this.metrics.reduce((sum, test) => sum + test.errors.navigationErrors, 0);

    const avgDuration = this.metrics.reduce((sum, test) => sum + (test.duration || 0), 0) / totalTests;

    // Timeout recommendations
    if (timeoutErrors > totalTests * 0.3) {
      console.log(`⚠️  High timeout error rate (${timeoutErrors} errors)`);
      console.log('   • Consider increasing timeout values in wdio.conf.ts');
      console.log('   • Optimize wait strategies using waitUntil instead of fixed delays');
      console.log('   • Review network conditions and page load performance');
    }

    // Element not found recommendations
    if (elementErrors > totalTests * 0.2) {
      console.log(`⚠️  High element not found error rate (${elementErrors} errors)`);
      console.log('   • Review element selectors for reliability');
      console.log('   • Add better wait strategies for dynamic content');
      console.log('   • Consider using more specific selectors');
    }

    // Navigation recommendations
    if (navigationErrors > totalTests * 0.1) {
      console.log(`⚠️  High navigation error rate (${navigationErrors} errors)`);
      console.log('   • Implement retry mechanisms for navigation');
      console.log('   • Add better page load verification');
      console.log('   • Review application stability');
    }

    // Performance recommendations
    if (avgDuration > 30000) { // 30 seconds
      console.log(`⚠️  High average test duration (${(avgDuration/1000).toFixed(1)}s)`);
      console.log('   • Optimize test data setup and teardown');
      console.log('   • Consider parallel test execution');
      console.log('   • Review unnecessary waits and delays');
    }

    // General recommendations
    if (totalErrors > totalTests * 0.5) {
      console.log(`⚠️  High overall error rate (${totalErrors} errors across ${totalTests} tests)`);
      console.log('   • Review test environment stability');
      console.log('   • Consider increasing retry counts');
      console.log('   • Add more robust error handling');
    }

    console.log('');
  }
}

// Main execution
async function main() {
  const metricsFile = process.argv[2];
  const analyzer = new TestMetricsAnalyzer(metricsFile);
  
  await analyzer.loadMetrics();
  analyzer.generateReport();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = TestMetricsAnalyzer;
