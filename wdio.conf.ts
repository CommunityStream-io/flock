import type { Options } from '@wdio/types';
import { getTimeoutConfig } from './features/support/timeout-config';

// Get timeout configuration based on environment
const timeouts = getTimeoutConfig(process.env.CI === 'true');

export const config: Options.Testrunner & { capabilities: any[] } = {
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
  specs: [process.env.TEST_SPEC || './features/**/**.feature'],

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
  maxInstances: 1, // Run features sequentially to prevent race conditions

  capabilities: [
    {
      maxInstances: 1, // Only one browser instance at a time
      browserName: 'chrome',
      acceptInsecureCerts: true,
      // Configure Chrome for Docker environment (based on WebdriverIO Docker docs)
      'goog:chromeOptions': {
        args: [
          '--no-sandbox',
          '--disable-infobars',
          '--headless',
          '--disable-gpu',
          '--window-size=1440,735',
          // Additional stability options for Docker
          '--disable-dev-shm-usage',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding',
          '--disable-extensions',
          '--disable-plugins',
          '--disable-default-apps',
          '--disable-sync',
          '--disable-translate',
          '--disable-background-networking',
          '--disable-client-side-phishing-detection',
          '--disable-component-extensions-with-background-pages',
          '--disable-hang-monitor',
          '--disable-prompt-on-repost',
          '--disable-domain-reliability',
          '--disable-features=TranslateUI',
          '--disable-ipc-flooding-protection',
          '--no-first-run',
          '--no-default-browser-check',
          '--disable-logging',
          '--disable-permissions-api',
          '--disable-popup-blocking',
          '--disable-web-resources',
          '--disable-xss-auditor',
          '--force-color-profile=srgb',
          '--memory-pressure-off',
          '--max_old_space_size=4096',
          '--log-level=3',
          '--silent',
          '--disable-gpu-logging',
        ],
        // Redirect Chrome logs to separate files
        prefs: {
          logging: {
            level: 'OFF',
          },
        },
      },
    },
  ] as any,

  //
  // ===================
  // Test Configurations
  // ===================
  // Define all options that are relevant for the WebdriverIO instance here
  //
  // Level of logging verbosity: trace | debug | info | warn | error | silent
  logLevel: process.env.SHARDED_TESTS === 'true' ? 'error' : (process.env.DEBUG_TESTS === 'true' ? 'info' : 'error'),

  // Set specific log levels per logger to reduce noise
  logLevels: {
    webdriver: process.env.SHARDED_TESTS === 'true' ? 'error' : (process.env.DEBUG_TESTS === 'true' ? 'info' : 'error'),
    webdriverio: process.env.SHARDED_TESTS === 'true' ? 'error' : (process.env.DEBUG_TESTS === 'true' ? 'info' : 'error'),
    '@wdio/local-runner': process.env.SHARDED_TESTS === 'true' ? 'error' : (process.env.DEBUG_TESTS === 'true' ? 'info' : 'error'),
    '@wdio/cli': process.env.SHARDED_TESTS === 'true' ? 'error' : (process.env.DEBUG_TESTS === 'true' ? 'info' : 'error'),
    '@wdio/cucumber-framework': process.env.SHARDED_TESTS === 'true' ? 'error' : (process.env.DEBUG_TESTS === 'true' ? 'info' : 'error'),
  },

  // If you only want to run your tests until a specific amount of tests have failed use
  // bail (default is 0 - don't bail, run all tests).
  bail: 0, // Don't bail on failures, run all tests

  // Retry configuration is handled by the test framework (Cucumber)

  // Set a base URL in order to shorten url command calls. If your `url` parameter starts
  // with `/`, the base url gets prepended, not including the path portion of your baseUrl.
  baseUrl: process.env.BASE_URL || 'http://localhost:4200',

  // Default timeout for all waitFor* commands.
  // Environment-driven timeout configuration - optimized for Phase 3 auto-wait
  waitforTimeout: timeouts.waitUntilGlobal,  // Use centralized timeout config (8s for Phase 3)
  waitforInterval: 200,    // Faster polling interval for Phase 3 optimization

  // Default timeout in milliseconds for request
  // if browser driver or grid doesn't send response
  connectionRetryTimeout: timeouts.global, // Use centralized timeout config for connection issues

  // Default request retries count
  connectionRetryCount: process.env.CI === 'true' ? 3 : 2,

  // Test runner services
  // Selenium standalone Chrome image handles ChromeDriver automatically
  services: [],

  // Environment variables are handled by the test runner

  // Framework you want to run your specs with.
  framework: 'cucumber',

  // Test reporter for stdout.
  // Using spec reporter to show scenario names on failure
  // Using allure reporter conditionally for test result aggregation
  reporters: [
    [
      'spec',
      {
        // Show scenario names and steps
        showTestNames: true,
        showTestStatus: true,
      },
    ],
    // Conditionally include Allure reporter based on environment variable
    ...(process.env.SKIP_ALLURE_REPORTER !== 'true' ? [
      [
        'allure',
        {
          outputDir: 'allure-results',
          disableWebdriverScreenshotsReporting: false,
          disableWebdriverStepsReporting: false,
        },
      ],
    ] : []),
  ],

  //
  // If you are using Cucumber you need to specify the location of your step definitions.
  cucumberOpts: {
    require: ['./features/step-definitions/steps.ts'],
    backtrace: true, // Show full stack trace on failures
    requireModule: ['expect-webdriverio'],
    dryRun: false,
    failFast: false,
    snippets: true,
    source: true,
    strict: false, // Allow skipped steps without failing the entire scenario
    tags: process.env.TEST_TAGS || '',
    timeout: timeouts.global, // Global timeout for step execution (25s CI, 20s local)
    ignoreUndefinedDefinitions: true,
    format: process.env.SHARDED_TESTS === 'true' ? ['progress'] : ['pretty'], // Minimal format for sharded tests, pretty for debugging
    publishQuiet: process.env.SHARDED_TESTS === 'true' || process.env.DEBUG_TESTS !== 'true', // Reduce noise from cucumber reporting unless debugging
    retry: process.env.CI === 'true' ? 3 : 1, // Retry failed scenarios in CI
  },

  //
  // =====
  // Hooks
  // =====
  // WebdriverIO provides several hooks you can use to interfere with the test process in order to enhance
  // it and to build services around it. You can either apply a single function or an array of
  // methods to it. If one of them returns with a promise, WebdriverIO will wait until that promise got
  // resolved to continue.
  
  // Import hooks for metrics collection - using individual function imports
  before: async function (capabilities, specs, browser) {
    const { before } = await import('./features/support/webdriverio-hooks');
    return before(capabilities, specs, browser);
  },

  after: async function (result, capabilities, specs) {
    const { after } = await import('./features/support/webdriverio-hooks');
    return after(result, capabilities, specs);
  },

  beforeStep: async function (step, context) {
    const { beforeStep } = await import('./features/support/webdriverio-hooks');
    return beforeStep(step, context);
  },

  afterStep: async function (step, context, error) {
    const { afterStep } = await import('./features/support/webdriverio-hooks');
    return afterStep(step, context, error);
  },

  beforeScenario: async function (world, context) {
    const { beforeScenario } = await import('./features/support/webdriverio-hooks');
    return beforeScenario(world, context);
  },

  afterScenario: async function (world, context, result) {
    const { afterScenario } = await import('./features/support/webdriverio-hooks');
    return afterScenario(world, context, result);
  },

  beforeFeature: async function (uri, feature) {
    const { beforeFeature } = await import('./features/support/webdriverio-hooks');
    return beforeFeature(uri, feature);
  },

  afterFeature: async function (uri, feature) {
    const { afterFeature } = await import('./features/support/webdriverio-hooks');
    return afterFeature(uri, feature);
  },
};
