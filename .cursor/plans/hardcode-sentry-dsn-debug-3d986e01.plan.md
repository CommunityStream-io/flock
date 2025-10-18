<!-- 3d986e01-91c5-4981-9469-570397fde3ac 9a2a2dc4-d0e0-4b6c-ae01-1de9fe5e2e39 -->
# Hardcode Sentry DSN and Enable Debug Mode

## Overview

Hardcode the Sentry DSN `https://c525bad84d7baf7a00631c940b44a980@o4506526838620160.ingest.us.sentry.io/4510187648712704` in both the Electron main process and Angular renderer, and enable debug mode to verify production builds are sending logs to Sentry.

## Changes Required

### 1. Electron Main Process (`projects/flock-native/electron/main.js`)

- **Line 46-48**: Already has the DSN hardcoded as `devDsn`, but the logic prefers `NATIVE_SENTRY_DSN_MAIN` env var. Will update to always use the hardcoded DSN.
- **Line 54**: Debug is already set to `true` ✓

**Action**: Update the `sentryDsn` variable to always use the hardcoded DSN instead of checking environment variables first.

### 2. Angular Production Environment (`projects/flock-native/src/environments/environment.prod.ts`)

- **Line 7**: Currently has placeholder `'${NATIVE_SENTRY_DSN}'`
- **Action**: Replace with the actual hardcoded DSN

### 3. Angular Development Environment (`projects/flock-native/src/environments/environment.ts`)

- **Line 7**: Already has the DSN hardcoded ✓
- No changes needed

### 4. Angular Sentry Logger (`projects/shared/src/lib/services/sentry-logger.ts`)

- **Line 42**: `Sentry.init()` call
- **Action**: Add `debug: true` option to enable Sentry debugging in Angular (currently not set)

## Implementation Details

**Electron (main.js:46-48)**:

```javascript
const sentryDsn = 'https://c525bad84d7baf7a00631c940b44a980@o4506526838620160.ingest.us.sentry.io/4510187648712704';
```

**Angular Production (environment.prod.ts:7)**:

```typescript
dsn: 'https://c525bad84d7baf7a00631c940b44a980@o4506526838620160.ingest.us.sentry.io/4510187648712704',
```

**Angular Sentry Logger (sentry-logger.ts:42)**:

```typescript
Sentry.init({
  dsn: sentryDsn,
  debug: true, // ADD THIS LINE
  environment: this.config?.environment || this.getEnvironment(),
  // ... rest of config
```

## CI/CD Simplification

Since we're hardcoding the DSN in source files, we can simplify the CI/CD workflows:

### 5. Remove DSN Environment Variables from CI (`release.yml`)

- **Lines 247-249, 350-352, 392-394**: Remove `NATIVE_SENTRY_DSN`, `NATIVE_SENTRY_DSN_MAIN`, and `MIRAGE_SENTRY_DSN` env vars from build jobs
- **Keep**: `SENTRY_AUTH_TOKEN` and `SENTRY_ORG` for source map uploads (lines 250-251, 353-354, 395-396)

### 6. Remove/Simplify DSN Injection Scripts

- **Lines 276-277, 371-372, 416-417**: Remove `inject-sentry-dsn.js` step (no longer needed)
- **Lines 279-280, 374-375, 419-420**: Remove `generate-sentry-config.js` step (no longer needed)
- **Keep**: Source map upload steps (lines 282-285, 377-380, 422-425) as they need `SENTRY_AUTH_TOKEN`

## Implementation Summary

**Electron (main.js:46-48)**:

```javascript
const sentryDsn = 'https://c525bad84d7baf7a00631c940b44a980@o4506526838620160.ingest.us.sentry.io/4510187648712704';
```

**Angular Production (environment.prod.ts:7)**:

```typescript
dsn: 'https://c525bad84d7baf7a00631c940b44a980@o4506526838620160.ingest.us.sentry.io/4510187648712704',
```

**Angular Sentry Logger (sentry-logger.ts:42+)**:

```typescript
Sentry.init({
  dsn: sentryDsn,
  debug: true, // ADD THIS
  environment: this.config?.environment || this.getEnvironment(),
```

**CI Workflow (release.yml)** - Remove DSN env vars and injection steps, keep source map uploads

## Expected Outcome

- Production builds will send Sentry events using the hardcoded DSN
- Debug logs will appear in console for both Electron main and Angular renderer
- No DSN environment variables needed in CI (only source map upload credentials)
- Simplified build process without DSN injection scripts
- Source maps still uploaded to Sentry using `SENTRY_AUTH_TOKEN` and `SENTRY_ORG`