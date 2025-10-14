# 🔍 Sentry Error Tracking Setup

## Overview

Flock now includes comprehensive error tracking and monitoring using [Sentry](https://sentry.io). The implementation:

- ✅ **Privacy-first**: Automatically filters passwords and sensitive data
- ✅ **Environment-aware**: Works in development, staging, and production
- ✅ **Electron-compatible**: Supports both web and native apps
- ✅ **Breadcrumbs**: Tracks user actions leading to errors
- ✅ **Performance monitoring**: Captures performance metrics
- ✅ **Graceful degradation**: Works without Sentry DSN (console-only logging)

## Quick Start

### 1. Get Your Sentry DSN

1. Sign up for a free account at [sentry.io](https://sentry.io)
2. Create a new Angular project
3. Copy your DSN (looks like: `https://xxx@xxx.ingest.sentry.io/xxx`)

### 2. Configure DSN

#### For Development (Local):
Create a `.env` file in the project root:

```bash
SENTRY_DSN=https://your-dsn-here@sentry.io/project-id
```

#### For Production (Environment Variable):
Set the environment variable on your deployment platform:

```bash
export SENTRY_DSN="https://your-dsn-here@sentry.io/project-id"
```

#### For Browser Apps (Runtime Config):
Add to your `index.html` before Angular loads:

```html
<script>
  window.SENTRY_DSN = 'https://your-dsn-here@sentry.io/project-id';
</script>
```

### 3. Initialize in Your App

The logger is already wired up, but you need to initialize it in your app:

**For flock-native:**
```typescript
// projects/flock-native/src/main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { inject } from '@angular/core';
import { Logger, LOGGER } from 'shared';

bootstrapApplication(AppComponent, appConfig)
  .then(ref => {
    const logger = ref.injector.get<Logger>(LOGGER);
    logger.instrument('flock-native');
  })
  .catch(err => console.error(err));
```

**For flock-mirage:**
```typescript
// projects/flock-mirage/src/main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { Logger, LOGGER } from 'shared';

bootstrapApplication(AppComponent, appConfig)
  .then(ref => {
    const logger = ref.injector.get<Logger>(LOGGER);
    logger.instrument('flock-mirage');
  })
  .catch(err => console.error(err));
```

## Features

### 1. Automatic Error Tracking

All errors logged via the Logger service are automatically sent to Sentry:

```typescript
// This will create a Sentry error event
logger.error('Migration failed', { reason: 'Network timeout' });
```

### 2. Breadcrumbs

User actions are tracked as breadcrumbs, visible when viewing errors:

```typescript
logger.log('User selected file', { filename: 'archive.zip' });
logger.workflow('Starting extraction');
// ... error occurs ...
// Sentry will show the full trail of actions leading to the error
```

### 3. Privacy Protection

The implementation automatically filters sensitive data:

```typescript
// Password and username are automatically stripped from Sentry events
env.BLUESKY_PASSWORD = 'secret123';  // ❌ Removed before sending
env.BLUESKY_USERNAME = 'user';       // ❌ Removed before sending
env.ARCHIVE_FOLDER = '/path/to/archive';  // ✅ Sent to Sentry
```

### 4. Performance Monitoring

Sentry automatically tracks:
- Page load times
- HTTP request durations
- Component render times

Sample rates:
- **Development**: 100% of transactions
- **Production**: 10% of transactions (to reduce costs)

### 5. Environment Detection

The logger automatically detects the environment:

- **electron**: When running in Electron
- **development**: When running on localhost
- **staging**: When hostname contains "staging"
- **production**: All other hostnames

### 6. Ignored Errors

Common noise is filtered out:

- Browser extension errors
- Network errors (user offline, etc.)
- Expected navigation errors
- Third-party plugin errors

## Usage Examples

### Basic Logging

```typescript
import { inject } from '@angular/core';
import { Logger, LOGGER } from 'shared';

export class MyComponent {
  private logger = inject<Logger>(LOGGER);

  doSomething() {
    this.logger.log('User clicked button');
    
    try {
      // ... some operation
    } catch (error) {
      this.logger.error('Operation failed', error);
    }
  }
}
```

### Workflow Tracking

```typescript
this.logger.workflow('Migration started');
this.logger.log('Extracting archive...');
this.logger.log('Processing 100 posts');
this.logger.workflow('Migration completed');
```

### Warnings

```typescript
if (postCount > 1000) {
  this.logger.warn('Large number of posts detected', { postCount });
}
```

## Testing

### Without Sentry DSN (Development)

The logger works fine without a Sentry DSN - it just logs to console:

```
🔍 [SentryLogger] No Sentry DSN found, logging will be console-only
🦅 LOG: User selected file { filename: 'archive.zip' }
❌ ERROR: Operation failed Error: Network timeout
```

### With Sentry DSN

When configured, you'll see:

```
✅ [SentryLogger] Initialized for flock-native in development environment
🦅 LOG: User selected file { filename: 'archive.zip' }
[Sentry] Event sent successfully
```

## Viewing Errors in Sentry

1. Log in to your Sentry dashboard
2. Navigate to your project
3. View **Issues** to see captured errors
4. Click an error to see:
   - Full stack trace
   - Breadcrumbs (user actions)
   - Environment info
   - Release version
   - User count

## Cost Management

Sentry has a free tier with limits:

- **Free tier**: 5,000 events/month
- **Developer tier**: $26/month for 50,000 events

### Reducing Costs:

1. **Lower sample rate** in production (already set to 10%)
2. **Add more ignored errors** to filter noise
3. **Use source maps** to get readable stack traces without overhead

## Advanced Configuration

### Source Maps

To get readable stack traces in production, configure source maps in `angular.json`:

```json
{
  "configurations": {
    "production": {
      "sourceMap": {
        "scripts": true,
        "styles": false,
        "vendor": false
      }
    }
  }
}
```

Then upload source maps to Sentry:

```bash
npm install --save-dev @sentry/cli
npx sentry-cli upload-sourcemaps --org your-org --project your-project dist/
```

### Custom Context

Add custom context to errors:

```typescript
import * as Sentry from '@sentry/angular';

// Set user context
Sentry.setUser({ id: 'user123', email: 'user@example.com' });

// Set custom tags
Sentry.setTag('migration_type', 'instagram_to_bluesky');

// Set custom context
Sentry.setContext('migration', {
  postCount: 100,
  dateRange: '2024-01-01 to 2024-12-31'
});
```

## Troubleshooting

### "Sentry not sending events"

1. Check your DSN is correct
2. Verify network access to sentry.io
3. Check browser console for Sentry errors
4. Verify environment is not 'development' (may have different rate limits)

### "Too many events"

1. Increase `ignoreErrors` patterns
2. Lower `tracesSampleRate`
3. Add more filters in `beforeSend`

### "Source maps not working"

1. Ensure source maps are enabled in build
2. Upload source maps to Sentry
3. Verify release version matches

## Security

### What's Sent to Sentry:

✅ Error messages and stack traces
✅ Breadcrumbs (user actions)
✅ Environment (dev/staging/production)
✅ Platform (web/electron)
✅ Release version

❌ Passwords (filtered)
❌ Auth tokens (filtered)
❌ Usernames (filtered)
❌ Personal file paths (can be configured)

### Compliance

- **GDPR**: You can configure Sentry to be GDPR-compliant
- **Data residency**: Choose EU region when creating project
- **User consent**: Can disable Sentry based on user preferences

## Next Steps

1. Sign up for Sentry account
2. Get your DSN
3. Add to environment variables
4. Initialize in your app
5. Test by triggering an error
6. View in Sentry dashboard

For more advanced configuration, see the [Sentry Angular docs](https://docs.sentry.io/platforms/javascript/guides/angular/).

