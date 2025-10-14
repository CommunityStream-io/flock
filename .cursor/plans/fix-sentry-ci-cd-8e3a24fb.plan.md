<!-- 8e3a24fb-4bdb-41d2-bcd3-35fb413086fa eacd93e4-9b96-4e4c-bd63-8af9d656e0ff -->
# Sentry CI/CD Implementation Fix

## Critical Issue: Electron Sentry Package Loading Failure

**Root Cause**: `@sentry/electron` has native modules that fail to load when packaged in the asar archive. The package needs to be unpacked for the exe to access it.

## Implementation Strategy

### 1. Fix Electron Packaging (Critical)

**File**: `package.json` - electron-builder config

Add `@sentry/electron` to `asarUnpack` array:

```json
"asarUnpack": [
  "**/node_modules/@straiforos/instagramtobluesky/**",
  "**/node_modules/@ffprobe-installer/**",
  "**/node_modules/@sentry/**",
  "**/projects/flock-native/transfer/**"
]
```

This ensures Sentry's native modules are extracted and accessible in the packaged exe.

### 2. Environment File Structure

Create separate DSN configs for each app:

**Three Sentry Projects**:

- `flock-native-renderer` (Angular app in Electron)
- `flock-native-main` (Electron main process)
- `flock-mirage` (Web app)

**Environment Files**:

- `projects/flock-native/src/environments/environment.ts` - Dev DSN (safe to commit)
- `projects/flock-native/src/environments/environment.prod.ts` - Placeholder (replaced at build)
- `projects/flock-mirage/src/environments/environment.ts` - Dev DSN
- `projects/flock-mirage/src/environments/environment.prod.ts` - Placeholder

### 3. Build-Time DSN Injection

**File**: `angular.json`

Add file replacements for production builds in both projects:

```json
"configurations": {
  "production": {
    "fileReplacements": [
      {
        "replace": "projects/flock-native/src/environments/environment.ts",
        "with": "projects/flock-native/src/environments/environment.prod.ts"
      }
    ]
  }
}
```

**File**: `projects/flock-native/src/environments/environment.prod.ts`

Use build-time environment variable replacement (via CI):

```typescript
export const environment: Environment = {
  production: true,
  sentry: {
    dsn: '${NATIVE_SENTRY_DSN}',
    environment: 'production',
    tracesSampleRate: 0.1
  }
};
```

### 4. Electron Main Process DSN

**File**: `projects/flock-native/electron/main.js`

Update to support both dev and prod DSNs:

```javascript
const sentryDsn = process.env.NATIVE_SENTRY_DSN_MAIN 
  || (app.isPackaged ? null : 'https://dev-dsn@sentry.io/dev-project');
```

### 5. CI/CD Integration

**File**: `.github/workflows/ci.yml`

Update build job environment variables:

```yaml
env:
  NATIVE_SENTRY_DSN: ${{ secrets.NATIVE_SENTRY_DSN }}
  NATIVE_SENTRY_DSN_MAIN: ${{ secrets.NATIVE_SENTRY_DSN_MAIN }}
  MIRAGE_SENTRY_DSN: ${{ secrets.MIRAGE_SENTRY_DSN }}
  SENTRY_AUTH_TOKEN: ${{ secrets.SENTRY_AUTH_TOKEN }}
  SENTRY_ORG: ${{ secrets.SENTRY_ORG }}
```

Add pre-build step for string replacement:

```yaml
- name: Inject Sentry DSNs
  run: |
    node scripts/inject-sentry-dsn.js
```

### 6. Source Map Upload

**New File**: `scripts/upload-sourcemaps.js`

Create script to upload source maps to all three Sentry projects after build.

**Add to package.json scripts**:

```json
"sentry:upload:native": "sentry-cli sourcemaps upload --org $SENTRY_ORG --project flock-native-renderer dist/flock-native/browser/",
"sentry:upload:mirage": "sentry-cli sourcemaps upload --org $SENTRY_ORG --project flock-mirage dist/flock-mirage/browser/",
"sentry:upload:all": "npm run sentry:upload:native && npm run sentry:upload:mirage"
```

**Update CI build step**:

```yaml
- name: Upload Source Maps to Sentry
  if: github.ref == 'refs/heads/main'
  run: npm run sentry:upload:all
```

### 7. Enable Source Maps in Production

**File**: `angular.json`

Update production config for both projects:

```json
"production": {
  "sourceMap": {
    "scripts": true,
    "styles": false,
    "hidden": true
  }
}
```

### 8. Add Sentry CLI Dependency

**File**: `package.json`

```json
"devDependencies": {
  "@sentry/cli": "^2.30.0"
}
```

### 9. DSN Injection Script

**New File**: `scripts/inject-sentry-dsn.js`

Create script to replace `${NATIVE_SENTRY_DSN}` placeholders in built files with actual environment variable values.

### 10. Documentation Updates

**Update**: `docs/SENTRY_SETUP.md`

Add sections for:

- CI/CD setup instructions
- GitHub Secrets configuration
- Source map upload verification
- Troubleshooting packaged builds

### 11. Graceful Degradation

Ensure all Sentry initialization has proper error handling:

- Console-only logging when DSN is null/missing
- No crashes if Sentry fails to initialize
- Clear logging messages about Sentry status

## GitHub Secrets Required

Add these secrets to GitHub repository:

- `NATIVE_SENTRY_DSN` - Renderer process (Angular in Electron)
- `NATIVE_SENTRY_DSN_MAIN` - Main process (Electron)
- `MIRAGE_SENTRY_DSN` - Web app
- `SENTRY_AUTH_TOKEN` - For source map uploads
- `SENTRY_ORG` - Your Sentry organization slug

## Verification Steps

1. Build packaged exe - should initialize Sentry without errors
2. Trigger test error - should appear in Sentry dashboard
3. Check source maps - stack traces should be readable
4. Verify all three projects receive events separately
5. Test graceful degradation - works without DSN in dev

## Key Files Modified

- `package.json` - asarUnpack, scripts, dependencies
- `angular.json` - fileReplacements, sourceMap config
- `projects/flock-native/src/environments/*.ts` - DSN configs
- `projects/flock-mirage/src/environments/*.ts` - DSN configs
- `projects/flock-native/electron/main.js` - Dev/prod DSN logic
- `.github/workflows/ci.yml` - Environment variables, upload step
- `scripts/inject-sentry-dsn.js` - NEW
- `scripts/upload-sourcemaps.js` - NEW (optional, can use CLI directly)
- `docs/SENTRY_SETUP.md` - Updated documentation

### To-dos

- [ ] Add @sentry packages to asarUnpack in package.json electron-builder config
- [ ] Update all environment files with proper DSN structure for dev and prod
- [ ] Add fileReplacements to angular.json for build-time environment switching
- [ ] Enable source maps in production builds for both flock-native and flock-mirage
- [ ] Update Electron main.js with dev/prod DSN logic and proper error handling
- [ ] Create scripts/inject-sentry-dsn.js for build-time DSN replacement
- [ ] Add @sentry/cli to devDependencies and create upload scripts
- [ ] Update .github/workflows/ci.yml with Sentry env vars and source map upload
- [ ] Update SENTRY_SETUP.md with CI/CD instructions and GitHub Secrets setup
- [ ] Test packaged exe to verify Sentry loads and captures errors correctly