import { Injectable, signal, inject } from '@angular/core';
import { MigrationService, Config, BLUESKY } from 'shared';
import { ApiService } from '../../services/api.service';
import { MurmurFileProcessor } from '../murmur-file-processor/murmur-file-processor';
import { MurmurBluesky } from '../bluesky/bluesky';

/**
 * Murmur Migration Service
 * Handles migration via Vercel API with real-time progress tracking
 */
@Injectable({
  providedIn: 'root'
})
export class MurmurMigration implements MigrationService {
  private apiService = inject(ApiService);
  private fileProcessor = inject(MurmurFileProcessor);
  private blueskyService = inject(MurmurBluesky);
  private config = inject(Config);

  public percentComplete = signal(0);
  public currentOperation = signal('');
  public elapsedSeconds = signal(0);
  public lastResult: { count: number; elapsedMs: number } | null = null;

  private progressInterval: any = null;
  private startTime = 0;

  reset(): void {
    this.percentComplete.set(0);
    this.currentOperation.set('');
    this.elapsedSeconds.set(0);
    this.lastResult = null;
    
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }
  }

  /**
   * Run migration via Vercel API
   * Polls for progress until complete
   */
  async run(simulate: boolean): Promise<{ count: number; elapsedMs: number }> {
    this.reset();
    this.startTime = Date.now();

    const sessionId = this.fileProcessor.getSessionId();
    if (!sessionId) {
      throw new Error('No archive uploaded. Please upload an Instagram archive first.');
    }

    const credentials = this.blueskyService.getCredentials?.();
    if (!credentials) {
      throw new Error('No credentials available. Please authenticate with Bluesky first.');
    }

    try {
      // Start migration
      this.currentOperation.set(simulate ? 'Starting dry run...' : 'Starting migration...');
      this.percentComplete.set(0);

      const migrationConfig = {
        blueskyCredentials: credentials,
        simulate,
        startDate: this.config.minDate(),
        endDate: this.config.maxDate(),
        stopOnError: false
      };

      // Set session ID in BlueskyService for progress tracking
      this.blueskyService.setSessionId(sessionId);

      // Start the migration (fire and forget - it runs in background)
      this.apiService.startMigration(sessionId, migrationConfig).subscribe({
        error: (error) => {
          console.error('Failed to start migration:', error);
          this.currentOperation.set('Failed to start migration');
          throw new Error(`Migration start failed: ${error.message || 'Unknown error'}`);
        }
      });

      // Poll for progress
      await this.pollProgress();

      // Return final results
      return this.lastResult || { count: 0, elapsedMs: Date.now() - this.startTime };
    } catch (error: any) {
      console.error('Migration error:', error);
      this.currentOperation.set(`Error: ${error.message}`);
      throw error;
    } finally {
      if (this.progressInterval) {
        clearInterval(this.progressInterval);
        this.progressInterval = null;
      }
    }
  }

  /**
   * Poll Vercel API for migration progress
   */
  private async pollProgress(): Promise<void> {
    return new Promise((resolve, reject) => {
      let errorCount = 0;
      const maxErrors = 5;

      this.progressInterval = setInterval(async () => {
        try {
          const progress = await this.blueskyService.getProgress();
          
          if (!progress) {
            // No progress data yet, keep waiting
            return;
          }

          // Reset error count on successful fetch
          errorCount = 0;

          // Update signals
          this.percentComplete.set(progress.percentage || 0);
          this.currentOperation.set(progress.message || 'Processing...');
          this.elapsedSeconds.set(Math.floor((Date.now() - this.startTime) / 1000));

          // Check status
          if (progress.status === 'complete') {
            clearInterval(this.progressInterval);
            this.progressInterval = null;
            
            this.lastResult = {
              count: progress.results?.postsImported || 0,
              elapsedMs: Date.now() - this.startTime
            };
            
            this.currentOperation.set('Migration completed successfully');
            resolve();
          } else if (progress.status === 'error') {
            clearInterval(this.progressInterval);
            this.progressInterval = null;
            
            const errorMessage = progress.error || 'Migration failed';
            this.currentOperation.set(`Error: ${errorMessage}`);
            reject(new Error(errorMessage));
          }
        } catch (error: any) {
          console.error('Error fetching progress:', error);
          errorCount++;
          
          if (errorCount >= maxErrors) {
            clearInterval(this.progressInterval);
            this.progressInterval = null;
            
            this.currentOperation.set('Failed to fetch progress');
            reject(new Error('Lost connection to migration process'));
          }
        }
      }, 2000); // Poll every 2 seconds
    });
  }

  /**
   * Get current migration status
   */
  getStatus() {
    return {
      percentComplete: this.percentComplete(),
      currentOperation: this.currentOperation(),
      elapsedSeconds: this.elapsedSeconds()
    };
  }
}

