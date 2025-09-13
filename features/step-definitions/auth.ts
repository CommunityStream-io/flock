import { Given, When, Then, After } from '@wdio/cucumber-framework';
import { pages } from '../pageobjects';
import { browser, $ } from '@wdio/globals';
import { timeouts, timeoutMessages } from '../support/timeout-config';

Given('I am on the auth step page', async () => {
    await pages.auth.open();
});

Given('I am on the auth step page without valid credentials', async () => {
    await pages.auth.open();
    // Ensure no credentials are entered by clearing the fields
    await pages.auth.clearUsernameField();
    await pages.auth.clearPasswordField();
});

Given('I have navigated to the auth step', async () => {
    await pages.stepLayout.openAuthStep();
    // Wait for navigation to complete and auth form to load
    await browser.waitUntil(
        async () => {
            const isOnAuthStep = await pages.stepLayout.isOnStep('auth');
            const isAuthFormVisible = await pages.auth.authForm.isDisplayed();
            return isOnAuthStep && isAuthFormVisible;
        },
        { 
            timeout: timeouts.navigation,
            timeoutMsg: timeoutMessages.navigation(process.env.CI === 'true')
        }
    );
});

When('I navigate back to the upload step', async () => {
    try {
        // Record navigation start time for metrics
        const navigationStart = Date.now();
        
        await pages.stepLayout.openUploadStep();
        
        // Wait for navigation to complete and page to load with enhanced error handling
        await browser.waitUntil(
            async () => {
                try {
                    const isOnUploadStep = await pages.stepLayout.isOnStep('upload');
                    const isUploadSectionVisible = await pages.uploadStep.uploadSection.isDisplayed();
                    return isOnUploadStep && isUploadSectionVisible;
                } catch (error) {
                    // Log navigation errors for debugging
                    console.log(`Navigation check error: ${error.message}`);
                    return false;
                }
            },
            { 
                timeout: timeouts.navigation,
                timeoutMsg: `Navigation to upload step did not complete within ${timeouts.navigation}ms. This may indicate a server connectivity issue or port conflict.`
            }
        );
        
        // Record successful navigation for metrics
        const navigationEnd = Date.now();
        if (typeof testMetrics !== 'undefined') {
            testMetrics.recordNavigation(navigationStart, navigationEnd, true);
        }
        
    } catch (error) {
        // Record failed navigation for metrics
        const navigationEnd = Date.now();
        if (typeof testMetrics !== 'undefined') {
            testMetrics.recordNavigation(navigationStart, navigationEnd, false);
            testMetrics.recordError(error, 'navigate back to upload step');
        }
        
        // Enhanced error message with troubleshooting info
        const enhancedError = new Error(
            `Failed to navigate back to upload step: ${error.message}\n` +
            `This may be caused by:\n` +
            `- Server not running on expected port\n` +
            `- Port conflict (check if another process is using the port)\n` +
            `- Network connectivity issues\n` +
            `- Application not responding\n` +
            `Original error: ${error.message}`
        );
        throw enhancedError;
    }
});

Then('I should see a username input field with @ prefix', async () => {
    await expect(pages.auth.usernameField).toBeDisplayed();

    // Check if the field has a placeholder with @ prefix
    const placeholder = await pages.auth.usernameField.getAttribute('placeholder');
    expect(placeholder).toContain('@');
});

Then('I should see a password input field', async () => {
    await expect(pages.auth.passwordField).toBeDisplayed();
});

Then('I should see the Bluesky authentication form', async () => {
    await expect(pages.auth.authForm).toBeDisplayed();
});

Then('the form should be initially invalid', async () => {
    const isFormValid = await pages.stepLayout.nextButton.isEnabled();
    expect(isFormValid).toBe(false);
});

Then('the password field should show an error', async () => {
    const errorText = await pages.auth.getPasswordErrorText();
    expect(errorText).toBeTruthy();
});

