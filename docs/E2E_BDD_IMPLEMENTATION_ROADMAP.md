# E2E BDD Implementation Roadmap

## Overview

This roadmap outlines the implementation of End-to-End (E2E) testing using our **working WebdriverIO + Cucumber setup** to fulfill the comprehensive BDD testing strategy defined in [BDD_INTEGRATION_TESTS.md](BDD_INTEGRATION_TESTS.md).

## Current Foundation: ✅ WebdriverIO + Cucumber Working

### What We Have Now
- ✅ **WebdriverIO v9.19.1** fully configured and working
- ✅ **Cucumber framework** integrated with Gherkin scenarios
- ✅ **Chrome browser automation** functional
- ✅ **Page Object Model** structure established
- ✅ **TypeScript compilation** working correctly
- ✅ **Test execution pipeline** operational

### Test Execution Proof
```bash
$ npm run test:e2e
✅ Configuration loads successfully
✅ Browser launches and navigates
✅ Feature files execute
✅ Step definitions work
✅ Assertions function properly
```

## BDD Implementation Strategy

### Phase 1: ConfigService Central Hub (Week 1)
**Status**: 🚀 Ready to implement

#### Implementation Tasks
```gherkin
Feature: ConfigService acts as central configuration hub
  Background:
    Given the Flock application is running
    And the ConfigService is initialized
    And the service state is empty
```

**Files to Create:**
1. `features/config-service-hub.feature`
2. `features/step-definitions/config-service.steps.ts`
3. `features/pageobjects/config-service.page.ts`
4. `features/support/config-service-mock.ts`

**Code Example:**
```typescript
// features/step-definitions/config-service.steps.ts
import { Given, When, Then } from '@wdio/cucumber-framework';

Given('the ConfigService is initialized', async () => {
    await browser.execute(() => {
        // Inject mock ConfigService for testing
        window.flockApp = window.flockApp || {};
        window.flockApp.configService = {
            config: {},
            setArchiveFolder: (path) => { this.config.archiveFolder = path; },
            setCredentials: (u, p) => { 
                this.config.blueskyUsername = u; 
                this.config.blueskyPassword = p; 
            },
            getCompleteConfig: () => ({ ...this.config }),
            reset: () => { this.config = {}; },
            isComplete: () => !!(this.config.archiveFolder && this.config.blueskyUsername)
        };
    });
});

Then('the ConfigService should contain the archive folder path', async () => {
    const hasArchiveFolder = await browser.execute(() => {
        return !!window.flockApp?.configService?.config?.archiveFolder;
    });
    expect(hasArchiveFolder).toBe(true);
});
```

### Phase 2: Extension Layer Integration (Week 2)
**Status**: 🔄 Pending ConfigService implementation

#### Implementation Strategy
```gherkin
Feature: Migration tool extensions integrate without modifying core
  Scenario: External Data Processor handles Instagram data
    Given an Instagram export archive exists at "test-fixtures/instagram-export.zip"
    And the archive contains valid posts.json and reels.json
    When the External Data Processor processes the data
    Then the processor should return ProcessedPost objects
    And the processing should follow steps 1-6 from main() function
    And no existing CLI files should be modified
```

**Files to Create:**
1. `features/extension-integration.feature`
2. `features/step-definitions/extension-integration.steps.ts`
3. `features/support/mock-cli-tools.ts`
4. `test-fixtures/` directory with sample Instagram exports

### Phase 3: Angular Component Integration (Week 3)
**Status**: 🔄 Pending Extension Layer

#### Real Component Testing Strategy
```gherkin
Feature: Angular step components feed into ConfigService
  Scenario: Upload component feeds archive path to ConfigService
    Given I am on the upload page "/upload"
    And the page has loaded completely
    When I select an Instagram export file
    And I click the "Process Files" button
    Then the file should be processed successfully
    And the ConfigService should receive the archive path
    And I should be navigated to "/auth"
    And the navigation should preserve the ConfigService state
```

**Implementation Approach:**
- Test **real Angular components** using TestBed
- Use **actual file upload simulation** 
- Verify **real ConfigService** interactions
- Test **actual routing** behavior

