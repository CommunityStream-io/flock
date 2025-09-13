import { browser } from '@wdio/globals';
import logger, { bddLogger } from './logger';
import { getTimeoutConfig } from './timeout-config';

/**
 * Enhanced timeout telemetry collector for diagnosing intermittent timeout issues
 * This system provides detailed tracking of timeout patterns, resource usage,
 * and environmental factors that may contribute to timeout failures.
 */

export interface TimeoutEvent {
  id: string;
  timestamp: number;
  operation: string;
  element?: string;
  step?: string;
  timeout: number;
  actualDuration: number;
  timeoutType: 'waitUntil' | 'element' | 'navigation' | 'script' | 'custom';
  success: boolean;
  errorMessage?: string;
  context: {
    shardId?: number;
    totalShards?: number;
    testName: string;
    stepName?: string;
    browserInfo: {
      name: string;
      version: string;
      platform: string;
    };
    systemResources: {
      memoryUsage: number;
      cpuUsage: number;
      uptime: number;
    };
    networkConditions?: {
      online: boolean;
      connectionType?: string;
    };
  };
  retryAttempt?: number;
  previousTimeouts?: number;
}

export interface TimeoutPattern {
  operation: string;
  frequency: number;
  averageDuration: number;
  timeoutRate: number;
  commonContexts: string[];
  timeOfDay?: {
    hour: number;
    frequency: number;
  }[];
  resourceCorrelation?: {
    highMemoryUsage: number;
    highCpuUsage: number;
  };
}

export interface TimeoutAnalysis {
  totalTimeouts: number;
  timeoutRate: number;
  patterns: TimeoutPattern[];
  recommendations: string[];
  criticalIssues: Array<{
    type: string;
    description: string;
    frequency: number;
    impact: 'low' | 'medium' | 'high' | 'critical';
  }>;
  environmentalFactors: {
    shardDistribution: Record<number, number>;
    browserDistribution: Record<string, number>;
    timeDistribution: Record<number, number>;
  };
}

class TimeoutTelemetryCollector {
  private timeoutEvents: TimeoutEvent[] = [];
  private operationCounts: Map<string, number> = new Map();
  private isCollecting = false;

  public startCollection() {
    this.isCollecting = true;
    this.timeoutEvents = [];
    this.operationCounts.clear();
    
    logger.info({ 
      type: 'timeout-telemetry-start' 
    }, 'Timeout telemetry collection started');
  }

  public stopCollection() {
    this.isCollecting = false;
    
    logger.info({ 
      type: 'timeout-telemetry-stop',
      totalEvents: this.timeoutEvents.length
    }, 'Timeout telemetry collection stopped');
  }

  /**
   * Record a timeout event with comprehensive context
   */
  public async recordTimeout(
    operation: string,
    timeout: number,
    actualDuration: number,
    timeoutType: TimeoutEvent['timeoutType'],
    element?: string,
    step?: string,
    retryAttempt?: number
  ): Promise<void> {
    if (!this.isCollecting) return;

    const eventId = this.generateEventId();
    const timestamp = Date.now();
    
    // Get current context
    const context = await this.getCurrentContext(step);
    
    // Count operation attempts
    const operationKey = `${operation}_${timeoutType}`;
    this.operationCounts.set(operationKey, (this.operationCounts.get(operationKey) || 0) + 1);
    
    // Count previous timeouts for this operation
    const previousTimeouts = this.timeoutEvents.filter(e => 
      e.operation === operation && 
      e.timeoutType === timeoutType &&
      e.timestamp > timestamp - 300000 // Last 5 minutes
    ).length;

    const timeoutEvent: TimeoutEvent = {
      id: eventId,
      timestamp,
      operation,
      element,
      step,
      timeout,
      actualDuration,
      timeoutType,
      success: actualDuration < timeout,
      context,
      retryAttempt,
      previousTimeouts
    };

    this.timeoutEvents.push(timeoutEvent);

    // Log timeout event with context
    logger.warn({
      eventId,
      operation,
      timeout,
      actualDuration,
      timeoutType,
      element,
      step,
      retryAttempt,
      previousTimeouts,
      context: {
        shardId: context.shardId,
        testName: context.testName,
        memoryUsage: context.systemResources.memoryUsage,
        cpuUsage: context.systemResources.cpuUsage
      },
      type: 'timeout-event'
    }, `Timeout recorded: ${operation} (${actualDuration}ms/${timeout}ms)`);

    // Record timeout in BDD logger
    bddLogger.error(`⏰ Timeout: ${operation} took ${actualDuration}ms (limit: ${timeout}ms)${element ? ` on ${element}` : ''}`);
  }

