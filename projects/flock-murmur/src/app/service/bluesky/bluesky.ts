import { Injectable } from '@angular/core';
import { BlueskyService } from 'shared';
import { ApiService } from '../api.service';

/**
 * Murmur Bluesky Service
 * Handles Bluesky operations via Vercel API
 */
@Injectable({
  providedIn: 'root'
})
export class MurmurBluesky implements BlueskyService {
  private sessionId: string | null = null;

  constructor(private apiService: ApiService) {}

  /**
   * Set session ID for API calls
   */
  setSessionId(sessionId: string): void {
    this.sessionId = sessionId;
  }

  /**
   * Start migration via Vercel API
   */
  async startMigration(config: any): Promise<void> {
    if (!this.sessionId) {
      throw new Error('No session ID available. Please upload an archive first.');
    }

    try {
      await this.apiService.startMigration(this.sessionId, config).toPromise();
    } catch (error: any) {
      console.error('Migration error:', error);
      throw new Error(`Migration failed: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Get migration progress
   */
  async getProgress(): Promise<any> {
    if (!this.sessionId) {
      throw new Error('No session ID available');
    }

    try {
      const result = await this.apiService.getProgress(this.sessionId).toPromise();
      return result?.progress || null;
    } catch (error: any) {
      console.error('Progress check error:', error);
      return null;
    }
  }

  /**
   * Authenticate (handled server-side in Vercel API)
   */
  async authenticate(credentials: { username: string; password: string }): Promise<boolean> {
    // Authentication will be handled server-side during migration
    // Client-side just validates credentials are provided
    return !!(credentials.username && credentials.password);
  }
}
