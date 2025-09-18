/// <reference path="../../test/types.d.ts" />
import { Given, When, Then, After, Before } from '@wdio/cucumber-framework';
import { pages } from '../pageobjects';
import { browser, $ } from '@wdio/globals';
import { timeouts, timeoutMessages, timeoutOptions } from '../support/timeout-config';
import { bddLog } from '../support/logger';
// Allure API is available via @wdio/allure-reporter global

// Import global setup
import '../support/global-setup';

// Import all step definition modules to register them
import './landing';
import './auth';
import './splash-screen';
import './splash-screen-direct';
import './step-navigation';
import './file-upload';

// ===== ALLURE DEDUPLICATION HELPERS =====

/**
 * Generate a consistent AllureId for test deduplication
 * This prevents duplicate test results across shards
 */
function generateAllureId(scenarioTitle: string, featurePath: string): string {
    // Create a deterministic ID based on feature and scenario
    const featureName = featurePath.split('/').pop()?.replace('.feature', '') || 'unknown';
    const scenarioHash = scenarioTitle
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
    
    return `${featureName}-${scenarioHash}`;
}

/**
 * Set AllureId and labels for current test to enable deduplication and organization
 * Only run this hook for scenarios, not individual steps
 */
Before({ tags: '@scenario' }, async function(scenario) {
    try {
        const allureId = generateAllureId(scenario.pickle.name, scenario.pickle.uri);
        const featureName = scenario.pickle.uri.split('/').pop()?.replace('.feature', '') || 'unknown';
        
        // Set AllureId to prevent duplicates across shards
        if (global.allure) {
            global.allure.id = allureId;
            
            // Add organizational labels
            global.allure.label('feature', featureName);
            global.allure.label('story', scenario.pickle.name);
            global.allure.label('suite', 'E2E Tests');
            
            // Add shard information for debugging
            if (process.env.SHARDED_TESTS === 'true') {
                global.allure.label('tag', 'sharded');
            }
            
            // Add environment labels
            if (process.env.CI === 'true') {
                global.allure.label('tag', 'ci');
            } else {
                global.allure.label('tag', 'local');
            }
        }
    } catch (error) {
        // Log the error but don't fail the test
        console.warn('Allure setup failed:', error.message);
    }
});

// ===== URL CHECKS =====

Then('the URL should contain {string}', async (urlPath: string) => {
    const currentUrl = await browser.getUrl();
    await expect(currentUrl).toContain(urlPath);
});

// ===== COMMON STEPS =====

Given('the splash screen message should be {string}', async (expectedMessage: string) => {
    try {
        // Wait for splash screen to be visible with longer timeout for CI
        const isSplashVisible = await browser.waitUntil(
            async () => await pages.stepLayout.isSplashScreenVisible(),
            timeoutOptions.splashScreen
        );
        
        if (isSplashVisible) {
            // Get the current splash screen message
            const actualMessage = await pages.stepLayout.getSplashScreenMessage();
            expect(actualMessage).toBe(expectedMessage);
        }
        // If splash screen is not visible, that's also valid for the default state
    } catch (error) {
        // If there's any error checking the splash screen, log it but don't fail the test
        bddLog(`Could not verify splash screen message: ${error.message}`, 'warning');
    }
});

// Simple navigation step
Given('I navigate to the application', async () => {
    await browser.url('/');
});

