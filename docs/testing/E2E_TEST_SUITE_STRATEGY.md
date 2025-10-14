# E2E Test Suite Strategy

**Problem**: Our E2E tests are too long-running and not atomic enough
- **191 scenarios** across 31 files
- **Estimated 32.1 minutes** for full suite
- **Config tests dominate**: 16.3 min (51% of total time)
- **Poor organization**: 76 tags with inconsistent naming

**Goal**: Break down into smaller, atomic test suites that run fast and in parallel

---

## 🎯 Test Suite Hierarchy

### 1. **Smoke Suite** (@smoke) - < 3 minutes
**Purpose**: Critical path verification - runs on every commit
**Frequency**: Every commit, PR, merge

**Should include**:
- [ ] Login with valid credentials
- [ ] Upload valid file
- [ ] View config overview
- [ ] Basic navigation
- [ ] Critical error handling

**Target scenarios**: 10-15 scenarios max
**Current status**: Has @smoke tag but needs consolidation

```bash
npm run e2e:smoke
```

---

### 2. **Core Suite** (@core) - < 8 minutes  
**Purpose**: Essential functionality across all platforms
**Frequency**: Every PR

**Split into**:
- **@core + @auth** (5 scenarios, ~1.5 min)
  - Login flow
  - Logout flow
  - Session persistence
  - Invalid credentials
  - Password visibility toggle

- **@core + @upload** (8 scenarios, ~2 min)
  - File selection
  - File validation
  - File removal
  - Invalid file types

- **@core + @config** (12 scenarios, ~3 min)
  - Config creation
  - Config validation
  - Date range selection
  - Form submission

```bash
npm run e2e:core
npm run e2e:core:auth
npm run e2e:core:upload
npm run e2e:core:config
```

---

### 3. **Platform Suites** - < 5 minutes each
**Purpose**: Platform-specific features
**Frequency**: Before platform-specific releases

**@web** (Mirage) - 4 scenarios, ~1 min
- Landing page
- Responsive design
- Browser-specific features

**@electron** (Native) - 19 scenarios, ~3 min
- IPC communication
- Native file dialogs
- Window management
- CLI integration

**@mobile** (Future)
- Touch interactions
- Orientation changes

```bash
npm run e2e:web
npm run e2e:electron
npm run e2e:mobile
```

---

### 4. **Feature Suites** - Split by functionality

#### **Config Suite** (Currently 98 scenarios, 16.3 min) 🔴
**Problem**: Monolithic, too many scenarios in few files  
**Solution**: Break into 6 atomic suites

**a) @config + @smoke** - Config Happy Path (< 2 min)
- Basic config creation
- Simple date range
- Valid settings
- Form submission

**b) @config + @validation** - Config Validation (< 3 min)
- Field validation rules
- Error messages
- Form state management
- Required fields

**c) @config + @date-range** - Date Range Logic (< 3 min)
- Date picker interactions
- Range validation
- Boundary conditions
- Error cases

**d) @config + @ui** - UI Interactions (< 3 min)
- Dialog interactions
- Scroll behavior
- Responsive layout
- Button states

**e) @config + @testing** - Config Testing Features (< 2 min)
- Test mode
- Data mocking
- Simulation

**f) @config + @overview** - Config Overview (< 2 min)
- View existing configs
- Navigate between steps
- Overview display

**Files to split**:
```
features/config/
├── config-happy-path.feature          (NEW - 5 scenarios)
├── config-validation.feature          (REDUCE from 19 to 12)
├── config-date-range.feature          (KEEP - 12 scenarios)
├── config-ui-interactions.feature     (NEW - split from config-user-interface)
├── config-dialog-scroll.feature       (KEEP - 8 scenarios)
├── config-testing.feature             (REDUCE from 14 to 8)
└── config-overview.feature            (KEEP - 12 scenarios)
```