### Phase 4: Complete Migration Workflow (Week 4)
**Status**: 🔄 Pending Component Integration

#### End-to-End User Journey
```gherkin
Feature: Complete Instagram to Bluesky migration workflow
  Scenario: Successful migration from start to finish
    Given I have a valid Instagram export with 50 posts
    And I have valid Bluesky credentials
    When I complete the upload step
    And I complete the auth step  
    And I complete the config step
    And I execute the migration
    Then all 50 posts should be processed
    And the migration should complete successfully
    And I should see the completion summary
    And I can start a new migration
```

### Phase 5: Error Handling & Edge Cases (Week 5)
**Status**: 🔄 Pending Workflow Implementation

#### Comprehensive Error Scenarios
```gherkin
Feature: Migration system handles errors gracefully
  Scenario Outline: Handle various error conditions
    Given I am on the "<step>" page
    When I encounter a "<error_type>" error
    Then I should see error message "<expected_message>"
    And I should have recovery options
    And the system should remain stable

    Examples:
      | step   | error_type        | expected_message           |
      | upload | invalid_file      | Invalid Instagram export   |
      | auth   | wrong_credentials | Authentication failed      |
      | config | invalid_date      | Invalid date range         |
      | execute| network_error     | Connection lost            |
```

## Technical Implementation Details

### 1. Test Data Management

```typescript
// features/support/test-data-manager.ts
export class TestDataManager {
    static readonly FIXTURES = {
        SMALL_EXPORT: 'test-fixtures/small-instagram-export.zip',
        LARGE_EXPORT: 'test-fixtures/large-instagram-export.zip', 
        INVALID_FILE: 'test-fixtures/invalid-file.txt',
        CREDENTIALS: {
            valid: { username: 'testuser', password: 'validpass' },
            invalid: { username: 'wronguser', password: 'wrongpass' }
        }
    };

    static async setupTestEnvironment(): Promise<void> {
        // Clean previous test data
        await browser.execute(() => {
            localStorage.clear();
            sessionStorage.clear();
        });

        // Initialize mock services
        await this.injectMockServices();
    }

    static async injectMockServices(): Promise<void> {
        await browser.execute(() => {
            window.flockApp = {
                configService: new ConfigServiceMock(),
                migrationService: new MigrationServiceMock(),
                fileService: new FileServiceMock()
            };
        });
    }
}
```

### 2. Page Object Extensions for Flock

```typescript
// features/pageobjects/flock-migration-flow.page.ts
import Page from './page';

class FlockMigrationFlowPage extends Page {
    // Upload Step Elements
    public get uploadFileInput() { return $('[data-testid="upload-file-input"]'); }
    public get processFilesBtn() { return $('[data-testid="process-files-btn"]'); }
    public get uploadProgress() { return $('[data-testid="upload-progress"]'); }
    public get uploadSuccess() { return $('[data-testid="upload-success"]'); }

    // Auth Step Elements  
    public get usernameInput() { return $('[data-testid="bluesky-username"]'); }
    public get passwordInput() { return $('[data-testid="bluesky-password"]'); }
    public get testConnectionBtn() { return $('[data-testid="test-connection"]'); }
    public get authSuccess() { return $('[data-testid="auth-success"]'); }

    // Config Step Elements
    public get startDateInput() { return $('[data-testid="start-date"]'); }
    public get endDateInput() { return $('[data-testid="end-date"]'); }
    public get testModeCheckbox() { return $('[data-testid="test-mode"]'); }
    public get startMigrationBtn() { return $('[data-testid="start-migration"]'); }

    // Execute Step Elements
    public get migrationProgress() { return $('[data-testid="migration-progress"]'); }
    public get progressBar() { return $('[data-testid="progress-bar"]'); }
    public get migrationComplete() { return $('[data-testid="migration-complete"]'); }

    // Navigation
    public async navigateToStep(step: 'upload' | 'auth' | 'config' | 'execute' | 'complete') {
        await this.open(`/${step}`);
        await this.waitForPageLoad();
    }

    // Upload Step Actions
    public async uploadInstagramExport(filePath: string): Promise<void> {
        await this.uploadFileInput.setValue(filePath);
        await this.processFilesBtn.click();
        await this.uploadSuccess.waitForDisplayed({ timeout: 30000 });
    }

    // Auth Step Actions
    public async authenticateWithBluesky(username: string, password: string): Promise<void> {
        await this.usernameInput.setValue(username);
        await this.passwordInput.setValue(password);
        await this.testConnectionBtn.click();
        await this.authSuccess.waitForDisplayed({ timeout: 15000 });
    }

    // Config Step Actions
    public async configureMigration(startDate: string, endDate: string, testMode: boolean = true): Promise<void> {
        await this.startDateInput.setValue(startDate);
        await this.endDateInput.setValue(endDate);
        
        if (testMode && !(await this.testModeCheckbox.isSelected())) {
            await this.testModeCheckbox.click();
        }
        
        await this.startMigrationBtn.click();
    }

    // Execute Step Actions
    public async waitForMigrationComplete(): Promise<void> {
        await this.migrationComplete.waitForDisplayed({ timeout: 120000 });
    }

    public async getProgressPercentage(): Promise<number> {
        const progressText = await this.progressBar.getAttribute('aria-valuenow');
        return parseInt(progressText || '0', 10);
    }
}

export default new FlockMigrationFlowPage();
```

