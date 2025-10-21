import type { Options } from '@wdio/types';
import { getTimeoutConfig } from './features/support/timeout-config';
import path from 'path';
import os from 'os';

// Set platform environment variable for Electron
process.env.PLATFORM = 'electron';

// Get timeout configuration based on environment
const timeouts = getTimeoutConfig(process.env.CI === 'true');

// macOS-specific Electron build path
// Detect architecture (Intel x64 vs Apple Silicon arm64)
const arch = os.arch();
const macBuildDir = arch === 'arm64'
  ? process.env.ELECTRON_BUILD_DIR || 'dist/electron/mac-arm64'
  : process.env.ELECTRON_BUILD_DIR || 'dist/electron/mac';
const electronAppPath = path.join(process.cwd(), macBuildDir, 'Flock Native.app/Contents/MacOS/Flock Native');

console.log('🦅 [WDIO ELECTRON MACOS] Architecture:', arch);
console.log('🦅 [WDIO ELECTRON MACOS] Testing Electron app at:', electronAppPath);

export const config: Options.Testrunner & { capabilities: any[] } = {
  runner: 'local',

  specs: [
    './features/electron/basic-app-verification.feature'
  ],

  exclude: [],

  maxInstances: 1,

  capabilities: [
    {
      maxInstances: 1,
      browserName: 'electron',
      'wdio:electronServiceOptions': {
        binary: electronAppPath,
        args: ['--disable-dev-shm-usage'],
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
        appPath: electronAppPath,
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
    require: ['./features/step-definitions/landing.ts', './features/support/**/*.ts'],
    backtrace: false,
    requireModule: [],
    dryRun: false,
    failFast: false,
    name: [],
    snippets: true,
    source: true,
    strict: false,
    // Run core tests + electron tests + macOS-specific tests
    tagExpression: process.env.TEST_TAGS || '(@core or @electron) and not @skip and (not @os or @os:macos)',
    timeout: timeouts.global,
    ignoreUndefinedDefinitions: false,
  },

  before: function (capabilities, specs) {
    console.log('🦅 [WDIO ELECTRON MACOS] Starting Electron test on macOS');
    console.log('🦅 [WDIO ELECTRON MACOS] Architecture:', arch);
    console.log('🦅 [WDIO ELECTRON MACOS] App path:', electronAppPath);
    console.log('🦅 [WDIO ELECTRON MACOS] Capabilities:', JSON.stringify(capabilities, null, 2));
  },

  beforeScenario: function (world) {
    console.log('🦅 [WDIO ELECTRON MACOS] Scenario:', world.pickle.name);
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
    console.log('🦅 [WDIO ELECTRON MACOS] Test completed with status:', result);
  },
};
