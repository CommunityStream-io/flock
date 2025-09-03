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
        // Enable Chrome DevTools Protocol for network simulation
        'goog:chromeOptions': {
            args: [
                // Network simulation and CDP support
                '--enable-chrome-browser-cloud-management',
                '--enable-network-service-logging',
                '--disable-web-security',              // Allow network interception
                '--disable-features=VizDisplayCompositor',
                // Standard Chrome options
                '--no-sandbox',                        // Disable sandbox for CI environments
                '--disable-dev-shm-usage',             // Prevent shared memory issues
                '--disable-gpu',                       // Disable GPU acceleration
                '--window-size=1920,1080',             // Set consistent window size
                // Conditionally add headless mode
                ...(process.env.HEADLESS === 'true' ? ['--headless'] : [])
            ]
        }
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
        requireModule: ['expect-webdriverio'],
        dryRun: false,
        failFast: false,
        snippets: true,
        source: true,
        strict: false,  // Allow skipped steps without failing the entire scenario
        tags: process.env.TEST_TAGS || "",
        timeout: 30000,
        ignoreUndefinedDefinitions: true,
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
    
    // Add screenshot on failure and coverage collection
    beforeSession: function (config, capabilities, specs, cid) {
        // Initialize coverage collection
        if (process.env.COLLECT_COVERAGE === 'true') {
            console.log('🔍 BDD: Initializing E2E coverage collection');
            
            // Ensure coverage directory exists
            const fs = require('fs');
            const path = require('path');
            const coverageDir = path.join(process.cwd(), 'coverage', 'e2e');
            if (!fs.existsSync(coverageDir)) {
                fs.mkdirSync(coverageDir, { recursive: true });
                console.log('📁 BDD: Created E2E coverage directory:', coverageDir);
            }
        }
    },
    
    beforeTest: async function (test, context) {
        // Initialize coverage collection for each test
        if (process.env.COLLECT_COVERAGE === 'true') {
            console.log('🔍 BDD: Starting coverage collection for test:', test.title);
            // Clear any existing coverage data
            await browser.execute(() => {
                if (window.__coverage__) {
                    window.__coverage__ = {};
                }
            });
        }
    },
    
    afterTest: async function (test, context, { error, result, duration, passed, retries }) {
        if (!passed) {
            // Screenshot will be taken automatically by WebdriverIO on failure
        }
        
        // Collect coverage data after each test
        if (process.env.COLLECT_COVERAGE === 'true') {
            console.log('📊 BDD: Collecting coverage data for test:', test.title);
            try {
                // Get coverage data from browser
                const coverageData = await browser.execute(() => {
                    return window.__coverage__ || {};
                });
                
                // Store coverage data for later processing
                if (Object.keys(coverageData).length > 0) {
                    const fs = require('fs');
                    const path = require('path');
                    
                    // Ensure coverage directory exists
                    const coverageDir = path.join(process.cwd(), 'coverage', 'e2e');
                    if (!fs.existsSync(coverageDir)) {
                        fs.mkdirSync(coverageDir, { recursive: true });
                    }
                    
                    // Save coverage data for this test
                    const testName = test.title.replace(/[^a-zA-Z0-9]/g, '_');
                    const coverageFile = path.join(coverageDir, `${testName}_${Date.now()}.json`);
                    fs.writeFileSync(coverageFile, JSON.stringify(coverageData, null, 2));
                    
                    console.log('✅ BDD: Coverage data saved for test:', test.title);
                }
            } catch (error) {
                console.log('❌ BDD: Failed to collect coverage data:', error.message);
            }
        }
    },
    
    afterSuite: function (suite) {
        // Collect coverage data after each suite
        if (process.env.COLLECT_COVERAGE === 'true') {
            console.log('📊 BDD: Collecting coverage data for suite:', suite.title);
        }
    },
    
    onComplete: async function (exitCode, config, capabilities, results) {
        // Final coverage collection and report generation
        if (process.env.COLLECT_COVERAGE === 'true') {
            console.log('📈 BDD: E2E tests completed, processing coverage data');
            
            try {
                // Process all collected coverage data
                const fs = require('fs');
                const path = require('path');
                const nyc = require('nyc');
                
                const coverageDir = path.join(process.cwd(), 'coverage', 'e2e');
                const outputDir = path.join(process.cwd(), 'coverage');
                
                // Ensure coverage directory exists
                if (!fs.existsSync(coverageDir)) {
                    fs.mkdirSync(coverageDir, { recursive: true });
                    console.log('📁 BDD: Created E2E coverage directory:', coverageDir);
                }
                
                if (fs.existsSync(coverageDir)) {
                    // Create NYC instance for processing
                    const nycInstance = new nyc({
                        cwd: process.cwd(),
                        tempDir: path.join(process.cwd(), '.nyc_output', 'e2e'),
                        reportDir: outputDir,
                        reporter: ['lcov', 'text-summary'],
                        include: [
                            'projects/flock-mirage/src/**/*.ts',
                            'projects/shared/src/**/*.ts'
                        ],
                        exclude: [
                            'projects/**/*.spec.ts',
                            'projects/**/*.test.ts',
                            'projects/**/test/**',
                            'projects/**/spec/**',
                            'projects/**/environments/**',
                            'projects/**/main.ts',
                            'projects/**/polyfills.ts'
                        ]
                    });
                    
                    // Process coverage files
                    const coverageFiles = fs.readdirSync(coverageDir)
                        .filter(file => file.endsWith('.json'))
                        .map(file => path.join(coverageDir, file));
                    
                    if (coverageFiles.length > 0) {
                        console.log('📊 BDD: Processing', coverageFiles.length, 'coverage files');
                        
                        // Merge and generate reports
                        await nycInstance.merge(coverageFiles);
                        await nycInstance.report();
                        
                        console.log('✅ BDD: E2E coverage report generated');
                    } else {
                        console.log('⚠️ BDD: No coverage files found to process');
                        console.log('📁 BDD: Coverage directory contents:', fs.readdirSync(coverageDir));
                    }
                } else {
                    console.log('⚠️ BDD: No E2E coverage directory found');
                }
            } catch (error) {
                console.log('❌ BDD: Failed to process E2E coverage data:', error.message);
            }
        }
    },
}
