# BDD Integration Test Plan

## Overview

This document outlines the Behavior-Driven Development (BDD) test scenarios for validating our migration integration plan. Each test scenario corresponds to specific phases and requirements from [MIGRATION_INTEGRATION_PLAN.md](MIGRATION_INTEGRATION_PLAN.md).

## BDD Test Structure

### Testing Framework Stack
- **Cypress**: E2E BDD testing with real user interactions
- **Jest + Cucumber**: Unit/Integration BDD tests for services
- **Angular Testing Utilities**: Component integration testing

### Test Organization
```
webui/src/app/testing/bdd/
├── features/
│   ├── config-service.feature
│   ├── migration-workflow.feature
│   ├── extension-integration.feature
│   └── error-handling.feature
├── step-definitions/
│   ├── config-service.steps.ts
│   ├── migration-workflow.steps.ts
│   ├── extension-integration.steps.ts
│   └── error-handling.steps.ts
└── support/
    ├── test-data.ts
    └── mock-services.ts
```

## Phase 1: Config-First Architecture BDD Tests

### Feature: ConfigService Central Hub

```gherkin
Feature: ConfigService acts as central configuration hub
  As a migration system
  I want all steps to feed into a central ConfigService
  So that configuration is consistent and mirrors CLI pattern

  Background:
    Given the ConfigService is initialized
    And the service state is empty

  Scenario: Upload step provides archive folder
    Given I am on the upload step
    When I upload a valid Instagram export file
    And the file extraction completes successfully
    Then the ConfigService should contain the archive folder path
    And the archive folder should be a valid temporary path

  Scenario: Auth step provides Bluesky credentials  
    Given I am on the auth step
    And the ConfigService has an archive folder
    When I enter valid Bluesky credentials
    And the connection test succeeds
    Then the ConfigService should contain the username and password
    And the credentials should be stored securely

  Scenario: Config step provides migration settings
    Given I am on the config step
    And the ConfigService has archive folder and credentials
    When I set migration date range to "2023-01-01" to "2023-12-31"
    And I enable test mode for videos
    And I disable simulation mode
    Then the ConfigService should contain all migration settings
    And the complete configuration should be valid

  Scenario: Execute step retrieves complete configuration
    Given the ConfigService has complete configuration
    When the execute step calls getCompleteConfig()
    Then a complete MigrationConfig object should be returned
    And all required fields should be present
    And the configuration should pass validation

  Scenario: Complete step resets configuration
    Given the migration has completed
    When the complete step calls reset()
    Then the ConfigService should be empty
    And ready for a new migration
```

### Step Definitions for ConfigService

```typescript
// webui/src/app/testing/bdd/step-definitions/config-service.steps.ts
import { Given, When, Then } from '@cucumber/cucumber';
import { TestBed } from '@angular/core/testing';
import { ConfigService, MigrationConfig } from '../../../services/config/config.service';

let configService: ConfigService;
let testConfig: Partial<MigrationConfig>;

Given('the ConfigService is initialized', () => {
  TestBed.configureTestingModule({
    providers: [ConfigService]
  });
  configService = TestBed.inject(ConfigService);
});

Given('the service state is empty', () => {
  configService.reset();
  expect(configService['config']).toEqual({});
});

When('I upload a valid Instagram export file', () => {
  // Simulate file upload and extraction
  testConfig = { archiveFolder: '/temp/instagram-export-123' };
});

When('the file extraction completes successfully', () => {
  configService.setArchiveFolder(testConfig.archiveFolder!);
});

Then('the ConfigService should contain the archive folder path', () => {
  const config = configService['config'];
  expect(config.archiveFolder).toBe(testConfig.archiveFolder);
});

When('I enter valid Bluesky credentials', () => {
  testConfig.blueskyUsername = 'testuser';
  testConfig.blueskyPassword = 'testpass';
});

When('the connection test succeeds', () => {
  configService.setCredentials(testConfig.blueskyUsername!, testConfig.blueskyPassword!);
});

Then('the ConfigService should contain the username and password', () => {
  const config = configService['config'];
  expect(config.blueskyUsername).toBe(testConfig.blueskyUsername);
  expect(config.blueskyPassword).toBe(testConfig.blueskyPassword);
});

When('I set migration date range to {string} to {string}', (startDate: string, endDate: string) => {
  testConfig.minDate = new Date(startDate);
  testConfig.maxDate = new Date(endDate);
});

When('I enable test mode for videos', () => {
  testConfig.testVideoMode = true;
});

When('I disable simulation mode', () => {
  testConfig.simulate = false;
});

Then('the ConfigService should contain all migration settings', () => {
  configService.setMigrationSettings(testConfig);
  const config = configService['config'];
  expect(config.minDate).toEqual(testConfig.minDate);
  expect(config.maxDate).toEqual(testConfig.maxDate);
  expect(config.testVideoMode).toBe(true);
  expect(config.simulate).toBe(false);
});

When('the execute step calls getCompleteConfig\\(\\)', () => {
  // This will be tested in the Then step
});

Then('a complete MigrationConfig object should be returned', () => {
  const completeConfig = configService.getCompleteConfig();
  expect(completeConfig).toBeDefined();
  expect(typeof completeConfig).toBe('object');
});

Then('all required fields should be present', () => {
  const completeConfig = configService.getCompleteConfig();
  expect(completeConfig.archiveFolder).toBeDefined();
  expect(completeConfig.blueskyUsername).toBeDefined();
  expect(completeConfig.blueskyPassword).toBeDefined();
});
```