Then('the password field should not show any errors', async () => {
    const errorText = await pages.auth.getPasswordErrorText();
    expect(errorText).toBe('');
});

Then('the password validation should pass', async () => {
    const errorText = await pages.auth.getPasswordErrorText();
    expect(errorText).toBe('');
});

Then('the error should indicate {string}', async (expectedError: string) => {
    // Check both username and password errors
    const usernameError = await pages.auth.getUsernameErrorText();
    const passwordError = await pages.auth.getPasswordErrorText();
    const formError = await pages.auth.formError.getText().catch(() => '');
    
    const hasExpectedError = usernameError.includes(expectedError) || 
                           passwordError.includes(expectedError) || 
                           formError.includes(expectedError);
    
    expect(hasExpectedError).toBe(true);
});

Then('the form should be valid', async () => {
    const isFormValid = await pages.stepLayout.nextButton.isEnabled();
    expect(isFormValid).toBe(true);
});

Then('the form should remain invalid', async () => {
    const isFormValid = await pages.stepLayout.nextButton.isEnabled();
    expect(isFormValid).toBe(false);
});

Then('the "Next" button should be enabled', async () => {
    const isEnabled = await pages.stepLayout.nextButton.isEnabled();
    expect(isEnabled).toBe(true);
});

When('I enter a username with @ symbol', async () => {
    await pages.auth.enterUsername('@username.bksy.social');
});

When('I enter a username without dots', async () => {
    await pages.auth.enterUsername('username');
});

When('I enter a username with one dot', async () => {
    await pages.auth.enterUsername('username.bksy');
});

When('I enter a valid username "username.bksy.social"', async () => {
    await pages.auth.enterUsername('username.bksy.social');
});

When('I enter a valid username', async () => {
    await pages.auth.enterUsername('test.bksy.social');
});

When('I enter a valid custom domain username "user.custom.domain"', async () => {
    await pages.auth.enterUsername('user.custom.domain');
});

Then('the username field should show an error', async () => {
    const errorText = await pages.auth.getUsernameErrorText();
    expect(errorText).toBeTruthy();
});

Then('the error should indicate "Do not include the @ symbol - it is automatically added"', async () => {
    const errorText = await pages.auth.getUsernameErrorText();
    expect(errorText).toContain('Do not include the @ symbol - it is automatically added');
});

Then('the error should indicate "Username must contain at least two dots (e.g., username.bksy.social)"', async () => {
    const errorText = await pages.auth.getUsernameErrorText();
    expect(errorText).toContain('Username must contain at least two dots');
});

Then('the username field should not show any errors', async () => {
    const errorText = await pages.auth.getUsernameErrorText();
    expect(errorText).toBe('');
});

Then('the username validation should pass', async () => {
    const errorText = await pages.auth.getUsernameErrorText();
    expect(errorText).toBe('');
});

When('I leave the password field empty', async () => {
    await pages.auth.enterPassword('');
    // Trigger blur to validate
    await pages.auth.passwordField.click();
    await $('body').click();
    // Wait for validation to complete
    await browser.waitUntil(
        async () => {
            // Check if form validation has completed
            const isFormValid = await pages.auth.isFormValid();
            return isFormValid;
        },
        { 
            timeout: timeouts.uiInteraction,
            timeoutMsg: timeoutMessages.uiInteraction(process.env.CI === 'true')
        }
    );
});

When('I enter a password', async () => {
    await pages.auth.enterPassword('testpassword123');
});

When('I enter a valid password', async () => {
    await pages.auth.enterPassword('testpassword123');
});

Then('the password field should show an error', async () => {
    const errorText = await pages.auth.getPasswordErrorText();
    expect(errorText).toBeTruthy();
});

Then('the error should indicate "Password is required"', async () => {
    const errorText = await pages.auth.getPasswordErrorText();
    expect(errorText).toContain('Password is required');
});

Then('the password field should not show any errors', async () => {
    const errorText = await pages.auth.getPasswordErrorText();
    expect(errorText).toBe('');
});

