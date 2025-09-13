import { browser } from '@wdio/globals';
import logger, { bddLogger } from './logger';

export interface TestMetrics {
  // Test execution metrics
  testId: string;
  testName: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  status: 'running' | 'passed' | 'failed' | 'skipped';
  
  // Browser metrics
  browserInfo: {
    name: string;
    version: string;
    platform: string;
    userAgent: string;
  };
  
  // Performance metrics
  performance: {
    pageLoadTime: number;
    domContentLoaded: number;
    firstPaint: number;
    firstContentfulPaint: number;
    largestContentfulPaint: number;
    cumulativeLayoutShift: number;
    firstInputDelay: number;
    totalBlockingTime: number;
  };
  
  // Navigation metrics
  navigation: {
    totalNavigations: number;
    navigationTimes: number[];
    averageNavigationTime: number;
    failedNavigations: number;
  };
  
  // Element interaction metrics
  interactions: {
    totalClicks: number;
    totalInputs: number;
    totalWaits: number;
    averageWaitTime: number;
    failedInteractions: number;
  };
  
  // Error tracking
  errors: {
    timeoutErrors: number;
    elementNotFoundErrors: number;
    navigationErrors: number;
    scriptErrors: number;
    networkErrors: number;
    otherErrors: number;
    errorDetails: Array<{
      type: string;
      message: string;
      stack?: string;
      timestamp: number;
      step?: string;
    }>;
    // Enhanced timeout tracking
    timeoutDetails: Array<{
      operation: string;
      timeout: number;
      actualDuration: number;
      element?: string;
      step?: string;
      timestamp: number;
    }>;
    // Resource-related errors
    resourceErrors: Array<{
      type: 'memory' | 'cpu' | 'disk' | 'network';
      message: string;
      value?: number;
      threshold?: number;
      timestamp: number;
    }>;
  };
  
  // Resource metrics
  resources: {
    totalRequests: number;
    failedRequests: number;
    averageResponseTime: number;
    totalDataTransferred: number;
    slowestResource: {
      url: string;
      duration: number;
      type: string;
    };
  };
  
  // Memory metrics
  memory: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
    memoryLeaks: number;
  };
  
  // Environment info
  environment: {
    ci: boolean;
    headless: boolean;
    shard?: number;
    totalShards?: number;
    nodeVersion: string;
    webdriverioVersion: string;
  };

  // System metrics
  system: {
    processId: number;
    memoryUsage: {
      rss: number;
      heapTotal: number;
      heapUsed: number;
      external: number;
    };
    cpuUsage: {
      user: number;
      system: number;
    };
    uptime: number;
    platform: string;
    arch: string;
  };

  // Shard-level metrics
  shard: {
    shardId: number;
    totalShards: number;
    startTime: number;
    endTime?: number;
    duration?: number;
    status: 'running' | 'completed' | 'failed' | 'timeout';
    exitCode?: number;
    errorMessage?: string;
  };
}

class TestMetricsCollector {
  private currentTest: Partial<TestMetrics> = {};
  private metrics: TestMetrics[] = [];
  private navigationTimes: number[] = [];
  private waitTimes: number[] = [];
  private errorCounts = {
    timeoutErrors: 0,
    elementNotFoundErrors: 0,
    navigationErrors: 0,
    scriptErrors: 0,
    networkErrors: 0,
    otherErrors: 0
  };