  /**
   * Record a successful operation for comparison
   */
  public async recordSuccess(
    operation: string,
    duration: number,
    timeoutType: TimeoutEvent['timeoutType'],
    element?: string,
    step?: string
  ): Promise<void> {
    if (!this.isCollecting) return;

    const eventId = this.generateEventId();
    const timestamp = Date.now();
    const context = await this.getCurrentContext(step);
    
    const successEvent: TimeoutEvent = {
      id: eventId,
      timestamp,
      operation,
      element,
      step,
      timeout: 0, // No timeout for successful operations
      actualDuration: duration,
      timeoutType,
      success: true,
      context
    };

    this.timeoutEvents.push(successEvent);

    // Count operation attempts
    const operationKey = `${operation}_${timeoutType}`;
    this.operationCounts.set(operationKey, (this.operationCounts.get(operationKey) || 0) + 1);
  }

  /**
   * Get current system and test context
   */
  private async getCurrentContext(step?: string): Promise<TimeoutEvent['context']> {
    try {
      // Get browser info
      const capabilities = browser.capabilities;
      const userAgent = await browser.execute(() => navigator.userAgent).catch(() => 'unknown');
      
      // Get system resources
      const memUsage = process.memoryUsage();
      const cpuUsage = process.cpuUsage();
      
      // Get network conditions
      const networkInfo = await this.getNetworkInfo();
      
      return {
        shardId: process.env.SHARD ? parseInt(process.env.SHARD) : undefined,
        totalShards: process.env.TOTAL_SHARDS ? parseInt(process.env.TOTAL_SHARDS) : undefined,
        testName: this.getCurrentTestName(),
        stepName: step,
        browserInfo: {
          name: capabilities.browserName || 'unknown',
          version: capabilities.browserVersion || 'unknown',
          platform: capabilities.platformName || 'unknown'
        },
        systemResources: {
          memoryUsage: memUsage.heapUsed / 1024 / 1024, // MB
          cpuUsage: (cpuUsage.user + cpuUsage.system) / 1000000, // seconds
          uptime: process.uptime()
        },
        networkConditions: networkInfo
      };
    } catch (error) {
      logger.warn({
        error: error.message,
        type: 'timeout-context-failed'
      }, 'Failed to get timeout context');
      
      return {
        shardId: process.env.SHARD ? parseInt(process.env.SHARD) : undefined,
        totalShards: process.env.TOTAL_SHARDS ? parseInt(process.env.TOTAL_SHARDS) : undefined,
        testName: 'unknown',
        stepName: step,
        browserInfo: {
          name: 'unknown',
          version: 'unknown',
          platform: 'unknown'
        },
        systemResources: {
          memoryUsage: 0,
          cpuUsage: 0,
          uptime: 0
        }
      };
    }
  }

  /**
   * Get network information
   */
  private async getNetworkInfo(): Promise<TimeoutEvent['context']['networkConditions']> {
    try {
      const networkInfo = await browser.execute(() => {
        return {
          online: navigator.onLine,
          connectionType: (navigator as any).connection?.effectiveType || 'unknown'
        };
      });
      return networkInfo;
    } catch {
      return {
        online: true,
        connectionType: 'unknown'
      };
    }
  }

  /**
   * Get current test name from global context
   */
  private getCurrentTestName(): string {
    // Try to get from global test context
    if (global.currentTestName) {
      return global.currentTestName;
    }
    
    // Fallback to environment or default
    return process.env.CURRENT_TEST_NAME || 'unknown';
  }

  /**
   * Analyze timeout patterns and generate insights
   */
  public analyzeTimeouts(): TimeoutAnalysis {
    const totalOperations = Array.from(this.operationCounts.values()).reduce((sum, count) => sum + count, 0);
    const timeoutEvents = this.timeoutEvents.filter(e => !e.success);
    const totalTimeouts = timeoutEvents.length;
    const timeoutRate = totalOperations > 0 ? totalTimeouts / totalOperations : 0;

    // Analyze patterns
    const patterns = this.analyzePatterns(timeoutEvents);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(patterns, timeoutRate);
    
    // Identify critical issues
    const criticalIssues = this.identifyCriticalIssues(patterns, timeoutEvents);
    
    // Analyze environmental factors
    const environmentalFactors = this.analyzeEnvironmentalFactors(timeoutEvents);

    return {
      totalTimeouts,
      timeoutRate,
      patterns,
      recommendations,
      criticalIssues,
      environmentalFactors
    };
  }

