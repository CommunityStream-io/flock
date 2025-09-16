import type { Options } from '@wdio/types';
import { getTimeoutConfig } from './features/support/timeout-config';

// Get timeout configuration based on environment
const timeouts = getTimeoutConfig(process.env.CI === 'true');

export const config: Options.Testrunner & { capabilities: any[] } = {
  runner: 'local',
  specs: [process.env.TEST_SPEC || './features/**/**.feature'],
  exclude: [],
  maxInstances: 1,
  
  capabilities: [
    {
      maxInstances: 1,
      browserName: 'chrome',
      acceptInsecureCerts: true,
      'goog:chromeOptions': {
        binary: '/usr/bin/chromium-browser',
        args: [
          '--no-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--window-size=1920,1080',
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
          '--disable-prompt-on-repost',
          '--disable-web-resources',
          '--disable-xss-auditor',
          '--disable-features=VizDisplayCompositor',
          '--force-color-profile=srgb',
          '--memory-pressure-off',
          '--max_old_space_size=4096',
          '--log-level=3',
          '--silent',
          '--disable-gpu-logging',
          ...(process.env.HEADLESS === 'true' ? ['--headless=new'] : []),
        ],
      },
    },
  ],

  logLevel: 'warn',
  bail: 0,
  baseUrl: process.env.BASE_URL || 'http://localhost:4200',
  waitforTimeout: timeouts.waitforTimeout,
  connectionRetryTimeout: timeouts.connectionRetryTimeout,
  connectionRetryCount: process.env.CI === 'true' ? 3 : 2,

  // Use pre-installed ChromeDriver
  services: [
    ['chromedriver', {
      chromedriverCustomPath: '/usr/local/bin/chromedriver'
    }]
  ],

  framework: 'cucumber',
  
  reporters: [
    [
      'spec',
      {
        showTestNames: true,
        showTestStatus: true,
      },
    ],
    ...(process.env.CI === 'true' ? [
      [
        'allure',
        {
          outputDir: 'allure-results',
          disableWebdriverStepsReporting: true,
          disableWebdriverScreenshotsReporting: false,
        },
      ],
    ] : []),
  ],

  cucumberOpts: {
    require: ['./features/step-definitions/**/*.ts'],
    backtrace: false,
    requireModule: ['ts-node/register'],
    dryRun: false,
    failFast: false,
    format: ['pretty'],
    snippets: true,
    source: true,
    strict: false,
    tagExpression: '',
    timeout: timeouts.cucumberTimeout,
    ignoreUndefinedDefinitions: false,
  },
};
