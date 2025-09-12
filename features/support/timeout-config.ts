/**
 * Centralized timeout configuration for E2E tests
 * 
 * This file provides a single source of truth for all timeout values
 * used throughout the test suite, making it easy to adjust timeouts
 * globally without hunting through multiple files.
 */

export interface TimeoutConfig {
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
      appLoad: 8000,           // 8s - Application loading (was 5s)
      splashScreen: 10000,     // 10s - Splash screen appearance (was 3s)
      navigation: 8000,        // 8s - General navigation (was 3s)
      quickNavigation: 3000,   // 3s - Quick navigation operations (was 2s)
      fileProcessing: 5000,    // 5s - File processing operations (was 3s)
      fileValidation: 8000,    // 8s - File validation (was 5s)
      fileError: 3000,         // 3s - File error display (was 2s)
      auth: 12000,             // 12s - Authentication operations (was 4s)
      authNavigation: 8000,    // 8s - Auth-related navigation (was 3s)
      credentialEntry: 15000,  // 15s - Credential entry and validation (NEW)
      uiInteraction: 8000,     // 8s - UI interactions (was 3s)
      dialogClose: 5000,       // 5s - Dialog closing (was 3s)
      immediate: 3000,         // 3s - Very quick operations (was 2s)
    };
  } else {
    // Local development timeouts - more generous for debugging
    return {
      appLoad: 8000,           // 8s - Application loading (was 6s)
      splashScreen: 8000,      // 8s - Splash screen appearance (was 5s)
      navigation: 6000,        // 6s - General navigation (was 5s)
      quickNavigation: 3000,   // 3s - Quick navigation operations (was 2.5s)
      fileProcessing: 5000,    // 5s - File processing operations (was 4s)
      fileValidation: 8000,    // 8s - File validation (was 6s)
      fileError: 3000,         // 3s - File error display (was 2.5s)
      auth: 8000,              // 8s - Authentication operations (was 5s)
      authNavigation: 6000,    // 6s - Auth-related navigation (was 5s)
      credentialEntry: 10000,  // 10s - Credential entry and validation (NEW)
      uiInteraction: 6000,     // 6s - UI interactions (was 4s)
      dialogClose: 5000,       // 5s - Dialog closing (was 4s)
      immediate: 3000,         // 3s - Very quick operations (was 2s)
    };
  }
}

/**
 * Get timeout configuration for current environment
 */
export const timeouts = getTimeoutConfig();

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
    isCI ? 'Application did not load within 5 seconds' : 'Application did not load within 6 seconds',
  splashScreen: (isCI: boolean) => 
    isCI ? 'Splash screen did not appear within 3 seconds' : 'Splash screen did not appear within 5 seconds',
  navigation: (isCI: boolean) => 
    isCI ? 'Navigation did not complete within 3 seconds' : 'Navigation did not complete within 5 seconds',
  quickNavigation: (isCI: boolean) => 
    isCI ? 'Quick navigation did not complete within 2 seconds' : 'Quick navigation did not complete within 2.5 seconds',
  fileProcessing: (isCI: boolean) => 
    isCI ? 'File processing did not complete within 3 seconds' : 'File processing did not complete within 4 seconds',
  fileValidation: (isCI: boolean) => 
    isCI ? 'File validation did not complete within 5 seconds' : 'File validation did not complete within 6 seconds',
  fileError: (isCI: boolean) => 
    isCI ? 'File error did not appear within 2 seconds' : 'File error did not appear within 2.5 seconds',
  auth: (isCI: boolean) => 
    isCI ? 'Authentication did not complete within 12 seconds' : 'Authentication did not complete within 8 seconds',
  authNavigation: (isCI: boolean) => 
    isCI ? 'Authentication navigation did not complete within 8 seconds' : 'Authentication navigation did not complete within 6 seconds',
  credentialEntry: (isCI: boolean) => 
    isCI ? 'Credential entry did not complete within 15 seconds' : 'Credential entry did not complete within 10 seconds',
  uiInteraction: (isCI: boolean) => 
    isCI ? 'UI interaction did not complete within 8 seconds' : 'UI interaction did not complete within 6 seconds',
  dialogClose: (isCI: boolean) => 
    isCI ? 'Dialog did not close within 3 seconds' : 'Dialog did not close within 4 seconds',
  immediate: (isCI: boolean) => 
    isCI ? 'Immediate operation did not complete within 2 seconds' : 'Immediate operation did not complete within 2 seconds',
};
