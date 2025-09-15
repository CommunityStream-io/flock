import { testMetrics, TestMetrics } from './test-metrics';
import { performanceMonitor } from './performance-monitor';
import { timeoutTelemetry } from './timeout-telemetry';
import logger, { bddLogger } from './logger';

/**
 * WebdriverIO hooks for automatic metrics collection
 * These hooks integrate with WebdriverIO's lifecycle to collect metrics automatically
 * Optimized for Cucumber E2E tests only
 */

/**
 * Before each scenario (Cucumber) - Main test entry point
 */
export async function beforeScenario(world: any, context: any) {
  const scenarioName = world.pickle?.name || 'Unknown Scenario';
  logger.info({ 
    scenarioName, 
    scenarioId: world.pickle?.id,
    type: 'scenario-start' 
  }, `Starting scenario: ${scenarioName}`);
  
  // Start performance monitoring for scenario
  performanceMonitor.startMonitoring();
  
  // Start metrics collection for scenario
  testMetrics.startTest(scenarioName, world.pickle?.id);
  
  // Set global test name for timeout telemetry context
  global.currentTestName = scenarioName;
  
  // Collect browser info
  await testMetrics.collectBrowserInfo();
  
  // Check initial resource usage
  performanceMonitor.checkResourceUsage();
}

/**
 * After each scenario (Cucumber) - Main test completion point
 */
export async function afterScenario(world: any, context: any, result: any) {
  const scenarioName = world.pickle?.name || 'Unknown Scenario';
  
  // Properly detect Cucumber scenario status
  let status: 'passed' | 'failed' | 'skipped' = 'skipped';
  
  // Check multiple possible result structures
  if (result) {
    // Check direct status property
    if (result.status) {
      switch (result.status.toUpperCase()) {
        case 'PASSED':
          status = 'passed';
          break;
        case 'FAILED':
          status = 'failed';
          break;
        case 'SKIPPED':
        case 'PENDING':
          status = 'skipped';
          break;
        default:
          status = 'skipped';
      }
    }
    // Check if result has passed property
    else if (typeof result.passed === 'boolean') {
      status = result.passed ? 'passed' : 'failed';
    }
    // Check if result has error property (indicates failure)
    else if (result.error) {
      status = 'failed';
    }
    // Check if result is a boolean
    else if (typeof result === 'boolean') {
      status = result ? 'passed' : 'failed';
    }
    // If no clear status, check if we have any step failures
    else if (result.steps && Array.isArray(result.steps)) {
      const hasFailures = result.steps.some((step: any) => step.status === 'failed');
      status = hasFailures ? 'failed' : 'passed';
    }
    // Default to passed if we have a result object but no clear failure indicators
    else {
      status = 'passed';
    }
  }
  
  logger.info({ 
    scenarioName, 
    status,
    resultStatus: result?.status,
    resultType: typeof result,
    resultKeys: result ? Object.keys(result) : [],
    type: 'scenario-complete' 
  }, `Scenario completed: ${scenarioName} (${status})`);
  
  // Check final resource usage
  performanceMonitor.checkResourceUsage();
  
  // Stop performance monitoring
  performanceMonitor.stopMonitoring();
  
  // End metrics collection
  testMetrics.endTest(status);
  
  // Clear global test name
  global.currentTestName = undefined;
  
  // Log test summary
  const currentMetrics = testMetrics.getCurrentTestMetrics();
  if (currentMetrics) {
    logger.info({
      testId: currentMetrics.testId,
      duration: currentMetrics.duration,
      navigations: currentMetrics.navigation.totalNavigations,
      interactions: currentMetrics.interactions.totalClicks + currentMetrics.interactions.totalInputs,
      errors: currentMetrics.errors.timeoutErrors + currentMetrics.errors.elementNotFoundErrors + currentMetrics.errors.navigationErrors,
      type: 'test-metrics-summary'
    }, 'Test Metrics Summary');
  }
}

/**
 * Before each step (Cucumber)
 */
export async function beforeStep(step: any, context: any) {
  bddLogger.setup(`${step.keyword} ${step.text}`);
}

/**
 * After each step (Cucumber)
 */
export async function afterStep(step: any, context: any, error: any) {
  if (error) {
    bddLogger.error(`Step failed: ${step.keyword} ${step.text}`);
    testMetrics.recordError(error, step.text);
  } else {
    bddLogger.success(`Step completed: ${step.keyword} ${step.text}`);
  }
}

/**
 * Before each feature (Cucumber)
 */
export async function beforeFeature(uri: string, feature: any) {
  logger.info({ 
    featureName: feature.name, 
    featureUri: uri,
    type: 'feature-start' 
  }, `Starting feature: ${feature.name}`);
}

/**
 * After each feature (Cucumber)
 */
export async function afterFeature(uri: string, feature: any) {
  logger.info({ 
    featureName: feature.name, 
    featureUri: uri,
    type: 'feature-complete' 
  }, `Completed feature: ${feature.name}`);
}

/**
 * Before all tests start
 */
export async function before(capabilities: any, specs: string[], browser: any) {
  logger.info({ 
    specCount: specs.length, 
    capabilities,
    type: 'test-suite-start' 
  }, `Starting test suite with ${specs.length} spec files`);
}

/**
 * After all tests complete
 */
