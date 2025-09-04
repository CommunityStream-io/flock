import type { Config } from '@wdio/types';

export const config: Config = {
    // =====
    // WebdriverIO Configuration
    // =====
    
    // Test runner configuration
    runner: 'local',
    
    // Test specs
    specs: [
        './features/**/*.feature'
    ],
    
    // Exclude patterns
    exclude: [
        './features/**/*.skipped.feature'
    ],
    
    // Maximum number of total parallel running workers
    maxInstances: 4,
    
    // Capabilities for different browsers
    capabilities: [
        {
            browserName: 'chrome',
            'goog:chromeOptions': {
                args: process.env.HEADLESS === 'true' ? [
                    '--headless',
                    '--no-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-gpu',
                    '--window-size=1920,1080'
                ] : [
                    '--no-sandbox',
                    '--disable-dev-shm-usage',
                    '--window-size=1920,1080'
                ]
            }
        }
    ],
    
    // Test configuration
    logLevel: 'info',
    bail: 0,
    baseUrl: 'http://localhost:4200',
    waitforTimeout: 10000,
    connectionRetryTimeout: 120000,
    connectionRetryCount: 3,
    
    // Test runner services
    services: [],
    
    // Environment variables
    env: {
        DEBUG: '',
        NODE_ENV: 'test'
    },
    
    // Framework configuration
    framework: 'cucumber',
    cucumberOpts: {
        require: ['./features/step-definitions/**/*.ts'],
        backtrace: false,
        requireModule: ['ts-node/register'],
        dryRun: false,
        failFast: false,
        snippets: true,
        source: true,
        strict: false,
        tags: process.env.TEST_TAGS || "",
        timeout: 30000,
        ignoreUndefinedDefinitions: true,
        format: ['pretty'],
        publishQuiet: process.env.DEBUG_TESTS !== 'true'
    },
    
    // =====
    // Hooks
    // =====
    
    beforeSession: function (config, capabilities, specs, cid) {
        // Initialize test session
    },
    
    beforeTest: async function (test, context) {
        // Initialize test
    },
    
    afterTest: async function (test, context, { error, result, duration, passed, retries }) {
        if (!passed) {
            // Screenshot will be taken automatically by WebdriverIO on failure
        }
    },
    
    afterSuite: function (suite) {
        // Clean up after each suite
    },
    
    onComplete: async function (exitCode, config, capabilities, results) {
        // Final cleanup
        console.log('📈 BDD: E2E tests completed');
    }
};