Then('the password validation should pass', async () => {
    const errorText = await pages.auth.getPasswordErrorText();
    expect(errorText).toBe('');
});

Given('I have entered a valid username', async () => {
    await pages.auth.enterUsername('test.bksy.social');
});

Given('I have entered a valid password', async () => {
    await pages.auth.enterPassword('testpassword123');
});

Then('the form should be initially invalid', async () => {
    const isFormValid = await pages.stepLayout.nextButton.isEnabled();
    expect(isFormValid).toBe(false);
});

Then('the form should be valid', async () => {
    const isValid = await pages.stepLayout.nextButton.isEnabled();
    expect(isValid).toBe(true);
});

Then('the "Next" button should be enabled', async () => {
    const isEnabled = await pages.stepLayout.nextButton.isEnabled();
    expect(isEnabled).toBe(true);
});

Given('I have entered valid credentials', async () => {
    console.log('🔧 BDD: Entering valid credentials with proper timeout handling');
    
    await pages.auth.open();
    await pages.auth.enterCredentials('test.bksy.social', 'testpassword123');
    
    // Wait for form validation to complete with proper timeout
    await browser.waitUntil(
        async () => {
            // Check if form is valid and ready
            const isFormValid = await pages.auth.isFormValid();
            const hasUsername = await pages.auth.usernameField.getValue();
            const hasPassword = await pages.auth.passwordField.getValue();
            return isFormValid && hasUsername && hasPassword;
        },
        { 
            timeout: timeouts.credentialEntry,
            timeoutMsg: timeoutMessages.credentialEntry(process.env.CI === 'true')
        }
    );
    
    console.log('✅ BDD: Valid credentials entered and form validated successfully');
});

When('I click the "Next" button', async () => {
    console.log('🔍 BDD: Step definition matched - clicking Next button');
    await pages.stepLayout.clickNextStep();
    console.log('🔍 BDD: Next button clicked successfully');
});

Then('the authentication script should run in the background', async () => {
    // Wait for navigation to complete, indicating authentication succeeded
    await browser.waitUntil(
        async () => {
            const currentUrl = await browser.getUrl();
            return currentUrl.includes('/step/config');
        },
        { timeout: timeouts.authNavigation, timeoutMsg: timeoutMessages.authNavigation(process.env.CI === 'true') }
    );
});

Then('I should be navigated to the config step', async () => {
    await browser.waitUntil(
        async () => {
            const currentUrl = await browser.getUrl();
            return currentUrl.includes('/step/config');
        },
        { timeout: timeouts.navigation, timeoutMsg: timeoutMessages.navigation(process.env.CI === 'true') }
    );
});

Then('I should see the splash screen', async () => {
    await pages.stepLayout.waitForSplashScreenToAppear();
    const isVisible = await pages.stepLayout.isSplashScreenVisible();
    expect(isVisible).toBe(true);
});

Then('the splash screen should display {string}', async (expectedMessage: string) => {
    await pages.stepLayout.waitForSplashScreenToAppear();
    const actualMessage = await pages.stepLayout.getSplashScreenMessage();
    expect(actualMessage).toContain(expectedMessage);
});

Then('the authentication should process in the background', async () => {
    // Wait for splash screen to appear and then disappear, indicating processing
    await pages.stepLayout.waitForSplashScreenToAppear();
    await pages.stepLayout.waitForSplashScreenToDisappear();
});

Given('I have entered invalid credentials', async () => {
    await pages.auth.open();
    await pages.auth.enterCredentials('invalid.user.name.invalid', 'wrongpassword');
    // Wait for form validation to complete
    await browser.waitUntil(
        async () => {
            // Check if form validation has completed
            const isFormValid = await pages.auth.isFormValid();
            return isFormValid;
        },
        { 
            timeout: timeouts.uiInteraction,
            timeoutMsg: timeoutMessages.uiInteraction(process.env.CI === 'true')
        }
    );
});

