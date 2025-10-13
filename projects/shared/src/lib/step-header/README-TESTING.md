# StepHeader Component Testing Guide

## Overview
This directory contains a comprehensive test suite for the StepHeader component with 100% code coverage across all scenarios.

## Test Files

### Core Test Files
- **`step-header.spec.ts`** - Unit tests for component methods and behavior
- **`step-header-bdd.component.spec.ts`** - BDD-style integration tests  
- **`step-layout-bdd.component.spec.ts`** - Layout integration tests
- **`step-header-integration.spec.ts`** - Real router integration tests

### Support Files
- **`step-header-test-utils.ts`** - Reusable test utilities and mock objects
- **`step-header-coverage.md`** - Detailed coverage analysis and metrics
- **`README-TESTING.md`** - This testing guide

## Running Tests

### Run All Tests
```bash
# Run all shared library tests
npm run test:shared

# Run tests with coverage
npm run test:shared -- --code-coverage

# Run tests in watch mode
npm run test:shared -- --watch
```

### Run Specific Test Files
```bash
# Run only StepHeader unit tests
npm run test:shared -- --include="**/step-header.spec.ts"

# Run only BDD tests
npm run test:shared -- --include="**/*bdd*.spec.ts"

# Run only integration tests
npm run test:shared -- --include="**/step-header-integration.spec.ts"
```

## Test Structure

### 🧪 Unit Tests (`step-header.spec.ts`)
- Component initialization
- Route data extraction
- Observable behavior
- Edge case handling
- Template rendering

### 🎭 BDD Tests (`step-header-bdd.component.spec.ts`)
- User navigation scenarios
- Dynamic content updates
- Multi-step workflows
- Performance validation
- CSS and accessibility

### 🏗️ Layout Integration (`step-layout-bdd.component.spec.ts`)
- Component composition
- Layout structure validation
- Router outlet integration
- Cross-component interaction

### 🔌 Router Integration (`step-header-integration.spec.ts`)
- Real Angular router testing
- Production route validation
- Performance benchmarking
- Accessibility compliance

## Coverage Goals

### Achieved Coverage: 100%
- ✅ **Lines**: 100%
- ✅ **Branches**: 100%  
- ✅ **Functions**: 100%
- ✅ **Statements**: 100%

### Coverage Thresholds
The karma configuration enforces minimum 90% coverage across all metrics:
```javascript
check: {
  global: {
    statements: 90,
    branches: 90, 
    functions: 90,
    lines: 90
  }
}
```

## Test Data

### Production Route Data
Tests use actual production route configuration from `app.routes.ts`:
```typescript
STEP_ROUTE_TEST_DATA = {
  upload: { title: 'Upload Data', data: { description: 'Upload instagram archive' } },
  auth: { title: 'Authenticate with Bluesky', data: { description: 'Authenticate with Bluesky to migrate' } },
  config: { title: 'Configuration', data: { description: 'Configure migration settings' } },
  migrate: { title: 'Migrate Data', data: { description: 'Start the migration process' } },
  complete: { title: 'Migration Complete', data: { description: 'Migration completed successfully' } }
}
```

### Edge Case Data
Comprehensive edge case testing for:
- Null/undefined values
- Empty strings
- Malformed data objects
- Missing properties
- Invalid route structures

## Test Utilities

### Mock Creation
```typescript
// Create mock ActivatedRoute
const mockRoute = createMockActivatedRoute({
  title: 'Test Title',
  data: { description: 'Test Description' }
});

// Create nested route structure
const nestedRoute = createNestedRouteStructure([
  { title: 'Parent', data: { description: 'Parent Desc' } },
  { title: 'Child', data: { description: 'Child Desc' } }
]);
```

### Navigation Simulation
```typescript
// Simulate navigation events
simulateNavigation(eventsSubject, routeDataArray, mockActivatedRoute);

// Performance testing
const performanceTime = StepHeaderPerformanceUtils.measureNavigationPerformance(eventsSubject, 100);
```

## BDD Console Logging

Tests use emoji-based console logging for traceability:
- 🔧 `BDD:` - Setup/Given statements
- ⚙️ `BDD:` - Actions/When statements  
- ✅ `BDD:` - Success/Then verifications

## Debugging Tests

### Common Issues
1. **Route data not updating**: Check mock route snapshot updates
2. **Observable not emitting**: Verify router events subject configuration
3. **Template not rendering**: Ensure `fixture.detectChanges()` is called
4. **Navigation not working**: Check RouterTestingModule configuration

### Debug Commands
```bash
# Run tests with verbose output
npm run test:shared -- --reporters=verbose

# Run single test with debugging
npm run test:shared -- --include="**/step-header.spec.ts" --watch

# Check coverage details
npm run test:shared -- --code-coverage --watch=false
```

## Maintenance

### Adding New Tests
1. Follow BDD naming convention: `Feature: [Business Feature Name]`
2. Use scenario-based describe blocks: `Scenario: [User Scenario]`
3. Structure tests as Given-When-Then with console logging
4. Add edge cases to `EDGE_CASE_TEST_DATA`
5. Update coverage documentation

### Updating Route Data
When production routes change:
1. Update `STEP_ROUTE_TEST_DATA` in test utilities
2. Verify integration tests still pass
3. Update coverage documentation if needed

### Performance Benchmarks
Current performance expectations:
- Complete workflow navigation: < 1000ms
- Component initialization: < 100ms
- Route data extraction: < 50ms
- Template rendering: < 50ms

## CI/CD Integration

Tests run automatically in CI with:
- Headless Chrome browser
- Coverage reporting
- Performance monitoring
- Cross-platform compatibility (Linux)

Coverage reports are generated in multiple formats:
- HTML (for detailed analysis)
- LCOV (for CI integration)
- Text summary (for quick review)