## Phase 2: Extension Layer BDD Tests

### Feature: Extension Files Integration

```gherkin
Feature: Migration tool extensions integrate without modifying core
  As a developer
  I want to use extension files that wrap migration tools
  So that CLI functionality remains unchanged

  Scenario: External Data Processor handles Instagram data
    Given an Instagram export archive exists
    And the archive contains valid posts.json and reels.json
    When the External Data Processor processes the data
    Then the processor should return ProcessedPost objects
    And the processing should follow steps 1-6 from main() function
    And no existing CLI files should be modified

  Scenario: External Migration Executor handles Bluesky integration
    Given valid Bluesky credentials exist
    And processed Instagram posts are available
    When the External Migration Executor runs
    Then it should authenticate with Bluesky
    And upload media with progress tracking
    And create posts with real-time updates
    And follow step 7 from main() function

  Scenario: External Migration Orchestrator coordinates execution
    Given a complete MigrationConfig is available
    When the External Migration Orchestrator executes
    Then it should call External Data Processor first
    And then call External Migration Executor
    And provide progress updates throughout
    And return comprehensive migration results
```

### Step Definitions for Extension Integration

```typescript
// webui/src/app/testing/bdd/step-definitions/extension-integration.steps.ts
import { Given, When, Then } from '@cucumber/cucumber';

// These will be created as we implement the extensions
let testArchivePath: string;
let processedPosts: any[];
let migrationResult: any;

Given('an Instagram export archive exists', () => {
  testArchivePath = 'test-data/instagram-export-sample.zip';
  // Setup test archive with sample data
});

Given('the archive contains valid posts.json and reels.json', () => {
  // Verify test data structure
  expect(testArchivePath).toContain('instagram-export');
});

When('the External Data Processor processes the data', async () => {
  // This will test our actual extension when implemented
  // const processor = new ExternalDataProcessor(config);
  // processedPosts = await processor.processWithProgress();
  processedPosts = []; // Placeholder
});

Then('the processor should return ProcessedPost objects', () => {
  expect(Array.isArray(processedPosts)).toBe(true);
  // Add more specific validations based on ProcessedPost interface
});

Then('no existing CLI files should be modified', () => {
  // Verify that main.ts, instagram-to-bluesky.ts, etc. remain unchanged
  // This could be a file hash check or git status verification
});
```

## Phase 3: Step Component Integration BDD Tests

### Feature: Step Components Use ConfigService