  public startTest(testName: string, testId?: string) {
    this.currentTest = {
      testId: testId || this.generateTestId(),
      testName,
      startTime: Date.now(),
      status: 'running',
      browserInfo: {
        name: '',
        version: '',
        platform: '',
        userAgent: ''
      },
      performance: {
        pageLoadTime: 0,
        domContentLoaded: 0,
        firstPaint: 0,
        firstContentfulPaint: 0,
        largestContentfulPaint: 0,
        cumulativeLayoutShift: 0,
        firstInputDelay: 0,
        totalBlockingTime: 0
      },
      navigation: {
        totalNavigations: 0,
        navigationTimes: [],
        averageNavigationTime: 0,
        failedNavigations: 0
      },
      interactions: {
        totalClicks: 0,
        totalInputs: 0,
        totalWaits: 0,
        averageWaitTime: 0,
        failedInteractions: 0
      },
      errors: {
        timeoutErrors: 0,
        elementNotFoundErrors: 0,
        navigationErrors: 0,
        scriptErrors: 0,
        networkErrors: 0,
        otherErrors: 0,
        errorDetails: [],
        timeoutDetails: [],
        resourceErrors: []
      },
      resources: {
        totalRequests: 0,
        failedRequests: 0,
        averageResponseTime: 0,
        totalDataTransferred: 0,
        slowestResource: {
          url: '',
          duration: 0,
          type: ''
        }
      },
      memory: {
        usedJSHeapSize: 0,
        totalJSHeapSize: 0,
        jsHeapSizeLimit: 0,
        memoryLeaks: 0
      },
      environment: {
        ci: process.env.CI === 'true',
        headless: process.env.HEADLESS === 'true',
        shard: process.env.SHARD ? parseInt(process.env.SHARD) : undefined,
        totalShards: process.env.TOTAL_SHARDS ? parseInt(process.env.TOTAL_SHARDS) : undefined,
        nodeVersion: process.version,
        webdriverioVersion: '9.19.1' // Update as needed
      },
      system: {
        processId: process.pid,
        memoryUsage: process.memoryUsage(),
        cpuUsage: process.cpuUsage(),
        uptime: process.uptime(),
        platform: process.platform,
        arch: process.arch
      },
      shard: {
        shardId: process.env.SHARD ? parseInt(process.env.SHARD) : 0,
        totalShards: process.env.TOTAL_SHARDS ? parseInt(process.env.TOTAL_SHARDS) : 1,
        startTime: Date.now(),
        status: 'running'
      }
    };

    this.navigationTimes = [];
    this.waitTimes = [];
    this.errorCounts = {
      timeoutErrors: 0,
      elementNotFoundErrors: 0,
      navigationErrors: 0,
      scriptErrors: 0,
      networkErrors: 0,
      otherErrors: 0
    };

    logger.info({ 
      testId: this.currentTest.testId, 
      testName, 
      type: 'metrics-start' 
    }, `Started metrics collection for test: ${testName}`);
  }

  public async collectBrowserInfo() {
    try {
      const capabilities = browser.capabilities;
      const userAgent = await browser.execute(() => navigator.userAgent);
      
      this.currentTest.browserInfo = {
        name: capabilities.browserName || 'unknown',
        version: capabilities.browserVersion || 'unknown',
        platform: capabilities.platformName || 'unknown',
        userAgent: userAgent
      };
    } catch (error) {
      logger.warn({ 
        error: error.message, 
        type: 'metrics-browser-info-failed' 
      }, 'Failed to collect browser info');
    }
  }

