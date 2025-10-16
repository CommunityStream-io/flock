const { performance } = require('perf_hooks');

/**
 * Performance Tracker Class
 * 
 * Tracks timing and resource usage for operations with automatic
 * Sentry integration and detailed logging.
 */
class PerformanceTracker {
  constructor(sentryInstance = null, logger = null) {
    this.sentry = sentryInstance;
    this.logger = logger;
    this.operations = new Map();
    this.activeTransactions = new Map();
    this.operationCounter = 0;
    
    // Resource tracking
    this.initialMemory = this.getResourceSnapshot();
  }

  /**
   * Start tracking an operation
   * @param {string} name - Operation name
   * @param {string} category - Operation category (startup, ipc-handler, operation, window)
   * @param {Object} metadata - Additional metadata
   * @returns {string} Operation ID
   */
  startOperation(name, category, metadata = {}) {
    const operationId = `${name}-${++this.operationCounter}-${Date.now()}`;
    const startTime = performance.now();
    const startTimestamp = Date.now();
    const resourceSnapshot = this.getResourceSnapshot();
    
    const operation = {
      id: operationId,
      name,
      category,
      startTime,
      startTimestamp,
      resourceSnapshot,
      metadata,
      children: [],
      parent: null,
      status: 'running'
    };
    
    this.operations.set(operationId, operation);
    
    // Create Sentry transaction for top-level operations
    if (this.sentry && category === 'startup') {
      const transaction = this.sentry.startTransaction({
        name: `app-${name}`,
        op: 'app.startup',
        tags: {
          operation: name,
          category
        },
        data: metadata
      });
      
      this.activeTransactions.set(operationId, transaction);
    }
    
    // Log operation start
    if (this.logger) {
      this.logger.info(`⏱️ [PERF] Started ${name} (${category})`, {
        operationId,
        category,
        metadata
      });
    } else {
      console.log(`⏱️ [PERF] Started ${name} (${category})`);
    }
    
    return operationId;
  }

  /**
   * Start a child operation under a parent
   * @param {string} parentId - Parent operation ID
   * @param {string} name - Child operation name
   * @param {Object} metadata - Additional metadata
   * @returns {string} Child operation ID
   */
  startChildOperation(parentId, name, metadata = {}) {
    const parent = this.operations.get(parentId);
    if (!parent) {
      console.warn(`⚠️ [PERF] Parent operation ${parentId} not found for child ${name}`);
      return this.startOperation(name, 'operation', metadata);
    }
    
    const childId = this.startOperation(name, 'operation', metadata);
    const child = this.operations.get(childId);
    
    // Set parent-child relationship
    child.parent = parentId;
    parent.children.push(childId);
    
    // Create Sentry span for child operation
    if (this.sentry) {
      const parentTransaction = this.activeTransactions.get(parentId);
      if (parentTransaction) {
        const span = parentTransaction.startChild({
          op: 'operation.execute',
          description: name,
          data: metadata
        });
        
        this.activeTransactions.set(childId, span);
      }
    }
    
    return childId;
  }

  /**
   * End tracking an operation
   * @param {string} operationId - Operation ID
   * @param {Object} result - Operation result data
   */
  endOperation(operationId, result = {}) {
    const operation = this.operations.get(operationId);
    if (!operation) {
      console.warn(`⚠️ [PERF] Operation ${operationId} not found`);
      return;
    }
    
    const endTime = performance.now();
    const endTimestamp = Date.now();
    const endResourceSnapshot = this.getResourceSnapshot();
    
    // Calculate metrics
    const duration = endTime - operation.startTime;
    const memoryDelta = this.calculateMemoryDelta(operation.resourceSnapshot, endResourceSnapshot);
    const cpuUsage = this.estimateCpuUsage(operation.startTimestamp, endTimestamp);
    
    // Update operation data
    operation.endTime = endTime;
    operation.endTimestamp = endTimestamp;
    operation.endResourceSnapshot = endResourceSnapshot;
    operation.duration = duration;
    operation.memoryDelta = memoryDelta;
    operation.cpuUsage = cpuUsage;
    operation.result = result;
    operation.status = result.success === false ? 'failed' : 'completed';
    
    // Finish Sentry span/transaction
    if (this.sentry) {
      const span = this.activeTransactions.get(operationId);
      if (span) {
        span.setData('duration_ms', Math.round(duration));
        span.setData('memory_delta_mb', Math.round(memoryDelta.heapUsedDeltaMB * 100) / 100);
        span.setData('success', operation.status === 'completed');
        
        if (result.error) {
          span.setData('error', result.error);
        }
        
        span.finish();
        this.activeTransactions.delete(operationId);
      }
    }
    
    // Generate detailed report
    this.reportMetrics(operation);
    
    return operation;
  }

  /**
   * Get resource usage snapshot
   * @returns {Object} Resource snapshot
   */
  getResourceSnapshot() {
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    return {
      timestamp: Date.now(),
      memory: {
        rss: memUsage.rss,
        heapTotal: memUsage.heapTotal,
        heapUsed: memUsage.heapUsed,
        external: memUsage.external,
        arrayBuffers: memUsage.arrayBuffers
      },
      cpu: cpuUsage,
      uptime: process.uptime()
    };
  }