```bash
npm run e2e:config:smoke
npm run e2e:config:validation
npm run e2e:config:date-range
npm run e2e:config:ui
npm run e2e:config:testing
npm run e2e:config:overview
```

---

#### **Auth Suite** (Currently 18 scenarios, 3 min)
**Status**: ✅ Already well-organized  
**Suites**:
- @auth + @smoke (3 scenarios)
- @auth + @validation (6 scenarios)
- @auth + @guards (8 scenarios)

```bash
npm run e2e:auth:smoke
npm run e2e:auth:validation
npm run e2e:auth:guards
```

---

#### **Upload Suite** (Currently 8 scenarios, 1.4 min)
**Status**: ✅ Already well-organized  
**Suites**:
- @upload + @smoke (2 scenarios)
- @upload + @validation (4 scenarios)
- @upload + @management (2 scenarios)

```bash
npm run e2e:upload:smoke
npm run e2e:upload:validation
npm run e2e:upload:management
```

---

### 5. **Integration Suites** - Cross-feature flows

**@integration + @full-flow** (< 5 min)
- Complete user journey
- Login → Upload → Config → Migrate
- End-to-end critical path

**@integration + @guards** (< 3 min)
- Navigation guards
- Route protection
- State validation

```bash
npm run e2e:integration:full
npm run e2e:integration:guards
```

---

### 6. **Regression Suite** (@regression) - Full test suite
**Purpose**: Comprehensive testing before major releases  
**Frequency**: Before releases, nightly builds

**Includes**: All tests (191 scenarios, ~32 min)

```bash
npm run e2e:regression
```

---

## 📊 Parallel Execution Strategy

### Safe for Parallel (@parallel)
Tests that don't share state:
- Auth tests (different sessions)
- Upload tests (different files)
- UI tests (read-only)

### Must run Serial (@serial)
Tests that share state:
- Full flow integration tests
- Migration tests
- State persistence tests

### Shard Strategy
```bash
# Split into 4 shards for CI
npm run e2e:shard:1  # Core + Auth
npm run e2e:shard:2  # Upload + Config (part 1)
npm run e2e:shard:3  # Config (part 2) + Electron
npm run e2e:shard:4  # Integration + Web
```

---

## 🏷️ Tag Cleanup Strategy

### Current: 76 tags (too many, inconsistent)

### Proposed: 25 tags (organized hierarchy)

**Platform**:
- @web, @electron, @mobile

**Suite Level**:
- @smoke, @core, @regression, @integration

**Feature Area**:
- @auth, @upload, @config, @migration

**Execution**:
- @parallel, @serial, @slow (> 30s)

**OS-Specific**:
- @os:windows, @os:macos, @os:linux

**Status**:
- @wip, @skip, @flaky

**Priority**:
- @critical, @high, @medium, @low

**Special**:
- @accessibility, @performance, @security

### Tags to Remove/Consolidate:
- ❌ @straiforos (not needed)
- ❌ @functionality (use @core)
- ❌ @future-ready, @future-extensibility (remove)
- ❌ @benefits, @call-to-action (move to @landing)
- ❌ @edge-case, @edge-cases (standardize to @edge-case)
- ❌ @button-visibility, @step-navigation-integration (too specific)

---

## 📝 NPM Scripts to Add

