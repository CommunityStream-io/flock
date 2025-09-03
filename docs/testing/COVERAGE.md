# 📊 Test Coverage - Measuring Our Flock's Health

> *"Just like a bird needs to know every feather is in place before taking flight, we need to know every line of code is tested before deployment. Our coverage reports show us exactly which parts of our flock are ready to soar."*

## 🎯 **Coverage Philosophy**

We believe in **comprehensive coverage** that goes beyond just unit tests. Our coverage strategy includes:

- **Unit Test Coverage** - Individual component and service testing
- **E2E Test Coverage** - Full user journey and integration testing  
- **Combined Coverage** - Merged reports showing complete test coverage
- **Coverage Trends** - Tracking coverage improvements over time

## 📈 **Coverage Types**

### **Unit Test Coverage**
- **Target**: Individual components, services, and utilities
- **Tool**: Karma with Istanbul coverage
- **Format**: LCOV reports
- **Scope**: Shared library and application components

### **E2E Test Coverage** 
- **Target**: Full user workflows and integration scenarios
- **Tool**: WebdriverIO with NYC coverage collection
- **Format**: LCOV reports
- **Scope**: Complete application functionality

### **Combined Coverage**
- **Target**: Comprehensive view of all testing
- **Tool**: NYC merge functionality
- **Format**: Merged LCOV reports
- **Scope**: Complete codebase coverage

## 🔧 **Coverage Configuration**

### **NYC Configuration** (`.nycrc.json`)
```json
{
  "extends": "@istanbuljs/nyc-config-typescript",
  "all": true,
  "check-coverage": false,
  "reporter": ["text", "text-summary", "html", "lcov"],
  "report-dir": "./coverage",
  "temp-dir": "./.nyc_output",
  "include": [
    "projects/flock-mirage/src/**/*.ts",
    "projects/shared/src/**/*.ts"
  ],
  "exclude": [
    "projects/**/*.spec.ts",
    "projects/**/*.test.ts",
    "projects/**/test/**",
    "projects/**/spec/**",
    "projects/**/environments/**",
    "projects/**/main.ts",
    "projects/**/polyfills.ts"
  ]
}
```

### **Karma Coverage Configuration**
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

## 🚀 **Running Coverage Reports**

### **Unit Test Coverage**
```bash
# Run unit tests with coverage
npm run test:coverage

# Coverage report will be generated in ./coverage/
```

### **E2E Test Coverage**
```bash
# Run E2E tests with coverage collection
npm run test:e2e:coverage

# Coverage data collected during E2E test execution
```

### **Combined Coverage**
```bash
# Run all tests with coverage and merge reports
npm run coverage:all

# This runs:
# 1. Unit test coverage
# 2. E2E test coverage  
# 3. Merges both reports
```

### **Coverage Merging**
```bash
# Merge existing coverage reports
npm run coverage:merge

# Creates combined LCOV report for Codecov upload
```

## 📊 **Codecov Integration**

### **Coverage Upload Configuration**
Our CI pipeline automatically uploads coverage to Codecov with separate flags:

**Unit Test Coverage:**
```yaml
- name: Upload unit test coverage to Codecov
  uses: codecov/codecov-action@v5
  with:
    files: ./coverage/lcov.info
    flags: unittests
    name: codecov-umbrella
```

**E2E Test Coverage:**
```yaml
- name: Upload E2E coverage to Codecov
  uses: codecov/codecov-action@v5
  with:
    files: ./coverage/lcov.info
    flags: e2etests
    name: codecov-umbrella
```

### **Codecov Configuration** (`codecov.yml`)
```yaml
coverage:
  status:
    project:
      default:
        target: auto
        threshold: 0%
        base: auto
    patch:
      default:
        target: auto
        threshold: 0%
        base: auto

flags:
  unittests:
    paths:
      - projects/shared/src/
    carryforward: true
  e2etests:
    paths:
      - projects/flock-mirage/src/
      - projects/shared/src/
    carryforward: true
```

## 📈 **Coverage Reports**

### **Local Coverage Reports**
After running coverage tests, you can view reports locally:

```bash
# Open HTML coverage report
open ./coverage/index.html

# View coverage summary in terminal
npm run test:coverage
```