```gherkin
Feature: Angular step components feed into ConfigService
  As a user
  I want each migration step to contribute to the central configuration
  So that my migration settings are preserved across steps

  Scenario: Upload component feeds archive path to ConfigService
    Given I am on the upload page
    When I select Instagram export files
    And I click "Process Files"
    Then the files should be extracted to a temporary location
    And the ConfigService should receive the archive path
    And I should be navigated to the auth step

  Scenario: Auth component feeds credentials to ConfigService  
    Given I am on the auth page
    And the ConfigService has an archive folder
    When I enter my Bluesky username "testuser"
    And I enter my Bluesky password "testpass"
    And I click "Test Connection"
    Then the Bluesky connection should be tested
    And the ConfigService should receive the credentials
    And I should be navigated to the config step

  Scenario: Config component feeds settings to ConfigService
    Given I am on the config page
    And the ConfigService has archive folder and credentials
    When I set the date range from "2023-01-01" to "2023-12-31"
    And I enable test mode for videos
    And I click "Start Migration"
    Then the ConfigService should receive all settings
    And I should be navigated to the execute step

  Scenario: Execute component uses complete configuration
    Given I am on the execute page
    And the ConfigService has complete configuration
    When the migration execution starts
    Then the complete config should be retrieved from ConfigService
    And the External Migration Orchestrator should be called
    And real-time progress should be displayed

  Scenario: Complete component resets for new migration
    Given I am on the complete page
    And the migration has finished
    When I click "Start New Migration"
    Then the ConfigService should be reset
    And I should be navigated to the upload step
```

### Cypress E2E BDD Tests

```typescript
// cypress/e2e/migration-workflow.cy.ts
describe('Migration Workflow BDD', () => {
  beforeEach(() => {
    cy.visit('/upload');
  });

  it('should complete full config-first migration workflow', () => {
    // Step 1: Upload
    cy.get('[data-testid="file-upload"]').selectFile('cypress/fixtures/instagram-export.zip');
    cy.get('[data-testid="process-files"]').click();
    cy.get('[data-testid="upload-success"]').should('be.visible');
    cy.url().should('include', '/auth');

    // Step 2: Auth
    cy.get('[data-testid="bluesky-username"]').type('testuser');
    cy.get('[data-testid="bluesky-password"]').type('testpass');
    cy.get('[data-testid="test-connection"]').click();
    cy.get('[data-testid="auth-success"]').should('be.visible');
    cy.url().should('include', '/config');

    // Step 3: Config
    cy.get('[data-testid="start-date"]').type('2023-01-01');
    cy.get('[data-testid="end-date"]').type('2023-12-31');
    cy.get('[data-testid="test-video-mode"]').check();
    cy.get('[data-testid="start-migration"]').click();
    cy.url().should('include', '/execute');

    // Step 4: Execute
    cy.get('[data-testid="migration-progress"]').should('be.visible');
    cy.get('[data-testid="progress-bar"]').should('exist');
    // Wait for migration to complete (or mock it)
    cy.get('[data-testid="migration-complete"]', { timeout: 30000 }).should('be.visible');
    cy.url().should('include', '/complete');

    // Step 5: Complete
    cy.get('[data-testid="migration-results"]').should('be.visible');
    cy.get('[data-testid="start-new-migration"]').click();
    cy.url().should('include', '/upload');
  });
});
```

## Phase 4: Error Handling BDD Tests

### Feature: Error Handling and Recovery

```gherkin
Feature: Migration system handles errors gracefully
  As a user
  I want clear error messages and recovery options
  So that I can resolve issues and complete my migration

  Scenario: Invalid Instagram export file
    Given I am on the upload page
    When I upload an invalid file
    Then I should see an error message "Invalid Instagram export format"
    And I should see suggestions for fixing the issue
    And I should be able to try uploading again

  Scenario: Bluesky authentication failure
    Given I am on the auth page
    When I enter invalid Bluesky credentials
    And I click "Test Connection"
    Then I should see an error message "Authentication failed"
    And I should be able to try different credentials
    And the form should remain on the auth page

  Scenario: Network error during migration
    Given migration is in progress
    When a network error occurs
    Then the migration should pause
    And I should see an error message with retry option
    And I should be able to resume from where it stopped

  Scenario: ConfigService validation failure
    Given incomplete configuration exists
    When the execute step tries to get complete config
    Then a validation error should be thrown
    And I should be redirected to the missing step
    And I should see what information is required
```

