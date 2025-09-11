import { Given, When, Then, After } from '@wdio/cucumber-framework';
import { pages } from '../pageobjects';
import { browser } from '@wdio/globals';

Given('I have not entered any credentials', async () => {
    await pages.auth.open();
    // Don't enter any credentials - leave fields empty
});

Given('I have already been authenticated', async () => {
    await pages.auth.open();
    // Simulate already authenticated state
    await browser.execute(() => {
        localStorage.setItem('bluesky_authenticated', 'true');
        localStorage.setItem('bluesky_username', 'test.bksy.social');
    });
});

When('I attempt to navigate to the upload step', async () => {
    await pages.stepLayout.clickPreviousStep();
});

When('I attempt to navigate to a different URL directly', async () => {
    // Simulate direct URL navigation
    await browser.url('/step/config');
});

Then('the navigation should be allowed', async () => {
    // Verify navigation succeeded by checking URL
    const currentUrl = await browser.getUrl();
    expect(currentUrl).toContain('/step/');
});

Then('no authentication should be triggered', async () => {
    // Verify no splash screen appeared
    const isSplashVisible = await pages.stepLayout.isSplashScreenVisible();
    expect(isSplashVisible).toBe(false);
});

Then('the navigation should be allowed immediately', async () => {
    // Verify immediate navigation without authentication process
    const currentUrl = await browser.getUrl();
    expect(currentUrl).toContain('/step/config');
    
    // Verify no splash screen appeared
    const isSplashVisible = await pages.stepLayout.isSplashScreenVisible();
    expect(isSplashVisible).toBe(false);
});

Then('no authentication process should be triggered', async () => {
    // Verify no splash screen appeared
    const isSplashVisible = await pages.stepLayout.isSplashScreenVisible();
    expect(isSplashVisible).toBe(false);
});

Then('the authentication should succeed', async () => {
    // Wait for navigation to config step, indicating successful authentication
    await browser.waitUntil(
        async () => {
            const currentUrl = await browser.getUrl();
            return currentUrl.includes('/step/config');
        },
        { timeout: process.env.CI === 'true' ? 30000 : 15000, timeoutMsg: process.env.CI === 'true' ? 'Authentication did not succeed - not navigated to config step within 30 seconds' : 'Authentication did not succeed - not navigated to config step within 15 seconds' }
    );
});

Then('I should be on the config step page', async () => {
    const currentUrl = await browser.getUrl();
    expect(currentUrl).toContain('/step/config');
});

Then('I should be on the config step', async () => {
    const currentUrl = await browser.getUrl();
    expect(currentUrl).toContain('/step/config');
});

Then('I should be on the upload step', async () => {
    const currentUrl = await browser.getUrl();
    expect(currentUrl).toContain('/step/upload');
});

Then('the error should indicate "Authentication failed. Please check your credentials."', async () => {
    const snackbarText = await pages.navigationGuard.getSnackbarText();
    expect(snackbarText).toContain('Authentication failed. Please check your credentials.');
});

Then('the error should indicate "Authentication failed"', async () => {
    const snackbarText = await pages.navigationGuard.getSnackbarText();
    expect(snackbarText).toContain('Authentication failed');
});

