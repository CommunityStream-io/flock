# E2E Testing Architecture with WebdriverIO and Cucumber

## Overview

This document outlines our End-to-End (E2E) testing architecture using WebdriverIO with Cucumber for both Electron desktop app testing and web browser testing. This setup integrates with our [BDD Integration Tests](BDD_INTEGRATION_TESTS.md) to provide comprehensive behavioral testing across all platforms.

## Architecture Overview

```
E2E Testing Stack
├── WebdriverIO v9.19.1 (Test Runner)
├── Cucumber Framework (BDD Scenarios)
├── Chrome/Chromedriver (Web Testing)
├── Electron Integration (Desktop Testing)
└── Custom Page Objects (Test Organization)
```

## Project Structure

```
flock/
├── wdio.conf.ts                 # Main WebdriverIO configuration
├── features/                    # Cucumber features and tests
│   ├── login.feature           # Example BDD scenarios
│   ├── step-definitions/       # Cucumber step implementations
│   │   └── steps.ts            # Step definition implementations
│   └── pageobjects/            # Page Object Model
│       ├── page.ts             # Base page class
│       ├── login.page.ts       # Login page object
│       └── secure.page.ts      # Secure area page object
├── test/                       # Test configurations
│   └── tsconfig.json          # TypeScript config for tests
└── package.json               # Dependencies and scripts
```

## Configuration Details

### WebdriverIO Configuration (wdio.conf.ts)

```typescript
import type { Options } from '@wdio/types'

export const config: Options.Testrunner = {
    // TypeScript compilation
    autoCompileOpts: {
        autoCompile: true,
        tsNodeOpts: {
            transpileOnly: true,
            project: 'test/tsconfig.json'
        }
    },

    // Test specifications
    specs: [
        './features/**/*.feature'
    ],

    // Browser capabilities
    capabilities: [{
        maxInstances: 5,
        browserName: 'chrome',
        acceptInsecureCerts: true
    }],

    // Test framework
    framework: 'cucumber',

    // Services for browser automation
    services: ['chromedriver'],

    // Cucumber-specific configuration
    cucumberOpts: {
        require: ['./features/step-definitions/steps.ts'],
        backtrace: false,
        requireModule: [],
        dryRun: false,
        failFast: false,
        snippets: true,
        source: true,
        strict: false,
        tagExpression: '',
        timeout: 60000,
        ignoreUndefinedDefinitions: false
    },

    // Logging and reporting
    logLevel: 'info',
    reporters: ['spec'],
    maxInstances: 10,
    bail: 0,
    baseUrl: 'http://localhost:4200',
    waitforTimeout: 10000,
    connectionRetryTimeout: 120000,
    connectionRetryCount: 3
}
```

### Package.json Scripts

```json
{
  "scripts": {
    "test:e2e": "wdio run wdio.conf.ts",
    "test:e2e:watch": "wdio run wdio.conf.ts --watch",
    "test:e2e:debug": "wdio run wdio.conf.ts --debug",
    "test:e2e:headless": "wdio run wdio.conf.ts --headless"
  }
}
```

## BDD Integration with Migration Workflow

### Cucumber Feature Files

Based on our [BDD Integration Tests](BDD_INTEGRATION_TESTS.md), here's how E2E tests integrate with the migration workflow:

```gherkin
# features/migration-workflow.feature
Feature: Instagram to Bluesky Migration Workflow
  As a user
  I want to migrate my Instagram content to Bluesky
  So that I can preserve my social media history

  Background:
    Given the Flock migration application is running
    And I have a valid Instagram export file
    And I have valid Bluesky credentials

  @config-first @e2e
  Scenario: Complete migration workflow with config-first architecture
    Given I am on the upload step
    When I upload my Instagram export file
    Then the ConfigService should receive the archive folder path
    And I should be navigated to the auth step

    When I enter my Bluesky credentials
    And I test the connection successfully
    Then the ConfigService should receive the credentials
    And I should be navigated to the config step

    When I configure migration settings
    And I start the migration
    Then the ConfigService should have complete configuration
    And I should be navigated to the execute step
    And the migration should complete successfully

  @error-handling @e2e
  Scenario: Error handling during migration
    Given I am on the upload step
    When I upload an invalid file
    Then I should see a clear error message
    And I should be able to retry the upload

  @performance @e2e
  Scenario: Large export file handling
    Given I have a large Instagram export (1000+ posts)
    When I process the export
    Then the processing should complete within 2 minutes
    And memory usage should stay under 500MB
    And the UI should remain responsive
```

### Step Definitions Integration

