# 🧪 Unit Testing - Testing Each Bird Individually

> *"Every bird in our flock needs to be healthy on its own before they can fly together. Unit tests ensure each component, service, and utility works perfectly in isolation."*

## 🎯 **Unit Testing Philosophy**

We follow **BDD (Behavior-Driven Development)** methodology using Angular's native testing framework with Jasmine. Our unit tests focus on:

- **Individual Component Behavior** - Each component works correctly in isolation
- **Service Logic** - Business logic and data processing functions
- **Utility Functions** - Helper functions and shared utilities
- **Real Angular Integration** - Test actual Angular components, not mocks

## 🏗️ **Unit Test Structure**

### **Test File Naming Conventions**
- **`component.spec.ts`** - Standard unit tests for components
- **`component-bdd.spec.ts`** - BDD-style behavior tests
- **`service.spec.ts`** - Service unit tests
- **`guard.spec.ts`** - Route guard tests
- **`utility.spec.ts`** - Utility function tests

### **BDD Test Structure Pattern**
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

## 🧪 **Component Testing**

### **Component Test Setup**
```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComponentName } from './component-name.component';

describe('ComponentName', () => {
  let component: ComponentName;
  let fixture: ComponentFixture<ComponentName>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComponentName],
      // Add any required providers or imports
    }).compileComponents();

    fixture = TestBed.createComponent(ComponentName);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
```

### **Component Testing Patterns**

#### **Input/Output Testing**
```typescript
it('Given valid input, When component initializes, Then input is set correctly', () => {
  // 🔧 BDD: Set up valid input
  const testInput = 'test value';
  
  // ⚙️ BDD: Set input and trigger change detection
  component.inputProperty = testInput;
  fixture.detectChanges();
  
  // ✅ BDD: Verify input is set correctly
  expect(component.inputProperty).toBe(testInput);
});
```

#### **User Interaction Testing**
```typescript
it('Given user clicks button, When button is clicked, Then action is triggered', () => {
  // 🔧 BDD: Set up component state
  spyOn(component, 'onButtonClick');
  
  // ⚙️ BDD: Simulate user interaction
  const button = fixture.debugElement.query(By.css('button'));
  button.triggerEventHandler('click', null);
  
  // ✅ BDD: Verify action was triggered
  expect(component.onButtonClick).toHaveBeenCalled();
});
```

#### **Form Testing**
```typescript
it('Given valid form data, When form is submitted, Then form is valid', () => {
  // 🔧 BDD: Set up form with valid data
  component.form.patchValue({
    username: 'testuser',
    password: 'testpass'
  });
  
  // ⚙️ BDD: Trigger form validation
  component.form.markAllAsTouched();
  fixture.detectChanges();
  
  // ✅ BDD: Verify form is valid
  expect(component.form.valid).toBe(true);
});
```

## 🔧 **Service Testing**

### **Service Test Setup**
```typescript
import { TestBed } from '@angular/core/testing';
import { ServiceName } from './service-name.service';

describe('ServiceName', () => {
  let service: ServiceName;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ServiceName);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
```

### **Service Testing Patterns**

#### **Method Testing**
```typescript
it('Given valid parameters, When method is called, Then correct result is returned', () => {
  // 🔧 BDD: Set up test data
  const input = 'test input';
  const expectedOutput = 'processed output';
  
  // ⚙️ BDD: Call service method
  const result = service.processData(input);
  
  // ✅ BDD: Verify correct result
  expect(result).toBe(expectedOutput);
});
```

#### **Dependency Injection Testing**
```typescript
it('Given external service dependency, When service method is called, Then dependency is used correctly', () => {
  // 🔧 BDD: Set up mock dependency
  const mockDependency = jasmine.createSpyObj('DependencyService', ['method']);
  mockDependency.method.and.returnValue('mocked result');
  
  // ⚙️ BDD: Call service method that uses dependency
  const result = service.methodThatUsesDependency();
  
  // ✅ BDD: Verify dependency was called and result is correct
  expect(mockDependency.method).toHaveBeenCalled();
  expect(result).toBe('mocked result');
});
```

#### **Error Handling Testing**
```typescript
it('Given invalid input, When method is called, Then error is handled gracefully', () => {
  // 🔧 BDD: Set up invalid input
  const invalidInput = null;
  
  // ⚙️ BDD: Call method with invalid input
  // ✅ BDD: Verify error is handled
  expect(() => service.processData(invalidInput)).toThrow('Invalid input');
});
```

## 🛡️ **Guard Testing**

### **Guard Test Setup**
```typescript
import { TestBed } from '@angular/core/testing';
import { GuardName } from './guard-name.guard';

describe('GuardName', () => {
  let guard: GuardName;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(GuardName);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
```

### **Guard Testing Patterns**

