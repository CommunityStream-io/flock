import type { Options } from '@wdio/types';
import { config as baseConfig } from './wdio.conf';

// Docker-specific configuration extends base config
export const config: Options.Testrunner & { capabilities: any[] } = {
  ...baseConfig,

  // Override Chrome options for Docker environment
  capabilities: [
    {
      maxInstances: 1,
      browserName: 'chrome',
      acceptInsecureCerts: true,
      'goog:chromeOptions': {
        // Use system Chrome in Docker
        binary: process.env.CHROME_BIN || '/usr/bin/chromium-browser',
        args: [
          // Docker-specific Chrome options
          '--headless=new',
          '--no-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor',
          '--window-size=1920,1080',
          
          // Additional stability options for containers
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
          
          // Log suppression
          '--log-level=3',
          '--silent',
          '--disable-gpu-logging',
        ],
        prefs: {
          logging: {
            level: 'OFF',
          },
        },
      },
    },
  ] as any,

  // Force Allure reporter to be enabled in Docker
  reporters: [
    [
      'spec',
      {
        showTestNames: true,
        showTestStatus: true,
      },
    ],
    [
      'allure',
      {
        outputDir: 'allure-results',
        disableWebdriverScreenshotsReporting: false,
        disableWebdriverStepsReporting: false,
        // Ensure results are flushed immediately in container environment
        disableMochaHooks: false,
        addConsoleLogs: true,
      },
    ],
  ],

  // Container-specific logging
  logLevel: 'error' as const,
  logLevels: {
    webdriver: 'error',
    webdriverio: 'error',
    '@wdio/local-runner': 'error',
    '@wdio/cli': 'error',
    '@wdio/cucumber-framework': 'error',
  },

  // Disable ChromeDriver service since we're using system ChromeDriver
  services: [],
};