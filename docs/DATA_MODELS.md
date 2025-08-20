
### 5. UI-Only Migration Preferences (Future Alignment)

The current UI includes preferences that are not yet part of the CLI `AppConfig`. These are tracked in the Angular app for MVP ergonomics and can be mapped to CLI behavior through an adapter:

```typescript
export interface UiMigrationPreferences {
  migratePosts: boolean;
  migratePhotos: boolean;
  migrateVideos: boolean;
  migrateComments: boolean;
  maxItems: number | null; // 0/null = unlimited
}
```

Guidance:
- Treat these fields as UI hints; do not assume direct CLI support.
- When integrating with the CLI, filter content in the app or bridge layer based on these values.
- We will consider formalizing these options in the CLI in a future “Config-First Alignment” milestone.