import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Migration } from '../../../services/migration';
import { ConfigServiceImpl } from '../../../services/config';

@Component({
  selector: 'shared-completion-summary',
  imports: [CommonModule],
  templateUrl: './completion-summary.html',
  styleUrl: './completion-summary.css'
})
export class CompletionSummary {
  private migration = inject(Migration);
  private configService = inject(ConfigServiceImpl);
  
  /**
   * Get migration results (native app) or migration service results (mirage app)
   */
  get migrationResults() {
    return this.configService.migrationResults;
  }
  
  /**
   * Get count of posts migrated
   */
  get count(): number | null {
    // Try native results first, then fall back to migration service
    const nativeResults = this.migrationResults;
    if (nativeResults) {
      return nativeResults.postsImported;
    }
    return this.migration.lastResult?.count ?? null;
  }
  
  /**
   * Get number of media files migrated
   */
  get mediaCount(): number | null {
    const nativeResults = this.migrationResults;
    if (nativeResults) {
      return nativeResults.mediaCount;
    }
    return null;
  }
  
  /**
   * Get elapsed time
   */
  get elapsed(): string | null {
    // Try native results first
    const nativeResults = this.migrationResults;
    if (nativeResults) {
      return nativeResults.duration;
    }
    
    // Fall back to migration service
    const ms = this.migration.lastResult?.elapsedMs;
    if (ms == null) return null;
    const seconds = Math.round(ms / 1000);
    return `${seconds}s`;
  }
  
  /**
   * Check if migration was successful
   */
  get success(): boolean {
    const nativeResults = this.migrationResults;
    if (nativeResults) {
      return nativeResults.success;
    }
    return this.migration.lastResult != null;
  }
}
