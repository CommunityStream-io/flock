# Electron E2E Testing Strategy

## Status: ✅ Infrastructure Fixed

### Completed
- ✅ Fixed ChromeDriver version mismatch (now using v130 to match Electron 33)
- ✅ Configured `wdio-electron-service` properly
- ✅ Tests can now connect to and launch the packaged Electron app
- ✅ Updated build output directory to `dist/electron-fixed`

### Test Results Summary
- **Total**: 20 test files
- **Failed**: 18 (due to behavior differences, not infrastructure)
- **Skipped**: 2
- **Duration**: ~2:47

## Key Differences: Web (Mirage) vs Native (Electron)

###1 **File Upload Behavior**
- **Mirage (Web)**: Uses standard HTML file input (`<input type="file">`)
- **Native (Electron)**: Uses IPC + native OS file dialogs
- **Impact**: Tests using file upload need to mock/stub native dialogs or use Electron's test APIs

### 2. **Timing & Loading**
- **Mirage**: Fast, synchronous, predictable page loads
- **Native**: 
  - IPC communication delays
  - Main process ↔️ Renderer process communication
  - Asset loading from ASAR archive
  - Splash screen timing differences
- **Impact**: Need increased timeouts and proper wait conditions

### 3. **Navigation**
- **Mirage**: Standard Angular routing (`/upload`, `/auth`)
- **Native**: Same Angular routing but with Electron window management
- **Impact**: May need to handle multiple BrowserWindow instances

### 4. **Authentication**
- **Mirage**: Mock authentication for demo
- **Native**: Real Bluesky authentication via IPC
- **Impact**: Tests need actual credentials or better mocking strategy

### 5. **CLI Integration**
- **Mirage**: No CLI integration (demo mode)
- **Native**: Full CLI integration via IPC for Instagram→Bluesky migration
- **Impact**: Tests for migration need to handle:
  - CLI process spawning
  - IPC event streams
  - Process output handling
  - Longer execution times

## Undefined Step Definitions

Many test failures are due to missing step definitions. Examples:
- `focus should be restored to appropriate element`
- `keyboard navigation should be re-enabled`
- `I rapidly navigate between steps`
- `the body should remain scrollable`

**Action**: Implement these step definitions or mark scenarios as `@skip` for Electron.

## Recommended Adaptation Strategy

### Phase 1: Core Functionality (Priority: High)
1. **Basic Navigation & Splash Screen**
   - Update timing expectations
   - Handle Electron window initialization
   - Files: `splash-screen*.feature`

2. **Configuration Management**
   - Adapt for Electron storage (localStorage/file system)
   - Files: `config/*.feature`

3. **Landing Page**
   - Simple page load verification
   - Files: `landing.feature`

### Phase 2: User Interactions (Priority: Medium)
1. **Authentication**
   - Decide: Mock or real Bluesky auth?
   - Update IPC communication tests
   - Files: `auth/*.feature`

2. **File Upload**
   - Replace HTML file input tests with Electron dialog tests
   - Use `dialog.showOpenDialog()` mocking
   - Files: `upload/*.feature`

### Phase 3: Advanced Features (Priority: Low)
1. **Migration Process**
   - Test CLI execution via IPC
   - Handle long-running processes
   - Test progress reporting
   - Files: Migration-related features (TBD)

2. **Layout & Accessibility**
   - Implement missing step definitions
   - Files: `layout/*.feature`

## Configuration Changes Needed

### 1. Timeout Configuration
Update `features/support/timeout-config.ts`:
```typescript
export const getTimeoutConfig = (isCI: boolean, isElectron: boolean = false) => {
  const multiplier = isElectron ? 2 : 1; // 2x timeouts for Electron
  // ...
};
```

### 2. Electron-Specific Hooks
Add to `wdio.electron.conf.ts`:
```typescript
beforeScenario: async function (world) {
  // Reset Electron app state
  // Clear temp directories
  // Reset IPC state
},

afterScenario: async function (world, result) {
  // Close extra windows
  // Clean up spawned processes
  // Take screenshots on failure
},
```

### 3. Step Definitions
Create `features/step-definitions/electron-specific.ts`:
- File dialog interactions
- IPC communication verification
- Process management
- Window management

### 4. Page Objects
Update Page Objects for Electron:
- Add IPC communication methods
- Add native dialog handling
- Add process management

## Testing Strategy

### Option A: Separate Test Suites (Recommended)
- Keep existing Mirage tests as-is
- Create new `features/electron/**/*.feature` for Electron-specific scenarios
- Share step definitions where possible
- Use `@electron` and `@web` tags to differentiate

### Option B: Unified Tests with Conditional Logic
- Update existing tests to work for both Mirage and Native
- Use environment detection in step definitions
- More complex but maintains single test suite

### Option C: Fork Tests Entirely
- Duplicate feature files into `features/electron/` and `features/web/`
- Maintain separately
- More maintenance but clearest separation

**Recommendation**: Option A provides best balance of code reuse and clarity.

## Next Steps

1. **Decide on testing strategy** (Option A/B/C above)
2. **Tag existing tests**: Add `@web` or `@skip-electron` tags to non-applicable tests
3. **Implement missing step definitions**: Or mark as `@skip`
4. **Update timeouts**: Increase for Electron's IPC communication delays
5. **Create Electron-specific scenarios**: Focus on IPC, file dialogs, CLI integration
6. **Mock Bluesky authentication**: Use test credentials or mock service
7. **Handle file uploads**: Use Electron dialog mocking instead of HTML input
8. **Test CLI integration**: Verify IPC communication with Instagram-to-Bluesky CLI

## Files Changed in This Fix

1. `package.json`: 
   - Changed output directory to `dist/electron-fixed`
   - Added `chromedriver@130`

2. `wdio.electron.conf.ts`:
   - Added `wdio-electron-service` configuration
   - Updated capabilities for Electron
   - Set proper app path

## Running Tests

```bash
# Build and test
npm run e2e:electron:build

# Test only (requires existing build)
npm run e2e:electron

# Specific test file
TEST_SPEC=./features/landing.feature npm run e2e:electron

# With specific tags
TEST_TAGS="@smoke" npm run e2e:electron
```

## Resources

- [WebdriverIO Electron Service](https://webdriver.io/docs/wdio-electron-service)
- [Electron Testing](https://www.electronjs.org/docs/latest/tutorial/automated-testing)
- [Debugging CLI/IPC Issues](../../DEBUGGING_CLI_IPC.md)

---

**Last Updated**: October 13, 2025

