# E2E Tests for Flock Migration App

This document describes the comprehensive end-to-end test suite for testing the step-by-step migration process, file upload functionality, and navigation guards.

## Test Structure

### Feature Files

#### 1. `migration-steps.feature`
Tests the complete migration workflow and step navigation:
- **Step Layout**: Verifies the step layout container and navigation footer
- **Complete Workflow**: Tests navigation through all steps (upload → auth → config → migrate → complete)
- **Step Titles**: Validates correct titles and descriptions for each step

#### 2. `file-upload.feature`
Tests file selection and upload validation:
- **Upload Interface**: Verifies upload UI elements and file input configuration
- **File Selection**: Tests valid file selection and display
- **File Validation**: Tests validation feedback for valid/invalid files
- **File Removal**: Tests file deletion functionality
- **Form State**: Tests reactive form validation states

#### 3. `navigation-guard.feature`
Tests the `uploadValidGuard` that prevents navigation without valid files:
- **Navigation Blocking**: Tests guard prevents navigation without valid archive
- **Guard Bypass**: Tests navigation allowed with valid archive
- **Validation Checking**: Tests guard checks actual file service state
- **Multiple Attempts**: Tests consistent behavior across multiple navigation attempts
- **Step Navigation Integration**: Tests guard integration with step navigation component

### Page Objects

#### `UploadStepPage`
- Handles file upload interactions
- Manages file input and form operations
- Provides methods for file selection and validation

#### `StepLayoutPage`
- Manages step navigation and layout
- Handles step-specific content verification
- Provides navigation methods between steps

#### `NavigationGuardPage`
- Tests snackbar messages and error handling
- Simulates file states for guard testing
- Handles navigation attempt verification

### Test Helpers

#### `TestFileHelper`
- Creates mock files for testing
- Simulates file selection in browser
- Handles file validation states

#### `NavigationTestHelper`
- Safely attempts navigation with guard capture
- Captures snackbar messages
- Checks current step state

#### `ValidationTestHelper`
- Checks Angular form validation
- Waits for component initialization
- Handles form state verification

#### `DebugHelper`
- Captures page state for debugging
- Logs errors and warnings
- Provides debugging utilities

### Custom World Context

The `CustomWorld` class provides shared state and convenience methods:
- **State Management**: Tracks selected files, validation state, navigation attempts
- **Helper Access**: Direct access to all test helper classes
- **Convenience Methods**: `selectValidArchive()`, `attemptNavigationToStep()`, etc.

## Test Scenarios Covered

### Migration Steps Testing
1. **Step Layout Structure**
   - ✅ Step layout container displays
   - ✅ Navigation footer displays
   - ✅ Current step highlighting

2. **Complete Workflow**
   - ✅ Upload step → Auth step navigation
   - ✅ Auth step → Config step navigation
   - ✅ Config step → Migrate step navigation
   - ✅ Migrate step → Complete step navigation

3. **Step Content Validation**
   - ✅ Page titles match expected values
   - ✅ Step descriptions display correctly
   - ✅ Step-specific components load

### File Upload Testing
1. **Interface Elements**
   - ✅ Upload section displays
   - ✅ "Choose Files" button with upload icon
   - ✅ File input accepts .zip files

2. **File Operations**
   - ✅ Valid file selection
   - ✅ Selected files list display
   - ✅ Delete button functionality
   - ✅ File removal and form reset

3. **Validation Feedback**
   - ✅ Success indicators for valid files
   - ✅ Error messages for invalid files
   - ✅ Form validation state updates

### Navigation Guard Testing
1. **Guard Protection**
   - ✅ Navigation blocked without valid archive
   - ✅ Snackbar error message display
   - ✅ Message auto-dismissal after 3 seconds

2. **Guard Bypass**
   - ✅ Navigation allowed with valid archive
   - ✅ No error messages when bypassed

3. **Edge Cases**
   - ✅ Guard checks actual file service state
   - ✅ Consistent behavior across multiple attempts
   - ✅ Integration with step navigation component

## Running the Tests

### Prerequisites
- Angular application running on development server
- WebDriverIO and Cucumber framework installed
- Chrome browser available

### Commands

```bash
# Run all e2e tests
npm run test:e2e

# Run specific feature file
npx wdio run wdio.conf.ts --spec features/migration-steps.feature

# Run with specific tags
npx wdio run wdio.conf.ts --cucumberOpts.tagExpression='@migration-steps'

# Run in watch mode
npm run test:e2e:watch

# Run with debug output
DEBUG_TESTS=true npm run test:e2e
```

### Test Tags

Use tags to run specific test groups:

- `@migration-steps` - All migration step tests
- `@step-navigation` - Step layout and navigation tests
- `@step-workflow` - Complete workflow tests
- `@file-upload` - All file upload tests
- `@upload-interface` - Upload interface tests
- `@file-selection` - File selection tests
- `@navigation-guard` - All navigation guard tests
- `@upload-guard` - Upload validation guard tests

### Debugging Tests

1. **Enable Debug Output**:
   ```bash
   DEBUG_TESTS=true npm run test:e2e
   ```

2. **Capture Screenshots**: Tests automatically capture screenshots on failure

3. **Page State Logging**: Use `DebugHelper.logPageState()` in tests

4. **Browser DevTools**: Tests run in headed Chrome by default for debugging

## Test Implementation Details

### File Mocking Strategy
- Uses `DataTransfer` and `File` APIs to simulate real file selection
- Creates mock Instagram archive files with proper structure
- Simulates both valid and invalid file scenarios

### Guard Testing Approach
- Tests actual Angular router guards, not mocked behavior
- Captures real snackbar messages from Material Design components
- Verifies URL changes and navigation state

### Angular Integration
- Waits for Angular zone stability before assertions
- Tests real Angular reactive forms validation
- Integrates with Angular Material components

### Error Handling
- Comprehensive error message capture
- Timeout handling for slow operations
- Graceful failure recovery

## Extending the Tests

### Adding New Scenarios
1. Add scenarios to existing feature files
2. Create step definitions in `features/step-definitions/steps.ts`
3. Update page objects if new UI elements are needed

### Adding New Feature Files
1. Create `.feature` file in `features/` directory
2. Add corresponding step definitions
3. Create page objects for new UI elements
4. Update test helpers if needed

### Mock Data
- Update `TestFileHelper.createValidArchiveFile()` for new archive formats
- Add new file types in `TestFileHelper.createMockFile()`
- Extend validation scenarios as needed

## Troubleshooting

### Common Issues

1. **Tests Timeout**
   - Increase timeout values in page objects
   - Check Angular application startup time
   - Verify all required services are mocked

2. **File Upload Failures**
   - Ensure `DataTransfer` API support in test browser
   - Check file input element selectors
   - Verify Angular form control binding

3. **Navigation Guard Issues**
   - Confirm guard implementation matches test expectations
   - Check snackbar selector accuracy
   - Verify file service state simulation

4. **Step Navigation Problems**
   - Update step selectors if Angular components change
   - Check routing configuration matches test expectations
   - Verify step loading detection logic

### Test Maintenance

- **Selectors**: Update CSS selectors when Angular Material components change
- **Timing**: Adjust wait times if application performance changes  
- **Validation**: Update validation logic when form requirements change
- **Navigation**: Maintain step routing consistency with application changes