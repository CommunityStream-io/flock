// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html
module.exports = function (config) {
  // Determine if running in CI environment
  const isCI = process.env.CI === 'true';
  const autoWatch = !isCI;
  const singleRun = isCI;
  const browsers = isCI ? ['ChromeHeadless'] : ['Chrome'];
  const logLevel = isCI ? config.LOG_WARN : config.LOG_INFO;
  console.log('isCI', isCI);
  console.log('autoWatch', autoWatch);
  console.log('singleRun', singleRun);
  console.log('browsers', browsers);
  console.log('logLevel', logLevel);

  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      'karma-jasmine',
      'karma-chrome-launcher',
      'karma-jasmine-html-reporter',
      'karma-coverage'
    ],
    client: {
      jasmine: {
        // Disable random execution for consistent test results
        random: false
      },
      clearContext: false, // leave Jasmine Spec Runner output visible in browser
    },
    jasmineHtmlReporter: {
      suppressAll: true // removes the duplicated traces
    },
    coverageReporter: {
      dir: './coverage',
      subdir: '.',
      reporters: [
        { type: 'html' },
        { type: 'text-summary' },
        { type: 'lcov' }
      ]
    },
    reporters: ['progress', 'kjhtml', 'coverage'],
    port: 9876,
    colors: true,
    logLevel,
    autoWatch,
    singleRun,
    customLaunchers: {
      ChromeHeadless: {
        base: 'Chrome',
        flags: [
          '--no-sandbox',
          '--disable-gpu',
          '--headless',
          '--disable-dev-shm-usage',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor',
          '--remote-debugging-port=9222',
          '--window-size=1920,1080'
        ]
      }
    },
    browsers
  });
};
