import type { Options } from '@wdio/types';
import { getTimeoutConfig } from './features/support/timeout-config';
import path from 'path';

// Set platform environment variable for Electron
process.env.PLATFORM = 'electron';

// Get timeout configuration based on environment
const timeouts = getTimeoutConfig(process.env.CI === 'true');

// Linux-specific Electron build path
const electronBuildDir = process.env.ELECTRON_BUILD_DIR || 'dist/electron/linux-unpacked';
const electronAppPath = path.join(process.cwd(), electronBuildDir, 'flock');

console.log('🦅 [WDIO ELECTRON LINUX] Testing Electron app at:', electronAppPath);

export const config: Options.Testrunner & { capabilities: any[] } = {
  runner: 'local',
  
  specs: [
    './features/core/**/*.feature',
    './features/electron/**/*.feature'
  ],
  
  exclude: [],
  
  maxInstances: 1,
  
  capabilities: [
    {
      maxInstances: 1,
      browserName: 'electron',
      'wdio:electronServiceOptions': {
        appBinaryPath: electronAppPath,
        appArgs: ['--disable-dev-shm-usage', '--no-sandbox'],
      },
    },
  ],
  
  logLevel: process.env.DEBUG_TESTS === 'true' ? 'info' : 'error',
  bail: 0,
  baseUrl: 'app:///',
  waitforTimeout: timeouts.waitforTimeout,
  connectionRetryTimeout: timeouts.connectionRetryTimeout,
  connectionRetryCount: 3,
  
  services: [
    [
      'electron',
      {
        appBinaryPath: electronAppPath,
        appArgs: [],
        chromedriver: {
          port: 9515,
          logFileName: 'chromedriver.log',
        },
      },
    ],
  ],
  
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
    // Run core tests + electron tests + Linux-specific tests
    tagExpression: process.env.TEST_TAGS || '(@core or @electron) and not @skip and (not @os or @os:linux)',
    timeout: timeouts.global,
    ignoreUndefinedDefinitions: false,
  },
  
  before: function (capabilities, specs) {
    console.log('🦅 [WDIO ELECTRON LINUX] Starting Electron test on Linux');
    console.log('🦅 [WDIO ELECTRON LINUX] App path:', electronAppPath);
    console.log('🦅 [WDIO ELECTRON LINUX] Capabilities:', JSON.stringify(capabilities, null, 2));
  },
  
  beforeScenario: function (world) {
    console.log('🦅 [WDIO ELECTRON LINUX] Scenario:', world.pickle.name);
  },
  
  afterScenario: async function (world, result, context) {
    if (result.status === 'failed') {
      const screenshot = await browser.takeScreenshot();
      if (global.allure) {
        global.allure.attachment('Screenshot', Buffer.from(screenshot, 'base64'), 'image/png');
      }
    }
  },
  
  after: function (result, capabilities, specs) {
    console.log('🦅 [WDIO ELECTRON LINUX] Test completed with status:', result);
  },
};