#### **CanActivate Testing**
```typescript
it('Given valid conditions, When guard is checked, Then access is allowed', () => {
  // 🔧 BDD: Set up valid conditions
  spyOn(guard, 'checkConditions').and.returnValue(true);
  
  // ⚙️ BDD: Check guard activation
  const result = guard.canActivate();
  
  // ✅ BDD: Verify access is allowed
  expect(result).toBe(true);
});
```

#### **Route Protection Testing**
```typescript
it('Given invalid conditions, When guard is checked, Then access is denied', () => {
  // 🔧 BDD: Set up invalid conditions
  spyOn(guard, 'checkConditions').and.returnValue(false);
  
  // ⚙️ BDD: Check guard activation
  const result = guard.canActivate();
  
  // ✅ BDD: Verify access is denied
  expect(result).toBe(false);
});
```

## 🧪 **Running Unit Tests**

### **Basic Commands**
```bash
# Run all unit tests
ng test

# Run tests for specific project
ng test shared
ng test flock-mirage
ng test flock-native
ng test flock-murmur

# Run tests with coverage
ng test --code-coverage

# Run tests in watch mode
ng test --watch

# Run tests once (CI mode)
ng test --watch=false
```

### **Advanced Commands**
```bash
# Run tests with specific pattern
ng test --include="**/*auth*.spec.ts"

# Run tests with verbose output
ng test --verbose

# Run tests with specific browser
ng test --browsers=ChromeHeadless

# Run tests with custom configuration
ng test --configuration=ci
```

## 📊 **Test Coverage**

### **Coverage Collection**
```bash
# Run tests with coverage
npm run test:coverage

# Coverage report will be generated in ./coverage/
```

### **Coverage Configuration**
Our Karma configuration includes coverage reporting:
```javascript
coverageReporter: {
  dir: './coverage',
  subdir: '.',
  reporters: [
    { type: 'html' },
    { type: 'text-summary' },
    { type: 'lcov' }
  ]
}
```

## 🎯 **Testing Best Practices**

### **Test Organization**
- **Group by Feature**: Organize tests by business functionality
- **Clear Descriptions**: Use descriptive test names that explain the scenario
- **BDD Structure**: Follow Given-When-Then pattern in test descriptions
- **Console Logging**: Use BDD emoji logging for test steps

### **Test Data Management**
- **Mock Data**: Create realistic test data that matches production
- **Test Utilities**: Use helper functions for common test setup
- **Data Builders**: Create builder patterns for complex test objects
- **Cleanup**: Ensure tests clean up after themselves

### **Assertion Patterns**
- **Specific Assertions**: Use specific matchers rather than generic ones
- **Error Messages**: Include helpful error messages in assertions
- **Multiple Assertions**: Test multiple aspects of the same behavior
- **Edge Cases**: Test boundary conditions and error scenarios

### **Mocking Strategy**
- **Mock External Dependencies**: Mock HTTP calls, file system, etc.
- **Spy on Methods**: Use spies to verify method calls
- **Mock Return Values**: Control what mocked methods return
- **Verify Interactions**: Ensure mocks are called as expected

## 🔍 **Debugging Unit Tests**

### **Common Issues**

#### **Test Failures**
- **Check Console Output**: Look for error messages and stack traces
- **Verify Setup**: Ensure TestBed configuration is correct
- **Check Dependencies**: Verify all required services are provided
- **Async Issues**: Use `fakeAsync` and `tick()` for async operations

#### **Component Testing Issues**
- **Change Detection**: Call `fixture.detectChanges()` after state changes
- **Element Selection**: Use proper selectors to find DOM elements
- **Event Simulation**: Use `triggerEventHandler` for user interactions
- **Form Testing**: Ensure form controls are properly initialized

#### **Service Testing Issues**
- **Dependency Injection**: Verify services are properly injected
- **Mock Configuration**: Ensure mocks are configured correctly
- **Async Operations**: Handle promises and observables properly
- **Error Scenarios**: Test both success and failure cases

### **Debugging Tools**
```bash
# Run single test file
ng test --include="**/specific-test.spec.ts"

# Run tests with debug output
ng test --verbose

# Run tests in browser for debugging
ng test --browsers=Chrome

# Use browser dev tools for debugging
# Set breakpoints in test files
```

## 📋 **Test Maintenance**

### **Keeping Tests Updated**
- **Refactor Tests**: Update tests when code changes
- **Remove Dead Tests**: Delete tests for removed functionality
- **Update Mocks**: Keep mocks in sync with real implementations
- **Review Coverage**: Regularly review coverage reports

### **Test Quality**
- **Readable Tests**: Write tests that are easy to understand
- **Maintainable Tests**: Structure tests for easy maintenance
- **Fast Tests**: Keep unit tests fast and focused
- **Reliable Tests**: Ensure tests are deterministic and stable

---

*"Unit tests are like checking each feather individually - they ensure every part of our code is strong and ready to help the whole flock soar."*
