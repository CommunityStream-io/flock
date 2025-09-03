# 🧪 Flock Testing - How Our Flock Stays Healthy and Strong

> *"We count every duckling in our flock—each feature gets a test, so no one gets left behind! Our testing keeps the whole migration waddling along safely and happily."*

## 🧪 **Testing Philosophy**

We follow **BDD (Behavior-Driven Development)** methodology using Angular's native testing framework with Jasmine. Why not Cucumber? Because we want real Angular components, not mocks! Our testing approach ensures that every bird in our flock can fly safely and reliably.

### **Why BDD?**
- **🔄 User-Focused** - Tests describe real user behavior and scenarios
- **🎯 Business Value** - Tests validate business requirements, not just code
- **🧪 Real Components** - Test actual Angular components, not mocked behavior
- **📚 Living Documentation** - Tests serve as executable specifications

## 🧪 **Testing Strategy Overview**

### **Testing Pyramid**
```mermaid
graph TB
    subgraph "Testing Pyramid"
        A[Unit Tests<br/>Fast & Isolated<br/>Many Tests]
        B[Integration Tests<br/>Component Interaction<br/>Medium Tests]
        C[E2E Tests<br/>Full User Journey<br/>Few Tests]
    end
    
    subgraph "Test Types"
        D[Component Tests]
        E[Service Tests]
        F[Guard Tests]
        G[BDD Tests]
    end
    
    A --> D
    A --> E
    A --> F
    B --> G
    C --> G
    
    style A fill:#4caf50
    style B fill:#ff9800
    style C fill:#f44336
```

### **BDD Structure Pattern**
```typescript
describe('Feature: User Authentication', () => {
  describe('Scenario: Valid login attempt', () => {
    it('Given valid credentials, When user submits, Then login succeeds', () => {
      // 🔧 BDD: Set up the context/preconditions
      console.log(`🔧 BDD: Setting up valid user credentials`);
      
      // ⚙️ BDD: Perform the action
      console.log(`⚙️ BDD: User submits login form`);
      
      // ✅ BDD: Verify the outcome
      console.log(`✅ BDD: Login succeeds and user is authenticated`);
      expect(result).toBe(expected);
    });
  });
});
```

## 🧪 **Unit Testing (Individual Bird Health)**

### **Test File Naming**
- **`component.spec.ts`** - Standard unit tests for components
- **`component-bdd.spec.ts`** - BDD-style behavior tests
- **`service.spec.ts`** - Service unit tests
- **`guard.spec.ts`** - Route guard tests

### **Component Testing**
```mermaid
graph TB
    subgraph "Component Test Structure"
        A[TestBed Setup] --> B[Component Creation]
        B --> C[Input/Output Testing]
        C --> D[User Interaction Testing]
        D --> E[State Change Testing]
        E --> F[Cleanup]
    end
    
    subgraph "Test Utilities"
        G[ComponentFixture]
        H[DebugElement]
        I[ChangeDetectorRef]
        J[TestBed]
    end
    
    A --> G
    B --> H
    C --> I
    D --> J
    
    style A fill:#4caf50
    style D fill:#ff9800
    style F fill:#f44336
```

### **Service Testing**
```mermaid
graph LR
    subgraph "Service Test Pattern"
        A[Mock Dependencies] --> B[Create Service]
        B --> C[Test Methods]
        C --> D[Verify Results]
        D --> E[Test Error Cases]
    end
    
    subgraph "Mocking Strategy"
        F[External APIs]
        G[File System]
        H[Network Calls]
        I[Other Services]
    end
    
    A --> F
    A --> G
    A --> H
    A --> I
    
    style A fill:#4caf50
    style C fill:#2196f3
    style E fill:#ff9800
```

### **Running Unit Tests**
```bash
# Test all birds
ng test

# Test specific birds:
ng test flock-mirage      # Test the mirage
ng test flock-murmur      # Test the murmuration  
ng test flock-native      # Test the native

# Test with coverage
ng test --code-coverage

# Test in watch mode
ng test --watch
```

## 🧪 **E2E Testing (Full Migration Journey)**

### **Test Structure**
```
features/
├── migration-steps.feature    # Complete migration workflow
├── file-upload.feature        # File selection and validation
└── navigation-guard.feature   # Route protection and validation
```

### **Feature File Example**
```gherkin
Feature: Migration Steps
  As a user migrating from Instagram to Bluesky
  I want to follow a guided step-by-step process
  So that I can complete my migration successfully

  Scenario: Complete migration workflow
    Given I have a valid Instagram export file
    When I upload the file
    Then the file should be validated successfully
    
    When I proceed to authentication
    Then I should be able to enter Bluesky credentials
    
    When I proceed to configuration
    Then I should be able to set migration options
    
    When I execute the migration
    Then I should see real-time progress updates
    
    When the migration completes
    Then I should see a success summary
```

