import type { Options } from '@wdio/types';
import { getTimeoutConfig } from './features/support/timeout-config';

// Get timeout configuration based on environment
const timeouts = getTimeoutConfig(process.env.CI === 'true');

export const config: Options.Testrunner = {
  //
  // ====================
  // Runner Configuration
  // ====================
  //
  runner: 'local',

  //
  // ==================
  // Specify Test Files
  // ==================
  //
  specs: [
    './features/core/**/*.feature',
    './features/web/**/*.feature'
  ],

  exclude: [],

  //
  // ============
  // Capabilities
  // ============
  //
  maxInstances: 5,

  capabilities: [
    {
      maxInstances: 5,
      browserName: 'chrome',
      acceptInsecureCerts: true,
      'goog:chromeOptions': {
        args: process.env.HEADLESS === 'true' 
          ? ['--headless', '--disable-gpu', '--no-sandbox', '--disable-dev-shm-usage']
          : ['--disable-dev-shm-usage']
      }
    }
  ],

  //
  // ===================
  // Test Configurations
  // ===================
  //
  logLevel: 'info',
  bail: 0,
  baseUrl: process.env.BASE_URL || 'http://localhost:4200',
  waitforTimeout: timeouts.implicit,
  connectionRetryTimeout: timeouts.connectionRetry,
  connectionRetryCount: 3,

  //
  // Test runner services
  //
  services: ['chromedriver'],

  //
  // Framework
  //
  framework: 'cucumber',
  reporters: [
    'spec',
    [
      'allure',
      {
        outputDir: 'allure-results',
        disableWebdriverStepsReporting: false,
        disableWebdriverScreenshotsReporting: false,
        useCucumberStepReporter: true,
      },
    ],
  ],

  //
  // Cucumber Configuration
  // ==================
  //
  cucumberOpts: {
    require: ['./features/step-definitions/**/*.ts', './features/support/**/*.ts'],
    backtrace: false,
    requireModule: [],
    dryRun: false,
    failFast: false,
    name: [],
    snippets: true,
    source: true,
    strict: false,
    // Run core tests and web-specific tests
    // Allow override with TEST_TAGS environment variable
    tagExpression: process.env.TEST_TAGS || '(@core or @web) and not @skip',
    timeout: timeouts.step,
    ignoreUndefinedDefinitions: false,
  },

  //
  // =====
  // Hooks
  // =====
  //
  before: function (capabilities, specs) {
    console.log('🌐 [WDIO WEB] Starting Web (Mirage) test');
    console.log('🌐 [WDIO WEB] Base URL:', config.baseUrl);
    console.log('🌐 [WDIO WEB] Platform:', process.env.PLATFORM || 'web');
    console.log('🌐 [WDIO WEB] Headless:', process.env.HEADLESS === 'true');
    console.log('🌐 [WDIO WEB] Tag Expression:', (config.cucumberOpts as any).tagExpression);
  },

  beforeScenario: function (world) {
    console.log('🌐 [WDIO WEB] Scenario:', world.pickle.name);
  },

  afterScenario: async function (world, result, context) {
    // Take screenshot on failure
    if (result.status === 'failed') {
      const screenshot = await browser.takeScreenshot();
      // Attach to Allure report
      if (global.allure) {
        global.allure.attachment('Screenshot', Buffer.from(screenshot, 'base64'), 'image/png');
      }
    }
  },

  after: function (result, capabilities, specs) {
    console.log('🌐 [WDIO WEB] Test completed with status:', result);
  },
};