### **Codecov Dashboard**
- **Repository**: [https://app.codecov.io/github/CommunityStream-io/flock](https://app.codecov.io/github/CommunityStream-io/flock)
- **Unit Tests**: Flagged as `unittests`
- **E2E Tests**: Flagged as `e2etests`
- **Combined View**: Shows both coverage types together

## 🎯 **Coverage Goals**

### **Current Targets**
- **Unit Test Coverage**: 80%+ for shared library
- **E2E Test Coverage**: 70%+ for critical user flows
- **Combined Coverage**: 75%+ overall

### **Coverage Quality**
- **Line Coverage**: Every line of code executed
- **Branch Coverage**: All conditional paths tested
- **Function Coverage**: All functions called
- **Statement Coverage**: All statements executed

## 🔍 **Coverage Analysis**

### **What Gets Covered**
- **Components**: User interface and interaction logic
- **Services**: Business logic and data processing
- **Guards**: Route protection and validation
- **Utilities**: Helper functions and shared logic

### **What's Excluded**
- **Test Files**: `.spec.ts` and `.test.ts` files
- **Environment Files**: Configuration and environment setup
- **Entry Points**: `main.ts` and `polyfills.ts`
- **Build Artifacts**: Generated and compiled code

## 🛠️ **Coverage Tools**

### **Primary Tools**
- **Istanbul/NYC**: Coverage collection and reporting
- **Karma**: Unit test coverage integration
- **WebdriverIO**: E2E test coverage hooks
- **Codecov**: Coverage reporting and trends

### **Coverage Collection Process**
```mermaid
graph TB
    subgraph "Coverage Collection"
        A[Unit Tests] --> B[Karma Coverage]
        C[E2E Tests] --> D[WebdriverIO Hooks]
        B --> E[LCOV Report]
        D --> F[Coverage Data]
        E --> G[NYC Merge]
        F --> G
        G --> H[Combined Report]
    end
    
    subgraph "Upload Process"
        H --> I[Codecov Upload]
        I --> J[Coverage Dashboard]
    end
    
    style A fill:#4caf50
    style C fill:#ff9800
    style G fill:#2196f3
    style J fill:#9c27b0
```

## 📋 **Coverage Best Practices**

### **Writing Testable Code**
- **Pure Functions**: Easy to test with predictable inputs/outputs
- **Dependency Injection**: Mock external dependencies
- **Single Responsibility**: Each function has one clear purpose
- **Clear Interfaces**: Well-defined component and service contracts

### **Coverage-Driven Development**
- **Write Tests First**: TDD approach for new features
- **Coverage Gaps**: Identify untested code paths
- **Edge Cases**: Test boundary conditions and error scenarios
- **Integration Points**: Ensure service interactions are covered

### **Maintaining Coverage**
- **Regular Reviews**: Check coverage reports after each feature
- **Coverage Gates**: Prevent deployment if coverage drops
- **Trend Monitoring**: Track coverage improvements over time
- **Quality Metrics**: Use coverage as one indicator of code quality

## 🚨 **Coverage Troubleshooting**

### **Common Issues**

#### **Low Coverage Scores**
- **Missing Tests**: Add tests for uncovered code paths
- **Dead Code**: Remove unused code or add tests
- **Complex Logic**: Break down complex functions into smaller, testable units
- **External Dependencies**: Mock external services and APIs

#### **Coverage Collection Failures**
- **Build Issues**: Ensure application builds successfully
- **Test Failures**: Fix failing tests before collecting coverage
- **Configuration**: Verify NYC and Karma configuration
- **File Paths**: Check include/exclude patterns in configuration

#### **E2E Coverage Issues**
- **Application Startup**: Ensure Angular app starts correctly
- **Test Execution**: Verify WebdriverIO tests run successfully
- **Coverage Hooks**: Check coverage collection hooks in WebdriverIO config
- **Environment Variables**: Verify `COLLECT_COVERAGE=true` is set

### **Debugging Coverage**
```bash
# Check coverage configuration
cat .nycrc.json

# Verify coverage files are generated
ls -la ./coverage/

# Check coverage report content
head -20 ./coverage/lcov.info

# Run coverage with verbose output
npm run test:coverage -- --verbose
```

## 🎯 **Coverage Metrics**

### **Key Metrics to Track**
- **Overall Coverage**: Percentage of code covered by tests
- **Coverage Trends**: Coverage changes over time
- **Coverage by Module**: Which parts of the codebase are well-tested
- **Coverage by Test Type**: Unit vs E2E coverage breakdown

### **Coverage Reports**
- **HTML Reports**: Visual coverage reports with line-by-line details
- **LCOV Reports**: Machine-readable coverage data for CI/CD
- **Text Summaries**: Quick coverage overview in terminal
- **Codecov Dashboard**: Historical coverage trends and comparisons

---

*"Coverage is like checking every feather before flight - it's not just about having feathers, but knowing each one is strong and ready to help you soar."*
