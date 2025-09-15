import { Given, When, Then } from '@wdio/cucumber-framework';
import { pages } from '../pageobjects';
import { browser } from '@wdio/globals';

Given('I am on the auth page with valid file state', async () => {
  console.log('🔧 BDD: Setting up auth page with valid file state');
  
  // Navigate directly to auth page
  await browser.url('/step/auth');
  
  // Set up valid file state directly in the service
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
          console.log('✅ BDD: File service state set directly for auth page');
          break;
        }
      }
    }
  });
  
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
  
  console.log('✅ BDD: Auth page with valid file state established');
});

Given('I have entered valid credentials', async () => {
  console.log('🔧 BDD: Entering valid credentials');
  
  // Enter valid username
  await pages.auth.enterUsername('testuser');
  
  // Enter valid password
  await pages.auth.enterPassword('testpass');
  
  console.log('✅ BDD: Valid credentials entered');
});

When('I trigger the authentication process', async () => {
  console.log('🔧 BDD: Triggering authentication process');
  
  // Click the Next button to trigger authentication
  await pages.stepLayout.clickNextStep();
  
  console.log('✅ BDD: Authentication process triggered');
});

Then('I should see the splash screen', async () => {
  console.log('🔧 BDD: Checking for splash screen visibility');
  
  // Wait for splash screen to appear
  await pages.stepLayout.waitForSplashScreenToAppear();
  
  // Verify splash screen is visible
  const isVisible = await pages.stepLayout.isSplashScreenVisible();
  expect(isVisible).toBe(true);
  
  console.log('✅ BDD: Splash screen is visible');
});

Then('the splash screen should display {string}', async (expectedMessage: string) => {
  console.log(`🔧 BDD: Checking splash screen message: "${expectedMessage}"`);
  
  // Get the splash screen message
  const actualMessage = await pages.stepLayout.getSplashScreenMessage();
  expect(actualMessage).toContain(expectedMessage);
  
  console.log(`✅ BDD: Splash screen displays correct message: "${actualMessage}"`);
});

Then('the splash screen should disappear after authentication completes', async () => {
  console.log('🔧 BDD: Waiting for splash screen to disappear');
  
  // Wait for splash screen to disappear
  await pages.stepLayout.waitForSplashScreenToDisappear();
  
  // Verify splash screen is not visible
  const isVisible = await pages.stepLayout.isSplashScreenVisible();
  expect(isVisible).toBe(false);
  
  console.log('✅ BDD: Splash screen has disappeared');
});
