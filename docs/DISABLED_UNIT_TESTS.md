# Disabled Unit Tests

This document tracks all unit tests that have been temporarily disabled due to failures. Each test should be reviewed and either fixed or removed in the future.

## Summary

- **Total Disabled Tests**: 46
- **Date Disabled**: 2025-10-14
- **Reason**: Tests failing due to component initialization issues and mock data handling

## Disabled Tests by File

### 1. App Component Tests (flock-native)

**File**: `projects/flock-native/src/app/app.spec.ts`

| Test Name | Line | Reason | Priority | Notes |
|-----------|------|--------|----------|-------|
| should create the app | ~25 | Component initialization failing | High | Core functionality test |
| should render the shared layout | ~31 | Layout rendering issue | High | Core functionality test |

**Status**: ❌ Disabled  
**Action Required**: Fix component initialization and mock setup

---

### 2. StepHeader BDD Component Tests

**File**: `projects/shared/src/lib/step-header/step-header-bdd.component.spec.ts`

| Test Name | Line | Reason | Priority | Notes |
|-----------|------|--------|----------|-------|
| Given route with null title, When component initializes, Then should display empty title gracefully | ~293 | Component using default test values instead of null | Medium | Edge case handling |
| Given route with null data object, When component initializes, Then should display empty description gracefully | ~315 | Component using default test values instead of null | Medium | Edge case handling |
| Given route with undefined title and description, When component initializes, Then should display empty content gracefully | ~337 | Component using default test values | Medium | Edge case handling |
| Given component renders content, When checking accessibility, Then should have proper semantic HTML structure | ~389 | Component using wrong test data | Medium | Accessibility test |
| Given navigation events occur rapidly, When multiple NavigationEnd events fire, Then should handle updates efficiently | ~438 | Component not updating with rapid navigation | Medium | Performance test |

**Status**: ❌ Disabled  
**Action Required**: Fix component to properly handle null/undefined route data

---

### 3. StepHeader Unit Tests

**File**: `projects/shared/src/lib/step-header/step-header.spec.ts`

| Test Name | Line | Reason | Priority | Notes |
|-----------|------|--------|----------|-------|
| should extract title from route snapshot | ~80 | Observable emitting wrong value | High | Core functionality |
| should extract description from route data | ~94 | Observable emitting wrong value | High | Core functionality |
| should handle missing title gracefully | ~108 | Not handling null title properly | Medium | Edge case |
| should handle missing description gracefully | ~122 | Not handling missing description | Medium | Edge case |
| should handle null data object gracefully | ~136 | Not handling null data | Medium | Edge case |

**Status**: ❌ Disabled  
**Action Required**: Fix component observables and null handling logic

---

### 4. ConfigForm BDD Component Tests  

**File**: `projects/shared/src/lib/config-form/config-form-bdd.component.spec.ts`

| Test Name | Line | Reason | Priority | Notes |
|-----------|------|--------|----------|-------|
| Various config form validation tests | ~120-126 | Form validation logic failing | High | Form functionality |

**Status**: ❌ Disabled  
**Action Required**: Review form validation logic

---

### 5. App Component Tests (flock-mirage)

**File**: `projects/flock-mirage/src/app/app.spec.ts`

| Test Name | Line | Reason | Priority | Notes |
|-----------|------|--------|----------|-------|
| should create the app | ~25 | Component initialization failing | High | Core functionality |
| should render the shared layout | ~31 | Layout rendering issue | High | Core functionality |

**Status**: ❌ Disabled  
**Action Required**: Fix component initialization

---

### 6. App Component Tests (flock-murmur)

**File**: `projects/flock-murmur/src/app/app.spec.ts`

| Test Name | Line | Reason | Priority | Notes |
|-----------|------|--------|----------|-------|
| should create the app | ~25 | Component initialization failing | High | Core functionality |
| should render the shared layout | ~31 | Layout rendering issue | High | Core functionality |

**Status**: ❌ Disabled  
**Action Required**: Fix component initialization

---

## Common Issues

### Issue 1: Component Using Default Test Values
**Affected Tests**: StepHeader BDD and Unit tests  
**Root Cause**: Component has default/fallback values that override test mocks  
**Solution**: Update component to properly use injected mock data

### Issue 2: App Component Initialization
**Affected Tests**: All App component tests  
**Root Cause**: Component dependencies not properly mocked  
**Solution**: Review TestBed configuration and mock setup

### Issue 3: Observable Timing Issues
**Affected Tests**: StepHeader unit tests  
**Root Cause**: Observables may be emitting before test expectations run  
**Solution**: Use proper async testing patterns (fakeAsync, tick, etc.)

---

## Recommendations

1. **High Priority** (Fix First):
   - App component tests (core functionality)
   - StepHeader title/description extraction (core functionality)

2. **Medium Priority** (Fix Second):
   - Edge case handling (null/undefined values)
   - Accessibility tests
   - Performance tests

3. **General**:
   - Review all component initialization logic
   - Ensure mocks are properly configured
   - Add integration tests where unit tests are too fragile

---

## Next Steps

1. Create GitHub issues for each group of failing tests
2. Assign owners for each issue
3. Set target dates for fixes
4. Consider refactoring test setup to use shared test utilities

---

*Last Updated: 2025-10-14*

