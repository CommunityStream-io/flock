# Allure Reporting Setup for WebdriverIO

This document explains how to use Allure reporting with WebdriverIO tests in the Flock project. Allure provides beautiful HTML reports with detailed test information, screenshots, and comprehensive analytics.

## Overview

Allure is a flexible, lightweight multi-language test reporting tool that provides detailed information about test execution. It offers:

- **Beautiful HTML Reports**: Interactive dashboards with test results
- **Screenshot Capture**: Automatic screenshots on test failures
- **Detailed Test Information**: Step-by-step execution details
- **Performance Metrics**: Test duration and timing analysis
- **Environment Information**: Browser, OS, and test configuration details

## Installation

The required packages are already installed:

```bash
npm install --save-dev @wdio/allure-reporter allure-commandline
```

## Configuration

### WebdriverIO Configuration

Both `wdio.conf.ts` and `test/wdio.conf.ts` are configured with Allure reporter:

```typescript
reporters: [
    'spec',
    ['allure', {
        outputDir: 'allure-results',
        disableWebdriverStepsReporting: true,
        disableWebdriverScreenshotsReporting: false,
    }]
],
```

### Configuration Options

- **`outputDir: 'allure-results'`**: Directory where Allure stores raw results
- **`disableWebdriverStepsReporting: true`**: Prevents duplicate step reporting
- **`disableWebdriverScreenshotsReporting: false`**: Enables automatic screenshot capture

### Screenshot Capture

The configuration includes automatic screenshot capture on test failures:

```typescript
afterTest: function (test, context, { error, result, duration, passed, retries }) {
    if (!passed) {
        browser.takeScreenshot();
    }
},
```

## Available NPM Scripts

### Report Generation
```bash
npm run allure:generate    # Generate HTML report from allure-results
```

### Report Viewing
```bash
npm run allure:open        # Open generated report in browser
npm run allure:serve       # Serve report on local server
```

### Combined Test + Report
```bash
npm run test:e2e:allure           # Run tests + generate report
npm run test:e2e:headless:allure  # Run headless tests + generate report
```

## Local Development Workflow

### 1. Run Tests with Allure
```bash
# Standard mode with Allure
npm run test:e2e:allure

# Headless mode with Allure
npm run test:e2e:headless:allure
```

### 2. Generate Report
```bash
npm run allure:generate
```

### 3. View Report
```bash
npm run allure:open
```

## CI/CD Integration

### GitHub Actions Workflow

The CI workflow automatically:

1. **Runs E2E tests** in headless mode
2. **Generates Allure report** from test results
3. **Uploads artifacts** for download:
   - `allure-report/` - Generated HTML report
   - `allure-results/` - Raw test results

### CI Artifacts

After each CI run, you can download:
- **Allure Report**: Beautiful HTML report with test results
- **Allure Results**: Raw data for local report generation

### Local Report Generation from CI

To generate a report from CI results:

```bash
# Download allure-results artifact from CI
# Extract to project root
npm run allure:generate
npm run allure:open
```

## Report Features

### Dashboard
- **Test Summary**: Total tests, passed, failed, skipped
- **Timeline**: Test execution timeline
- **Categories**: Test failure categorization
- **Trends**: Historical test performance

### Test Details
- **Step-by-step execution**: Detailed test step information
- **Screenshots**: Automatic captures on failures
- **Environment info**: Browser, OS, test configuration
- **Performance data**: Test duration and timing

### Filtering and Search
- **By status**: Passed, failed, skipped, broken
- **By duration**: Fast, slow, medium tests
- **By tags**: Feature, severity, priority
- **By environment**: Browser, OS, device

## Customization

### Adding Test Metadata

You can enhance reports with custom metadata:

```typescript
// In your step definitions
import { allure } from 'allure-commandline';

// Add description
allure.description('This test verifies user login functionality');

// Add severity
allure.severity('critical');

// Add story/epic
allure.story('User Authentication');
allure.epic('Core Features');

// Add custom labels
allure.label('feature', 'Login');
allure.label('component', 'AuthService');
```

### Environment Configuration

Customize environment information in reports:

```typescript
// In wdio.conf.ts
onPrepare: function (config, capabilities) {
    allure.addEnvironment('Browser', capabilities.browserName);
    allure.addEnvironment('Version', capabilities.browserVersion);
    allure.addEnvironment('Platform', capabilities.platformName);
}
```

## Troubleshooting

### Common Issues

#### 1. Report Generation Fails
```bash
# Ensure allure-results directory exists
mkdir -p allure-results

# Check if tests generated results
ls -la allure-results/

# Regenerate report
npm run allure:generate
```

#### 2. Screenshots Not Appearing
- Verify `disableWebdriverScreenshotsReporting: false`
- Check if `afterTest` hook is properly configured
- Ensure browser session is active during screenshot capture

#### 3. CI Report Generation Issues
- Verify Allure command line is installed in CI
- Check if `allure-results` directory exists after tests
- Ensure proper file permissions

### Performance Optimization

#### 1. Reduce Report Size
```typescript
// Limit screenshot capture
afterTest: function (test, context, { error, result, duration, passed, retries }) {
    if (!passed && process.env.CAPTURE_SCREENSHOTS !== 'false') {
        browser.takeScreenshot();
    }
},
```

#### 2. Selective Reporting
```typescript
// Only capture screenshots for critical failures
afterTest: function (test, context, { error, result, duration, passed, retries }) {
    if (!passed && test.title.includes('Critical')) {
        browser.takeScreenshot();
    }
},
```

## Best Practices

### 1. Test Organization
- Use descriptive test names
- Group related tests with tags
- Maintain consistent test structure

### 2. Screenshot Management
- Capture screenshots only when needed
- Use meaningful screenshot names
- Clean up old screenshots periodically

### 3. Report Maintenance
- Generate reports after each test run
- Archive old reports for historical analysis
- Use CI artifacts for team collaboration

### 4. Performance Monitoring
- Track test execution times
- Monitor report generation performance
- Optimize screenshot capture frequency

## Integration with Other Tools

### 1. Slack/Teams Notifications
- Send report links to team channels
- Include test summary in notifications
- Automate failure alerts

### 2. JIRA Integration
- Link test results to JIRA tickets
- Update ticket status based on test results
- Track test coverage per feature

### 3. Email Reports
- Schedule daily/weekly report emails
- Include test summary and trends
- Highlight critical failures

## Conclusion

Allure reporting provides comprehensive test visibility and enhances team collaboration. The setup includes:

- ✅ **Automatic report generation** after test runs
- ✅ **CI/CD integration** with artifact uploads
- ✅ **Screenshot capture** on test failures
- ✅ **Beautiful HTML reports** with detailed analytics
- ✅ **Local and remote report viewing** options

Use the provided npm scripts to run tests and generate reports, and leverage CI artifacts for team collaboration and historical analysis.