```typescript
// features/step-definitions/migration-workflow.steps.ts
import { Given, When, Then } from '@wdio/cucumber-framework';
import UploadPage from '../pageobjects/upload.page';
import AuthPage from '../pageobjects/auth.page';
import ConfigPage from '../pageobjects/config.page';
import ExecutePage from '../pageobjects/execute.page';

Given('the Flock migration application is running', async () => {
    await browser.url('/upload');
    await expect(browser).toHaveTitle('Flock - Instagram to Bluesky Migration');
});

Given('I have a valid Instagram export file', async () => {
    // Setup test data - mock or real Instagram export
    global.testData = {
        exportFile: 'test-fixtures/instagram-export-sample.zip',
        expectedPosts: 150,
        archiveSize: '25MB'
    };
});

When('I upload my Instagram export file', async () => {
    await UploadPage.uploadFile(global.testData.exportFile);
    await UploadPage.processFiles();
});

Then('the ConfigService should receive the archive folder path', async () => {
    // Verify through UI state or API call
    await expect(UploadPage.successMessage).toBeDisplayed();
    await expect(UploadPage.successMessage).toHaveTextContaining('successfully processed');
});

When('I enter my Bluesky credentials', async () => {
    await AuthPage.enterCredentials('testuser', 'testpassword');
});

When('I test the connection successfully', async () => {
    await AuthPage.testConnection();
    await AuthPage.waitForConnectionSuccess();
});

Then('the ConfigService should receive the credentials', async () => {
    await expect(AuthPage.successIndicator).toBeDisplayed();
});

When('I configure migration settings', async () => {
    await ConfigPage.setDateRange('2023-01-01', '2023-12-31');
    await ConfigPage.enableTestMode();
    await ConfigPage.disableSimulation();
});

When('I start the migration', async () => {
    await ConfigPage.startMigration();
});

Then('the ConfigService should have complete configuration', async () => {
    // This could be verified through browser dev tools or API endpoint
    const configState = await browser.execute(() => {
        return window.flockApp?.configService?.isComplete();
    });
    expect(configState).toBe(true);
});

Then('the migration should complete successfully', async () => {
    await ExecutePage.waitForMigrationComplete();
    await expect(ExecutePage.completionMessage).toBeDisplayed();
});
```

## Page Object Model Implementation

### Base Page Class

```typescript
// features/pageobjects/page.ts
export default class Page {
    public async open(path: string) {
        await browser.url(path);
    }

    public async waitForPageLoad() {
        await browser.waitUntil(
            () => browser.execute(() => document.readyState === 'complete'),
            { timeout: 10000, timeoutMsg: 'Page did not load within 10 seconds' }
        );
    }

    public async scrollToElement(element: WebdriverIO.Element) {
        await element.scrollIntoView();
    }

    public async takeScreenshot(name: string) {
        await browser.saveScreenshot(`./test-results/screenshots/${name}.png`);
    }
}
```

### Migration-Specific Page Objects

```typescript
// features/pageobjects/upload.page.ts
import Page from './page';

class UploadPage extends Page {
    public get fileInput() {
        return $('[data-testid="file-upload-input"]');
    }

    public get processButton() {
        return $('[data-testid="process-files-btn"]');
    }

    public get successMessage() {
        return $('[data-testid="upload-success-message"]');
    }

    public get progressBar() {
        return $('[data-testid="upload-progress-bar"]');
    }

    public async uploadFile(filePath: string) {
        await this.fileInput.setValue(filePath);
    }

    public async processFiles() {
        await this.processButton.click();
        await this.waitForProcessingComplete();
    }

    public async waitForProcessingComplete() {
        await browser.waitUntil(
            async () => {
                const progressValue = await this.progressBar.getAttribute('value');
                return progressValue === '100';
            },
            { timeout: 30000, timeoutMsg: 'File processing did not complete' }
        );
    }

    public async open() {
        await super.open('/upload');
        await this.waitForPageLoad();
    }
}

export default new UploadPage();
```

```typescript
// features/pageobjects/config.page.ts
import Page from './page';

class ConfigPage extends Page {
    public get startDateInput() {
        return $('[data-testid="start-date-input"]');
    }

    public get endDateInput() {
        return $('[data-testid="end-date-input"]');
    }

    public get testModeCheckbox() {
        return $('[data-testid="test-mode-checkbox"]');
    }

    public get simulationModeCheckbox() {
        return $('[data-testid="simulation-mode-checkbox"]');
    }

    public get startMigrationButton() {
        return $('[data-testid="start-migration-btn"]');
    }

    public async setDateRange(startDate: string, endDate: string) {
        await this.startDateInput.setValue(startDate);
        await this.endDateInput.setValue(endDate);
    }

    public async enableTestMode() {
        if (!(await this.testModeCheckbox.isSelected())) {
            await this.testModeCheckbox.click();
        }
    }

    public async disableSimulation() {
        if (await this.simulationModeCheckbox.isSelected()) {
            await this.simulationModeCheckbox.click();
        }
    }

    public async startMigration() {
        await this.startMigrationButton.click();
    }

    public async open() {
        await super.open('/config');
        await this.waitForPageLoad();
    }
}

export default new ConfigPage();
```

