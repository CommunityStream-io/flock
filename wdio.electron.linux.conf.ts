import type { Options } from '@wdio/types';
import { getTimeoutConfig } from './features/support/timeout-config';
import path from 'path';
import fs from 'fs';

// Get timeout configuration based on environment
const timeouts = getTimeoutConfig(process.env.CI === 'true');

// Linux Electron build configuration
// Support multiple Linux package formats: AppImage, deb, rpm
const electronBuildDir = process.env.ELECTRON_BUILD_DIR || 'dist/electron';

// Determine which Linux binary to use (AppImage is most portable)
let electronAppPath: string;

// Check for AppImage first (most portable)
const appImagePath = path.join(process.cwd(), electronBuildDir, 'Flock-Native-*.AppImage');
// Check for unpacked directory
const unpackedPath = path.join(process.cwd(), electronBuildDir, 'linux-unpacked', 'flock-native');

// Use environment variable if provided, otherwise auto-detect
if (process.env.ELECTRON_BINARY_PATH) {
  electronAppPath = process.env.ELECTRON_BINARY_PATH;
} else if (fs.existsSync(unpackedPath)) {
  electronAppPath = unpackedPath;
} else {
  // Default to unpacked for development
  electronAppPath = unpackedPath;
}

console.log('🦅 [WDIO ELECTRON LINUX] Testing Linux Electron app at:', electronAppPath);

export const config: Options.Testrunner & { capabilities: any[] } = {
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
    './features/electron/**/*.feature'
  ],

  exclude: [],

  //
  // ============
  // Capabilities
  // ============
  //
  maxInstances: 1,

  capabilities: [
    {
      maxInstances: 1,
      browserName: 'electron',
      'wdio:electronServiceOptions': {
        appBinaryPath: electronAppPath,
        appArgs: [
          '--disable-dev-shm-usage',
          '--no-sandbox', // Required for Linux in CI environments
        ],
      },
    },
  ],

  //
  // ===================
  // Test Configurations
  // ===================
  //
  logLevel: 'info',
  bail: 0,
  baseUrl: 'app:///', // Electron apps use app:// protocol
  waitforTimeout: timeouts.implicit,
  connectionRetryTimeout: timeouts.connectionRetry,
  connectionRetryCount: 3,

  //
  // Test runner services
  //
  services: [
    [
      'electron',
      {
        appBinaryPath: electronAppPath,
        appArgs: [],
        chromedriver: {
          port: 9515,
          logFileName: 'chromedriver-linux.log',
        },
      },
    ],
  ],

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
    // Run core tests + electron tests + linux-specific tests
    tagExpression: process.env.TEST_TAGS || '(@core or @electron) and not @skip and (not @os or @os:linux)',
    timeout: timeouts.step,
    ignoreUndefinedDefinitions: false,
  },

  //
  // =====
  // Hooks
  // =====
  //
  before: function (capabilities, specs) {
    console.log('🦅 [WDIO ELECTRON LINUX] Starting Linux Electron test');
    console.log('🦅 [WDIO ELECTRON LINUX] App path:', electronAppPath);
    console.log('🦅 [WDIO ELECTRON LINUX] Platform:', 'linux');
    console.log('🦅 [WDIO ELECTRON LINUX] Capabilities:', JSON.stringify(capabilities, null, 2));
  },

  beforeScenario: function (world) {
    console.log('🦅 [WDIO ELECTRON LINUX] Scenario:', world.pickle.name);
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
    console.log('🦅 [WDIO ELECTRON LINUX] Test completed with status:', result);
  },
};
