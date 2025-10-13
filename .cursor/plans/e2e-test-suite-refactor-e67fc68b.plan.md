<!-- e67fc68b-0b72-4662-9ca0-3c9e5ea4f584 63354918-1edf-4213-a3c4-eade0634055c -->
# E2E Test Suite Refactor - Phases 1-2

## Overview

Break down the monolithic E2E test suite (191 scenarios, 32 min) into smaller, atomic test suites with proper tagging and organization. This plan covers Phase 1 (Tag Cleanup) and Phase 2 (Config Split).

## Phase 1: Tag Cleanup

### Current State

- 76 unique tags across 31 feature files
- Inconsistent naming (e.g., `@bluesky-auth` vs `@auth`)
- Tags like `@future-extensibility`, `@benefits` that should be consolidated
- Missing `@parallel` and `@serial` execution tags

### Tag Standardization

Update all feature files to use the new 25-tag hierarchy:

**Platform**: `@web`, `@electron`, `@mobile`
**Suite Level**: `@smoke`, `@core`, `@regression`, `@integration`
**Feature Area**: `@auth`, `@upload`, `@config`, `@migration`
**Execution**: `@parallel`, `@serial`, `@slow`
**OS-Specific**: `@os:windows`, `@os:macos`, `@os:linux`
**Status**: `@wip`, `@skip`, `@flaky`
**Priority**: `@critical`, `@high`, `@medium`, `@low`
**Special**: `@accessibility`, `@performance`, `@security`

### Tags to Replace/Remove

- `@bluesky-auth` → `@auth`
- `@straiforos` → remove
- `@functionality` → `@core`
- `@future-ready`, `@future-extensibility` → remove or archive
- `@benefits`, `@call-to-action` → merge into `@landing-page`
- `@edge-case` / `@edge-cases` → standardize to `@edge-case`
- `@button-visibility`, `@step-navigation-integration` → remove (too specific)

### Files to Update (31 feature files)

All feature files in:

- `features/auth/` (5 files)
- `features/config/` (7 files)
- `features/core/` (7 files)
- `features/upload/` (4 files)
- `features/electron/` (3 files)
- `features/web/` (1 file)
- `features/` root (4 files)

## Phase 2: Config Split

### Current Config Suite Problems

- **98 scenarios** across 7 files taking **16.3 minutes** (51% of total test time)
- `config-user-interface.feature`: 21 scenarios (too many UI scenarios)
- `config-validation.feature`: 19 scenarios (can be split by theme)
- `config-testing.feature`: 14 scenarios (testing + help dialog scenarios)

### New Config File Structure

**Create**: `features/config/config-happy-path.feature` (~5 scenarios)

- Extract basic config creation scenarios
- Simple date range selection
- Valid settings and form submission
- Tag: `@config @smoke @core @parallel`

**Split**: `config-user-interface.feature` (21 → 10 per file)

- Keep: `features/config/config-ui-interactions.feature` (10 scenarios)
- Focus on interactive UI elements (toggles, buttons, controls)
- Create: `features/config/config-ui-layout.feature` (11 scenarios)
- Focus on layout, spacing, responsive design

**Reduce**: `config-validation.feature` (19 → 12 scenarios)

- Keep core validation scenarios
- Move edge cases to separate file or consolidate similar tests
- Focus on real-time validation, error recovery, accessibility

**Reduce**: `config-testing.feature` (14 → 10 scenarios)

- Keep: Core testing mode scenarios (8 scenarios)
- Move: Help dialog scenarios (4 scenarios) → merge into config help documentation tests or overview

**Keep as-is**:

- `config-date-range.feature` (12 scenarios) ✅
- `config-dialog-scroll.feature` (8 scenarios) ✅
- `config-overview.feature` (12 scenarios) ✅
- `config.feature` (basic config scenarios) ✅

### Tagging Strategy for Config Files

- Happy path: `@config @smoke @core @parallel`
- Validation: `@config @validation @parallel`
- Date range: `@config @date-range @parallel`
- UI: `@config @ui @parallel`
- Testing: `@config @testing @simulation @parallel`
- Overview: `@config @overview @core @parallel`

## Phase 3 Handoff Document

Create `docs/testing/E2E_PHASE_3_HANDOFF.md` with:

- Summary of completed work (Phases 1-2)
- Detailed instructions for Phase 3 (NPM Scripts)
- List of all new NPM scripts to add to `package.json` (from strategy doc)
- Instructions for Phase 4 (CI/CD Integration)
- Instructions for Phase 5 (Documentation updates)

## Key Files to Modify

### Phase 1 (Tag Cleanup)

- All 31 `.feature` files in `features/` directory

### Phase 2 (Config Split)

- `features/config/config-validation.feature` (reduce scenarios)
- `features/config/config-user-interface.feature` (split into 2 files)
- `features/config/config-testing.feature` (reduce scenarios)
- **NEW**: `features/config/config-happy-path.feature`
- **NEW**: `features/config/config-ui-layout.feature`

### Handoff Document

- **NEW**: `docs/testing/E2E_PHASE_3_HANDOFF.md`

## Success Criteria

- All 31 feature files use new tag hierarchy
- No obsolete tags remain (`@straiforos`, `@future-ready`, etc.)
- Config suite split into 8 focused files (was 7)
- No single config file > 12 scenarios
- All config tests have proper `@parallel` tags
- Handoff document clearly explains next steps for Phases 3-5

### To-dos

- [ ] Audit all feature files and create tag mapping (old → new tags)
- [ ] Update tags in auth feature files (5 files)
- [ ] Update tags in upload feature files (4 files)
- [ ] Update tags in config feature files (7 files)
- [ ] Update tags in electron, web, core, and root feature files (15 files)
- [ ] Create config-happy-path.feature with ~5 smoke scenarios
- [ ] Split config-user-interface.feature into config-ui-interactions.feature and config-ui-layout.feature
- [ ] Reduce config-validation.feature from 19 to 12 scenarios
- [ ] Reduce config-testing.feature from 14 to 10 scenarios
- [ ] Create E2E_PHASE_3_HANDOFF.md with instructions for Phases 3-5