## Electron Desktop App Testing

### Electron-Specific Configuration

```typescript
// wdio.electron.conf.ts
import { config as baseConfig } from './wdio.conf';
import type { Options } from '@wdio/types';

export const config: Options.Testrunner = {
    ...baseConfig,
    
    // Electron-specific capabilities
    capabilities: [{
        browserName: 'electron',
        'wdio:electronServiceOptions': {
            appBinaryPath: './dist/flock-desktop/flock.exe',
            appArgs: ['--testing']
        }
    }],

    // Electron service
    services: [
        'electron',
        'chromedriver'
    ],

    // Electron-specific specs
    specs: [
        './features/electron/**/*.feature'
    ]
};
```

### Electron-Specific Features

```gherkin
# features/electron/desktop-integration.feature
Feature: Desktop Application Integration
  As a user
  I want the desktop app to integrate with my system
  So that I can use migration features seamlessly

  @electron @desktop
  Scenario: File system access for Instagram exports
    Given the desktop app is running
    When I click "Browse for Instagram Export"
    Then the native file dialog should open
    And I should be able to select multiple file types
    And the selected files should be processed locally

  @electron @desktop
  Scenario: System notifications during migration
    Given migration is in progress
    When a migration milestone is reached
    Then I should receive a system notification
    And the notification should show progress details

  @electron @desktop
  Scenario: Menu bar and system tray integration
    Given the desktop app is running
    When I close the main window
    Then the app should minimize to system tray
    And I should be able to restore from tray icon
```

## Test Data Management

### Test Fixtures

```typescript
// features/support/test-data.ts
export interface TestFixture {
    name: string;
    description: string;
    files: {
        instagramExport: string;
        expectedOutput: string;
    };
    config: {
        username: string;
        password: string;
        dateRange: {
            start: string;
            end: string;
        };
    };
}

export const testFixtures: Record<string, TestFixture> = {
    smallExport: {
        name: 'Small Instagram Export',
        description: 'Export with 10 posts, 5 images, 2 videos',
        files: {
            instagramExport: 'fixtures/small-instagram-export.zip',
            expectedOutput: 'fixtures/small-export-expected.json'
        },
        config: {
            username: 'testuser',
            password: 'testpass',
            dateRange: {
                start: '2023-01-01',
                end: '2023-12-31'
            }
        }
    },
    largeExport: {
        name: 'Large Instagram Export',
        description: 'Export with 1000+ posts for performance testing',
        files: {
            instagramExport: 'fixtures/large-instagram-export.zip',
            expectedOutput: 'fixtures/large-export-expected.json'
        },
        config: {
            username: 'testuser',
            password: 'testpass',
            dateRange: {
                start: '2020-01-01',
                end: '2023-12-31'
            }
        }
    }
};
```

### Mock Services

```typescript
// features/support/mock-services.ts
export class MockConfigService {
    private static instance: MockConfigService;
    private config: any = {};

    static getInstance(): MockConfigService {
        if (!MockConfigService.instance) {
            MockConfigService.instance = new MockConfigService();
        }
        return MockConfigService.instance;
    }

    setArchiveFolder(path: string): void {
        this.config.archiveFolder = path;
    }

    setCredentials(username: string, password: string): void {
        this.config.blueskyUsername = username;
        this.config.blueskyPassword = password;
    }

    setMigrationSettings(settings: any): void {
        Object.assign(this.config, settings);
    }

    getCompleteConfig(): any {
        return { ...this.config };
    }

    reset(): void {
        this.config = {};
    }

    isComplete(): boolean {
        return !!(this.config.archiveFolder && 
                 this.config.blueskyUsername && 
                 this.config.blueskyPassword);
    }
}

// Browser injection for testing
export const injectMockServices = async () => {
    await browser.execute(() => {
        window.flockApp = window.flockApp || {};
        window.flockApp.configService = new (class {
            private config: any = {};
            
            setArchiveFolder(path: string) { this.config.archiveFolder = path; }
            setCredentials(u: string, p: string) { 
                this.config.blueskyUsername = u; 
                this.config.blueskyPassword = p; 
            }
            setMigrationSettings(s: any) { Object.assign(this.config, s); }
            getCompleteConfig() { return { ...this.config }; }
            reset() { this.config = {}; }
            isComplete() { 
                return !!(this.config.archiveFolder && 
                         this.config.blueskyUsername && 
                         this.config.blueskyPassword); 
            }
        })();
    });
};
```

