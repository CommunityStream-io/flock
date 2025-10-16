import type { Options } from '@wdio/types';
import { getTimeoutConfig } from './features/support/timeout-config';
import path from 'path';
import os from 'os';

// Get timeout configuration based on environment
const timeouts = getTimeoutConfig(process.env.CI === 'true');

/**
 * Determine platform-specific Electron build path and app name
 * Supports Windows, macOS (Intel & ARM), and Linux
 */
function getPlatformElectronPath(): { buildDir: string; appName: string } {
  const platform = process.platform;
  
  // Allow override via environment variable
  if (process.env.ELECTRON_BUILD_DIR && process.env.ELECTRON_APP_NAME) {
    return {
      buildDir: process.env.ELECTRON_BUILD_DIR,
      appName: process.env.ELECTRON_APP_NAME
    };
  }
  
  switch (platform) {
    case 'win32':
      // Windows build
      return {
        buildDir: 'dist/electron/win-unpacked',
        appName: 'Flock Native.exe'
      };
    
    case 'darwin':
      // macOS build - detect architecture
      const arch = os.arch();
      const macBuildDir = arch === 'arm64' 
        ? 'dist/electron/mac-arm64'
        : 'dist/electron/mac';
      return {
        buildDir: macBuildDir,
        appName: 'Flock Native.app/Contents/MacOS/Flock Native'
      };
    
    case 'linux':
      // Linux build
      return {
        buildDir: 'dist/electron/linux-unpacked',
        appName: 'flock-native'
      };
    
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
}

const { buildDir, appName } = getPlatformElectronPath();
const electronBuildDir = buildDir;
const electronAppPath = path.join(process.cwd(), electronBuildDir, appName);

console.log('🦅 [WDIO ELECTRON] Platform:', process.platform);
console.log('🦅 [WDIO ELECTRON] Architecture:', os.arch());
console.log('🦅 [WDIO ELECTRON] Testing Electron app at:', electronAppPath);

/**
 * Generate tag expression for platform-specific test filtering
 */
function getTagExpression(): string {
  const osTag = process.platform === 'win32' 
    ? 'windows' 
    : process.platform === 'darwin' 
      ? 'macos' 
      : 'linux';
  
  return `(@core or @electron) and not @skip and (not @os or @os:${osTag})`;
}

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
      'wdio:electron Options': {
        binary: electronAppPath,
        args: [
          '--disable-dev-shm-usage',
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
        appPath: electronAppPath,
        appArgs: [],
        chromedriver: {
          port: 9515,
          logFileName: 'chromedriver.log',
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
    // Run core tests + electron tests for current OS
    // OS tags: @os:windows, @os:macos, @os:linux
    // A test with no @os tag runs on all OSes
    // A test with @os:windows only runs on Windows
    // Platform detection logic:
    // - Windows: win32 -> @os:windows
    // - macOS: darwin -> @os:macos  
    // - Linux: linux -> @os:linux
    tagExpression: process.env.TEST_TAGS || getTagExpression(),
    timeout: timeouts.step,
    ignoreUndefinedDefinitions: false,
  },

  //
  // =====
  // Hooks
  // =====
  //
  before: function (capabilities, specs) {
    console.log('🦅 [WDIO ELECTRON] Starting Electron test');
    console.log('🦅 [WDIO ELECTRON] App path:', electronAppPath);
    console.log('🦅 [WDIO ELECTRON] Capabilities:', JSON.stringify(capabilities, null, 2));
  },

  beforeScenario: function (world) {
    console.log('🦅 [WDIO ELECTRON] Scenario:', world.pickle.name);
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
    console.log('🦅 [WDIO ELECTRON] Test completed with status:', result);
  },
};

