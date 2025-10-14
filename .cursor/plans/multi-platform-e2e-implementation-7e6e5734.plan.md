<!-- 7e6e5734-770e-40dd-929b-c4f8b18310de d4c08f2f-bb17-4cd3-819e-c167c4418200 -->
# Multi-Platform E2E Testing Implementation Plan

## Week 1: Fix CLI Execution (Critical Blocker)

### Diagnosis & Fix

The CLI execution fails in packaged Electron apps due to path resolution issues in `projects/flock-native/electron/ipc-handlers.js` (lines 339-382). The code attempts multiple path resolution strategies but may not correctly handle all packaging scenarios.

**Debug Steps:**

1. Launch packaged app: `dist/electron/win-unpacked/Flock Native.exe`
2. Open DevTools (F12) and monitor console
3. Upload test archive and trigger migration
4. Check console logs for path resolution failures

**Key Files:**

- `projects/flock-native/electron/ipc-handlers.js` - CLI execution handler (lines 310-410)
- `projects/flock-native/src/app/service/cli/cli.service.ts` - Angular CLI service (lines 137-202)
- `package.json` - asarUnpack configuration (lines 118-122)

**Expected Fix Locations:**

- Verify CLI path exists in `app.asar.unpacked/node_modules/@straiforos/instagramtobluesky/`
- Ensure path resolution correctly checks unpacked directory
- Validate `process.execPath` (Electron's Node.js) is used correctly
- Add E2E test to prevent regression

---

## Week 2: Phase 1 - Test Structure & Categorization

### Create Directory Structure

```
features/
├── core/              # Platform-agnostic tests
│   ├── auth/
│   ├── config/
│   └── upload/
├── web/               # Web-specific tests  
│   └── demo/
├── electron/          # Electron-specific tests
│   ├── ipc/
│   ├── window/
│   └── os/
├── pageobjects/
│   └── adapters/      # NEW - Platform adapters
└── step-definitions/
    ├── core/          # NEW - Shared steps
    ├── web/           # NEW - Web-specific
    └── electron/      # NEW - Electron-specific
```

### Categorize Existing 20+ Features

**Review each feature file and categorize:**

**Core candidates (business logic):**

- `auth/auth-username-validation.feature` - Form validation rules
- `auth/auth-password-validation.feature` - Password rules
- `config/config-validation.feature` - Config validation (15 scenarios)
- `config/config-date-range.feature` - Date range logic (4 scenarios)
- `upload/upload-file-validation.feature` - File validation rules

**Web candidates (web-specific):**

- `landing.feature` - Web demo landing page
- Upload features using HTML `<input type="file">`
- Demo mode specific scenarios

**Electron candidates (to create):**

- `electron/ipc/cli-integration.feature` - Test CLI execution (prevents regression!)
- `electron/upload/native-dialog.feature` - Native file dialogs
- `electron/window/window-state.feature` - Window management

### Add Platform Tags

```gherkin
@core @auth @validation
Feature: Username Validation

@web @platform:web @upload
Feature: Web File Upload

@electron @platform:electron @ipc
Feature: CLI Integration via IPC
```

**Tagging Strategy:**

- Platform: `@core`, `@web`, `@electron`
- OS: `@os:windows`, `@os:macos`, `@os:linux`
- Domain: `@auth`, `@config`, `@upload`, `@migration`
- Priority: `@smoke`, `@regression`

---

## Week 3: Phase 2 - Platform Adapters

### Create Adapter Pattern

Implement the adapter pattern to isolate platform-specific behavior.

**Key Files to Create:**

`features/support/adapters/PlatformAdapter.interface.ts`:

```typescript
export interface PlatformAdapter {
  platform: 'web' | 'electron' | 'mobile';
  os?: 'windows' | 'macos' | 'linux';
  selectFile(path: string): Promise<void>;
  navigateTo(route: string): Promise<void>;
  authenticate(username: string, password: string): Promise<void>;
  sendIpcMessage?(channel: string, data: any): Promise<any>;
}
```

`features/support/adapters/WebAdapter.ts`:

- Implements HTML file input selection
- Uses `browser.url('http://localhost:4200/...')`
- Handles demo mode authentication

`features/support/adapters/ElectronAdapter.ts`:

- Uses Electron native dialogs
- Uses `browser.url('app:///...')` protocol
- Handles real IPC authentication
- Implements `sendIpcMessage` for CLI testing

`features/support/adapters/platform.factory.ts`:

- Factory pattern based on `process.env.PLATFORM`
- Returns appropriate adapter instance

### Update Page Objects

Modify existing page objects in `features/pageobjects/` to use adapters:

```typescript
export class UploadPage {
  private adapter = PlatformFactory.createAdapter();
  
  async selectFile(filePath: string) {
    await this.adapter.selectFile(filePath);
  }
}
```

---

## Week 4: Phase 3 - Configuration Split

### Create Platform-Specific Configs

**Split WDIO configurations:**

`wdio.web.conf.ts` (new):

```typescript
import { baseConfig } from './wdio.conf';

export const config = {
  ...baseConfig,
  baseUrl: 'http://localhost:4200',
  capabilities: [{ browserName: 'chrome' }],
  cucumberOpts: {
    ...baseConfig.cucumberOpts,
    tagExpression: '@core or @web',
  },
  specs: [
    './features/core/**/*.feature',
    './features/web/**/*.feature'
  ],
};
```

`wdio.electron.conf.ts` (update existing):

```typescript
cucumberOpts: {
  tagExpression: `(@core or @electron) and (@os:${process.platform} or not @os)`,
},
specs: [
  './features/core/**/*.feature',
  './features/electron/**/*.feature'
],
```

### Update NPM Scripts in `package.json`

```json
{
  "e2e:web": "cross-env PLATFORM=web wdio run wdio.web.conf.ts",
  "e2e:web:headless": "cross-env PLATFORM=web HEADLESS=true wdio run wdio.web.conf.ts",
  
  "e2e:electron": "cross-env PLATFORM=electron wdio run wdio.electron.conf.ts",
  "e2e:electron:build": "npm run pack:win:dir && npm run e2e:electron",
  
  "e2e:core": "cross-env TEST_TAGS='@core' npm run e2e",
  "e2e:smoke": "cross-env TEST_TAGS='@smoke' npm run e2e",
  
  "e2e:ci:web": "cross-env CI=true PLATFORM=web npm run e2e:web:headless",
  "e2e:ci:electron": "cross-env CI=true PLATFORM=electron npm run e2e:electron:build"
}
```

---

## Week 5: Phase 4 - Electron-Specific Features

### Create Electron Test Features

**Critical: Test CLI execution to prevent regression**

`features/electron/ipc/cli-integration.feature`:

```gherkin
@electron @platform:electron @ipc @smoke
Feature: CLI Integration via IPC
  Test that CLI execution works in packaged app
  
  Scenario: Execute CLI and receive output
    Given the Electron app is running
    When I trigger CLI execution via IPC
    Then the CLI process should start successfully
    And I should receive CLI output via IPC events
    And the process should complete without errors
```

`features/electron/upload/native-dialog.feature`:

```gherkin
@electron @platform:electron @upload
Feature: Native File Dialog
  
  @os:windows
  Scenario: Windows native dialog
    Given I am on the upload page
    When I click the file selection button
    Then a native Windows file dialog should appear
```

`features/electron/window/window-state.feature`:

```gherkin
@electron @platform:electron @window
Feature: Window State Management
  
  Scenario: Window persists state
    Given the Electron app is running
    When I resize the window
    And I restart the app
    Then the window should restore its previous size
```

### Implement Step Definitions

`features/step-definitions/electron/ipc.steps.ts`:

- Steps for testing IPC communication
- CLI execution verification
- Output monitoring

`features/step-definitions/electron/dialog.steps.ts`:

- Steps for native dialog interactions
- OS-specific dialog handling

---

## Week 6: Phase 5 - CI/CD Integration

### GitHub Actions Workflows

`.github/workflows/e2e-web.yml`:

```yaml
name: E2E Web Tests
on: [push, pull_request]

jobs:
  web-tests:
    runs-on: ubuntu-latest
    steps:
   - uses: actions/checkout@v3
   - uses: actions/setup-node@v3
   - run: npm ci
   - run: npm run e2e:ci:web
   - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: allure-results-web
          path: allure-results/
```

`.github/workflows/e2e-electron.yml`:

```yaml
name: E2E Electron Tests
on: [push, pull_request]

jobs:
  electron-windows:
    runs-on: windows-latest
    steps:
   - uses: actions/checkout@v3
   - uses: actions/setup-node@v3
   - run: npm ci
   - run: npm run e2e:ci:electron
      
  electron-macos:
    runs-on: macos-latest
    steps:
   - uses: actions/checkout@v3
   - uses: actions/setup-node@v3
   - run: npm ci
   - run: npm run e2e:ci:electron
      
  electron-linux:
    runs-on: ubuntu-latest
    steps:
   - uses: actions/checkout@v3
   - uses: actions/setup-node@v3
   - run: npm ci
   - run: npm run e2e:ci:electron
```

### Parallel Execution & Reporting

- Configure test sharding for faster feedback
- Aggregate Allure reports from all platforms
- Set up badge generation for test status

---

## Testing Strategy Guidelines: Unit vs E2E Balance

### What to Unit Test (Fast, Isolated)

**Target: ~80% coverage on business logic**

Current state: ~293 unit tests in `projects/shared/src/lib/`

**Unit test these:**

- **Form validation logic** - Individual validators
                - Example: `auth-username-validation`, `auth-password-validation`
                - Covered by: `projects/shared/src/lib/steps/*/\*.spec.ts`

- **Data transformation** - Pure functions
                - Date parsing, format conversion
                - Config object construction

- **Service methods** - Mocked dependencies
                - `CLIService` methods (without actual CLI execution)
                - Authentication flows (with mocked API)

- **Component logic** - Angular TestBed
                - Button state management
                - Progress calculations
                - UI state transitions

**Don't duplicate in E2E:**

- Edge cases for individual validators (test in unit tests)
- Error message text formatting
- Internal state management

### What to E2E Test (Slow, Integrated)

**Target: Critical user journeys + platform-specific behavior**

**Core E2E tests (run on all platforms):**

- **Happy path workflows** - Complete user journeys
                - Upload → Configure → Authenticate → Migrate
                - Navigation between steps

- **Integration points** - Cross-component behavior
                - Form submission triggers navigation
                - File upload updates UI state

- **Critical business rules** - Only high-value scenarios
                - Date range validation prevents invalid migrations
                - Missing credentials block migration start

**Platform-specific E2E tests:**

- **Web:** HTML file input, demo mode, browser-specific behavior
- **Electron:** IPC communication, CLI execution, native dialogs, window management

### Leverage Unit Tests to Reduce E2E Burden

**Strategy:**

1. **Validate inputs in unit tests** - Don't test every invalid input in E2E

                        - Unit: Test 20 password validation rules
                        - E2E: Test 1 valid password, 1 invalid password

2. **Use unit test coverage to inform E2E** - Gap analysis

                        - If unit tests cover all date range edge cases → E2E only tests 1 valid range
                        - If no unit tests for feature → E2E must be comprehensive

3. **Extract logic to make it unit-testable**

                        - If E2E test is slow/flaky, extract logic to service → unit test
                        - Example: CLI output parsing → Extract to service method → Unit test

4. **Smoke tests in E2E, exhaustive tests in unit**

                        - E2E: "Config form accepts valid input"
                        - Unit: 15 scenarios for every field combination

### Practical Example

**Username Validation:**

Unit tests (fast - `auth.service.spec.ts`):

```typescript
describe('validateUsername', () => {
  it('should reject empty username');
  it('should reject username without @');
  it('should reject invalid format');
  it('should accept valid handle');
  it('should accept valid DID');
  // ... 10 more edge cases
});
```

E2E tests (slow - `auth-username-validation.feature`):

```gherkin
@core @auth @smoke
Scenario: Valid username accepted
  When I enter "@user.bsky.social"
  Then username should be valid

@core @auth  
Scenario: Invalid username rejected
  When I enter "invalid"
  Then I should see username error
```

Result: 1 minute of unit tests covers what would take 15 minutes in E2E.

### Coverage Targets

- **Unit Tests:** 80%+ line coverage on business logic
- **E2E Tests:** 100% critical user journeys, 1 happy path per feature
- **Platform Tests:** 100% platform-specific features (IPC, dialogs, etc.)

---

## Success Criteria

### Week 1 Complete:

- CLI execution works in packaged Electron app
- Can migrate Instagram posts successfully
- E2E test exists to prevent regression

### Week 2-6 Complete:

- All 20+ existing features categorized and moved
- Platform adapters implemented and tested
- Can run: `npm run e2e:web` and `npm run e2e:electron`
- Tag-based filtering works: `@core`, `@web`, `@electron`, `@smoke`
- CI/CD pipelines run tests on all platforms
- Zero regressions in existing test suite

### Testing Strategy:

- Documentation created: `docs/testing/UNIT_VS_E2E_GUIDELINES.md`
- Team understands when to write unit vs E2E tests
- Reduced E2E test execution time by leveraging unit tests

---

## Risk Mitigation

**Risk: Breaking existing tests during migration**

- Mitigation: Copy files, don't move; keep originals until validated

**Risk: CLI fix introduces new issues**

- Mitigation: Add E2E test immediately after fix

**Risk: Incorrect test categorization**

- Mitigation: Start conservative (platform-specific), consolidate later

**Risk: Over-testing in E2E, slow feedback**

- Mitigation: Follow unit vs E2E guidelines, extract testable logic

### To-dos

- [ ] Debug and fix CLI execution in packaged Electron app (ipc-handlers.js path resolution)
- [ ] Create E2E test for CLI execution to prevent regression (features/electron/ipc/cli-integration.feature)
- [ ] Create new directory structure (core/, web/, electron/, adapters/)
- [ ] Categorize and copy all 20+ existing feature files to appropriate directories
- [ ] Add platform tags (@core, @web, @electron) to all feature files
- [ ] Create platform adapter pattern (PlatformAdapter interface, WebAdapter, ElectronAdapter, factory)
- [ ] Update existing page objects to use platform adapters
- [ ] Create wdio.web.conf.ts and update wdio.electron.conf.ts with tag expressions
- [ ] Add platform-specific npm scripts to package.json (e2e:web, e2e:electron, e2e:core, etc.)
- [ ] Create Electron-specific features (IPC, native dialogs, window management)
- [ ] Implement step definitions for Electron-specific features
- [ ] Create GitHub Actions workflows for web and Electron tests across platforms
- [ ] Document unit vs E2E testing guidelines (docs/testing/UNIT_VS_E2E_GUIDELINES.md)