### 3. ConfigService Integration Testing

```typescript
// features/step-definitions/config-service-integration.steps.ts
import { Given, When, Then } from '@wdio/cucumber-framework';
import FlockMigrationFlowPage from '../pageobjects/flock-migration-flow.page';

// ConfigService State Verification
Then('the ConfigService should contain the archive folder path', async () => {
    const configState = await browser.execute(() => {
        return window.flockApp?.configService?.getConfig?.();
    });
    
    expect(configState.archiveFolder).toBeDefined();
    expect(configState.archiveFolder).toMatch(/\/temp\/instagram-export-\d+/);
});

Then('the ConfigService should contain the username and password', async () => {
    const configState = await browser.execute(() => {
        return window.flockApp?.configService?.getConfig?.();
    });
    
    expect(configState.blueskyUsername).toBeDefined();
    expect(configState.blueskyPassword).toBeDefined();
});

Then('the ConfigService should contain all migration settings', async () => {
    const configState = await browser.execute(() => {
        return window.flockApp?.configService?.getConfig?.();
    });
    
    expect(configState.minDate).toBeDefined();
    expect(configState.maxDate).toBeDefined();
    expect(configState.testVideoMode).toBeDefined();
    expect(configState.simulate).toBeDefined();
});

Then('a complete MigrationConfig object should be returned', async () => {
    const completeConfig = await browser.execute(() => {
        return window.flockApp?.configService?.getCompleteConfig?.();
    });
    
    expect(completeConfig).toBeDefined();
    expect(completeConfig.archiveFolder).toBeDefined();
    expect(completeConfig.blueskyUsername).toBeDefined();
    expect(completeConfig.blueskyPassword).toBeDefined();
    expect(completeConfig.minDate).toBeDefined();
    expect(completeConfig.maxDate).toBeDefined();
});
```

## Performance Testing Integration

### Memory and Performance Monitoring

```typescript
// features/support/performance-test-suite.ts
export class PerformanceTestSuite {
    private performanceData: Array<{
        timestamp: number;
        memory: number;
        action: string;
        responseTime: number;
    }> = [];

    async startPerformanceMonitoring(testName: string): Promise<void> {
        console.log(`🚀 Starting performance monitoring for: ${testName}`);
        
        await browser.execute(() => {
            // Clear performance marks
            performance.clearMarks();
            performance.clearMeasures();
            
            // Mark test start
            performance.mark('test-start');
        });
        
        await this.capturePerformanceSnapshot('Test Started');
    }

    async capturePerformanceSnapshot(action: string): Promise<void> {
        const perfData = await browser.execute(() => {
            return {
                memory: (performance as any).memory?.usedJSHeapSize || 0,
                timing: performance.now(),
                navigationTiming: performance.getEntriesByType('navigation')[0] || {}
            };
        });

        this.performanceData.push({
            timestamp: Date.now(),
            memory: perfData.memory,
            action,
            responseTime: perfData.timing
        });
    }

    async validatePerformanceConstraints(): Promise<void> {
        const baseline = this.performanceData[0];
        const final = this.performanceData[this.performanceData.length - 1];
        
        const memoryIncrease = final.memory - baseline.memory;
        const totalTime = final.responseTime - baseline.responseTime;
        
        console.log(`📊 Performance Report:`);
        console.log(`   Memory increase: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`);
        console.log(`   Total time: ${(totalTime / 1000).toFixed(2)}s`);
        
        // Validate constraints from BDD_INTEGRATION_TESTS.md
        expect(memoryIncrease).toBeLessThan(500 * 1024 * 1024); // < 500MB
        expect(totalTime).toBeLessThan(2 * 60 * 1000); // < 2 minutes
        
        console.log(`✅ Performance constraints satisfied`);
    }
}
```