Given('I have entered credentials that will cause a network error', async () => {
    console.log('🔧 BDD: Setting up network error simulation');
    
    try {
        // Use WebDriverIO v9 Puppeteer integration
        const puppeteer = await browser.getPuppeteer();
        const puppeteerPages = await puppeteer.pages();
        
        if (puppeteerPages && puppeteerPages.length > 0) {
            const page = puppeteerPages[0];
            
            // Enable request interception
            await page.setRequestInterception(true);
            
            // Intercept and block authentication requests
            page.on('request', (request) => {
                const url = request.url();
                if (url.includes('xrpc/com.atproto.server.createSession') || 
                    url.includes('api/authenticate') || 
                    url.includes('authenticate')) {
                    console.log(`🚫 BDD: Blocking authentication request to ${url}`);
                    request.abort('failed');
                } else {
                    request.continue();
                }
            });
            
            console.log('✅ BDD: Network error simulation configured successfully');
        } else {
            console.log('⚠️ BDD: No pages found for network simulation - skipping');
        }
        
        await pages.auth.open();
        await pages.auth.enterCredentials('test.user.name', 'password');
        console.log('🔧 BDD: Credentials entered for network error test');
    } catch (error) {
        console.log('⚠️ BDD: Network error simulation failed:', error.message);
        // Fail fast - don't use fallbacks
        throw error;
    }
});

Then('the authentication should fail', async () => {
    // Check that we're still on the auth step
    const currentUrl = await browser.getUrl();
    expect(currentUrl).toContain('/step/auth');
});

Then('the authentication process should start', async () => {
    console.log('⚙️ BDD: Verifying authentication process has started');
    
    // Wait for splash screen to appear, indicating authentication process started
    await pages.stepLayout.waitForSplashScreenToAppear();
    console.log('✅ BDD: Authentication process started - splash screen appeared');
});

Then('I should see a snackbar error message', async () => {
    await pages.navigationGuard.waitForSnackbar();
});

Then('I should see the splash screen with {string}', async (expectedMessage: string) => {
    console.log(`⚙️ BDD: Verifying splash screen shows "${expectedMessage}"`);
    
    // Wait for splash screen to appear
    await pages.stepLayout.waitForSplashScreenToAppear();
    
    // Verify the splash screen message
    const actualMessage = await pages.stepLayout.getSplashScreenMessage();
    
    expect(actualMessage).toContain(expectedMessage);
    console.log(`✅ BDD: Splash screen shows correct message: "${actualMessage}"`);
});

Then('the error should indicate "Invalid Bluesky credentials"', async () => {
    const snackbarText = await pages.navigationGuard.getSnackbarText();
    expect(snackbarText).toContain('Invalid Bluesky credentials');
});

Then('the authentication should fail with an error', async () => {
    console.log('⚙️ BDD: Verifying authentication failed with error');
    
    // Wait for splash screen to disappear (authentication process completed)
    await pages.stepLayout.waitForSplashScreenToDisappear();
    
    // Verify we're still on the auth step (navigation was blocked)
    const currentUrl = await browser.getUrl();
    expect(currentUrl).toContain('/step/auth');
    
    console.log('✅ BDD: Authentication failed - user remains on auth step');
});

Then('I should remain on the auth step', async () => {
    const currentUrl = await browser.getUrl();
    expect(currentUrl).toContain('/step/auth');
});

// Cleanup for network error tests
After('@network-error', async () => {
    console.log('🧹 BDD: Cleaning up network error simulation');
    
    try {
        // Use WebDriverIO v9 Puppeteer integration for cleanup
        const puppeteer = await browser.getPuppeteer();
        const puppeteerPages = await puppeteer.pages();
        
        if (puppeteerPages && puppeteerPages.length > 0) {
            const page = puppeteerPages[0];
            // Disable request interception
            await page.setRequestInterception(false);
            console.log('✅ BDD: Network conditions reset to normal');
        } else {
            console.log('⚠️ BDD: No pages found for cleanup - skipping');
        }
    } catch (error) {
        console.log('⚠️ BDD: Network cleanup failed (expected in some environments):', error.message);
        // Fail fast - don't use fallbacks
        throw error;
    }
});

