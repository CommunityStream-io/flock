# Skipped Tests and Timeout Configuration Refactoring

## 📋 **Currently Skipped Tests**

### 1. **Upload Feature** (`features/upload/upload.feature`)
- **Line 35**: `@file-upload @navigation-reset @skip()`
- **Scenario**: "Navigation back to upload step resets splash screen message"
- **Status**: ✅ **FIXED** - Was one of the original problematic tests
- **Action**: Remove @skip() tag

### 2. **Auth Feature** (`features/auth/auth.feature`) 
- **Line 55**: `@bluesky-auth @authentication @skip()`
- **Scenario**: "Valid credentials trigger authentication splash screen"
- **Status**: ✅ **FIXED** - Was the other original problematic test
- **Action**: Remove @skip() tag

### 3. **Navigation Guard Feature** (`features/navigation-guard.feature`)
- **Line 1**: `@skip()` (entire feature)
- **Feature**: "Navigation Guard Protection - Upload Validation Requirements"
- **Status**: ❓ **UNKNOWN** - Needs investigation
- **Action**: Test if feature works, remove @skip() if functional

### 4. **Auth Navigation Guards Feature** (`features/auth/auth-navigation-guards.feature`)
- **Line 1**: `@skip()` (entire feature) 
- **Feature**: "Authentication Navigation Guards - Route Protection and Validation"
- **Status**: ❓ **UNKNOWN** - Needs investigation
- **Action**: Test if feature works, remove @skip() if functional

### 5. **Landing Feature** (`features/landing.feature`)
- **Line 15**: `@landing-page @process-steps @skip()`
- **Scenario**: "Process steps show correct migration workflow"
- **Status**: ❓ **UNKNOWN** - Needs investigation
- **Action**: Test if scenario works, remove @skip() if functional

## 🔧 **Remaining Files to Update for Timeout Configuration**

**Total Remaining**: 25 instances of `timeout: timeouts.` patterns across 10 files

### **Step Definitions** (High Priority)
- [ ] `features/step-definitions/file-upload.ts` - **7 instances** (highest priority)
- [ ] `features/step-definitions/auth.ts` - **3 instances** (partially done)
- [ ] `features/step-definitions/splash-screen.ts` - **1 instance**
- [ ] `features/step-definitions/landing.ts` - **1 instance**
- [ ] `features/step-definitions/steps.ts` - **1 instance**

### **Page Objects** (High Priority)
- [ ] `features/pageobjects/auth.page.ts` - **6 instances** (highest priority)
- [ ] `features/pageobjects/navigation-guard.page.ts` - **2 instances**
- [ ] `features/pageobjects/config.page.ts` - **2 instances**
- [ ] `features/pageobjects/upload-step.page.ts` - **1 instance**

### **Support Files** (Medium Priority)
- [ ] `features/support/global-setup.ts` - **1 instance**
- [ ] `features/support/performance-monitor.ts` - **1 instance** (hardcoded 30000ms)

### **Timeout Patterns to Replace**

#### Pattern 1: Object with timeout and timeoutMsg
```typescript
// OLD
{ 
    timeout: timeouts.navigation,
    timeoutMsg: timeoutMessages.navigation(process.env.CI === 'true')
}

// NEW
timeoutOptions.navigation
```

#### Pattern 2: Individual timeout properties
```typescript
// OLD
{ timeout: timeouts.uiInteraction, timeoutMsg: timeoutMessages.uiInteraction(process.env.CI === 'true') }

// NEW
timeoutOptions.uiInteraction
```

#### Pattern 3: Hardcoded timeouts
```typescript
// OLD
{ timeout: 30000, timeoutMsg: 'Page did not load completely' }

// NEW
createTimeoutOptions('appLoad', 'Page did not load completely')
```

## 📊 **Current Status**

### ✅ **Completed**
- `features/support/test-setup.ts` - Updated to use `createTimeoutOptions()`
- `features/step-definitions/splash-screen-direct.ts` - Updated to use `createTimeoutOptions()`
- `features/pageobjects/step-layout.page.ts` - Updated to use `createTimeoutOptions()`
- `features/step-definitions/auth.ts` - Partially updated (some patterns remain)

### 🔄 **In Progress**
- `features/step-definitions/auth.ts` - Still has some patterns to update

### ⏳ **Pending**
- All other files listed above

## 🎯 **Next Actions**

1. **Remove @skip() from fixed tests** (upload and auth splash screen)
2. **Complete timeout refactoring** in remaining files
3. **Test all scenarios** to ensure they work properly
4. **Investigate unknown skipped tests** to determine if they can be enabled

## 🔍 **Quick Reference: Specific Patterns Found**

### Most Common Patterns to Replace:
1. **`{ timeout: timeouts.navigation, timeoutMsg: timeoutMessages.navigation(process.env.CI === 'true') }`** → `timeoutOptions.navigation`
2. **`{ timeout: timeouts.uiInteraction, timeoutMsg: timeoutMessages.uiInteraction(process.env.CI === 'true') }`** → `timeoutOptions.uiInteraction`
3. **`{ timeout: timeouts.auth, timeoutMsg: timeoutMessages.auth(process.env.CI === 'true') }`** → `timeoutOptions.auth`
4. **`{ timeout: timeouts.fileValidation, timeoutMsg: timeoutMessages.fileValidation(process.env.CI === 'true') }`** → `timeoutOptions.fileValidation`

### Files with Most Instances:
- **file-upload.ts**: 7 instances (navigation, fileValidation, fileError patterns)
- **auth.page.ts**: 6 instances (uiInteraction, auth, navigation patterns)
- **auth.ts**: 3 instances (remaining after partial update)

## 📝 **Notes**

- The centralized timeout configuration provides consistent behavior across CI and local environments
- Using `timeoutOptions` is preferred over `createTimeoutOptions()` for standard operations
- All timeout values are automatically adjusted based on environment (CI vs local)
- Error messages are standardized and environment-aware
- **Total work remaining**: 25 timeout patterns across 10 files