  /**
   * Calculate memory delta between two snapshots
   * @param {Object} start - Start snapshot
   * @param {Object} end - End snapshot
   * @returns {Object} Memory delta
   */
  calculateMemoryDelta(start, end) {
    const formatMB = (bytes) => Math.round((bytes / 1024 / 1024) * 100) / 100;
    
    return {
      rssDeltaMB: formatMB(end.memory.rss - start.memory.rss),
      heapUsedDeltaMB: formatMB(end.memory.heapUsed - start.memory.heapUsed),
      heapTotalDeltaMB: formatMB(end.memory.heapTotal - start.memory.heapTotal),
      externalDeltaMB: formatMB(end.memory.external - start.memory.external),
      arrayBuffersDeltaMB: formatMB(end.memory.arrayBuffers - start.memory.arrayBuffers),
      startRssMB: formatMB(start.memory.rss),
      endRssMB: formatMB(end.memory.rss),
      startHeapUsedMB: formatMB(start.memory.heapUsed),
      endHeapUsedMB: formatMB(end.memory.heapUsed)
    };
  }

  /**
   * Estimate CPU usage (simplified)
   * @param {number} startTimestamp - Start timestamp
   * @param {number} endTimestamp - End timestamp
   * @returns {number} Estimated CPU percentage
   */
  estimateCpuUsage(startTimestamp, endTimestamp) {
    // This is a simplified estimation
    // In a real implementation, you'd want more sophisticated CPU tracking
    const duration = endTimestamp - startTimestamp;
    const processUptime = process.uptime() * 1000;
    
    // Rough estimation based on operation duration vs process uptime
    return Math.min(Math.round((duration / processUptime) * 100), 100);
  }

  /**
   * Report metrics for an operation
   * @param {Object} operation - Operation data
   */
  reportMetrics(operation) {
    const status = operation.status === 'completed' ? '✅' : '❌';
    const duration = Math.round(operation.duration);
    const memoryInfo = operation.memoryDelta;
    
    // Generate breakdown for child operations
    let breakdown = '';
    if (operation.children.length > 0) {
      breakdown = '\n    ├─ Breakdown:';
      for (const childId of operation.children) {
        const child = this.operations.get(childId);
        if (child && child.duration) {
          const childDuration = Math.round(child.duration);
          breakdown += `\n    │  ├─ ${child.name}: ${childDuration}ms`;
        }
      }
    }
    
    const report = `⏱️ [PERF] ${operation.name} ${operation.status} in ${duration}ms
    ├─ Memory: ${memoryInfo.startRssMB}MB → ${memoryInfo.endRssMB}MB (${memoryInfo.rssDeltaMB > 0 ? '+' : ''}${memoryInfo.rssDeltaMB}MB)
    ├─ Heap: ${memoryInfo.startHeapUsedMB}MB → ${memoryInfo.endHeapUsedMB}MB (${memoryInfo.heapUsedDeltaMB > 0 ? '+' : ''}${memoryInfo.heapUsedDeltaMB}MB)
    ├─ CPU: ~${operation.cpuUsage}%${breakdown}
    └─ Status: ${operation.status === 'completed' ? 'Success' : 'Failed'}${operation.result.error ? ` (${operation.result.error})` : ''}`;
    
    // Log to console and logger
    console.log(report);
    
    if (this.logger) {
      this.logger.info(`Performance metrics for ${operation.name}`, {
        operation: operation.name,
        category: operation.category,
        duration: operation.duration,
        memoryDelta: operation.memoryDelta,
        cpuUsage: operation.cpuUsage,
        status: operation.status,
        children: operation.children.length,
        result: operation.result
      });
    }
  }

  /**
   * Get summary statistics for operations
   * @param {string} category - Optional category filter
   * @returns {Object} Summary statistics
   */
  getSummary(category = null) {
    const operations = Array.from(this.operations.values())
      .filter(op => op.duration && (category === null || op.category === category));
    
    if (operations.length === 0) {
      return { count: 0 };
    }
    
    const durations = operations.map(op => op.duration);
    durations.sort((a, b) => a - b);
    
    const total = durations.reduce((sum, d) => sum + d, 0);
    const avg = total / durations.length;
    const min = durations[0];
    const max = durations[durations.length - 1];
    const p95Index = Math.floor(durations.length * 0.95);
    const p95 = durations[p95Index];
    
    return {
      count: operations.length,
      total: Math.round(total),
      average: Math.round(avg),
      min: Math.round(min),
      max: Math.round(max),
      p95: Math.round(p95),
      category: category || 'all'
    };
  }

  /**
   * Clear completed operations to free memory
   * @param {number} maxAge - Maximum age in milliseconds (default: 5 minutes)
   */
  cleanup(maxAge = 5 * 60 * 1000) {
    const cutoff = Date.now() - maxAge;
    let removed = 0;
    
    for (const [id, operation] of this.operations.entries()) {
      if (operation.status !== 'running' && operation.endTimestamp < cutoff) {
        this.operations.delete(id);
        removed++;
      }
    }
    
    if (removed > 0) {
      console.log(`🧹 [PERF] Cleaned up ${removed} completed operations`);
    }
    
    return removed;
  }

  /**
   * Get all active operations
   * @returns {Array} Active operations
   */
  getActiveOperations() {
    return Array.from(this.operations.values())
      .filter(op => op.status === 'running');
  }

  /**
   * Get operation by ID
   * @param {string} operationId - Operation ID
   * @returns {Object|null} Operation data
   */
  getOperation(operationId) {
    return this.operations.get(operationId) || null;
  }
}

module.exports = PerformanceTracker;
