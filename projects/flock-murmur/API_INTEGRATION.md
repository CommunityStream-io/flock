# Flock Murmur - API Integration (DEPRECATED)

## ⚠️ Status: DEPRECATED

This documentation is deprecated as Vercel dependencies have been removed from flock-murmur. The API integration described here is no longer functional.

## Overview

The API integration described in this document was designed for Vercel serverless functions, which have been removed. The Angular application is now prepared for future backend integration with DigitalOcean App Platform or similar services.

## Next Steps

- Design new backend architecture for DigitalOcean App Platform
- Implement replacement API endpoints
- Update Angular services to work with new backend
- Create new API integration documentation

## Legacy Information (For Reference Only)

The following sections describe the previous Vercel-based implementation:

### API Service Usage

The `ApiService` previously provided methods to interact with Vercel edge functions for Instagram to Bluesky migration.

### Import the Service

```typescript
import { ApiService } from './services/api.service';

export class MyComponent {
  constructor(private apiService: ApiService) {}
}
```

### Upload Archive

```typescript
uploadFile(file: File) {
  this.apiService.uploadArchive(file).subscribe({
    next: (response) => {
      console.log('Upload successful:', response);
      this.sessionId = response.sessionId;
      // Store sessionId for later use
    },
    error: (error) => {
      console.error('Upload failed:', error);
    }
  });
}
```

### Start Migration

```typescript
startMigration() {
  const config = {
    blueskyCredentials: {
      username: 'user.bsky.social',
      password: 'app-password'
    },
    simulate: false,
    startDate: '2023-01-01',
    endDate: '2024-12-31'
  };

  this.apiService.startMigration(this.sessionId, config).subscribe({
    next: (response) => {
      console.log('Migration complete:', response.results);
    },
    error: (error) => {
      console.error('Migration failed:', error);
    }
  });
}
```

### Track Progress

```typescript
trackProgress() {
  const interval = setInterval(() => {
    this.apiService.getProgress(this.sessionId).subscribe({
      next: (response) => {
        console.log('Progress:', response.progress);
        this.updateUI(response.progress);

        if (response.progress.status === 'complete' || 
            response.progress.status === 'error') {
          clearInterval(interval);
        }
      },
      error: (error) => {
        console.error('Progress check failed:', error);
        clearInterval(interval);
      }
    });
  }, 2000); // Check every 2 seconds
}
```

---

*This documentation is maintained for historical reference only.*

@Component({
  selector: 'app-migration',
  template: `
    <div>
      <input type="file" (change)="onFileSelect($event)" accept=".zip">
      <button (click)="startMigration()" [disabled]="!sessionId">
        Start Migration
      </button>
      
      <div *ngIf="progress">
        <p>{{ progress.message }}</p>
        <progress [value]="progress.percentage" max="100"></progress>
      </div>
      
      <div *ngIf="results">
        <h3>Migration Complete!</h3>
        <p>Posts imported: {{ results.postsImported }}</p>
        <p>Media count: {{ results.mediaCount }}</p>
        <p>Duration: {{ results.duration }}</p>
      </div>
    </div>
  `
})
export class MigrationComponent {
  sessionId: string = '';
  progress: any = null;
  results: any = null;

  constructor(private apiService: ApiService) {}

  onFileSelect(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.uploadFile(file);
    }
  }

  uploadFile(file: File) {
    this.apiService.uploadArchive(file).subscribe({
      next: (response) => {
        this.sessionId = response.sessionId;
        console.log('Upload successful:', response);
      },
      error: (error) => {
        console.error('Upload failed:', error);
        alert('Upload failed: ' + error.message);
      }
    });
  }

  startMigration() {
    const config = {
      blueskyCredentials: {
        username: prompt('Bluesky username:') || '',
        password: prompt('Bluesky app password:') || ''
      },
      simulate: false
    };

    // Start migration
    this.apiService.startMigration(this.sessionId, config).subscribe({
      next: (response) => {
        this.results = response.results;
        console.log('Migration complete:', response);
      },
      error: (error) => {
        console.error('Migration failed:', error);
        alert('Migration failed: ' + error.message);
      }
    });

    // Track progress
    this.trackProgress();
  }

  trackProgress() {
    const interval = setInterval(() => {
      this.apiService.getProgress(this.sessionId).subscribe({
        next: (response) => {
          this.progress = response.progress;

          if (response.progress.status === 'complete') {
            clearInterval(interval);
            this.results = response.progress.results;
          } else if (response.progress.status === 'error') {
            clearInterval(interval);
            alert('Migration error: ' + response.progress.error);
          }
        },
        error: (error) => {
          console.error('Progress check failed:', error);
          clearInterval(interval);
        }
      });
    }, 2000);
  }
}
```

## Error Handling

Always handle errors appropriately:

```typescript
this.apiService.uploadArchive(file).subscribe({
  next: (response) => {
    // Success handling
  },
  error: (error) => {
    if (error.status === 413) {
      // File too large
      alert('File is too large. Maximum size is 500MB.');
    } else if (error.status === 404) {
      // Session not found
      alert('Session expired. Please upload again.');
    } else {
      // Generic error
      alert('An error occurred: ' + error.message);
    }
  }
});
```

## Configuration Options

### Migration Config

```typescript
interface MigrationConfig {
  blueskyCredentials: {
    username: string;  // Bluesky username (e.g., user.bsky.social)
    password: string;  // App password (NOT your account password)
  };
  simulate?: boolean;     // Test mode (default: false)
  startDate?: string;     // Filter posts after this date (ISO format)
  endDate?: string;       // Filter posts before this date (ISO format)
  stopOnError?: boolean;  // Stop migration on first error (default: false)
}
```

## Progress Tracking

The progress object provides real-time updates:

```typescript
interface Progress {
  status: 'starting' | 'processing' | 'complete' | 'error';
  phase: string;          // Current phase (extraction, migration, etc.)
  message: string;        // User-friendly progress message
  percentage: number;     // Progress percentage (0-100)
  currentPost?: number;   // Current post being processed
  totalPosts?: number;    // Total posts to process
  updatedAt: string;      // Last update timestamp
  results?: {             // Available when complete
    postsImported: number;
    postsFailed: number;
    mediaCount: number;
    duration: string;
  };
  error?: string;         // Error message if status is 'error'
}
```