## Phase 5: Performance and Memory BDD Tests

### Feature: Performance Requirements

```gherkin
Feature: Migration system meets performance requirements
  As a user
  I want migration to be fast and efficient
  So that I don't experience delays or browser crashes

  Scenario: Large Instagram export handling
    Given an Instagram export with 1000+ posts
    When I process the export
    Then memory usage should stay under 500MB
    And processing should complete within 2 minutes
    And the UI should remain responsive

  Scenario: Real-time progress updates
    Given migration is executing
    When posts are being uploaded
    Then progress updates should occur every 2 seconds
    And the progress bar should reflect actual completion
    And estimated time should be reasonably accurate

  Scenario: Memory cleanup after migration
    Given migration has completed
    When I navigate to the complete page
    Then temporary files should be cleaned up
    And memory usage should return to baseline
    And no memory leaks should be detected
```

## Integration Test Implementation Plan

### Week 1: ConfigService BDD Tests
```bash
# Create and run ConfigService BDD tests
npm run test:bdd:config-service

# Expected outcomes:
# ✅ ConfigService acts as central hub
# ✅ Each step feeds correct data
# ✅ Validation works correctly
# ✅ Reset functionality works
```

### Week 2: Extension Layer BDD Tests
```bash
# Create extension files and test integration
npm run test:bdd:extensions

# Expected outcomes:
# ✅ Extensions wrap CLI tools without modification
# ✅ Progress hooks work correctly
# ✅ Data processing matches CLI behavior
# ✅ Bluesky integration functions properly
```

### Week 3: Component Integration BDD Tests
```bash
# Test component-ConfigService integration
npm run test:bdd:components

# Expected outcomes:
# ✅ Upload component feeds archive path
# ✅ Auth component feeds credentials
# ✅ Config component feeds settings
# ✅ Execute component uses complete config
```

### Week 4: E2E BDD Tests
```bash
# Run full workflow E2E tests
npm run test:e2e:workflow

# Expected outcomes:
# ✅ Complete workflow functions end-to-end
# ✅ Navigation works correctly
# ✅ Data persists across steps
# ✅ User experience is smooth
```

### Week 5: Error Handling and Performance BDD Tests
```bash
# Test error scenarios and performance
npm run test:bdd:error-handling
npm run test:bdd:performance

# Expected outcomes:
# ✅ Errors are handled gracefully
# ✅ Recovery options work
# ✅ Performance meets requirements
# ✅ Memory management is effective
```

## BDD Test Commands

```json
// package.json scripts for BDD testing
{
  "scripts": {
    "test:bdd": "cucumber-js --require-module ts-node/register --require 'src/app/testing/bdd/step-definitions/**/*.ts' 'src/app/testing/bdd/features/**/*.feature'",
    "test:bdd:config-service": "npm run test:bdd -- --tags '@config-service'",
    "test:bdd:extensions": "npm run test:bdd -- --tags '@extensions'",
    "test:bdd:components": "npm run test:bdd -- --tags '@components'",
    "test:bdd:error-handling": "npm run test:bdd -- --tags '@error-handling'",
    "test:bdd:performance": "npm run test:bdd -- --tags '@performance'",
    "test:e2e:workflow": "cypress run --spec 'cypress/e2e/migration-workflow.cy.ts'",
    "test:bdd:all": "npm run test:bdd && npm run test:e2e:workflow"
  }
}
```

## Success Criteria for BDD Tests

### Functional Testing
- [ ] All config-first scenarios pass
- [ ] Extension integration scenarios pass  
- [ ] Component integration scenarios pass
- [ ] Full workflow E2E scenarios pass
- [ ] Error handling scenarios pass

### Performance Testing
- [ ] Memory usage stays within limits
- [ ] Processing time meets requirements
- [ ] UI responsiveness maintained
- [ ] Progress updates are timely

### Quality Testing
- [ ] All BDD scenarios are green
- [ ] Test coverage above 80%
- [ ] No test flakiness
- [ ] Clear test documentation

This BDD approach ensures we validate each aspect of our integration plan systematically, providing confidence that our config-first architecture and extension strategy work correctly in practice.

