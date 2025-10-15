# Using Sentry with Angular Environments

## Setup

### 1. Configure Environment Files

**`environment.ts` (development):**
```typescript
export const environment = {
  production: false,
  sentry: {
    dsn: null, // or your dev DSN
    environment: 'development',
    tracesSampleRate: 1.0
  }
};
```

**`environment.prod.ts` (production):**
```typescript
export const environment = {
  production: true,
  sentry: {
    dsn: null, // Will be replaced during CI build
    environment: 'production',
    tracesSampleRate: 0.1
  }
};
```

### 2. Initialize in Your App

**`main.ts`:**
```typescript
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { Logger, LOGGER } from 'shared';
import { environment } from './environments/environment';

bootstrapApplication(AppComponent, appConfig)
  .then(ref => {
    const logger = ref.injector.get<Logger>(LOGGER);
    
    // Pass environment.sentry config
    logger.instrument('flock-mirage', environment.sentry);
  })
  .catch(err => console.error(err));
```

### 3. Set GitHub Secrets

In your GitHub repository settings:

1. Go to Settings → Secrets and variables → Actions
2. Add secrets:
   - `MIRAGE_SENTRY_DSN` - For flock-mirage
   - `NATIVE_SENTRY_DSN` - For flock-native
   - `SENTRY_DSN` - For flock-murmur

### 4. CI Will Inject at Build Time

The CI workflow already has the environment variables set:

```yaml
env:
  SENTRY_DSN: ${{ secrets.SENTRY_DSN }}
  MIRAGE_SENTRY_DSN: ${{ secrets.MIRAGE_SENTRY_DSN }}
  NATIVE_SENTRY_DSN: ${{ secrets.NATIVE_SENTRY_DSN }}
```

## Usage in Components

```typescript
import { inject } from '@angular/core';
import { Logger, LOGGER } from 'shared';

export class MyComponent {
  private logger = inject<Logger>(LOGGER);

  doSomething() {
    this.logger.log('User action');
    
    try {
      // ... code
    } catch (error) {
      this.logger.error('Operation failed', error);
    }
  }
}
```

## Configuration Options

```typescript
export interface SentryConfig {
  dsn: string | null;           // Sentry DSN
  environment?: string;          // 'development', 'production', etc.
  tracesSampleRate?: number;     // 0.0 to 1.0
}
```

## Benefits

✅ Type-safe configuration  
✅ Environment-specific settings  
✅ CI/CD integration  
✅ No hardcoded secrets  
✅ Easy to override per environment