### **Page Object Pattern**
```mermaid
graph TB
    subgraph "Page Objects"
        A[UploadStepPage]
        B[StepLayoutPage]
        C[NavigationGuardPage]
        D[LandingPage]
    end
    
    subgraph "Test Helpers"
        E[TestFileHelper]
        F[NavigationTestHelper]
        G[ValidationTestHelper]
        H[DebugHelper]
    end
    
    subgraph "E2E Tests"
        I[Migration Steps]
        J[File Upload]
        K[Navigation Guards]
    end
    
    A --> I
    B --> I
    C --> K
    D --> J
    
    E --> I
    F --> K
    G --> J
    H --> I
    
    style A fill:#4caf50
    style E fill:#ff9800
    style I fill:#2196f3
```

### **Running E2E Tests**
```bash
# Full migration journey tests
ng e2e

# Test specific migration paths:
ng e2e flock-mirage
ng e2e flock-murmur
ng e2e flock-native

# Test with specific tags
ng e2e --cucumberOpts.tagExpression='@migration-steps'

# Test in watch mode
ng e2e --watch
```

## 🧪 **BDD Testing Methodology**

### **BDD vs Unit Testing**
- **BDD Tests** - Focus on user scenarios and business behavior
- **Unit Tests** - Focus on individual methods and edge cases
- **Both** - Complement each other for comprehensive coverage

### **BDD Test Organization**
```typescript
// Group by business feature first
describe('Feature: User Authentication', () => {
  // Then by user scenario
  describe('Scenario: Valid login attempt', () => {
    // Then by specific test cases
    it('Given valid credentials, When user submits, Then login succeeds', () => {
      // BDD implementation
    });
  });
  
  describe('Scenario: Invalid credentials', () => {
    it('Given invalid credentials, When user submits, Then error is shown', () => {
      // BDD implementation  
    });
  });
});
```

### **Console Logging Convention**
- **🔧 BDD:** Setup/Given statements (blue tools)
- **⚙️ BDD:** Actions/When statements (yellow gear)
- **✅ BDD:** Success/Then verifications (green check)
- **❌ BDD:** Expected errors/failures (red X)
- **📝 BDD:** Form submissions/data operations (memo)
- **🧭 BDD:** Navigation operations (compass)

## 🧪 **Test Categories**

### **Feature Categories**
1. **Component Behavior** - Form validation, user interactions, state changes
2. **Service Integration** - Data flow, configuration management, API calls
3. **User Workflows** - End-to-end scenarios across multiple components
4. **Error Handling** - Validation failures, network errors, edge cases

### **Test Scenarios Covered**

#### **Migration Steps Testing**
```mermaid
graph LR
    A[Upload Step] --> B[Auth Step]
    B --> C[Config Step]
    C --> D[Migrate Step]
    D --> E[Complete Step]
    
    A --> F[File Validation]
    B --> G[Credential Validation]
    C --> H[Settings Validation]
    D --> I[Progress Tracking]
    
    style A fill:#4caf50
    style B fill:#2196f3
    style C fill:#ff9800
    style D fill:#9c27b0
    style E fill:#e91e63
```

#### **File Upload Testing**
- **Interface Elements** - Upload section, file input, validation feedback
- **File Operations** - File selection, validation, removal
- **Validation Feedback** - Success indicators, error messages, form states

#### **Navigation Guard Testing**
- **Guard Protection** - Navigation blocking without valid data
- **Guard Bypass** - Navigation allowed with valid data
- **Edge Cases** - Multiple attempts, service state integration

## 🧪 **Real Component Integration**

### **Angular Integration**
- **Real Components** - Always use actual Angular components via TestBed
- **Mock External** - Mock only external dependencies (services, APIs)
- **Real Forms** - Test real form behavior and validation
- **Real Navigation** - Verify actual navigation and state changes
- **Lifecycle** - Use `fixture.detectChanges()` to trigger Angular lifecycle

### **Test Data Management**
```mermaid
graph TB
    subgraph "Test Data Strategy"
        A[Test File Helper] --> B[Mock Files]
        A --> C[Validation States]
        A --> D[Error Scenarios]
    end
    
    subgraph "Data Types"
        E[Instagram Archives]
        F[Bluesky Credentials]
        G[Migration Settings]
        H[Progress Updates]
    end
    
    B --> E
    C --> F
    D --> G
    A --> H
    
    style A fill:#4caf50
    style E fill:#ff9800
    style H fill:#2196f3
```

## 🧪 **Test Implementation Details**

### **File Mocking Strategy**
- **DataTransfer API** - Use `DataTransfer` and `File` APIs to simulate real file selection
- **Mock Archives** - Create mock Instagram archive files with proper structure
- **Validation Scenarios** - Simulate both valid and invalid file scenarios

### **Guard Testing Approach**
- **Real Guards** - Test actual Angular router guards, not mocked behavior
- **Snackbar Capture** - Capture real snackbar messages from Material Design components
- **URL Validation** - Verify URL changes and navigation state

### **Angular Integration**
- **Zone Stability** - Wait for Angular zone stability before assertions
- **Reactive Forms** - Test real Angular reactive forms validation
- **Material Components** - Integrate with Angular Material components

