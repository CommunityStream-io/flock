import { Injectable, signal, inject } from '@angular/core';
import { 
  MigrationService, 
  ConfigService,
  CONFIG,
  BLUESKY,
  FILE_PROCESSOR
} from 'shared';
import { ApiService } from '../../services';
import { WebFileService, WebBlueSkyService } from '../interfaces';

/**
 * Murmur Migration Service
 * Handles migration via Vercel API with real-time progress tracking
 * 
 * Uses injection tokens with web-specific type casting for platform features
 */
@Injectable({
  providedIn: 'root'
})
export class MurmurMigration implements MigrationService {
  private apiService = inject(ApiService);
  private fileProcessor = inject<WebFileService>(FILE_PROCESSOR);
  private blueskyService = inject<WebBlueSkyService>(BLUESKY);
  private config = inject<ConfigService>(CONFIG);

  public percentComplete = signal(0);
  public currentOperation = signal('');
  public elapsedSeconds = signal(0);
  public lastResult: { count: number; elapsedMs: number } | null = null;

  private progressInterval: any = null;
  private startTime = 0;
  private sessionId: string | null = null;

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

    // Get session ID from web file processor
    if (!this.sessionId) {
      this.sessionId = this.fileProcessor.getSessionId();
      
      if (!this.sessionId) {
        throw new Error('No archive uploaded. Please upload an Instagram archive first.');
      }
    }

    // Get credentials from ConfigService (interface-compliant)
    const credentials = this.config.blueskyCredentials;
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
        startDate: this.config.startDate || undefined,
        endDate: this.config.endDate || undefined,
        stopOnError: false
      };

      // Start the migration (fire and forget - it runs in background)
      this.apiService.startMigration(this.sessionId!, migrationConfig).subscribe({
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
          // Get progress directly from API
          const result = await this.apiService.getProgress(this.sessionId!).toPromise();
          const progress = result?.progress || null;
          
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

