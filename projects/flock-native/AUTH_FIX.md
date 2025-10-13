# 🔐 Authentication Fix - @ Prefix Issue

## Problem

When running with `SIMULATE: false`, authentication failed with:
```
XRPCError: Invalid identifier or password
```

The logs showed:
```
username: "@insta-migrate-test.bsky.social"
```

## Root Cause

**AT Protocol expects usernames WITHOUT the @ prefix for authentication.**

### User Flow
1. User enters: `@user.bsky.social` (with @, for better UX)
2. Validation checks for @ prefix ✅
3. **But**: AT Protocol's `agent.login()` expects: `user.bsky.social` (without @)

### The Issue

We were passing the username with `@` directly to the CLI:
```typescript
const env = {
  BLUESKY_USERNAME: '@user.bsky.social',  // ❌ Wrong!
  // ...
}
```

The Bluesky AT Protocol client then tried to authenticate with `@user.bsky.social` instead of `user.bsky.social`, causing authentication to fail.

## Solution

Strip the @ prefix before passing to the CLI:

```typescript
// In CLIService.executeMigration()
const username = options.blueskyHandle.startsWith('@') 
  ? options.blueskyHandle.substring(1) 
  : options.blueskyHandle;

const env = {
  BLUESKY_USERNAME: username,  // ✅ Correct! Without @
  // ...
}
```

### Why Keep @ in the UI?

- **Better UX**: Users are familiar with `@username.bsky.social` format
- **Validation**: The @ prefix helps validate correct format
- **Consistency**: Matches how Bluesky displays usernames

## Code Changes

### 1. CLIService (projects/flock-native/src/app/service/cli.service.ts)

**Before:**
```typescript
const env: Record<string, string> = {
  BLUESKY_USERNAME: options.blueskyHandle,
  // ...
};
```

**After:**
```typescript
// Strip @ prefix from username if present
// AT Protocol expects identifier without @ prefix
const username = options.blueskyHandle.startsWith('@') 
  ? options.blueskyHandle.substring(1) 
  : options.blueskyHandle;

this.log('Username for auth:', username, '(@ prefix stripped)');

const env: Record<string, string> = {
  BLUESKY_USERNAME: username,
  // ...
};
```

### 2. Documentation Updates

- **CLI_INTEGRATION.md**: Added notes about @ prefix stripping
- **Environment Variable Mapping**: Added "@ prefix stripped" note
- **Security Notes**: Mentioned AT Protocol compatibility

## Testing

### Before Fix
```bash
# With @user.bsky.social
CLI stdout: username: "@insta-migrate-test.bsky.social"
CLI stdout: SIMULATE: false
CLI stderr: XRPCError: Invalid identifier or password
CLI process exited with code 1  ❌
```

### After Fix
```bash
# Same input, but @ stripped internally
CLI stdout: username: "insta-migrate-test.bsky.social"  ✅
CLI stdout: SIMULATE: false
CLI stdout: Import started at 2025-10-12T...
CLI stdout: Imported 397 posts with 499 media
CLI process exited with code 0  ✅
```

## Related Files

- `projects/flock-native/src/app/service/cli.service.ts` - Fix applied here
- `projects/flock-native/src/app/service/bluesky.ts` - Validation still requires @
- `projects/flock-native/CLI_INTEGRATION.md` - Documentation updated

## Key Takeaway

**UI Format ≠ API Format**

- **UI/UX Layer**: Use `@user.bsky.social` (familiar to users)
- **API Layer**: Use `user.bsky.social` (AT Protocol requirement)
- **Transform at boundary**: Strip @ when calling external APIs

This is a common pattern when the user-facing format differs from the API's expected format.

---

**🔐 Auth Now Working!** | **@ Prefix Stripped** | **Real Migration Ready**

