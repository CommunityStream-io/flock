/**
 * IPC Performance Wrapper Utilities
 * 
 * Provides utilities for automatically wrapping IPC handlers with performance tracking
 */

/**
 * Sanitize arguments for logging (remove sensitive data)
 * @param {Array} args - Function arguments
 * @returns {Array} Sanitized arguments
 */
function sanitizeArgs(args) {
  return args.map(arg => {
    if (typeof arg === 'string') {
      // Truncate very long strings
      if (arg.length > 100) {
        return arg.substring(0, 100) + '...';
      }
      return arg;
    } else if (typeof arg === 'object' && arg !== null) {
      // Remove sensitive fields from objects
      const sanitized = { ...arg };
      delete sanitized.password;
      delete sanitized.token;
      delete sanitized.secret;
      delete sanitized.key;
      delete sanitized.blueskyPassword;
      delete sanitized.blueskyHandle;
      return sanitized;
    }
    return arg;
  });
}

/**
 * Wrap an IPC handler with performance tracking
 * @param {string} handlerName - Name of the handler
 * @param {Function} handlerFn - Original handler function
 * @param {PerformanceTracker} performanceTracker - Performance tracker instance
 * @returns {Function} Wrapped handler function
 */
function wrapIpcHandler(handlerName, handlerFn, performanceTracker) {
  return async (event, ...args) => {
    const opId = performanceTracker.startOperation(
      handlerName,
      'ipc-handler',
      { 
        args: sanitizeArgs(args),
        handler: handlerName,
        timestamp: Date.now()
      }
    );
    
    try {
      const result = await handlerFn(event, ...args);
      performanceTracker.endOperation(opId, { 
        success: true,
        resultType: typeof result,
        hasResult: result !== undefined
      });
      return result;
    } catch (error) {
      performanceTracker.endOperation(opId, { 
        success: false, 
        error: error.message,
        errorType: error.constructor.name,
        stack: error.stack
      });
      throw error;
    }
  };
}

/**
 * Wrap multiple IPC handlers at once
 * @param {Object} handlers - Object with handler names as keys and functions as values
 * @param {PerformanceTracker} performanceTracker - Performance tracker instance
 * @returns {Object} Object with wrapped handlers
 */
function wrapIpcHandlers(handlers, performanceTracker) {
  const wrapped = {};
  
  for (const [name, handler] of Object.entries(handlers)) {
    wrapped[name] = wrapIpcHandler(name, handler, performanceTracker);
  }
  
  return wrapped;
}

/**
 * Create a performance-tracked operation within a handler
 * @param {PerformanceTracker} performanceTracker - Performance tracker instance
 * @param {string} parentOpId - Parent operation ID
 * @param {string} operationName - Name of the sub-operation
 * @param {Object} metadata - Additional metadata
 * @returns {Object} Object with start/end functions
 */
function createTrackedOperation(performanceTracker, parentOpId, operationName, metadata = {}) {
  let operationId = null;
  
  return {
    start: () => {
      operationId = performanceTracker.startChildOperation(parentOpId, operationName, metadata);
      return operationId;
    },
    end: (result = {}) => {
      if (operationId) {
        performanceTracker.endOperation(operationId, result);
      }
    },
    fail: (error) => {
      if (operationId) {
        performanceTracker.endOperation(operationId, { 
          success: false, 
          error: error.message || error,
          errorType: error.constructor?.name || 'Error'
        });
      }
    },
    getId: () => operationId
  };
}

/**
 * Utility to track async operations with automatic error handling
 * @param {PerformanceTracker} performanceTracker - Performance tracker instance
 * @param {string} parentOpId - Parent operation ID
 * @param {string} operationName - Name of the operation
 * @param {Function} asyncFn - Async function to execute
 * @param {Object} metadata - Additional metadata
 * @returns {Promise} Promise that resolves to the function result
 */
async function trackAsyncOperation(performanceTracker, parentOpId, operationName, asyncFn, metadata = {}) {
  const op = createTrackedOperation(performanceTracker, parentOpId, operationName, metadata);
  
  try {
    op.start();
    const result = await asyncFn();
    op.end({ success: true, hasResult: result !== undefined });
    return result;
  } catch (error) {
    op.fail(error);
    throw error;
  }
}

/**
 * Utility to track synchronous operations with automatic error handling
 * @param {PerformanceTracker} performanceTracker - Performance tracker instance
 * @param {string} parentOpId - Parent operation ID
 * @param {string} operationName - Name of the operation
 * @param {Function} syncFn - Synchronous function to execute
 * @param {Object} metadata - Additional metadata
 * @returns {*} Function result
 */
function trackSyncOperation(performanceTracker, parentOpId, operationName, syncFn, metadata = {}) {
  const op = createTrackedOperation(performanceTracker, parentOpId, operationName, metadata);
  
  try {
    op.start();
    const result = syncFn();
    op.end({ success: true, hasResult: result !== undefined });
    return result;
  } catch (error) {
    op.fail(error);
    throw error;
  }
}

/**
 * Create a performance context for a handler
 * Provides convenient methods for tracking operations within a handler
 * @param {PerformanceTracker} performanceTracker - Performance tracker instance
 * @param {string} parentOpId - Parent operation ID
 * @returns {Object} Performance context with helper methods
 */
function createPerformanceContext(performanceTracker, parentOpId) {
  return {
    trackAsync: (name, fn, metadata) => trackAsyncOperation(performanceTracker, parentOpId, name, fn, metadata),
    trackSync: (name, fn, metadata) => trackSyncOperation(performanceTracker, parentOpId, name, fn, metadata),
    createOperation: (name, metadata) => createTrackedOperation(performanceTracker, parentOpId, name, metadata),
    getParentId: () => parentOpId,
    getTracker: () => performanceTracker
  };
}

module.exports = {
  wrapIpcHandler,
  wrapIpcHandlers,
  createTrackedOperation,
  trackAsyncOperation,
  trackSyncOperation,
  createPerformanceContext,
  sanitizeArgs
};
