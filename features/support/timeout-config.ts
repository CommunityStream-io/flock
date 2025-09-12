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
    // CI timeouts - increased for static file serving reliability
    return {
      appLoad: 3000,           // 3s - Application loading (reduced from 5s)
      splashScreen: 3000,      // 3s - Splash screen appearance (reduced from 5s)
      navigation: 3000,        // 3s - General navigation (reduced from 5s)
      quickNavigation: 2000,   // 2s - Quick navigation operations (reduced from 3s)
      fileProcessing: 2000,    // 2s - File processing operations (reduced from 3s)
      fileValidation: 3000,    // 3s - File validation (reduced from 5s)
      fileError: 1500,         // 1.5s - File error display (reduced from 2s)
      auth: 3000,              // 3s - Authentication operations (reduced from 5s)
      authNavigation: 3000,    // 3s - Auth-related navigation (reduced from 5s)
      uiInteraction: 3000,     // 3s - UI interactions (reduced from 5s)
      dialogClose: 3000,       // 3s - Dialog closing (reduced from 5s)
      immediate: 1500,         // 1.5s - Very quick operations (reduced from 2s)
    };
  } else {
    // Local development timeouts - more generous for debugging
    return {
      appLoad: 6000,           // 6s - Application loading
      splashScreen: 5000,      // 5s - Splash screen appearance
      navigation: 5000,        // 5s - General navigation
      quickNavigation: 2500,   // 2.5s - Quick navigation operations
      fileProcessing: 4000,    // 4s - File processing operations
      fileValidation: 6000,    // 6s - File validation
      fileError: 2500,         // 2.5s - File error display
      auth: 5000,              // 5s - Authentication operations
      authNavigation: 5000,    // 5s - Auth-related navigation
      uiInteraction: 4000,     // 4s - UI interactions
      dialogClose: 4000,       // 4s - Dialog closing
      immediate: 2000,         // 2s - Very quick operations
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
  uiInteraction: createTimeoutOptions('uiInteraction', 'UI interaction did not complete within expected time'),
  dialogClose: createTimeoutOptions('dialogClose', 'Dialog did not close within expected time'),
  immediate: createTimeoutOptions('immediate', 'Immediate operation did not complete within expected time'),
};

/**
 * Environment-specific timeout messages
 */
export const timeoutMessages = {
  appLoad: (isCI: boolean) => 
    isCI ? 'Application did not load within 5 seconds' : 'Application did not load within 3 seconds',
  splashScreen: (isCI: boolean) => 
    isCI ? 'Splash screen did not appear within 5 seconds' : 'Splash screen did not appear within 3 seconds',
  navigation: (isCI: boolean) => 
    isCI ? 'Navigation did not complete within 5 seconds' : 'Navigation did not complete within 3 seconds',
  quickNavigation: (isCI: boolean) => 
    isCI ? 'Quick navigation did not complete within 3 seconds' : 'Quick navigation did not complete within 2 seconds',
  fileProcessing: (isCI: boolean) => 
    isCI ? 'File processing did not complete within 3 seconds' : 'File processing did not complete within 2 seconds',
  fileValidation: (isCI: boolean) => 
    isCI ? 'File validation did not complete within 5 seconds' : 'File validation did not complete within 3 seconds',
  fileError: (isCI: boolean) => 
    isCI ? 'File error did not appear within 2 seconds' : 'File error did not appear within 1.5 seconds',
  auth: (isCI: boolean) => 
    isCI ? 'Authentication did not complete within 5 seconds' : 'Authentication did not complete within 3 seconds',
  authNavigation: (isCI: boolean) => 
    isCI ? 'Authentication navigation did not complete within 5 seconds' : 'Authentication navigation did not complete within 3 seconds',
  uiInteraction: (isCI: boolean) => 
    isCI ? 'UI interaction did not complete within 5 seconds' : 'UI interaction did not complete within 3 seconds',
  dialogClose: (isCI: boolean) => 
    isCI ? 'Dialog did not close within 5 seconds' : 'Dialog did not close within 3 seconds',
  immediate: (isCI: boolean) => 
    isCI ? 'Immediate operation did not complete within 2 seconds' : 'Immediate operation did not complete within 1.5 seconds',
};