  /**
   * Analyze timeout patterns by operation type
   */
  private analyzePatterns(timeoutEvents: TimeoutEvent[]): TimeoutPattern[] {
    const operationGroups = new Map<string, TimeoutEvent[]>();
    
    // Group by operation and timeout type
    timeoutEvents.forEach(event => {
      const key = `${event.operation}_${event.timeoutType}`;
      if (!operationGroups.has(key)) {
        operationGroups.set(key, []);
      }
      operationGroups.get(key)!.push(event);
    });

    const patterns: TimeoutPattern[] = [];
    
    operationGroups.forEach((events, key) => {
      const [operation, timeoutType] = key.split('_');
      const totalOperations = this.operationCounts.get(key) || 0;
      
      patterns.push({
        operation,
        frequency: events.length,
        averageDuration: events.reduce((sum, e) => sum + e.actualDuration, 0) / events.length,
        timeoutRate: totalOperations > 0 ? events.length / totalOperations : 0,
        commonContexts: this.getCommonContexts(events),
        timeOfDay: this.analyzeTimeDistribution(events),
        resourceCorrelation: this.analyzeResourceCorrelation(events)
      });
    });

    return patterns.sort((a, b) => b.frequency - a.frequency);
  }

  /**
   * Get common contexts for timeout events
   */
  private getCommonContexts(events: TimeoutEvent[]): string[] {
    const contexts = new Map<string, number>();
    
    events.forEach(event => {
      const contextKey = `${event.context.browserInfo.name}_${event.context.shardId || 'unknown'}`;
      contexts.set(contextKey, (contexts.get(contextKey) || 0) + 1);
    });

    return Array.from(contexts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([context, count]) => `${context} (${count})`);
  }

  /**
   * Analyze time distribution of timeouts
   */
  private analyzeTimeDistribution(events: TimeoutEvent[]): TimeoutPattern['timeOfDay'] {
    const hourGroups = new Map<number, number>();
    
    events.forEach(event => {
      const hour = new Date(event.timestamp).getHours();
      hourGroups.set(hour, (hourGroups.get(hour) || 0) + 1);
    });

    return Array.from(hourGroups.entries())
      .map(([hour, frequency]) => ({ hour, frequency }))
      .sort((a, b) => b.frequency - a.frequency);
  }

  /**
   * Analyze resource correlation with timeouts
   */
  private analyzeResourceCorrelation(events: TimeoutEvent[]): TimeoutPattern['resourceCorrelation'] {
    const highMemoryThreshold = 100; // MB
    const highCpuThreshold = 1; // seconds
    
    let highMemoryUsage = 0;
    let highCpuUsage = 0;
    
    events.forEach(event => {
      if (event.context.systemResources.memoryUsage > highMemoryThreshold) {
        highMemoryUsage++;
      }
      if (event.context.systemResources.cpuUsage > highCpuThreshold) {
        highCpuUsage++;
      }
    });

    return {
      highMemoryUsage,
      highCpuUsage
    };
  }

  /**
   * Generate recommendations based on analysis
   */
  private generateRecommendations(patterns: TimeoutPattern[], timeoutRate: number): string[] {
    const recommendations: string[] = [];
    
    if (timeoutRate > 0.3) {
      recommendations.push('High timeout rate detected - consider increasing global timeouts or optimizing wait strategies');
    }
    
    patterns.forEach(pattern => {
      if (pattern.timeoutRate > 0.5) {
        recommendations.push(`Operation '${pattern.operation}' has high timeout rate (${(pattern.timeoutRate * 100).toFixed(1)}%) - review timeout configuration`);
      }
      
      if (pattern.averageDuration > pattern.timeout * 0.8) {
        recommendations.push(`Operation '${pattern.operation}' consistently takes close to timeout limit - consider increasing timeout`);
      }
      
      if (pattern.resourceCorrelation?.highMemoryUsage > pattern.frequency * 0.7) {
        recommendations.push(`Operation '${pattern.operation}' correlates with high memory usage - investigate memory leaks`);
      }
    });
    
    return recommendations;
  }

  /**
   * Identify critical issues requiring immediate attention
   */
  private identifyCriticalIssues(patterns: TimeoutPattern[], timeoutEvents: TimeoutEvent[]): TimeoutAnalysis['criticalIssues'] {
    const issues: TimeoutAnalysis['criticalIssues'] = [];
    
    // Check for cascading timeouts
    const cascadingTimeouts = timeoutEvents.filter(e => e.previousTimeouts && e.previousTimeouts > 2).length;
    if (cascadingTimeouts > 0) {
      issues.push({
        type: 'cascading-timeouts',
        description: `${cascadingTimeouts} timeouts occurred after previous timeouts in the same test`,
        frequency: cascadingTimeouts,
        impact: 'high'
      });
    }
    
    // Check for shard-specific issues
    const shardTimeouts = new Map<number, number>();
    timeoutEvents.forEach(e => {
      if (e.context.shardId) {
        shardTimeouts.set(e.context.shardId, (shardTimeouts.get(e.context.shardId) || 0) + 1);
      }
    });
    
    shardTimeouts.forEach((count, shardId) => {
      if (count > 5) {
        issues.push({
          type: 'shard-timeout-cluster',
          description: `Shard ${shardId} has ${count} timeouts - possible resource contention`,
          frequency: count,
          impact: 'medium'
        });
      }
    });
    
    return issues;
  }