```json
{
  "scripts": {
    // Smoke tests
    "e2e:smoke": "cross-env TEST_TAGS='@smoke' wdio run wdio.conf.ts",
    
    // Core suites
    "e2e:core": "cross-env TEST_TAGS='@core' wdio run wdio.conf.ts",
    "e2e:core:auth": "cross-env TEST_TAGS='@core and @auth' wdio run wdio.conf.ts",
    "e2e:core:upload": "cross-env TEST_TAGS='@core and @upload' wdio run wdio.conf.ts",
    "e2e:core:config": "cross-env TEST_TAGS='@core and @config' wdio run wdio.conf.ts",
    
    // Config sub-suites (break down the monolith)
    "e2e:config": "cross-env TEST_TAGS='@config' wdio run wdio.conf.ts",
    "e2e:config:smoke": "cross-env TEST_TAGS='@config and @smoke' wdio run wdio.conf.ts",
    "e2e:config:validation": "cross-env TEST_TAGS='@config and @validation' wdio run wdio.conf.ts",
    "e2e:config:date-range": "cross-env TEST_TAGS='@config and @date-range' wdio run wdio.conf.ts",
    "e2e:config:ui": "cross-env TEST_TAGS='@config and @ui' wdio run wdio.conf.ts",
    
    // Platform suites
    "e2e:web": "cross-env PLATFORM=web TEST_TAGS='@web or @core' wdio run wdio.web.conf.ts",
    "e2e:electron": "cross-env PLATFORM=electron TEST_TAGS='@electron or @core' wdio run wdio.electron.conf.ts",
    
    // Integration
    "e2e:integration": "cross-env TEST_TAGS='@integration' wdio run wdio.conf.ts",
    "e2e:integration:full": "cross-env TEST_TAGS='@integration and @full-flow' wdio run wdio.conf.ts",
    
    // Parallel execution
    "e2e:parallel": "cross-env TEST_TAGS='@parallel' wdio run wdio.conf.ts --maxInstances 4",
    
    // Sharding for CI
    "e2e:shard:1": "cross-env TEST_TAGS='@core and @auth' wdio run wdio.conf.ts",
    "e2e:shard:2": "cross-env TEST_TAGS='@upload or (@config and @validation)' wdio run wdio.conf.ts",
    "e2e:shard:3": "cross-env TEST_TAGS='(@config and not @validation) or @electron' wdio run wdio.conf.ts",
    "e2e:shard:4": "cross-env TEST_TAGS='@integration or @web' wdio run wdio.conf.ts",
    
    // Full regression
    "e2e:regression": "cross-env TEST_TAGS='@regression or not @skip' wdio run wdio.conf.ts"
  }
}
```

---

## 🚀 Implementation Plan

### Phase 1: Tag Cleanup (1 day)
1. Update all feature files with new tag strategy
2. Remove redundant/obsolete tags
3. Add @parallel/@serial tags based on test analysis

### Phase 2: Config Split (2 days)
1. Break `config-user-interface.feature` (21 → 10 scenarios each)
2. Break `config-validation.feature` (19 → 10 + 9 scenarios)
3. Break `config-testing.feature` (14 → 8 + 6 scenarios)
4. Extract happy path scenarios into new files

### Phase 3: NPM Scripts (1 day)
1. Add all new scripts to `package.json`
2. Test each script independently
3. Document in README

### Phase 4: CI/CD Integration (1 day)
1. Update GitHub Actions to run sharded tests
2. Configure parallel execution
3. Set up test result aggregation

### Phase 5: Documentation (0.5 days)
1. Update test documentation
2. Add developer guide for writing tests
3. Create tagging best practices guide

---

## 📈 Expected Improvements

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| **Full Suite Time** | ~32 min | ~32 min | 0% (same) |
| **Smoke Suite Time** | N/A | < 3 min | ✅ Quick feedback |
| **CI Time (4 shards)** | 32 min | ~8 min | 75% faster |
| **Feedback Loop** | 32 min | 3-8 min | 4-10x faster |
| **Parallel Efficiency** | Low | High | ✅ Better resource use |

---

## ✅ Success Criteria

- [ ] No single feature file > 10 scenarios
- [ ] No single test suite > 5 minutes
- [ ] Smoke tests < 3 minutes
- [ ] Core tests < 8 minutes
- [ ] CI with 4 shards < 10 minutes
- [ ] All tests properly tagged
- [ ] 90%+ test success rate
- [ ] Clear test ownership and organization

---

**Status**: 🔴 Not started  
**Priority**: 🔥 High - blocking CI/CD optimization  
**Owner**: Dev Team  
**Timeline**: 1 week (5 phases)

