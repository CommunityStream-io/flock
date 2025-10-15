# Flock Murmur - Routes and Services Guide

## 🗺️ Application Routes

Flock Murmur implements a complete migration workflow with the following routes:

### Main Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/home` | LandingPage | Welcome page with app introduction |
| `/licenses` | Licenses | Open source licenses and attributions |
| `/support` | Support | Support and donation information |

### Migration Workflow Routes

All migration steps are under `/step` path:

| Route | Component | Guards/Resolvers | Description |
|-------|-----------|------------------|-------------|
| `/step/upload` | Upload | `uploadValidGuard` (canDeactivate) | Upload Instagram archive to Vercel |
| `/step/auth` | Auth | `authDeactivateGuard`, `migrationResetResolver` | Authenticate with Bluesky |
| `/step/config` | Config | `authValidGuard`, `migrationResetResolver` | Configure migration settings |
| `/step/migrate` | Migrate | `authValidGuard`, `migrateRunResolver` | Run migration process |
| `/step/complete` | Complete | `authValidGuard` | View migration results |

### Route Guards

- **uploadValidGuard**: Ensures valid file is uploaded before leaving upload step
- **authValidGuard**: Ensures user is authenticated before accessing protected routes
- **authDeactivateGuard**: Handles cleanup when leaving auth step

### Route Resolvers

- **migrationResetResolver**: Resets migration state when re-entering workflow
- **migrateRunResolver**: Initializes migration process via Vercel API

## 🔧 Services

### File Processor Service (`MurmurFileProcessor`)

Handles file uploads to Vercel serverless API:

```typescript
class MurmurFileProcessor {
  validateArchive(path: string): Promise<ValidationResult>
  processArchive(file: File): Promise<{ sessionId: string }>
  getSessionId(): string | null
}
```

**Key Features:**
- Client-side validation
- Uploads to `/api/upload` endpoint
- Returns session ID for tracking
- Integrates with Vercel KV storage

### Bluesky Service (`MurmurBluesky`)

Handles Bluesky operations via Vercel API:

```typescript
class MurmurBluesky {
  setSessionId(sessionId: string): void
  startMigration(config: any): Promise<void>
  getProgress(): Promise<any>
  authenticate(credentials: object): Promise<boolean>
}
```

**Key Features:**
- Server-side authentication via API
- Calls `/api/migrate` for migration
- Polls `/api/progress` for status updates
- No direct Bluesky API calls from client

### Logger Service (`ConsoleLogger`)

Browser console logging with prefixes:

```typescript
class ConsoleLogger {
  log(message: string, ...args: any[]): void
  error(message: string, ...args: any[]): void
  warn(message: string, ...args: any[]): void
  debug(message: string, ...args: any[]): void  // Dev only
}
```

### API Service (`ApiService`)

HTTP client for Vercel API endpoints:

```typescript
class ApiService {
  uploadArchive(file: File): Observable<UploadResponse>
  startMigration(sessionId: string, config: object): Observable<MigrationResponse>
  getProgress(sessionId: string): Observable<ProgressResponse>
}
```

## 📊 Vercel Analytics & Monitoring

### Vercel Analytics

Automatically tracks page views and user interactions:

- **Installation**: Added via `@vercel/analytics` package
- **Initialization**: Injected in `main.ts`
- **Configuration**: Enabled in `vercel.json`
- **Dashboard**: View metrics in Vercel dashboard

**Tracked Events:**
- Page views
- Route transitions
- User interactions
- Custom events (can be added)

### Vercel Speed Insights

Monitors application performance:

- **Installation**: Added via `@vercel/speed-insights` package
- **Initialization**: Injected in `main.ts`
- **Metrics Tracked**:
  - First Contentful Paint (FCP)
  - Largest Contentful Paint (LCP)
  - First Input Delay (FID)
  - Cumulative Layout Shift (CLS)
  - Time to First Byte (TTFB)

### Logging

Comprehensive logging throughout API functions:

**Upload Endpoint (`/api/upload`):**
- Upload start/completion
- File size and metadata
- Session ID generation
- Error tracking

**Migrate Endpoint (`/api/migrate`):**
- Migration initialization
- Archive processing steps
- Post migration progress
- Authentication events
- Errors and failures

**Progress Endpoint (`/api/progress`):**
- Progress checks
- Status updates
- Session validation

**Log Format:**
```typescript
console.log('[ServiceName] Message', {
  key: 'value',
  timestamp: new Date().toISOString()
});
```

### Vercel KV Storage

Used for large archive handling:

**Storage Keys:**
- `upload:{sessionId}` - Upload metadata (1 hour TTL)
- `upload:data:{sessionId}` - Base64 encoded archive (1 hour TTL)
- `progress:{sessionId}` - Migration progress (2 hours TTL)

**Benefits for Large Archives:**
- Handles files up to 500MB
- Automatic expiration
- Fast access times
- Serverless-optimized

## 🚀 Usage Examples

### Route Navigation

```typescript
// From component or service
import { Router } from '@angular/router';

constructor(private router: Router) {}

// Navigate to upload step
this.router.navigate(['/step/upload']);

// Navigate with query params
this.router.navigate(['/step/config'], {
  queryParams: { mode: 'advanced' }
});
```

### Using Services

```typescript
// File upload
constructor(private fileProcessor: MurmurFileProcessor) {}

async uploadFile(file: File) {
  const result = await this.fileProcessor.processArchive(file);
  console.log('Session ID:', result.sessionId);
}

// Start migration
constructor(private bluesky: MurmurBluesky) {}

async migrate(config: MigrationConfig) {
  this.bluesky.setSessionId(this.sessionId);
  await this.bluesky.startMigration(config);
  
  // Poll for progress
  const progress = await this.bluesky.getProgress();
  console.log('Progress:', progress);
}
```

### Custom Analytics Events

```typescript
import { track } from '@vercel/analytics';

// Track custom event
track('migration_started', {
  archiveSize: file.size,
  postCount: totalPosts
});

track('migration_completed', {
  duration: elapsedTime,
  postsImported: successCount
});
```

## 🔒 Security Considerations

### Client-Side
- No Bluesky credentials stored in browser
- Session-based tracking
- HTTPS-only in production
- CORS properly configured

### Server-Side
- Credentials only used in Vercel functions
- Automatic session expiration
- Rate limiting on Bluesky API
- Input validation on all endpoints

## 📝 Configuration

### Development

```typescript
// environment.ts
{
  apiBaseUrl: 'http://localhost:3000/api',
  vercelAnalytics: false,
  enableTestModes: true
}
```

### Production

```typescript
// environment.prod.ts
{
  apiBaseUrl: '/api',
  vercelAnalytics: true,
  enableTestModes: false
}
```

## 🎯 Best Practices

1. **Always check session ID** before API calls
2. **Poll progress** every 2-3 seconds during migration
3. **Handle timeouts** gracefully (free tier: 300s limit)
4. **Show memory warnings** for large archives (free tier: 2048MB limit)
5. **Log important events** for debugging
6. **Use analytics** to track user behavior
7. **Monitor performance** with Speed Insights

---

*Comprehensive routing and services for cloud-based migration! 🌊✨*
