/**
 * Centralized timeout configuration for E2E tests
 * 
 * This file provides a single source of truth for all timeout values
 * used throughout the test suite, making it easy to adjust timeouts
 * globally without hunting through multiple files.
 */

export interface TimeoutConfig {
  // Global timeouts
  global: number;
  waitUntilGlobal: number;  // Global timeout for waitUntil calls
  
  // Application loading timeouts
  appLoad: number;
  splashScreen: number;
  
  // Navigation timeouts
  navigation: number;
  quickNavigation: number;
  
  // File operation timeouts
  fileProcessing: number;
  fileValidation: number;
  fileError: number;
  
  // Authentication timeouts
  auth: number;
  authNavigation: number;
  credentialEntry: number;  // New: Credential entry and validation
  
  // UI interaction timeouts
  uiInteraction: number;
  dialogClose: number;
  
  // Very quick operations
  immediate: number;
}

/**
 * Get timeout configuration based on environment
 * 
 * @param isCI - Whether running in CI environment
 * @returns Timeout configuration object
 */
export function getTimeoutConfig(isCI: boolean = process.env.CI === 'true'): TimeoutConfig {
  if (isCI) {
    // CI timeouts - increased for sharded test stability
    return {
      global: 120000,          // 120s (2 minutes) - Global timeout (must be higher than all step-specific timeouts)
      waitUntilGlobal: 30000,  // 30s - Global timeout for waitUntil calls
      appLoad: 25000,          // 25s - Application loading (lower than global timeout)
      splashScreen: 25000,     // 25s - Splash screen appearance (lower than global timeout)
      navigation: 25000,       // 25s - General navigation (lower than global timeout)
      quickNavigation: 3000,   // 3s - Quick navigation operations (was 2s)
      fileProcessing: 8000,    // 8s - File processing operations (was 5s)
      fileValidation: 10000,   // 10s - File validation (was 8s)
      fileError: 3000,         // 3s - File error display (was 2s)
      auth: 25000,             // 25s - Authentication operations (lower than global timeout)
      authNavigation: 10000,   // 10s - Auth-related navigation (was 8s)
      credentialEntry: 15000,  // 15s - Credential entry and validation (NEW)
      uiInteraction: 10000,    // 10s - UI interactions (was 8s)
      dialogClose: 5000,       // 5s - Dialog closing (was 3s)
      immediate: 3000,         // 3s - Very quick operations (was 2s)
    };
  } else {
    // Local development timeouts - more generous for debugging
    return {
      global: 120000,          // 120s (2 minutes) - Global timeout (must be higher than all step-specific timeouts)
      waitUntilGlobal: 30000,  // 30s - Global timeout for waitUntil calls
      appLoad: 20000,          // 20s - Application loading (lower than global timeout)
      splashScreen: 20000,     // 20s - Splash screen appearance (lower than global timeout)
      navigation: 20000,       // 20s - General navigation (lower than global timeout)
      quickNavigation: 3000,   // 3s - Quick navigation operations (was 2.5s)
      fileProcessing: 5000,    // 5s - File processing operations (was 4s)
      fileValidation: 10000,   // 10s - File validation (was 8s)
      fileError: 3000,         // 3s - File error display (was 2.5s)
      auth: 20000,             // 20s - Authentication operations (close to global timeout)
      authNavigation: 10000,   // 10s - Auth-related navigation (was 6s)
      credentialEntry: 10000,  // 10s - Credential entry and validation (NEW)
      uiInteraction: 6000,     // 6s - UI interactions (was 4s)
      dialogClose: 5000,       // 5s - Dialog closing (was 4s)
      immediate: 3000,         // 3s - Very quick operations (was 2s)
    };
  }
}

/**
 * Get timeout configuration for current environment
 * This is now a function to ensure CI detection happens at runtime
 */
export function getTimeouts() {
    const isCI = process.env.CI === 'true';
    const config = getTimeoutConfig(isCI);
    return config;
}

// For backward compatibility, create a dynamic object that calls the function
export const timeouts = {
    get global() { return getTimeouts().global; },
    get appLoad() { return getTimeouts().appLoad; },
    get splashScreen() { return getTimeouts().splashScreen; },
    get navigation() { return getTimeouts().navigation; },
    get quickNavigation() { return getTimeouts().quickNavigation; },
    get fileProcessing() { return getTimeouts().fileProcessing; },
    get fileValidation() { return getTimeouts().fileValidation; },
    get fileError() { return getTimeouts().fileError; },
    get auth() { return getTimeouts().auth; },
    get authNavigation() { return getTimeouts().authNavigation; },
    get credentialEntry() { return getTimeouts().credentialEntry; },
    get uiInteraction() { return getTimeouts().uiInteraction; },
    get dialogClose() { return getTimeouts().dialogClose; },
    get immediate() { return getTimeouts().immediate; }
};