  /**
   * Analyze environmental factors
   */
  private analyzeEnvironmentalFactors(timeoutEvents: TimeoutEvent[]): TimeoutAnalysis['environmentalFactors'] {
    const shardDistribution: Record<number, number> = {};
    const browserDistribution: Record<string, number> = {};
    const timeDistribution: Record<number, number> = {};
    
    timeoutEvents.forEach(event => {
      // Shard distribution
      if (event.context.shardId) {
        shardDistribution[event.context.shardId] = (shardDistribution[event.context.shardId] || 0) + 1;
      }
      
      // Browser distribution
      const browserKey = event.context.browserInfo.name;
      browserDistribution[browserKey] = (browserDistribution[browserKey] || 0) + 1;
      
      // Time distribution (hour of day)
      const hour = new Date(event.timestamp).getHours();
      timeDistribution[hour] = (timeDistribution[hour] || 0) + 1;
    });
    
    return {
      shardDistribution,
      browserDistribution,
      timeDistribution
    };
  }

  /**
   * Export timeout telemetry data
   */
  public async exportTelemetry(filename?: string): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const defaultFilename = `timeout-telemetry-${timestamp}.json`;
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
      
      const analysis = this.analyzeTimeouts();
      const exportData = {
        metadata: {
          exportTime: new Date().toISOString(),
          totalEvents: this.timeoutEvents.length,
          collectionPeriod: {
            start: this.timeoutEvents.length > 0 ? new Date(Math.min(...this.timeoutEvents.map(e => e.timestamp))).toISOString() : null,
            end: this.timeoutEvents.length > 0 ? new Date(Math.max(...this.timeoutEvents.map(e => e.timestamp))).toISOString() : null
          }
        },
        events: this.timeoutEvents,
        analysis
      };
      
      const filepath = path.join(metricsDir, finalFilename);
      await fs.writeFile(filepath, JSON.stringify(exportData, null, 2));
      
      logger.info({ 
        filename: finalFilename,
        filepath,
        eventCount: this.timeoutEvents.length,
        type: 'timeout-telemetry-export' 
      }, `Timeout telemetry exported to ${filepath}`);
    } catch (error) {
      logger.error({ 
        error: error.message, 
        filename: finalFilename,
        type: 'timeout-telemetry-export-failed' 
      }, 'Failed to export timeout telemetry');
    }
  }

  /**
   * Generate timeout analysis report
   */
  public generateTimeoutReport(): string {
    const analysis = this.analyzeTimeouts();
    
    return `
🔍 Timeout Telemetry Analysis Report
=====================================

📊 Summary
----------
Total Timeout Events: ${analysis.totalTimeouts}
Overall Timeout Rate: ${(analysis.timeoutRate * 100).toFixed(2)}%

🚨 Critical Issues
------------------
${analysis.criticalIssues.length > 0 ? 
  analysis.criticalIssues.map(issue => 
    `• ${issue.type.toUpperCase()}: ${issue.description} (${issue.frequency} occurrences, ${issue.impact} impact)`
  ).join('\n') : 
  'No critical issues detected'}

📈 Top Timeout Patterns
-----------------------
${analysis.patterns.slice(0, 5).map((pattern, index) => 
  `${index + 1}. ${pattern.operation} (${pattern.timeoutType})
   - Frequency: ${pattern.frequency} timeouts
   - Timeout Rate: ${(pattern.timeoutRate * 100).toFixed(1)}%
   - Avg Duration: ${pattern.averageDuration.toFixed(0)}ms`
).join('\n\n')}

💡 Recommendations
------------------
${analysis.recommendations.length > 0 ? 
  analysis.recommendations.map((rec, index) => `${index + 1}. ${rec}`).join('\n') : 
  'No specific recommendations at this time'}

🌍 Environmental Factors
------------------------
Shard Distribution: ${Object.entries(analysis.environmentalFactors.shardDistribution)
  .map(([shard, count]) => `Shard ${shard}: ${count}`)
  .join(', ') || 'No shard data'}

Browser Distribution: ${Object.entries(analysis.environmentalFactors.browserDistribution)
  .map(([browser, count]) => `${browser}: ${count}`)
  .join(', ') || 'No browser data'}

Time Distribution: ${Object.entries(analysis.environmentalFactors.timeDistribution)
  .map(([hour, count]) => `${hour}:00 - ${count}`)
  .join(', ') || 'No time data'}
    `.trim();
  }

  private generateEventId(): string {
    return `timeout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  public getEvents(): TimeoutEvent[] {
    return [...this.timeoutEvents];
  }

  public getEventCount(): number {
    return this.timeoutEvents.length;
  }
}

export const timeoutTelemetry = new TimeoutTelemetryCollector();