## Integration with BDD Testing Strategy

### Mapping E2E Tests to BDD Phases

Based on [BDD_INTEGRATION_TESTS.md](BDD_INTEGRATION_TESTS.md), our E2E tests cover:

#### Phase 1: Config-First Architecture
- **E2E Coverage**: Full workflow testing ensuring ConfigService receives data from each step
- **Web Testing**: Browser-based UI interactions
- **Electron Testing**: Desktop app file system and native integration

#### Phase 2: Extension Layer
- **E2E Coverage**: Testing extension integration without modifying core CLI tools
- **Mock Integration**: Using real extension calls in controlled environment

#### Phase 3: Component Integration
- **E2E Coverage**: Testing Angular component → ConfigService → Extension flow
- **Navigation Testing**: Ensuring step transitions work correctly

#### Phase 4: Error Handling
- **E2E Coverage**: Testing error scenarios and recovery mechanisms
- **User Experience**: Validating error messages and retry functionality

#### Phase 5: Performance
- **E2E Coverage**: Performance testing with real data volumes
- **Memory Testing**: Monitoring resource usage during tests

## Test Execution and CI/CD Integration

### Local Development

```bash
# Run all E2E tests
npm run test:e2e

# Run with watch mode for development
npm run test:e2e:watch

# Run specific tags
npx wdio run wdio.conf.ts --cucumberOpts.tagExpression='@config-first'

# Run Electron tests
npx wdio run wdio.electron.conf.ts

# Debug mode
npm run test:e2e:debug
```

### CI/CD Pipeline Integration

```yaml
# .github/workflows/e2e-tests.yml
name: E2E Tests
on: [push, pull_request]

jobs:
  web-e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm run start &
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: test-screenshots
          path: test-results/screenshots/

  electron-e2e:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build:electron
      - run: npx wdio run wdio.electron.conf.ts
```

## Performance Testing

### Memory and Performance Monitoring

```typescript
// features/support/performance-monitoring.ts
export class PerformanceMonitor {
    private startMemory: number = 0;
    private startTime: number = 0;

    async startMonitoring(): Promise<void> {
        this.startTime = Date.now();
        this.startMemory = await this.getMemoryUsage();
    }

    async getMemoryUsage(): Promise<number> {
        const memInfo = await browser.execute(() => {
            return (performance as any).memory?.usedJSHeapSize || 0;
        });
        return memInfo;
    }

    async checkPerformanceConstraints(): Promise<void> {
        const currentMemory = await this.getMemoryUsage();
        const memoryIncrease = currentMemory - this.startMemory;
        const elapsedTime = Date.now() - this.startTime;

        // Memory should not increase by more than 500MB
        expect(memoryIncrease).toBeLessThan(500 * 1024 * 1024);
        
        // Processing should complete within 2 minutes for large files
        expect(elapsedTime).toBeLessThan(2 * 60 * 1000);
    }
}
```

## Debugging and Troubleshooting

### Debug Configuration

```typescript
// wdio.debug.conf.ts
import { config as baseConfig } from './wdio.conf';

export const config = {
    ...baseConfig,
    
    // Debug settings
    logLevel: 'debug',
    outputDir: './test-results/debug',
    
    // Slower timeouts for debugging
    cucumberOpts: {
        ...baseConfig.cucumberOpts,
        timeout: 300000 // 5 minutes
    },
    
    // Keep browser open on failure
    afterTest: async function (test, context, { error, result, duration, passed, retries }) {
        if (!passed) {
            await browser.debug();
        }
    }
};
```

### Common Issues and Solutions

1. **Element Not Found**: Use explicit waits and better selectors
2. **Timing Issues**: Implement proper wait strategies
3. **Memory Leaks**: Clean up test data between scenarios
4. **Flaky Tests**: Use retry mechanisms and stable selectors

## Success Metrics

### Test Coverage Goals
- [ ] **Functional Coverage**: 95% of user workflows covered
- [ ] **Error Scenarios**: All error paths tested
- [ ] **Performance**: All performance requirements validated
- [ ] **Cross-Platform**: Both web and Electron coverage
- [ ] **Integration**: ConfigService integration fully tested

### Quality Metrics
- [ ] **Test Stability**: <2% flaky test rate
- [ ] **Execution Time**: Complete suite under 15 minutes
- [ ] **Maintenance**: Clear, maintainable test code
- [ ] **Documentation**: All test scenarios documented

This E2E testing architecture provides comprehensive coverage of your migration application across both web and desktop platforms, ensuring reliable behavior through BDD scenarios that directly map to your integration requirements.
