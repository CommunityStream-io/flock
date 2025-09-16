import { Before, After } from '@wdio/cucumber-framework';
import { browser } from '@wdio/globals';
import { bddLog } from './logger';
import { timeouts, timeoutMessages, timeoutOptions } from './timeout-config';

// Global application state
let applicationInitialized = false;

// Internal function to initialize application (runs only once per session)
async function initializeApplication() {
    if (applicationInitialized) {
        bddLog('Application already initialized, skipping setup', 'setup');
        return;
    }
    
    bddLog('Initializing application globally', 'setup');
    await browser.url('/');
    
    // Wait for application to be ready
    await browser.waitUntil(
        async () => {
            const readyState = await browser.execute(() => document.readyState);
            if (readyState !== 'complete') return false;
            
            const hasAppRoot = await browser.$('app-root').isExisting();
            if (!hasAppRoot) return false;
            
            const hasContent = await browser.execute(() => {
                const appRoot = document.querySelector('app-root');
                return appRoot && appRoot.children.length > 0;
            });
            
            return hasContent;
        },
        timeoutOptions.appLoad
    );
    
    applicationInitialized = true;
    bddLog('Application initialized successfully', 'success');
}

// Global setup - runs once per test session
Before({ tags: '@requires-app' }, async () => {
    await initializeApplication();
});

// Reset state between scenarios
After({ tags: '@requires-app' }, async () => {
    // Reset to home page for next scenario
    await browser.url('/');
});
