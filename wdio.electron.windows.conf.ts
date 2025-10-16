import type { Options } from '@wdio/types';
import { getTimeoutConfig } from './features/support/timeout-config';
import path from 'path';

// Get timeout configuration based on environment
const timeouts = getTimeoutConfig(process.env.CI === 'true');

// Windows-specific Electron build path
const electronBuildDir = process.env.ELECTRON_BUILD_DIR || 'dist/electron/win-unpacked';
const electronAppPath = path.join(process.cwd(), electronBuildDir, 'Flock Native.exe');

console.log('🦅 [WDIO ELECTRON WINDOWS] Testing Electron app at:', electronAppPath);

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
        appArgs: ['--disable-dev-shm-usage'],
      },
    },
  ],
  
  logLevel: process.env.DEBUG_TESTS === 'true' ? 'info' : 'error',
  bail: 0,
  baseUrl: 'app:///',
  waitforTimeout: timeouts.implicit,
  connectionRetryTimeout: timeouts.connectionRetry,
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
    // Run core tests + electron tests + Windows-specific tests
    tagExpression: process.env.TEST_TAGS || '(@core or @electron) and not @skip and (not @os or @os:windows)',
    timeout: timeouts.step,
    ignoreUndefinedDefinitions: false,
  },
  
  before: function (capabilities, specs) {
    console.log('🦅 [WDIO ELECTRON WINDOWS] Starting Electron test on Windows');
    console.log('🦅 [WDIO ELECTRON WINDOWS] App path:', electronAppPath);
    console.log('🦅 [WDIO ELECTRON WINDOWS] Capabilities:', JSON.stringify(capabilities, null, 2));
  },
  
  beforeScenario: function (world) {
    console.log('🦅 [WDIO ELECTRON WINDOWS] Scenario:', world.pickle.name);
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
    console.log('🦅 [WDIO ELECTRON WINDOWS] Test completed with status:', result);
  },
};
