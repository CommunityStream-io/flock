# 🌐 E2E Testing - Testing the Full Migration Journey

> *"Just like a bird needs to complete its entire migration journey to reach its destination, our E2E tests ensure every step of the user's journey works perfectly from start to finish."*

## 🎯 **E2E Testing Philosophy**

Our E2E tests follow **BDD (Behavior-Driven Development)** methodology using WebdriverIO with Cucumber. We test complete user workflows to ensure:

- **Full User Journeys** - Complete migration process from start to finish
- **Real Browser Testing** - Actual browser interactions and behavior
- **Integration Testing** - How all components work together
- **User Experience Validation** - Real user scenarios and edge cases

## 🏗️ **E2E Test Structure**

### **Feature File Organization**
```
features/
├── auth.feature              # Authentication and credential validation
├── file-upload.feature       # File selection and validation
├── landing.feature           # Landing page and navigation
└── navigation-guard.feature  # Route protection and validation
```

### **Step Definition Modules**
```
features/step-definitions/
├── steps.ts              # Main file with imports and common steps
├── auth.ts               # Authentication-related steps
├── file-upload.ts        # File upload and validation steps
├── landing.ts            # Landing page interaction steps
├── splash-screen.ts      # Splash screen and loading states
└── step-navigation.ts    # Step navigation and routing
```

### **Page Object Pattern**
```
features/pageobjects/
├── index.ts              # Main page object exports
├── page.ts               # Base page object class
├── auth.page.ts          # Authentication page interactions
├── landing.page.ts       # Landing page interactions
├── login.page.ts         # Login form interactions
├── navigation-guard.page.ts # Navigation guard testing
├── secure.page.ts        # Secure area interactions
├── step-layout.page.ts   # Step layout interactions
└── upload-step.page.ts   # File upload interactions
```

## 🧪 **BDD Feature Examples**

### **Authentication Feature**
```gherkin
Feature: Bluesky Authentication
  As a user migrating from Instagram to Bluesky
  I want to authenticate with my Bluesky credentials
  So that I can proceed with the migration process

  Scenario: Valid credentials allow progression
    Given the application is running
    And I navigate to the auth step
    And I have entered valid credentials
    When I click the "Next" button
    Then the authentication script should run in the background
    And I should be navigated to the config step
```

### **File Upload Feature**
```gherkin
Feature: File Upload and Validation
  As a user starting the migration process
  I want to upload my Instagram archive file
  So that the system can validate and process it

  Scenario: Valid file upload succeeds
    Given I am on the upload step
    When I select a valid Instagram archive file "valid-archive.zip"
    Then the file should be selected in the file input
    And I should see validation success indicators
```

### **Navigation Guard Feature**
```gherkin
Feature: Navigation Guards
  As a user navigating through the migration process
  I want to be prevented from skipping required steps
  So that the migration process is completed correctly

  Scenario: Navigation is blocked without valid file
    Given I am on the upload step
    And no file has been selected
    When I try to navigate to the next step
    Then I should see a validation error message
    And I should remain on the upload step
```

## 🔧 **Step Definition Patterns**

### **BDD Step Structure**
```typescript
Given('the application is running', async () => {
  // 🔧 BDD: Set up the context/preconditions
  console.log('🔧 BDD: Application is running and ready');
  
  // Navigate to the application
  await browser.url('/');
  
  // Wait for application to load
  await browser.waitUntil(async () => {
    return await browser.getTitle() === 'Flock Migration';
  });
});
```

### **User Interaction Steps**
```typescript
When('I click the {string} button', async (buttonText: string) => {
  // ⚙️ BDD: Perform the action
  console.log(`⚙️ BDD: Clicking ${buttonText} button`);
  
  // Find and click the button
  const button = await $(`button=${buttonText}`);
  await button.waitForDisplayed();
  await button.click();
  
  // Wait for action to complete
  await browser.waitUntil(async () => {
    return await button.isDisplayed() === false;
  });
});
```

### **Validation Steps**
```typescript
Then('I should see validation success indicators', async () => {
  // ✅ BDD: Verify the outcome
  console.log('✅ BDD: Checking for validation success indicators');
  
  // Check for success indicators
  const successMessage = await $('.validation-success');
  await successMessage.waitForDisplayed();
  
  // Verify success message content
  const messageText = await successMessage.getText();
  expect(messageText).toContain('File uploaded successfully');
});
```

## 🎭 **Page Object Pattern**

### **Base Page Object**
```typescript
export class Page {
  // Common selectors
  protected get loadingSpinner() { return $('.loading-spinner'); }
  protected get errorMessage() { return $('.error-message'); }
  
  // Common methods
  async waitForPageLoad() {
    await this.loadingSpinner.waitForDisplayed({ reverse: true });
  }
  
  async getErrorMessage() {
    await this.errorMessage.waitForDisplayed();
    return await this.errorMessage.getText();
  }
}
```

### **Specific Page Objects**
```typescript
export class UploadStepPage extends Page {
  // Page-specific selectors
  get fileInput() { return $('input[type="file"]'); }
  get uploadButton() { return $('button[type="submit"]'); }
  get validationMessage() { return $('.validation-message'); }
  
  // Page-specific methods
  async uploadFile(filePath: string) {
    // 🔧 BDD: Set up file upload
    console.log('🔧 BDD: Setting up file upload');
    
    await this.fileInput.setValue(filePath);
    await this.uploadButton.click();
    
    // Wait for upload to complete
    await this.waitForPageLoad();
  }
  
  async getValidationMessage() {
    await this.validationMessage.waitForDisplayed();
    return await this.validationMessage.getText();
  }
}
```

