import { browser } from '@wdio/globals';
import { testMetrics } from './test-metrics';
import { timeoutTelemetry } from './timeout-telemetry';
import logger, { bddLogger } from './logger';

/**
 * Performance monitoring wrapper for WebdriverIO commands
 * This class wraps common WebdriverIO operations to collect performance metrics
 */
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private isMonitoring = false;

  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  public startMonitoring() {
    this.isMonitoring = true;
    timeoutTelemetry.startCollection();
    logger.info({ type: 'performance-monitoring-start' }, 'Performance monitoring started');
  }

  public stopMonitoring() {
    this.isMonitoring = false;
    timeoutTelemetry.stopCollection();
    logger.info({ type: 'performance-monitoring-stop' }, 'Performance monitoring stopped');
  }

  /**
   * Monitor operation with custom timeout and detailed tracking
   */
  public async monitorWithTimeout<T>(
    operation: () => Promise<T>,
    operationName: string,
    timeout: number,
    elementDescription?: string
  ): Promise<T> {
    const startTime = Date.now();
    bddLogger.action(`${operationName} with ${timeout}ms timeout`);
    
    try {
      const result = await Promise.race([
        operation(),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error(`Operation ${operationName} timed out after ${timeout}ms`)), timeout)
        )
      ]);
      
      const duration = Date.now() - startTime;
      bddLogger.success(`${operationName} completed in ${duration}ms`);
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      if (error.message.includes('timed out')) {
        testMetrics.recordTimeout(operationName, timeout, duration, elementDescription);
        await timeoutTelemetry.recordTimeout(
          operationName, 
          timeout, 
          duration, 
          'custom', 
          elementDescription, 
          undefined, 
          undefined
        );
        bddLogger.error(`${operationName} timed out after ${duration}ms (limit: ${timeout}ms)`);
      } else {
        bddLogger.error(`${operationName} failed after ${duration}ms: ${error.message}`);
      }
      
      testMetrics.recordError(error as Error, elementDescription);
      throw error;
    }
  }

  /**
   * Check system resource usage and record warnings
   */
  public checkResourceUsage() {
    const memUsage = process.memoryUsage();
    
    // Check memory thresholds
    const memoryThresholdMB = 500; // 500MB threshold
    const memoryUsageMB = memUsage.heapUsed / 1024 / 1024;
    
    if (memoryUsageMB > memoryThresholdMB) {
      testMetrics.recordResourceError(
        'memory',
        `High memory usage: ${memoryUsageMB.toFixed(2)}MB`,
        memoryUsageMB,
        memoryThresholdMB
      );
    }
    
    // Update system metrics
    testMetrics.updateSystemMetrics();
  }

  /**
   * Wrap browser.url() with performance monitoring
   */
  public async monitorNavigation(url: string): Promise<void> {
    if (!this.isMonitoring) {
      await browser.url(url);
      return;
    }

    const startTime = Date.now();
    let success = false;
    
    try {
      bddLogger.action(`Navigating to ${url}`);
      await browser.url(url);
      success = true;
      
      // Record successful navigation
      const duration = Date.now() - startTime;
      await timeoutTelemetry.recordSuccess(
        `navigation_${url}`, 
        duration, 
        'navigation'
      );
    } catch (error) {
      const duration = Date.now() - startTime;
      
      if (error.message.includes('timed out')) {
        await timeoutTelemetry.recordTimeout(
          `navigation_${url}`, 
          15000, // Default navigation timeout
          duration, 
          'navigation'
        );
        bddLogger.error(`Navigation timed out to ${url} after ${duration}ms`);
      } else {
        bddLogger.error(`Navigation failed to ${url}: ${error.message}`);
      }
      
      testMetrics.recordError(error as Error, 'navigation');
      throw error;
    } finally {
      const endTime = Date.now();
      testMetrics.recordNavigation(startTime, endTime, success);
    }
  }

  /**
   * Wrap element interactions with performance monitoring
   */
  public async monitorElementInteraction<T>(
    operation: () => Promise<T>,
    interactionType: 'click' | 'input' | 'wait',
    elementDescription?: string
  ): Promise<T> {
    if (!this.isMonitoring) {
      return await operation();
    }

    const startTime = Date.now();
    let success = false;
    let result: T;

    try {
      bddLogger.action(`${interactionType} operation${elementDescription ? ` on ${elementDescription}` : ''}`);
      result = await operation();
      success = true;
      
      // Record specific interaction types
      if (interactionType === 'click') {
        testMetrics.recordClick();
      } else if (interactionType === 'input') {
        testMetrics.recordInput();
      } else if (interactionType === 'wait') {
        const endTime = Date.now();
        testMetrics.recordWait(startTime, endTime);
      }
      
      // Record successful interaction
      const duration = Date.now() - startTime;
      await timeoutTelemetry.recordSuccess(
        `${interactionType}_${elementDescription || 'unknown'}`, 
        duration, 
        'element', 
        elementDescription
      );
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      if (error.message.includes('timed out')) {
        await timeoutTelemetry.recordTimeout(
          `${interactionType}_${elementDescription || 'unknown'}`, 
          5000, // Default element timeout
          duration, 
          'element', 
          elementDescription
        );
        bddLogger.error(`${interactionType} operation timed out${elementDescription ? ` on ${elementDescription}` : ''} after ${duration}ms`);
      } else {
        bddLogger.error(`${interactionType} operation failed${elementDescription ? ` on ${elementDescription}` : ''}: ${error.message}`);
      }
      
      testMetrics.recordError(error as Error, `${interactionType}${elementDescription ? `_${elementDescription}` : ''}`);
      throw error;
    }
  }

  /**
   * Monitor waitUntil operations
   */
  public async monitorWaitUntil<T>(
    condition: () => Promise<T>,
    options: { timeout?: number; timeoutMsg?: string },
    description?: string
  ): Promise<T> {
    if (!this.isMonitoring) {
      return await browser.waitUntil(condition, options);
    }

    const startTime = Date.now();
    let success = false;
    let result: T;
    const timeout = options.timeout || 5000;

    try {
      bddLogger.action(`Waiting for condition${description ? `: ${description}` : ''}`);
      result = await browser.waitUntil(condition, options);
      success = true;
      
      // Record successful wait
      const duration = Date.now() - startTime;
      await timeoutTelemetry.recordSuccess(
        `waitUntil_${description || 'unknown'}`, 
        duration, 
        'waitUntil', 
        undefined, 
        description
      );
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      if (error.message.includes('timed out')) {
        await timeoutTelemetry.recordTimeout(
          `waitUntil_${description || 'unknown'}`, 
          timeout, 
          duration, 
          'waitUntil', 
          undefined, 
          description
        );
        bddLogger.error(`Wait condition timed out${description ? `: ${description}` : ''} after ${duration}ms (limit: ${timeout}ms)`);
      } else {
        bddLogger.error(`Wait condition failed${description ? `: ${description}` : ''}: ${error.message}`);
      }
      
      testMetrics.recordError(error as Error, `wait_${description || 'unknown'}`);
      throw error;
    } finally {
      const endTime = Date.now();
      testMetrics.recordWait(startTime, endTime);
    }
  }

  /**
   * Monitor script execution
   */
  public async monitorScriptExecution<T>(
    script: string | (() => T),
    args?: any[],
    description?: string
  ): Promise<T> {
    if (!this.isMonitoring) {
      return await browser.execute(script, args) as T;
    }

    const startTime = Date.now();
    let success = false;
    let result: T;

    try {
      bddLogger.action(`Executing script${description ? `: ${description}` : ''}`);
      result = await browser.execute(script, args) as T;
      success = true;
      return result;
    } catch (error) {
      bddLogger.error(`Script execution failed${description ? `: ${description}` : ''}: ${error.message}`);
      testMetrics.recordError(error as Error, `script_${description || 'unknown'}`);
      throw error;
    }
  }

  /**
   * Monitor page load performance
   */
  public async monitorPageLoad(url: string): Promise<void> {
    if (!this.isMonitoring) {
      await browser.url(url);
      return;
    }

    const startTime = Date.now();
    let success = false;

    try {
      bddLogger.action(`Loading page ${url}`);
      await browser.url(url);
      
      // Wait for page to be ready
      await browser.waitUntil(
        async () => {
          const readyState = await browser.execute(() => document.readyState);
          return readyState === 'complete';
        },
        { timeout: 30000, timeoutMsg: 'Page did not load completely' }
      );

      // Collect performance metrics
      await testMetrics.collectPerformanceMetrics();
      await testMetrics.collectMemoryMetrics();
      await testMetrics.collectResourceMetrics();
      
      success = true;
    } catch (error) {
      bddLogger.error(`Page load failed for ${url}: ${error.message}`);
      testMetrics.recordError(error as Error, 'page_load');
      throw error;
    } finally {
      const endTime = Date.now();
      testMetrics.recordNavigation(startTime, endTime, success);
    }
  }

  /**
   * Get current performance snapshot
   */
  public async getPerformanceSnapshot(): Promise<any> {
    try {
      return await browser.execute(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const paintEntries = performance.getEntriesByType('paint');
        const resources = performance.getEntriesByType('resource');
        
        return {
          navigation: {
            domContentLoaded: navigation ? navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart : 0,
            loadComplete: navigation ? navigation.loadEventEnd - navigation.loadEventStart : 0,
            totalLoadTime: navigation ? navigation.loadEventEnd - navigation.fetchStart : 0
          },
          paint: {
            firstPaint: paintEntries.find(entry => entry.name === 'first-paint')?.startTime || 0,
            firstContentfulPaint: paintEntries.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0
          },
          resources: {
            count: resources.length,
            totalSize: resources.reduce((sum, r) => sum + ((r as any).transferSize || 0), 0),
            averageLoadTime: resources.reduce((sum, r) => sum + r.duration, 0) / resources.length
          },
          memory: (performance as any).memory ? {
            usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
            totalJSHeapSize: (performance as any).memory.totalJSHeapSize
          } : null
        };
      });
    } catch (error) {
      logger.warn({ 
        error: error.message, 
        type: 'performance-snapshot-failed' 
      }, 'Failed to get performance snapshot');
      return null;
    }
  }

  /**
   * Monitor network activity
   */
  public async monitorNetworkActivity(): Promise<any> {
    try {
      return await browser.execute(() => {
        const resources = performance.getEntriesByType('resource');
        const failedResources = resources.filter(r => (r as any).transferSize === 0);
        
        return {
          totalRequests: resources.length,
          failedRequests: failedResources.length,
          successRate: ((resources.length - failedResources.length) / resources.length) * 100,
          slowestResource: resources.reduce((slowest, current) => 
            current.duration > slowest.duration ? current : slowest, resources[0] || { name: '', duration: 0 }),
          averageResponseTime: resources.reduce((sum, r) => sum + r.duration, 0) / resources.length
        };
      });
    } catch (error) {
      logger.warn({ 
        error: error.message, 
        type: 'network-monitoring-failed' 
      }, 'Failed to monitor network activity');
      return null;
    }
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance();