export async function after(result: number, capabilities: any, specs: string[]) {
  logger.info({ 
    exitCode: result, 
    specCount: specs.length,
    type: 'test-suite-complete' 
  }, `Test suite completed with exit code: ${result}`);
  
  // Generate and log summary report
  const summary = testMetrics.generateSummaryReport();
  logger.info({ type: 'test-suite-summary' }, summary);
  
  // Export metrics to file
  await testMetrics.exportMetrics();
  
  // Export timeout telemetry
  await timeoutTelemetry.exportTelemetry();
  
  // Log detailed metrics for debugging
  const allMetrics = testMetrics.getMetrics();
  logger.info({ 
    metricsCount: allMetrics.length,
    type: 'metrics-collection-complete' 
  }, `Collected metrics for ${allMetrics.length} tests`);
  
  // Log timeout telemetry summary
  const timeoutReport = timeoutTelemetry.generateTimeoutReport();
  logger.info({ type: 'timeout-telemetry-summary' }, timeoutReport);
  
  // Log performance insights
  logPerformanceInsights(allMetrics);
}

/**
 * Log performance insights and recommendations
 */
export function logPerformanceInsights(metrics: TestMetrics[]) {
    // Find slowest tests
    const slowestTests = metrics
      .sort((a, b) => (b.duration || 0) - (a.duration || 0))
      .slice(0, 3);
    
    logger.info({
      slowestTests: slowestTests.map((test, index) => ({
        rank: index + 1,
        testName: test.testName,
        duration: test.duration
      })),
      type: 'performance-slowest-tests'
    }, 'Slowest Tests Analysis');
    
    // Find tests with most errors
    const errorProneTests = metrics
      .map(test => ({
        ...test,
        totalErrors: test.errors.timeoutErrors + test.errors.elementNotFoundErrors + 
                    test.errors.navigationErrors + test.errors.scriptErrors + 
                    test.errors.networkErrors + test.errors.otherErrors
      }))
      .sort((a, b) => b.totalErrors - a.totalErrors)
      .slice(0, 3);
    
    logger.info({
      errorProneTests: errorProneTests.map((test, index) => ({
        rank: index + 1,
        testName: test.testName,
        totalErrors: test.totalErrors
      })),
      type: 'performance-error-prone-tests'
    }, 'Most Error-Prone Tests Analysis');
    
    // Navigation performance insights
    const avgNavigationTime = metrics.reduce((sum, test) => 
      sum + test.navigation.averageNavigationTime, 0) / metrics.length;
    
    const navigationInsights = {
      averageNavigationTime: avgNavigationTime,
      warning: avgNavigationTime > 5000,
      recommendation: avgNavigationTime > 5000 ? 'Consider optimizing page load times or increasing navigation timeouts' : null
    };
    
    logger.info({
      ...navigationInsights,
      type: 'performance-navigation-insights'
    }, 'Navigation Performance Analysis');
    
    // Memory usage insights
    const memoryTests = metrics.filter(test => test.memory.usedJSHeapSize > 0);
    if (memoryTests.length > 0) {
      const avgMemoryUsage = memoryTests.reduce((sum, test) => 
        sum + test.memory.usedJSHeapSize, 0) / memoryTests.length;
      
      const memoryInsights = {
        averageMemoryUsageMB: avgMemoryUsage / 1024 / 1024,
        warning: avgMemoryUsage > 50 * 1024 * 1024,
        recommendation: avgMemoryUsage > 50 * 1024 * 1024 ? 'Consider investigating potential memory leaks' : null
      };
      
      logger.info({
        ...memoryInsights,
        type: 'performance-memory-insights'
      }, 'Memory Usage Analysis');
    }
    
    // Error pattern analysis
    const totalTimeoutErrors = metrics.reduce((sum, test) => sum + test.errors.timeoutErrors, 0);
    const totalElementErrors = metrics.reduce((sum, test) => sum + test.errors.elementNotFoundErrors, 0);
    const totalNavigationErrors = metrics.reduce((sum, test) => sum + test.errors.navigationErrors, 0);
    
    const errorPatterns = {
      totalTimeoutErrors,
      totalElementErrors,
      totalNavigationErrors,
      timeoutErrorRate: totalTimeoutErrors / metrics.length,
      elementErrorRate: totalElementErrors / metrics.length,
      navigationErrorRate: totalNavigationErrors / metrics.length,
      warnings: [] as Array<{type: string; count: number; recommendation: string}>
    };
    
    if (totalTimeoutErrors > metrics.length * 0.5) {
      errorPatterns.warnings.push({
        type: 'high-timeout-error-rate',
        count: totalTimeoutErrors,
        recommendation: 'Consider increasing timeouts or optimizing wait strategies'
      });
    }
    
    if (totalElementErrors > metrics.length * 0.3) {
      errorPatterns.warnings.push({
        type: 'high-element-error-rate',
        count: totalElementErrors,
        recommendation: 'Consider improving element selectors or wait strategies'
      });
    }
    
    if (totalNavigationErrors > metrics.length * 0.2) {
      errorPatterns.warnings.push({
        type: 'high-navigation-error-rate',
        count: totalNavigationErrors,
        recommendation: 'Consider improving navigation reliability or retry mechanisms'
      });
    }
    
    logger.info({
      ...errorPatterns,
      type: 'performance-error-patterns'
    }, 'Error Pattern Analysis');
    
    // Add timeout-specific analysis
    const timeoutAnalysis = timeoutTelemetry.analyzeTimeouts();
    if (timeoutAnalysis.totalTimeouts > 0) {
      logger.info({
        totalTimeouts: timeoutAnalysis.totalTimeouts,
        timeoutRate: timeoutAnalysis.timeoutRate,
        criticalIssues: timeoutAnalysis.criticalIssues.length,
        topPatterns: timeoutAnalysis.patterns.slice(0, 3).map(p => ({
          operation: p.operation,
          frequency: p.frequency,
          timeoutRate: p.timeoutRate
        })),
        type: 'timeout-analysis-summary'
      }, 'Timeout Analysis Summary');
    }
}

