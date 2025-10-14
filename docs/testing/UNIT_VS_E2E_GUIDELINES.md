# Unit vs E2E Testing Guidelines

**Last Updated**: October 13, 2025

## Overview

This document provides guidelines for deciding when to write unit tests vs E2E (End-to-End) tests in the Flock project. The goal is to maximize test coverage while minimizing test execution time and maintenance burden.

## Current Testing Stack

- **Unit Tests**: Karma + Jasmine (~293 tests in `projects/shared/src/lib/`)
- **E2E Tests**: WebdriverIO + Cucumber/Gherkin (20+ feature files in `features/`)
- **Platforms**: Web (Mirage), Electron (Native), Future: Mobile

## Coverage Targets

- **Unit Tests**: 80%+ line coverage on business logic
- **E2E Tests**: 100% critical user journeys, 1 happy path per feature
- **Platform Tests**: 100% platform-specific features (IPC, dialogs, etc.)

---

## What to Unit Test

**Unit tests are fast, isolated, and test individual pieces of logic in isolation.**

### 1. Form Validation Logic

**Test**: Individual validators and validation rules
**Why**: Fast, deterministic, easy to test all edge cases
**How**: Angular TestBed with mocked dependencies

**Example**:
```typescript
// projects/shared/src/lib/services/validation.service.spec.ts
describe('ValidationService', () => {
  describe('validateBlueskyHandle', () => {
    it('should reject empty handle');
    it('should reject handle without @');
    it('should reject invalid format');
    it('should accept valid handle like @user.bsky.social');
    it('should accept valid DID format');
    it('should trim whitespace');
    it('should reject handles longer than 253 characters');
    // ... 10+ more edge cases
  });
});
```

**Don't duplicate in E2E**: Testing all 15+ validation edge cases would take minutes in E2E, but seconds in unit tests.

### 2. Data Transformation Functions

**Test**: Pure functions that transform data
**Why**: No dependencies, easy to test, fast execution
**How**: Simple function calls with assertion

**Example**:
```typescript
// projects/shared/src/lib/utils/date.utils.spec.ts
describe('DateUtils', () => {
  describe('parseInstagramDate', () => {
    it('should parse YYYY-MM-DD format');
    it('should handle timezone offsets');
    it('should return null for invalid dates');
    it('should handle edge case dates (leap years, etc.)');
  });
  
  describe('formatDateRange', () => {
    it('should format single date');
    it('should format date range');
    it('should handle missing dates');
  });
});
```

### 3. Service Methods

**Test**: Service methods with mocked dependencies
**Why**: Test business logic without external dependencies
**How**: Jasmine spies, mocked HTTP calls, mocked file system

**Example**:
```typescript
// projects/flock-native/src/app/service/cli/cli.service.spec.ts
describe('CLIService', () => {
  let service: CLIService;
  let electronServiceMock: jasmine.SpyObj<ElectronService>;
  
  beforeEach(() => {
    electronServiceMock = jasmine.createSpyObj('ElectronService', ['getAPI']);
    // ... setup
  });
  
  it('should execute CLI with correct arguments', async () => {
    // Test the service logic without actually executing CLI
    const processId = await service.executeMigration('/path/to/archive', {
      blueskyHandle: '@test.bsky.social',
      blueskyPassword: 'password',
      simulate: true
    });
    
    expect(electronServiceMock.getAPI).toHaveBeenCalled();
    expect(processId).toBeDefined();
  });
  
  it('should strip @ prefix from username', async () => {
    // Test specific logic
    await service.executeMigration('/path', {
      blueskyHandle: '@user.bsky.social',
      blueskyPassword: 'pass',
      simulate: true
    });
    
    // Verify the @ was stripped
    const calls = electronServiceMock.getAPI().executeCLI.calls;
    expect(calls.first().args[2].env.BLUESKY_USERNAME).toBe('user.bsky.social');
  });
});
```

### 4. Component Logic

