import { browser } from '@wdio/globals';
import { pages } from '../pageobjects';
import { timeouts, timeoutMessages, createTimeoutOptions } from './timeout-config';

/**
 * Test setup utilities for E2E tests
 * These functions help set up proper state for tests that require navigation between steps
 */

/**
 * Sets up a valid file upload state to allow navigation between steps
 * This uses DOM-based file selection instead of accessing private service properties
 */
export async function setupValidFileUpload(filename: string = 'test-archive.zip'): Promise<void> {
  console.log('🔧 BDD: Setting up valid file upload state');
  
  // Navigate to upload step
  await browser.url('/step/upload');
  
  // Wait for upload page to load
  await browser.waitUntil(
    async () => {
      const isUploadPageLoaded = await pages.uploadStep.uploadSection.isDisplayed();
      return isUploadPageLoaded;
    },
    createTimeoutOptions('appLoad', 'Upload page did not load within expected time')
  );
  
  // Select a valid file using the page object method
  await pages.uploadStep.selectFile(filename);
  
  // Wait for file validation to complete
  await browser.waitUntil(
    async () => {
      const hasFiles = await pages.uploadStep.hasFiles();
      const isFormValid = await pages.uploadStep.isFormValid();
      return hasFiles && isFormValid;
    },
    createTimeoutOptions('fileValidation', 'File validation did not complete within expected time')
  );
  
  console.log('✅ BDD: Valid file upload state established');
}

/**
 * Sets up authentication state for testing
 * This ensures the auth form is accessible and ready for testing
 */
export async function setupAuthState(): Promise<void> {
  console.log('🔧 BDD: Setting up authentication state');
  
  // First set up valid file upload
  await setupValidFileUpload();
  
  // Navigate to auth step - this should now work because we have valid file state
  await browser.url('/step/auth');
  
  // Wait for auth form to be visible
  await browser.waitUntil(
    async () => {
      const isAuthFormVisible = await pages.auth.authForm.isDisplayed();
      return isAuthFormVisible;
    },
    createTimeoutOptions('authNavigation', 'Auth form did not appear within expected time')
  );
  
  console.log('✅ BDD: Authentication state established');
}

/**
 * Sets up complete test state for splash screen testing
 * This ensures all prerequisites are met for testing the splash screen functionality
 */
export async function setupSplashScreenTestState(): Promise<void> {
  console.log('🔧 BDD: Setting up splash screen test state');
  
  // Set up authentication state
  await setupAuthState();
  
  // Verify we can access the auth form
  const isAuthFormVisible = await pages.auth.authForm.isDisplayed();
  if (!isAuthFormVisible) {
    throw new Error('Auth form is not visible - cannot proceed with splash screen test');
  }
  
  console.log('✅ BDD: Splash screen test state established');
}

/**
 * Simulates a valid file upload for navigation guard testing
 * This uses DOM-based file selection to trigger the actual Angular form validation
 */
export async function simulateValidFileUpload(filename: string = 'test-archive.zip'): Promise<void> {
  console.log('🔧 BDD: Simulating valid file upload');
  
  // Navigate to upload step
  await pages.uploadStep.open();
  
  // Select a valid file using the page object method
  await pages.uploadStep.selectFile(filename);
  
  // Wait for file validation to complete
  await browser.waitUntil(
    async () => {
      const hasFiles = await pages.uploadStep.hasFiles();
      const isFormValid = await pages.uploadStep.isFormValid();
      return hasFiles && isFormValid;
    },
    createTimeoutOptions('fileValidation', 'File validation did not complete within expected time')
  );
  
  console.log('✅ BDD: Valid file upload simulated');
}

/**
 * Simulates no file upload state for testing navigation guards
 * This ensures the upload step is in its initial state
 */
export async function simulateNoFileUpload(): Promise<void> {
  console.log('🔧 BDD: Simulating no file upload state');
  
  // Navigate to upload step
  await pages.uploadStep.open();
  
  // Verify no files are selected
  const hasFiles = await pages.uploadStep.hasFiles();
  if (hasFiles) {
    // If files are selected, remove them
    await pages.uploadStep.clickDeleteButton(0);
  }
  
  // Verify the form is in invalid state
  const isFormValid = await pages.uploadStep.isFormValid();
  if (isFormValid) {
    throw new Error('Form should be invalid when no file is uploaded');
  }
  
  console.log('✅ BDD: No file upload state simulated');
}
