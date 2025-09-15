# AI Agent Prompt: Fix Disabled E2E Tests

## Context & Background
I have an Angular application with WebdriverIO E2E tests that I had to disable due to flakiness. The tests were causing infinite loops and navigation timeouts in our CI pipeline. I've successfully stabilized the pipeline by skipping these tests, but now I need help fixing the underlying issues.

## Test Environment
- **Framework**: Angular 17+ with standalone components
- **E2E Testing**: WebdriverIO 9.19.1 with Cucumber
- **Browser**: Chrome Headless 140.0.7339.127
- **Environment**: Docker containers in CI (GitHub Actions)
- **Test Runner**: Uses `npm run test:e2e:skip-failing` (excludes `@skip()` tagged tests)

## Disabled Tests & Issues

### 1. Authentication Splash Screen Test (CRITICAL)
**Location**: `features/auth/auth.feature` lines 55-63
**Tag**: `@bluesky-auth @authentication @skip()`
**Scenario**: "Valid credentials trigger authentication splash screen"

**The Problem**:
- Test clicks "Next" button on auth form
- Waits for `shared-splash-screen` component to appear
- Component never renders, causing 15-second timeout
- Test fails but gets marked as "passed" due to error handling
- Test restarts instead of moving to next scenario
- Creates infinite loop running same test every ~120 seconds

**Key Evidence**:
- Empty browser info in telemetry (browser disconnected)
- 6 identical test runs of same scenario
- Each run takes exactly 120 seconds
- Status shows "passed" but actually failing silently

**Relevant Code**:
- **Step Definition**: `features/step-definitions/auth.ts` line 321-325
- **Page Object**: `features/pageobjects/step-layout.page.ts` line 89-91, 207-213
- **Component Selector**: `$('shared-splash-screen')`
- **Timeout Config**: 15s CI, 12s local (`features/support/timeout-config.ts`)

### 2. Upload Navigation Test (MODERATE)
**Location**: `features/upload/upload.feature` lines 35-40
**Tag**: `@file-upload @navigation-reset @skip()`
**Scenario**: "Navigation back to upload step resets splash screen message"

**The Problem**:
- Test navigates back to upload step from auth step
- `browsingContext.navigate` commands timeout
- Browser loses connection to Angular dev server
- Navigation never completes, causing test failure

**Key Evidence**:
- Navigation timeouts to `http://localhost:4200/step/upload`
- Browser connection issues in Docker environment
- 19 passing tests, 1 failing, 16 skipped in same shard

**Relevant Code**:
- **Step Definition**: `features/step-definitions/auth.ts` line 33-85
- **Navigation Logic**: `pages.stepLayout.openUploadStep()`
- **Timeout**: 15s CI, 12s local for navigation

## What We've Learned

### Infrastructure Insights
- **Docker environment is stable** - not the root cause
- **ChromeDriver throttling was a red herring** - not the real issue
- **Port conflicts resolved** - staggered shard startup works
- **Angular dev server runs fine** - `ng serve` works in containers

### Test Patterns
- **Splash screen component issues** - likely rendering problem
- **Navigation connectivity** - browser-to-server communication
- **Error handling masking failures** - tests marked "passed" when failing
- **Infinite loops** - test runner restarting failed tests instead of moving on

### Working Tests
- All other auth scenarios work fine
- File upload scenarios work (except navigation back)
- Form validation works
- Navigation guards work
- 19/19 shards now pass consistently

## What I Need Help With

### For Test #1 (Splash Screen)
1. **Why isn't `shared-splash-screen` component rendering?**
   - Check if component exists in Angular app
   - Verify component is properly imported/declared
   - Check if splash screen service is working
   - Investigate authentication flow triggering splash screen

2. **Why does test restart instead of failing?**
   - Check WebdriverIO retry configuration
   - Verify error handling in step definitions
   - Look at test runner behavior with failed scenarios

### For Test #2 (Navigation)
1. **Why do navigation commands timeout?**
   - Check Angular routing configuration
   - Verify step navigation service
   - Investigate browser connectivity in Docker
   - Check if upload step route exists and works

2. **Why does browser lose connection?**
   - Check Angular dev server stability
   - Verify port binding in Docker
   - Look at network connectivity between browser and server

## Files to Investigate
- `projects/shared/src/lib/components/` (splash screen component)
- `projects/shared/src/lib/services/` (authentication, navigation services)
- `projects/flock-mirage/src/app/` (routing, app configuration)
- `features/pageobjects/step-layout.page.ts` (navigation methods)
- `features/step-definitions/auth.ts` (step implementations)
- `features/support/timeout-config.ts` (timeout settings)

## Success Criteria
- Both tests run without infinite loops or timeouts
- Tests complete in reasonable time (~2 minutes like other tests)
- Tests fail gracefully if functionality is broken (don't restart)
- Tests work consistently across multiple CI runs

## Current Status
- Pipeline is 100% stable with these tests disabled
- All other E2E tests pass consistently
- Docker environment is working perfectly
- Telemetry system is collecting comprehensive data

**Please help me identify the root causes and provide specific fixes for these two problematic tests!**

---

## Additional Context

### Test Execution Flow
1. **Background steps** run first (navigate to upload, select file, navigate to auth)
2. **Scenario steps** execute the specific test logic
3. **Teardown** happens automatically after each scenario

### Telemetry Data Available
- Test metrics with timing, errors, and performance data
- Timeout telemetry with detailed operation tracking
- Browser info and system resource usage
- Step-by-step execution logs

### CI Configuration
- **Dockerfile.test**: Multi-stage build with Node.js 20, Chrome, ChromeDriver
- **CI Workflow**: 19 parallel shards, each running in isolated containers
- **Artifacts**: Allure reports, test metrics, timeout telemetry uploaded
- **Timeout Analysis**: Automated analysis of collected telemetry data

### Known Working Patterns
- **File upload tests**: Work perfectly with simulated file selection
- **Form validation tests**: All auth form scenarios pass
- **Navigation tests**: Forward navigation works fine
- **Error handling tests**: Snackbar and validation errors work
- **Step progression**: Users can move through upload → auth → config steps

### Debugging Approach
1. **Check component existence** - verify `shared-splash-screen` is real
2. **Test in isolation** - run individual scenarios locally
3. **Check service integration** - verify auth service triggers splash screen
4. **Investigate routing** - ensure upload step route is accessible
5. **Review error handling** - fix test runner behavior with failures