## 🧪 **Test Debugging & Targeted Execution**

### **Running Specific Test Suites**
Instead of waiting for all tests to complete, you can target specific test files or scenarios:

#### **E2E Test Targeting**
```bash
# Run only auth flow tests
export TEST_SPEC="./features/auth.feature" && npm run test:e2e:headless

# Run only file upload tests  
export TEST_SPEC="./features/file-upload.feature" && npm run test:e2e:headless

# Run only landing page tests
export TEST_SPEC="./features/landing.feature" && npm run test:e2e:headless

# Run specific migration steps
export TEST_SPEC="./features/migration-steps.feature" && npm run test:e2e:headless
```

#### **Using Test Tags for Filtering**
```bash
# Run tests with specific tags
npm run e2e:validation  # Runs @bluesky-auth and @validation tagged tests

# Run tests excluding certain tags
npm run test:e2e:skip-failing  # Excludes @skip tagged tests

# Run only passing tests
npm run test:e2e:only-passing  # Excludes @skip tagged tests
```

#### **Debug Mode for E2E Tests**
```bash
# Run with debug output and headless mode
npm run e2e:debug

# Run specific validation tests in debug mode
npm run e2e:debug-validation
```

### **Unit Test Targeting**
```bash
# Test specific project
ng test flock-mirage
ng test flock-murmur  
ng test flock-native

# Test with watch mode for faster iteration
ng test --watch

# Test specific file pattern
ng test --include="**/*auth*.spec.ts"
```

### **Common Debugging Scenarios**

#### **When Tests Fail with Missing Step Definitions**
```bash
# Check which steps are missing
export TEST_SPEC="./features/auth.feature" && npm run test:e2e:headless

# Look for "Step is not defined" errors in output
# Add missing step definitions to features/step-definitions/steps.ts
```

#### **When Snackbar Tests Fail**
```bash
# Test snackbar functionality in isolation
export TEST_SPEC="./features/auth.feature" && npm run e2e:headless

# Look for "element still not displayed after 5000ms" errors
# Check snackbar selectors in page objects
```

#### **When Navigation Tests Fail**
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

### **Environment Variables for Test Control**
```bash
# Control test execution
export TEST_SPEC="./features/auth.feature"    # Target specific feature file
export HEADLESS=true                          # Run in headless mode
export DEBUG_TESTS=true                       # Enable debug output
export TEST_TAGS="@auth and @validation"      # Filter by tags
```

## 🧪 **Test Maintenance**

### **Maintenance Tasks**
- **Selectors** - Update CSS selectors when Angular Material components change
- **Timing** - Adjust wait times if application performance changes  
- **Validation** - Update validation logic when form requirements change
- **Navigation** - Maintain step routing consistency with application changes

### **Common Issues & Solutions**

#### **Tests Timeout**
- **Increase Timeouts** - Adjust timeout values in page objects
- **Check Startup** - Verify Angular application startup time
- **Service Mocking** - Ensure all required services are properly mocked

#### **File Upload Failures**
- **API Support** - Ensure `DataTransfer` API support in test browser
- **Element Selection** - Check file input element selectors
- **Form Binding** - Verify Angular form control binding

#### **Navigation Guard Issues**
- **Guard Implementation** - Confirm guard implementation matches test expectations
- **Selector Accuracy** - Check snackbar selector accuracy
- **Service State** - Verify file service state simulation

## 🧪 **Testing Tools & Infrastructure**

### **Testing Framework Stack**
- **Jasmine** - Primary testing framework with Angular
- **Angular Testing Utilities** - TestBed, ComponentFixture, etc.
- **WebDriverIO** - E2E testing with Cucumber integration
- **Allure Reporting** - Comprehensive test reporting and CI integration

### **CI/CD Integration**
```mermaid
graph LR
    subgraph "CI Pipeline"
        A[Code Commit] --> B[Run Tests]
        B --> C[Generate Reports]
        C --> D[Deploy if Pass]
    end
    
    subgraph "Test Execution"
        E[Unit Tests]
        F[Integration Tests]
        G[E2E Tests]
        H[Performance Tests]
    end
    
    B --> E
    B --> F
    B --> G
    B --> H
    
    style A fill:#4caf50
    style B fill:#ff9800
    style D fill:#4caf50
```

## 🚀 **Future Testing Enhancements**

### **Advanced Testing Features**
- **Visual Regression** - Screenshot comparison for UI consistency
- **Performance Testing** - Load time and memory usage testing
- **Accessibility Testing** - Automated accessibility compliance testing
- **Cross-Browser Testing** - Test across multiple browser versions

### **Testing Infrastructure**
- **Parallel Execution** - Run tests in parallel for faster execution
- **Test Data Management** - Centralized test data and environment management
- **Reporting Dashboard** - Real-time test results and trend analysis
- **Test Analytics** - Insights into test coverage and quality metrics

---

*"Testing is like preening your feathers - it takes time, but it ensures you're always ready to fly. A well-tested flock is a confident flock that can soar through any storm."*
