import { browser } from '@wdio/globals';
import { pages } from '../pageobjects';

/**
 * Test setup utilities for E2E tests
 * These functions help set up proper state for tests that require navigation between steps
 */

/**
 * Sets up a valid file upload state to allow navigation between steps
 * This bypasses the uploadValidGuard by directly setting the service state
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
    { 
      timeout: 10000,
      timeoutMsg: 'Upload page did not load within timeout'
    }
  );
  
  // Select a valid file
  await pages.uploadStep.selectFile(filename);
  
  // Directly set the file service state to bypass validation
  await browser.execute(() => {
    // Access the Angular application and set the file service state directly
    const appElement = document.querySelector('app-root');
    if (appElement && (appElement as any).__ngContext__) {
      const context = (appElement as any).__ngContext__;
      // Find the file service in the context
      for (let i = 0; i < context.length; i++) {
        const service = context[i];
        if (service && service.archivedFile !== undefined) {
          // This is likely the file service, set a mock file
          service.archivedFile = new File(['mock content'], 'test-archive.zip', { type: 'application/zip' });
          console.log('✅ BDD: File service state set directly');
          break;
        }
      }
    }
  });
  
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
  
  // Navigate to auth step
  await browser.url('/step/auth');
  
  // Wait for auth form to be visible
  await browser.waitUntil(
    async () => {
      const isAuthFormVisible = await pages.auth.authForm.isDisplayed();
      return isAuthFormVisible;
    },
    { 
      timeout: 10000,
      timeoutMsg: 'Auth form did not appear within timeout'
    }
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