**Test**: Component state management, UI logic, calculations
**Why**: Fast feedback, test UI logic without rendering
**How**: Angular TestBed with ComponentFixture

**Example**:
```typescript
// projects/shared/src/lib/steps/config/config.spec.ts
describe('ConfigComponent', () => {
  it('should initialize with default values');
  it('should enable submit button when form is valid');
  it('should disable submit button when form is invalid');
  it('should calculate date range correctly');
  it('should emit navigation event on submit');
  it('should show error message when validation fails');
});
```

---

## What to E2E Test

**E2E tests are slow, integrated, and test complete user journeys.**

### 1. Happy Path Workflows

**Test**: Complete user journeys from start to finish
**Why**: Verify all components work together
**How**: Cucumber feature files with step definitions

**Example**:
```gherkin
@core @smoke
Feature: Complete Migration Workflow
  As a user
  I want to migrate my Instagram posts to Bluesky
  So that I can preserve my content
  
  Scenario: Successful migration
    Given I am on the upload page
    When I upload a valid Instagram archive
    And I proceed to configuration
    And I set a date range
    And I proceed to authentication
    And I enter valid Bluesky credentials
    And I start the migration
    Then I should see the migration complete successfully
```

**Don't test**: Individual form validation rules (already covered by unit tests)

### 2. Integration Points

**Test**: Cross-component behavior and navigation
**Why**: Verify components communicate correctly
**How**: Feature files testing interactions between steps

**Example**:
```gherkin
@core
Feature: Step Navigation
  
  Scenario: Cannot proceed without completing current step
    Given I am on the upload page
    When I try to navigate to configuration
    Then I should remain on the upload page
    And I should see an error message
    
  Scenario: Can proceed after completing step
    Given I am on the upload page
    And I have uploaded a valid archive
    When I click the next button
    Then I should be on the configuration page
```

### 3. Critical Business Rules

**Test**: High-value scenarios that could break the application
**Why**: Protect critical functionality
**How**: 1-2 scenarios per critical rule

**Example**:
```gherkin
@core @critical
Feature: Date Range Validation
  
  Scenario: Date range prevents invalid migrations
    Given I am on the configuration page
    When I set the start date after the end date
    And I try to proceed
    Then I should see a date range error
    And I should not be able to proceed
    
  # Don't test: All 15 date validation edge cases (unit tests handle this)
```

### 4. Platform-Specific Features

**Test**: Features unique to each platform
**Why**: Can't be tested in isolation
**How**: Platform-specific feature files with `@web`, `@electron` tags

**Web Platform**:
```gherkin
@web @platform:web
Feature: HTML File Input
  Scenario: Upload file via HTML input
    Given I am on the web upload page
    When I select a file using the HTML input
    Then the file should be validated
```

**Electron Platform**:
```gherkin
@electron @platform:electron @ipc
Feature: CLI Execution via IPC
  Scenario: Execute migration CLI
    Given the Electron app is running
    When I trigger migration via IPC
    Then the CLI should execute successfully
    And I should receive output via IPC events
```

---

## Decision Framework

### Ask These Questions:

1. **Can this be tested without the UI?**
   - **Yes** → Unit test
   - **No** → E2E test

2. **Does this test require multiple components to interact?**
   - **No** → Unit test
   - **Yes** → E2E test

3. **Is this testing a critical user journey?**
   - **Yes** → E2E test
   - **No** → Probably unit test

