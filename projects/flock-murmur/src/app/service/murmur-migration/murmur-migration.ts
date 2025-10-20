import { Injectable, signal, inject } from '@angular/core';
import { 
  MigrationService, 
  ConfigService,
  CONFIG,
  BLUESKY,
  FILE_PROCESSOR
} from 'shared';
import { WebFileService, WebBlueSkyService } from '../interfaces';

/**
 * Murmur Migration Service
 * Handles migration preparation for future backend integration
 * 
 * Uses injection tokens with web-specific type casting for platform features
 */
@Injectable({
  providedIn: 'root'
})
export class MurmurMigration implements MigrationService {
  private fileProcessor = inject<WebFileService>(FILE_PROCESSOR);
  private blueskyService = inject<WebBlueSkyService>(BLUESKY);
  private config = inject<ConfigService>(CONFIG);

  public percentComplete = signal(0);
  public currentOperation = signal('');
  public elapsedSeconds = signal(0);
  public lastResult: { count: number; elapsedMs: number } | null = null;

  private startTime = 0;

  reset(): void {
    this.percentComplete.set(0);
    this.currentOperation.set('');
    this.elapsedSeconds.set(0);
    this.lastResult = null;
  }

  /**
   * Run migration (placeholder for future backend integration)
   */
  async run(simulate: boolean): Promise<{ count: number; elapsedMs: number }> {
    this.reset();
    this.startTime = Date.now();

    // Check if file is available
    if (!this.fileProcessor.archivedFile) {
      throw new Error('No archive uploaded. Please upload an Instagram archive first.');
    }

    // Get credentials from ConfigService (interface-compliant)
    const credentials = this.config.blueskyCredentials;
    if (!credentials) {
      throw new Error('No credentials available. Please authenticate with Bluesky first.');
    }

    try {
      // TODO: Implement backend integration for migration
      this.currentOperation.set(simulate ? 'Preparing dry run...' : 'Preparing migration...');
      this.percentComplete.set(10);

      // Simulate some processing time
      await this.delay(1000);

      this.currentOperation.set('Backend integration needed');
      this.percentComplete.set(100);

      // Return placeholder result
      const elapsedMs = Date.now() - this.startTime;
      this.lastResult = { count: 0, elapsedMs };

      return this.lastResult;
    } catch (error: any) {
      console.error('Migration error:', error);
      this.currentOperation.set(`Error: ${error.message}`);
      throw error;
    }
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

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