/**
 * Helper function to create timeout options for browser.waitUntil
 * 
 * @param timeoutType - Type of timeout from config
 * @param customMessage - Custom timeout message (optional)
 * @returns Timeout options object
 */
export function createTimeoutOptions(
  timeoutType: keyof TimeoutConfig,
  customMessage?: string
): { timeout: number; timeoutMsg: string } {
  const timeout = timeouts[timeoutType];
  const defaultMessage = `${timeoutType} did not complete within ${timeout}ms`;
  
  return {
    timeout,
    timeoutMsg: customMessage || defaultMessage
  };
}

/**
 * Pre-configured timeout options for common operations
 */
export const timeoutOptions = {
  appLoad: createTimeoutOptions('appLoad', 'Application did not load within expected time'),
  splashScreen: createTimeoutOptions('splashScreen', 'Splash screen did not appear within expected time'),
  navigation: createTimeoutOptions('navigation', 'Navigation did not complete within expected time'),
  quickNavigation: createTimeoutOptions('quickNavigation', 'Quick navigation did not complete within expected time'),
  fileProcessing: createTimeoutOptions('fileProcessing', 'File processing did not complete within expected time'),
  fileValidation: createTimeoutOptions('fileValidation', 'File validation did not complete within expected time'),
  fileError: createTimeoutOptions('fileError', 'File error did not appear within expected time'),
  auth: createTimeoutOptions('auth', 'Authentication did not complete within expected time'),
  authNavigation: createTimeoutOptions('authNavigation', 'Authentication navigation did not complete within expected time'),
  credentialEntry: createTimeoutOptions('credentialEntry', 'Credential entry did not complete within expected time'),
  uiInteraction: createTimeoutOptions('uiInteraction', 'UI interaction did not complete within expected time'),
  dialogClose: createTimeoutOptions('dialogClose', 'Dialog did not close within expected time'),
  immediate: createTimeoutOptions('immediate', 'Immediate operation did not complete within expected time'),
};

/**
 * Environment-specific timeout messages
 */
export const timeoutMessages = {
  appLoad: (isCI: boolean) => 
    isCI ? 'Application did not load within 15 seconds' : 'Application did not load within 12 seconds',
  splashScreen: (isCI: boolean) => 
    isCI ? 'Splash screen did not appear within 3 seconds' : 'Splash screen did not appear within 5 seconds',
  navigation: (isCI: boolean) => 
    isCI ? 'Navigation did not complete within 3 seconds' : 'Navigation did not complete within 5 seconds',
  quickNavigation: (isCI: boolean) => 
    isCI ? 'Quick navigation did not complete within 2 seconds' : 'Quick navigation did not complete within 2.5 seconds',
  fileProcessing: (isCI: boolean) => 
    isCI ? 'File processing did not complete within 8 seconds' : 'File processing did not complete within 5 seconds',
  fileValidation: (isCI: boolean) => 
    isCI ? 'File validation did not complete within 10 seconds' : 'File validation did not complete within 10 seconds',
  fileError: (isCI: boolean) => 
    isCI ? 'File error did not appear within 2 seconds' : 'File error did not appear within 2.5 seconds',
  auth: (isCI: boolean) => 
    isCI ? 'Authentication did not complete within 12 seconds' : 'Authentication did not complete within 8 seconds',
  authNavigation: (isCI: boolean) => 
    isCI ? 'Authentication navigation did not complete within 10 seconds' : 'Authentication navigation did not complete within 10 seconds',
  credentialEntry: (isCI: boolean) => 
    isCI ? 'Credential entry did not complete within 15 seconds' : 'Credential entry did not complete within 10 seconds',
  uiInteraction: (isCI: boolean) => 
    isCI ? 'UI interaction did not complete within 10 seconds' : 'UI interaction did not complete within 6 seconds',
  dialogClose: (isCI: boolean) => 
    isCI ? 'Dialog did not close within 3 seconds' : 'Dialog did not close within 4 seconds',
  immediate: (isCI: boolean) => 
    isCI ? 'Immediate operation did not complete within 2 seconds' : 'Immediate operation did not complete within 2 seconds',
};