4. **Am I testing edge cases and error conditions?**
   - **Yes** → Unit test (unless it's a critical user-facing error)
   - **No** → Could be either

5. **Is this platform-specific behavior?**
   - **Yes** → E2E test with platform tags
   - **No** → Consider unit test first

### Examples:

| Scenario | Test Type | Reason |
|----------|-----------|--------|
| Username validation rejects empty input | Unit | Fast, isolated, edge case |
| Date parser handles leap years | Unit | Pure function, deterministic |
| Form submission navigates to next step | E2E | Integration between components |
| File upload shows progress bar | E2E | UI behavior, user-facing |
| CLI execution via IPC works | E2E | Platform-specific, requires Electron |
| Config object constructor | Unit | Pure logic, no dependencies |
| Complete migration workflow | E2E | Critical user journey |
| Error message formatting | Unit | Pure function, UI logic |
| Navigation guard prevents invalid routes | E2E | Integration, router behavior |
| Calculate upload progress percentage | Unit | Math function, deterministic |

---

## Leveraging Unit Tests to Reduce E2E Burden

### Strategy 1: Validate Inputs in Unit Tests

**Before** (All validation in E2E):
```gherkin
# 15 scenarios testing every validation rule - takes 10 minutes
Scenario: Empty username is rejected
Scenario: Username without @ is rejected
Scenario: Username too long is rejected
# ... 12 more scenarios
```

**After** (Comprehensive unit tests, minimal E2E):
```typescript
// Unit test - 15 tests in 10 seconds
describe('validateUsername', () => {
  it('should reject empty username');
  it('should reject username without @');
  // ... 13 more tests
});
```

```gherkin
# E2E - 2 smoke tests in 30 seconds
Scenario: Valid username is accepted
Scenario: Invalid username shows error
```

**Result**: 10 minutes → 40 seconds

### Strategy 2: Use Coverage to Inform E2E

**Check unit test coverage before writing E2E tests:**

```bash
npm run test:coverage
```

If unit tests already cover:
- ✅ 80%+ of validation logic → E2E only needs 1-2 happy path tests
- ❌ < 50% of validation logic → E2E must be more comprehensive

### Strategy 3: Extract Logic to Make it Unit-Testable

**Before** (E2E test is slow/flaky):
```gherkin
# This test is flaky and takes 2 minutes
Scenario: CLI output is parsed correctly
  When the CLI outputs progress
  Then I should see the correct percentage
```

**After** (Extract to service, unit test):
```typescript
// Unit test - fast and reliable
describe('CLIService.parseProgress', () => {
  it('should extract percentage from CLI output', () => {
    const output = 'Processing: 45%';
    const result = service.parseProgress(output);
    expect(result.percentage).toBe(45);
  });
});
```

```gherkin
# E2E test - just verify integration
Scenario: Progress updates are displayed
  When migration runs
  Then I should see progress updates
```

**Result**: Flaky 2-minute test → Reliable 10-second test + stable E2E

### Strategy 4: Smoke Tests in E2E, Exhaustive Tests in Unit

**Unit Tests**: Test every combination and edge case
```typescript
describe('ConfigForm validation', () => {
  // Test matrix: 15 fields × 5 validation rules = 75 tests
  it('should validate field A with rule 1');
  it('should validate field A with rule 2');
  // ... 73 more tests
});
```

**E2E Tests**: Test one happy path per feature
```gherkin
Scenario: Valid configuration is accepted
  When I fill in all required fields correctly
  Then the form should be valid
  And I should be able to proceed
```

---

## Practical Examples

### Example 1: Username Validation

**Unit Tests** (15 tests, 5 seconds):
```typescript
describe('validateBlueskyHandle', () => {
  it('should accept @user.bsky.social');
  it('should accept user.bsky.social without @');
  it('should accept DID format did:plc:...');
  it('should reject empty string');
  it('should reject invalid characters');
  it('should reject too long handles (>253 chars)');
  it('should reject handles with spaces');
  it('should reject handles with emojis');
  it('should trim whitespace');
  it('should be case insensitive');
  it('should reject @user without domain');
  it('should accept subdomains @user.sub.bsky.social');
  it('should reject invalid TLDs');
  it('should handle Unicode correctly');
  it('should reject SQL injection attempts');
});
```

**E2E Tests** (2 scenarios, 30 seconds):
```gherkin
@core @auth @smoke
Scenario: Valid username is accepted
  When I enter "@test.bsky.social"
  Then the username field should be valid
  And I should be able to proceed

@core @auth
Scenario: Invalid username shows error
  When I enter "invalid"
  Then I should see a username error
  And I should not be able to proceed
```

**Result**: 15 edge cases covered in 35 seconds (vs 10+ minutes in pure E2E)

### Example 2: CLI Output Parsing

**Unit Tests** (10 tests, 2 seconds):
```typescript
describe('CLIService.parseProgress', () => {
  it('should parse percentage: "Progress: 45%"');
  it('should parse file count: "3/10 files processed"');
  it('should handle no progress indicator');
  it('should handle invalid format');
  it('should parse multiple formats');
  it('should extract error messages');
  it('should identify completion markers');
  it('should handle multiline output');
  it('should parse timestamps');
  it('should handle Unicode output');
});
```

**E2E Tests** (1 scenario, 20 seconds):
```gherkin
@electron @ipc
Scenario: Progress updates are displayed
  When I start a migration
  Then I should see progress updates
  And the progress bar should increment
```

---

## Anti-Patterns to Avoid

### ❌ Don't: Duplicate Unit Test Logic in E2E

```gherkin
# BAD: This is already covered by 15 unit tests
Scenario: Username validation handles all edge cases
  When I enter "@user.bsky.social"
  Then it should be valid
  When I enter "no-at-sign"
  Then it should be invalid
  When I enter "@user"
  Then it should be invalid
  # ... 12 more examples
```

### ❌ Don't: Test Implementation Details in E2E

```gherkin
# BAD: Testing internal state/implementation
Scenario: Form sets internal validation state
  When I enter invalid data
  Then the form's isValid property should be false
  And the validationErrors array should contain specific errors
```

```gherkin
# GOOD: Test user-facing behavior
Scenario: Invalid form shows error
  When I enter invalid data
  Then I should see an error message
  And the submit button should be disabled
```

### ❌ Don't: Write E2E Tests for Fast, Isolated Logic

```gherkin
# BAD: This should be a unit test
Scenario: Date formatting works correctly
  # Testing a pure function in E2E is wasteful
```

```typescript
// GOOD: Unit test
it('should format date correctly', () => {
  expect(formatDate('2025-01-15')).toBe('January 15, 2025');
});
```

---

## Test Maintenance Tips

### 1. Keep E2E Tests Stable

- **Use data-testid attributes** for reliable selectors
- **Avoid brittle CSS selectors** that change with styling
- **Add timeouts** for async operations
- **Use platform adapters** to isolate platform differences

### 2. Make Unit Tests Comprehensive

- **Aim for 80%+ coverage** on business logic
- **Test edge cases exhaustively**
- **Mock external dependencies** (API, file system, etc.)
- **Keep tests fast** (< 100ms per test)

### 3. Review Test Balance Regularly

```bash
# Check unit test coverage
npm run test:coverage

# Check E2E test execution time
npm run e2e:web:headless
```

**If E2E tests take > 10 minutes:**
- Look for tests that could be unit tests
- Extract logic to services and unit test
- Use @smoke tag for critical path only

---

## Summary

**Unit Tests** (80% of test coverage):
- Form validation logic
- Data transformation
- Service methods (mocked)
- Component logic
- Edge cases and error conditions

**E2E Tests** (20% of test coverage):
- Happy path workflows
- Integration points
- Critical business rules (1-2 per rule)
- Platform-specific features

**Result**:
- Faster feedback (unit tests run in seconds)
- More comprehensive coverage (test all edge cases)
- More stable tests (unit tests don't depend on UI)
- Efficient use of E2E tests (critical paths only)

---

## Next Steps

1. **Review existing tests** and categorize them
2. **Extract logic** from E2E tests that could be unit tests
3. **Add unit tests** for uncovered business logic
4. **Simplify E2E tests** to focus on integration and critical paths
5. **Monitor coverage** and adjust balance over time

**Questions?** See the team or review examples in:
- `projects/shared/src/lib/**/*.spec.ts` - Unit test examples
- `features/core/**/*.feature` - E2E test examples
- `docs/testing/TESTING.md` - Overall testing strategy

---

**Last Updated**: October 13, 2025