## 🚀 **Running E2E Tests**

### **Basic Commands**
```bash
# Run all E2E tests
npm run test:e2e:headless

# Run tests with coverage
npm run test:e2e:coverage

# Run tests in debug mode
npm run e2e:debug

# Run tests with verbose output
export DEBUG_TESTS=true && npm run test:e2e:headless
```

### **Targeted Test Execution**
```bash
# Run specific feature files
export TEST_SPEC="./features/auth.feature" && npm run test:e2e:headless
export TEST_SPEC="./features/file-upload.feature" && npm run test:e2e:headless
export TEST_SPEC="./features/landing.feature" && npm run test:e2e:headless

# Run tests with specific tags
export TEST_TAGS="@bluesky-auth" && npm run test:e2e:headless
export TEST_TAGS="@file-upload" && npm run test:e2e:headless
export TEST_TAGS="@validation" && npm run test:e2e:headless

# Run validation tests specifically
npm run e2e:validation
```

### **Test Environment Control**
```bash
# Run in headless mode (CI)
export HEADLESS=true && npm run test:e2e:headless

# Run with debug output
export DEBUG_TESTS=true && npm run test:e2e:headless

# Run specific test combinations
export TEST_TAGS="@bluesky-auth and @validation" && npm run test:e2e:headless
```

## 🔍 **E2E Test Debugging**

### **Debug Mode**
```bash
# Run with debug output and headless mode
npm run e2e:debug

# Run specific validation tests in debug mode
npm run e2e:debug-validation
```

### **Common Debugging Scenarios**

#### **Missing Step Definitions**
```bash
# Check which steps are missing
export TEST_SPEC="./features/auth.feature" && npm run test:e2e:headless

# Look for "Step is not defined" errors in output
# Add missing step definitions to the appropriate module:
# - features/step-definitions/auth.ts (for auth-related steps)
# - features/step-definitions/file-upload.ts (for file upload steps)
# - features/step-definitions/landing.ts (for landing page steps)
```

#### **Element Not Found Issues**
```bash
# Test specific page interactions
export TEST_SPEC="./features/file-upload.feature" && npm run test:e2e:headless

# Check page object selectors
# Verify element selectors in page objects match actual DOM
```

#### **Navigation Issues**
```bash
# Test navigation guards specifically
export TEST_SPEC="./features/navigation-guard.feature" && npm run test:e2e:headless

# Verify guard implementation and URL routing
```

### **Quick Test Iteration Workflow**
```bash
# 1. Run specific failing test suite
export TEST_SPEC="./features/auth.feature" && npm run test:e2e:headless

# 2. Fix issues in code

# 3. Re-run just that suite to verify fix
export TEST_SPEC="./features/auth.feature" && npm run test:e2e:headless

# 4. Once fixed, run full test suite
npm run test:e2e:headless
```

## 📊 **E2E Test Coverage**

### **Coverage Collection**
```bash
# Run E2E tests with coverage
npm run test:e2e:coverage

# Coverage data is collected during test execution
# Results are uploaded to Codecov with 'e2etests' flag
```

### **Coverage Configuration**
Our WebdriverIO configuration includes coverage collection hooks:
```typescript
beforeSession: function (config, capabilities, specs, cid) {
  if (process.env.COLLECT_COVERAGE === 'true') {
    console.log('🔍 BDD: Initializing E2E coverage collection');
  }
},

afterSuite: function (suite) {
  if (process.env.COLLECT_COVERAGE === 'true') {
    console.log('📊 BDD: Collecting coverage data for suite:', suite.title);
  }
}
```

## 🎯 **E2E Testing Best Practices**

### **Test Organization**
- **Feature-Based**: Organize tests by business features
- **Scenario-Based**: Group related scenarios together
- **Modular Steps**: Use modular step definitions for reusability
- **Page Objects**: Use page objects for maintainable selectors

### **Test Data Management**
- **Test Files**: Use dedicated test files for file upload scenarios
- **Mock Data**: Create realistic test data that matches production
- **Data Cleanup**: Clean up test data after test execution
- **Environment Isolation**: Ensure tests don't interfere with each other

### **Reliability and Stability**
- **Wait Strategies**: Use proper wait strategies for dynamic content
- **Element Selection**: Use stable selectors that won't break with UI changes
- **Error Handling**: Handle expected errors gracefully
- **Retry Logic**: Implement retry logic for flaky operations

### **Performance Considerations**
- **Parallel Execution**: Run tests in parallel when possible
- **Test Optimization**: Optimize tests for faster execution
- **Resource Management**: Clean up resources after test execution
- **CI Integration**: Ensure tests run efficiently in CI environment

## 🛠️ **E2E Test Maintenance**

### **Keeping Tests Updated**
- **UI Changes**: Update selectors when UI components change
- **Feature Changes**: Update tests when features are modified
- **Step Definitions**: Keep step definitions in sync with feature files
- **Page Objects**: Maintain page objects as UI evolves

### **Common Maintenance Tasks**
- **Selector Updates**: Update CSS selectors when Angular Material components change
- **Timing Adjustments**: Adjust wait times if application performance changes
- **Validation Updates**: Update validation logic when form requirements change
- **Navigation Updates**: Maintain step routing consistency with application changes

### **Test Quality**
- **Readable Tests**: Write tests that are easy to understand
- **Maintainable Tests**: Structure tests for easy maintenance
- **Reliable Tests**: Ensure tests are deterministic and stable
- **Fast Tests**: Optimize tests for reasonable execution time

---

*"E2E tests are like following a bird's complete migration journey - they ensure every step of the user's path works perfectly, from takeoff to landing."*