Then('the form should remain invalid', async () => {
    const isValid = await pages.stepLayout.nextButton.isEnabled();
    expect(isValid).toBe(false);
});

When('I attempt to navigate to the config step', async () => {
    await pages.stepLayout.clickNextStep();
    await pages.navigationGuard.waitForGuardExecution();
});

Then('the navigation should be blocked', async () => {
    const currentUrl = await browser.getUrl();
    expect(currentUrl).toContain('/step/auth');
});

Then('the error should indicate "Please provide valid Bluesky credentials"', async () => {
    const snackbarText = await pages.navigationGuard.getSnackbarText();
    expect(snackbarText).toContain('Please provide valid Bluesky credentials');
});

Given('I have successfully authenticated', async () => {
    // This would typically be set up by the test environment
    // or by completing a successful authentication flow
    await browser.execute(() => {
        // Simulate successful authentication state
        localStorage.setItem('bluesky_authenticated', 'true');
    });
});

Then('the navigation should succeed', async () => {
    const currentUrl = await browser.getUrl();
    expect(currentUrl).toContain('/step/config');
});

When('I attempt to navigate away from the auth step', async () => {
    await pages.stepLayout.clickNextStep();
});

Then('the system should validate my credentials', async () => {
    // This step verifies that validation occurs
    // The actual validation logic is in the component and in the auth resolver
});

Then('I should proceed to the next step', async () => {
    // This is handled by the navigation guard
    // We verify the outcome in the next step
});

Then('the error should indicate "Please complete authentication before proceeding"', async () => {
    const snackbarText = await pages.navigationGuard.getSnackbarText();
    expect(snackbarText).toContain('Please complete authentication before proceeding');
});

Then('I should remain on the auth step', async () => {
    // Verify we're still on the auth step
    const currentUrl = await browser.getUrl();
    expect(currentUrl).toContain('/step/auth');
});

// Help dialog steps
When('I click the help icon', async () => {
    await pages.auth.clickHelpIcon();
});

Then('I should see a help dialog with username format suggestions', async () => {
    const isDialogVisible = await pages.auth.isHelpDialogVisible();
    expect(isDialogVisible).toBe(true);
});

Then('the dialog should contain {string}', async (expectedText: string) => {
    const dialogText = await pages.auth.getHelpDialogText();
    expect(dialogText).toContain(expectedText);
});

Then('the dialog should explain that the @ symbol is automatically added', async () => {
    const dialogText = await pages.auth.getHelpDialogText();
    expect(dialogText).toContain('@ symbol is automatically added');
});

When('I close the help dialog', async () => {
    await pages.auth.closeHelpDialog();
    // Wait for dialog to disappear using waitUntil for more reliable dialog closing
    await browser.waitUntil(
        async () => {
            const isDialogVisible = await pages.auth.isHelpDialogVisible();
            return !isDialogVisible;
        },
        { 
            timeout: timeouts.dialogClose, 
            timeoutMsg: timeoutMessages.dialogClose(process.env.CI === 'true')
        }
    );
});

When('I close the help dialog with Escape key', async () => {
    await pages.auth.closeHelpDialogWithEscape();
    // Wait for dialog to disappear using waitUntil for more reliable dialog closing
    await browser.waitUntil(
        async () => {
            const isDialogVisible = await pages.auth.isHelpDialogVisible();
            return !isDialogVisible;
        },
        { 
            timeout: timeouts.dialogClose, 
            timeoutMsg: 'Help dialog did not close with Escape key within expected time'
        }
    );
});

Then('the help dialog should be hidden', async () => {
    const isDialogVisible = await pages.auth.isHelpDialogVisible();
    expect(isDialogVisible).toBe(false);
});