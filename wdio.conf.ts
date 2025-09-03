import type { Options } from '@wdio/types'

export const config: Options.Testrunner = {
    //
    // ====================
    // Runner Configuration
    // ====================
    //
    // WebdriverIO allows it to run your tests in arbitrary locations (e.g. locally or
    // on a remote machine).
    runner: 'local',
    
    //
    // =====================
    // TypeScript Configurations
    // =====================
    //
    // TypeScript support is handled by ts-node automatically

    //
    // ==================
    // Specify Test Files
    // ==================
    // Define which test specs should run. The pattern is relative to the directory
    // from which `wdio` was called.
    specs: [
        process.env.TEST_SPEC || './features/**/**.feature'
    ],
    
    // Patterns to exclude.
    exclude: [
        // 'path/to/excluded/files'
    ],

    //
    // ============
    // Capabilities
    // ============
    // Define your capabilities here. WebdriverIO can run multiple capabilities at the same
    // time. Depending on the number of capabilities, WebdriverIO launches several test
    // sessions. Within your capabilities you can overwrite the spec and exclude options in
    // order to group specific specs to a specific capability.
    maxInstances: 10,
    
    capabilities: [{
        maxInstances: 5,
        browserName: 'chrome',
        acceptInsecureCerts: true,
        // Conditionally add headless mode based on environment variable
        ...(process.env.HEADLESS === 'true' && {
            'goog:chromeOptions': {
                args: [
                    '--headless',                    // Run Chrome without visible UI
                    '--no-sandbox',                  // Disable sandbox for CI environments
                    '--disable-dev-shm-usage',       // Prevent shared memory issues
                    '--disable-gpu',                 // Disable GPU acceleration
                    '--window-size=1920,1080'       // Set consistent window size
                ]
            }
        })
    }] as any,

    //
    // ===================
    // Test Configurations
    // ===================
    // Define all options that are relevant for the WebdriverIO instance here
    //
    // Level of logging verbosity: trace | debug | info | warn | error | silent
    logLevel: process.env.DEBUG_TESTS === 'true' ? 'info' : 'error',
    
    // Set specific log levels per logger to reduce noise
    logLevels: {
        webdriver: process.env.DEBUG_TESTS === 'true' ? 'info' : 'error',
        webdriverio: process.env.DEBUG_TESTS === 'true' ? 'info' : 'error',
        '@wdio/local-runner': process.env.DEBUG_TESTS === 'true' ? 'info' : 'error',
        '@wdio/cli': process.env.DEBUG_TESTS === 'true' ? 'info' : 'error',
        '@wdio/cucumber-framework': process.env.DEBUG_TESTS === 'true' ? 'info' : 'error'
    },

    // If you only want to run your tests until a specific amount of tests have failed use
    // bail (default is 0 - don't bail, run all tests).
    bail: 0,  // Don't bail on failures, run all tests

    // Set a base URL in order to shorten url command calls. If your `url` parameter starts
    // with `/`, the base url gets prepended, not including the path portion of your baseUrl.
    baseUrl: 'http://localhost:4200',

    // Default timeout for all waitFor* commands.
    waitforTimeout: 10000,

    // Default timeout in milliseconds for request
    // if browser driver or grid doesn't send response
    connectionRetryTimeout: 120000,

    // Default request retries count
    connectionRetryCount: 3,

    // Test runner services
    // Note: chromedriver service is built-in for WebdriverIO v9
    services: [],
    
    // Environment variables to reduce debug output
    env: {
        DEBUG: '',
        NODE_ENV: 'test'
    },
    
    // Framework you want to run your specs with.
    framework: 'cucumber',

    // Test reporter for stdout.
    // Using spec reporter to show scenario names on failure
    reporters: [
        ['spec', {
            // Show scenario names and steps
            showTestNames: true,
            showTestStatus: true
        }]
    ],

    //
    // If you are using Cucumber you need to specify the location of your step definitions.
    cucumberOpts: {
        require: ['./features/step-definitions/steps.ts'],
        backtrace: true,  // Show full stack trace on failures
        requireModule: [],
        dryRun: false,
        failFast: false,
        snippets: true,
        source: true,
        strict: false,  // Allow skipped steps without failing the entire scenario
        tags: process.env.TEST_TAGS || 'not @skip',
        timeout: 60000,
        ignoreUndefinedDefinitions: false,
        format: ['pretty'],  // Add pretty format for better readability
        publishQuiet: process.env.DEBUG_TESTS !== 'true'   // Reduce noise from cucumber reporting unless debugging
    },
    
    //
    // =====
    // Hooks
    // =====
    // WebdriverIO provides several hooks you can use to interfere with the test process in order to enhance
    // it and to build services around it. You can either apply a single function or an array of
    // methods to it. If one of them returns with a promise, WebdriverIO will wait until that promise got
    // resolved to continue.
    
    // Add screenshot on failure
    afterTest: function (test, context, { error, result, duration, passed, retries }) {
        if (!passed) {
            // Screenshot will be taken automatically by WebdriverIO on failure
        }
    },
}