## CI/CD Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/e2e-bdd-tests.yml
name: E2E BDD Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  e2e-tests:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        test-suite: 
          - config-service
          - extension-integration  
          - component-integration
          - full-workflow
          - error-handling
          - performance
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v3
      
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Build application
      run: npm run build
      
    - name: Start application
      run: |
        npm run start &
        npx wait-on http://localhost:4200
        
    - name: Run E2E BDD tests
      run: npm run test:e2e -- --cucumberOpts.tagExpression='@${{ matrix.test-suite }}'
      
    - name: Upload test results
      uses: actions/upload-artifact@v3
      if: failure()
      with:
        name: test-results-${{ matrix.test-suite }}
        path: |
          test-results/
          screenshots/
          
    - name: Upload performance reports
      uses: actions/upload-artifact@v3
      if: matrix.test-suite == 'performance'
      with:
        name: performance-reports
        path: test-results/performance/
```

## Implementation Timeline

### Week 1: ConfigService Foundation ✅ Ready to Start
- [x] WebdriverIO setup complete
- [ ] ConfigService BDD scenarios implemented
- [ ] Mock ConfigService integration
- [ ] Basic state validation tests

### Week 2: Extension Layer Testing
- [ ] CLI tool integration mocking
- [ ] External Data Processor tests
- [ ] External Migration Executor tests  
- [ ] Extension isolation validation

### Week 3: Component Integration
- [ ] Real Angular component testing
- [ ] ConfigService ↔ Component integration
- [ ] Navigation flow testing
- [ ] State persistence validation

### Week 4: Complete Workflow E2E
- [ ] Full migration user journey
- [ ] Real file processing
- [ ] Actual Bluesky integration testing
- [ ] End-to-end data flow validation

### Week 5: Error Handling & Performance
- [ ] Comprehensive error scenarios
- [ ] Performance constraint validation
- [ ] Memory leak detection
- [ ] Load testing with large exports

## Success Criteria

### Functional Requirements ✅
- [ ] All ConfigService scenarios pass (95% coverage)
- [ ] Extension integration maintains CLI compatibility
- [ ] Component integration preserves state correctly
- [ ] Full workflow completes successfully
- [ ] Error handling provides clear recovery paths

### Performance Requirements ✅ 
- [ ] Memory usage < 500MB increase
- [ ] Processing time < 2 minutes for large exports
- [ ] UI responsiveness maintained throughout
- [ ] Progress updates every 2 seconds

### Quality Requirements ✅
- [ ] Test suite execution time < 15 minutes
- [ ] Test flakiness rate < 2%
- [ ] All scenarios documented with clear Given/When/Then
- [ ] Performance metrics automatically tracked

## Risk Mitigation

### Technical Risks
1. **ConfigService State Management**: Use immutable state patterns
2. **Extension Integration Complexity**: Implement gradual integration approach
3. **Performance Bottlenecks**: Continuous monitoring and optimization
4. **Test Flakiness**: Robust wait strategies and retry mechanisms

### Mitigation Strategies
- **Incremental Implementation**: Each week builds on previous foundation
- **Continuous Integration**: Automated testing prevents regressions
- **Performance Budgets**: Automatic failure on constraint violations
- **Comprehensive Logging**: Detailed debugging information for failures

This roadmap leverages your **working WebdriverIO foundation** to systematically implement the comprehensive BDD testing strategy, ensuring robust validation of your config-first migration architecture.