  public async collectPerformanceMetrics() {
    try {
      const performanceData = await browser.execute(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const paintEntries = performance.getEntriesByType('paint');
        const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
        const clsEntries = performance.getEntriesByType('layout-shift');
        
        return {
          pageLoadTime: navigation ? navigation.loadEventEnd - navigation.loadEventStart : 0,
          domContentLoaded: navigation ? navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart : 0,
          firstPaint: paintEntries.find(entry => entry.name === 'first-paint')?.startTime || 0,
          firstContentfulPaint: paintEntries.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,
          largestContentfulPaint: lcpEntries.length > 0 ? lcpEntries[lcpEntries.length - 1].startTime : 0,
          cumulativeLayoutShift: clsEntries.reduce((sum, entry) => sum + (entry as any).value, 0),
          firstInputDelay: 0, // Would need specific measurement
          totalBlockingTime: 0 // Would need specific measurement
        };
      });

      this.currentTest.performance = performanceData;
    } catch (error) {
      logger.warn({ 
        error: error.message, 
        type: 'metrics-performance-failed' 
      }, 'Failed to collect performance metrics');
    }
  }

  public async collectMemoryMetrics() {
    try {
      const memoryInfo = await browser.execute(() => {
        const memory = (performance as any).memory;
        return memory ? {
          usedJSHeapSize: memory.usedJSHeapSize,
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit
        } : {
          usedJSHeapSize: 0,
          totalJSHeapSize: 0,
          jsHeapSizeLimit: 0
        };
      });

      this.currentTest.memory = {
        ...memoryInfo,
        memoryLeaks: 0 // Would need specific measurement
      };
    } catch (error) {
      logger.warn({ 
        error: error.message, 
        type: 'metrics-memory-failed' 
      }, 'Failed to collect memory metrics');
    }
  }

  public async collectResourceMetrics() {
    try {
      const resourceData = await browser.execute(() => {
        const resources = performance.getEntriesByType('resource');
        const totalRequests = resources.length;
        const failedRequests = resources.filter(r => (r as any).transferSize === 0).length;
        const totalSize = resources.reduce((sum, r) => sum + ((r as any).transferSize || 0), 0);
        const averageResponseTime = resources.reduce((sum, r) => sum + r.duration, 0) / totalRequests;
        
        const slowestResource = resources.reduce((slowest, current) => 
          current.duration > slowest.duration ? current : slowest, resources[0] || { name: '', duration: 0 });

        return {
          totalRequests,
          failedRequests,
          averageResponseTime: isNaN(averageResponseTime) ? 0 : averageResponseTime,
          totalDataTransferred: totalSize,
          slowestResource: {
            url: slowestResource?.name || '',
            duration: slowestResource?.duration || 0,
            type: (slowestResource && 'initiatorType' in slowestResource) ? String(slowestResource.initiatorType) : ''
          }
        };
      });

      this.currentTest.resources = resourceData;
    } catch (error) {
      logger.warn({ 
        error: error.message, 
        type: 'metrics-resource-failed' 
      }, 'Failed to collect resource metrics');
    }
  }

  public recordNavigation(startTime: number, endTime: number, success: boolean) {
    const duration = endTime - startTime;
    this.navigationTimes.push(duration);
    
    if (this.currentTest.navigation) {
      this.currentTest.navigation.totalNavigations++;
      this.currentTest.navigation.navigationTimes = [...this.navigationTimes];
      this.currentTest.navigation.averageNavigationTime = 
        this.navigationTimes.reduce((sum, time) => sum + time, 0) / this.navigationTimes.length;
      
      if (!success) {
        this.currentTest.navigation.failedNavigations++;
      }
    }
  }

  public recordWait(startTime: number, endTime: number) {
    const duration = endTime - startTime;
    this.waitTimes.push(duration);
    
    if (this.currentTest.interactions) {
      this.currentTest.interactions.totalWaits++;
      this.currentTest.interactions.averageWaitTime = 
        this.waitTimes.reduce((sum, time) => sum + time, 0) / this.waitTimes.length;
    }
  }

  public recordClick() {
    if (this.currentTest.interactions) {
      this.currentTest.interactions.totalClicks++;
    }
  }

  public recordInput() {
    if (this.currentTest.interactions) {
      this.currentTest.interactions.totalInputs++;
    }
  }

  public recordError(error: Error, step?: string) {
    const errorType = this.categorizeError(error);
    this.errorCounts[errorType]++;
    
    if (this.currentTest.errors) {
      this.currentTest.errors[errorType]++;
      this.currentTest.errors.errorDetails.push({
        type: errorType,
        message: error.message,
        stack: error.stack,
        timestamp: Date.now(),
        step
      });
    }
  }

  public recordTimeout(operation: string, timeout: number, actualDuration: number, element?: string, step?: string) {
    if (this.currentTest.errors) {
      this.currentTest.errors.timeoutDetails.push({
        operation,
        timeout,
        actualDuration,
        element,
        step,
        timestamp: Date.now()
      });
    }
  }

  public recordResourceError(type: 'memory' | 'cpu' | 'disk' | 'network', message: string, value?: number, threshold?: number) {
    if (this.currentTest.errors) {
      this.currentTest.errors.resourceErrors.push({
        type,
        message,
        value,
        threshold,
        timestamp: Date.now()
      });
    }
  }

  public updateSystemMetrics() {
    if (this.currentTest.system) {
      this.currentTest.system.memoryUsage = process.memoryUsage();
      this.currentTest.system.cpuUsage = process.cpuUsage();
      this.currentTest.system.uptime = process.uptime();
    }
  }

  public updateShardStatus(status: 'completed' | 'failed' | 'timeout', exitCode?: number, errorMessage?: string) {
    if (this.currentTest.shard) {
      this.currentTest.shard.status = status;
      this.currentTest.shard.endTime = Date.now();
      this.currentTest.shard.duration = this.currentTest.shard.endTime - this.currentTest.shard.startTime;
      if (exitCode !== undefined) this.currentTest.shard.exitCode = exitCode;
      if (errorMessage) this.currentTest.shard.errorMessage = errorMessage;
    }
  }

  private categorizeError(error: Error): keyof typeof this.errorCounts {
    const message = error.message.toLowerCase();
    
    if (message.includes('timeout') || message.includes('timed out')) {
      return 'timeoutErrors';
    } else if (message.includes('element') && (message.includes('not found') || message.includes('not visible'))) {
      return 'elementNotFoundErrors';
    } else if (message.includes('navigation') || message.includes('navigate')) {
      return 'navigationErrors';
    } else if (message.includes('script') || message.includes('javascript')) {
      return 'scriptErrors';
    } else if (message.includes('network') || message.includes('connection') || message.includes('fetch')) {
      return 'networkErrors';
    } else {
      return 'otherErrors';
    }
  }

  public endTest(status: 'passed' | 'failed' | 'skipped') {
    if (this.currentTest) {
      this.currentTest.endTime = Date.now();
      this.currentTest.duration = this.currentTest.endTime! - (this.currentTest.startTime || 0);
      this.currentTest.status = status;
      
      // Update error counts
      if (this.currentTest.errors) {
        this.currentTest.errors = {
          ...this.currentTest.errors,
          ...this.errorCounts
        };
      }
      
      this.metrics.push(this.currentTest as TestMetrics);
      
      logger.info({ 
        testId: this.currentTest.testId,
        testName: this.currentTest.testName,
        status,
        duration: this.currentTest.duration,
        type: 'metrics-complete' 
      }, `Completed metrics collection for test: ${this.currentTest.testName} (${status})`);
    }
  }

  public getMetrics(): TestMetrics[] {
    return [...this.metrics];
  }

  public getCurrentTestMetrics(): TestMetrics | null {
    return this.currentTest as TestMetrics || null;
  }

  public async exportMetrics(filename?: string): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const defaultFilename = `test-metrics-${timestamp}.json`;
    const finalFilename = filename || defaultFilename;
    
    try {
      const fs = require('fs').promises;
      const path = require('path');
      
      // Ensure logs/metrics directory exists
      const metricsDir = path.join('logs', 'metrics');
      try {
        await fs.access(metricsDir);
      } catch {
        await fs.mkdir(metricsDir, { recursive: true });
      }
      
      const filepath = path.join(metricsDir, finalFilename);
      await fs.writeFile(filepath, JSON.stringify(this.metrics, null, 2));
      
      logger.info({ 
        filename: finalFilename,
        filepath,
        metricsCount: this.metrics.length,
        type: 'metrics-export' 
      }, `Metrics exported to ${filepath}`);
    } catch (error) {
      logger.error({ 
        error: error.message, 
        filename: finalFilename,
        type: 'metrics-export-failed' 
      }, 'Failed to export metrics');
    }
  }

  public generateSummaryReport(): string {
    const totalTests = this.metrics.length;
    const passedTests = this.metrics.filter(m => m.status === 'passed').length;
    const failedTests = this.metrics.filter(m => m.status === 'failed').length;
    const skippedTests = this.metrics.filter(m => m.status === 'skipped').length;
    
    const totalDuration = this.metrics.reduce((sum, m) => sum + (m.duration || 0), 0);
    const averageDuration = totalDuration / totalTests;
    
    const totalErrors = this.metrics.reduce((sum, m) => 
      sum + m.errors.timeoutErrors + m.errors.elementNotFoundErrors + m.errors.navigationErrors + 
      m.errors.scriptErrors + m.errors.networkErrors + m.errors.otherErrors, 0);
    
    const averageNavigationTime = this.metrics.reduce((sum, m) => 
      sum + m.navigation.averageNavigationTime, 0) / totalTests;
    
    const averageWaitTime = this.metrics.reduce((sum, m) => 
      sum + m.interactions.averageWaitTime, 0) / totalTests;

    return `
📊 Test Metrics Summary Report
===============================
Total Tests: ${totalTests}
✅ Passed: ${passedTests} (${((passedTests/totalTests)*100).toFixed(1)}%)
❌ Failed: ${failedTests} (${((failedTests/totalTests)*100).toFixed(1)}%)
⏭️ Skipped: ${skippedTests} (${((skippedTests/totalTests)*100).toFixed(1)}%)

⏱️ Performance Metrics
----------------------
Total Duration: ${totalDuration}ms (${(totalDuration/1000).toFixed(1)}s)
Average Test Duration: ${averageDuration.toFixed(0)}ms
Average Navigation Time: ${averageNavigationTime.toFixed(0)}ms
Average Wait Time: ${averageWaitTime.toFixed(0)}ms

🚨 Error Summary
----------------
Total Errors: ${totalErrors}
Timeout Errors: ${this.metrics.reduce((sum, m) => sum + m.errors.timeoutErrors, 0)}
Element Not Found: ${this.metrics.reduce((sum, m) => sum + m.errors.elementNotFoundErrors, 0)}
Navigation Errors: ${this.metrics.reduce((sum, m) => sum + m.errors.navigationErrors, 0)}
Script Errors: ${this.metrics.reduce((sum, m) => sum + m.errors.scriptErrors, 0)}
Network Errors: ${this.metrics.reduce((sum, m) => sum + m.errors.networkErrors, 0)}
Other Errors: ${this.metrics.reduce((sum, m) => sum + m.errors.otherErrors, 0)}
    `.trim();
  }

  private generateTestId(): string {
    return `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const testMetrics = new TestMetricsCollector();
