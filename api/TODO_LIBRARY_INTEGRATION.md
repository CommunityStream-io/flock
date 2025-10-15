# TODO: Integration with @straiforos/instagramtobluesky Library

## Overview

The current Vercel API implementation uses custom processors for Instagram archive extraction and Bluesky migration. This should be refactored to use the actual `@straiforos/instagramtobluesky` library's processors and utilities to ensure consistency with the native desktop implementation and benefit from the library's proven logic.

## Current Status

**Files to Update:**
- `api/lib/instagram-processor.ts` - Custom Instagram processing (needs library integration)
- `api/lib/bluesky-migrator.ts` - Custom Bluesky migration (needs library integration)

**Current Approach:**
The current implementation reimplements the Instagram processing and Bluesky migration logic from scratch. This works but doesn't leverage the existing, tested library code.

## Required Changes

### 1. Instagram Archive Processing

**Library Exports to Use:**
```typescript
import { 
  InstagramMediaProcessor,
  MediaProcessResult,
  InstagramExportedPost,
  sortPostsByCreationTime,
  readJsonFile,
  decodeUTF8
} from '@straiforos/instagramtobluesky';
```

**Refactor `InstagramArchiveProcessor` to:**
1. Use `readJsonFile` utility for JSON parsing
2. Use `InstagramMediaProcessor` for media extraction
3. Use `sortPostsByCreationTime` for proper post ordering
4. Use `decodeUTF8` for text handling (Instagram uses UTF-8 encoding that may need special handling)
5. Return `MediaProcessResult[]` instead of custom types

**Example Integration:**
```typescript
export class InstagramArchiveProcessor {
  private processor: InstagramMediaProcessor;

  async extractAndProcessArchive(): Promise<MediaProcessResult[]> {
    // Extract archive to temp directory
    const extractPath = await this.extractToTempDir();
    
    // Use library's processor
    const processor = new InstagramMediaProcessor(extractPath);
    const posts = await processor.processArchive();
    
    // Sort by creation time
    const sortedPosts = sortPostsByCreationTime(posts);
    
    return sortedPosts;
  }
}
```

### 2. Bluesky Migration

**Library Exports to Use:**
```typescript
import { 
  BlueskyClient,
  uploadMediaAndEmbed,
  PostRecordImpl,
  createPostRecord
} from '@straiforos/instagramtobluesky';
```

**Refactor `BlueskyMigrator` to:**
1. Use `BlueskyClient` for authentication and API calls
2. Use `uploadMediaAndEmbed` for media uploads (handles rate limiting automatically)
3. Use `createPostRecord` for proper post formatting
4. Use `PostRecordImpl` type for type safety
5. Leverage library's built-in rate limiting and error recovery

**Example Integration:**
```typescript
export class BlueskyMigrator {
  private client: BlueskyClient;

  async authenticate(): Promise<void> {
    this.client = new BlueskyClient(
      this.credentials.username,
      this.credentials.password
    );
    await this.client.authenticate();
  }

  async migratePosts(posts: MediaProcessResult[]): Promise<MigrationResult> {
    for (const post of posts) {
      // Use library's upload and embed utilities
      const embed = await uploadMediaAndEmbed(
        this.client,
        post.mediaFiles
      );
      
      // Create post with proper formatting
      const record = createPostRecord(post.caption, embed, post.createdAt);
      await this.client.createPost(record);
      
      // Library handles rate limiting automatically
    }
  }
}
```

### 3. Type Safety

**Update TypeScript interfaces:**
```typescript
// api/migrate.ts
import { MediaProcessResult, PostRecordImpl } from '@straiforos/instagramtobluesky';

// Use proper types throughout
const posts: MediaProcessResult[] = await processor.extractAndProcessArchive();
const results = await migrator.migratePosts(posts);
```

### 4. Configuration Mapping

**Map Vercel config to library config:**
```typescript
import { AppConfig } from '@straiforos/instagramtobluesky';

// Convert API config to library config
const libConfig = AppConfig.fromObject({
  blueskyUsername: config.blueskyCredentials.username,
  blueskyPassword: config.blueskyCredentials.password,
  archiveFolder: extractPath,
  minDate: config.startDate ? new Date(config.startDate) : undefined,
  maxDate: config.endDate ? new Date(config.endDate) : undefined,
  simulate: config.simulate || false
});
```

## Benefits of Integration

1. **Consistency**: Same processing logic as native desktop app
2. **Proven Logic**: Library has been tested in production
3. **Maintenance**: Bug fixes in library automatically benefit Vercel implementation
4. **Features**: Access to all library features (simulation mode, date filtering, etc.)
5. **Type Safety**: Proper TypeScript types throughout
6. **Error Handling**: Library's robust error handling and recovery
7. **Rate Limiting**: Built-in rate limiting respects Bluesky API limits

## Implementation Steps

1. **Install Library Types** (if available):
   ```bash
   npm install --save-dev @types/@straiforos/instagramtobluesky
   ```

2. **Update Instagram Processor**:
   - Import library utilities
   - Refactor `extractAndProcessArchive` to use library
   - Update return types to `MediaProcessResult[]`
   - Test with sample archive

3. **Update Bluesky Migrator**:
   - Import `BlueskyClient` and utilities
   - Refactor authentication to use library
   - Refactor migration to use library's upload functions
   - Update return types

4. **Update API Handlers**:
   - Update type imports in `api/migrate.ts`
   - Update error handling to match library patterns
   - Test end-to-end flow

5. **Test Thoroughly**:
   - Test with real Instagram archives
   - Test with simulation mode
   - Test with date filtering
   - Test error scenarios

## Notes

- The library is designed to be used as a CLI but exports all necessary utilities
- The library handles file system operations, so some adaptation needed for serverless
- Consider extracting archives to `/tmp` directory in serverless environment
- Monitor memory usage when processing large archives in serverless functions
- Library's rate limiting is built-in, no need for custom delays

## References

- Native Implementation: `projects/flock-native/electron/ipc-handlers.js`
- CLI Integration Guide: `projects/flock-native/CLI_INTEGRATION.md`
- Library Package: `@straiforos/instagramtobluesky@^0.7.8`
- Shared Interfaces: `projects/shared/src/lib/services/interfaces/`

## Status

- [ ] Update Instagram processor to use library
- [ ] Update Bluesky migrator to use library
- [ ] Update type definitions
- [ ] Test with sample archive
- [ ] Test end-to-end flow
- [ ] Update documentation

---

*This TODO represents the path forward to properly integrate with the established library rather than maintaining custom implementations.*
