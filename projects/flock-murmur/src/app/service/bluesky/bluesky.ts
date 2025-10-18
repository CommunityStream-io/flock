import { Injectable } from '@angular/core';
import { BlueSkyService, Credentials, AuthResult, ConnectionResult } from 'shared';
import { PostRecordImpl } from '@straiforos/instagramtobluesky';
import { ApiService } from '../../services/api.service';

/**
 * Murmur Bluesky Service
 * Handles Bluesky operations via Vercel API
 */
@Injectable({
  providedIn: 'root'
})
export class MurmurBluesky implements BlueSkyService {
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
   * Authenticate with Bluesky via Vercel API
   * Validates credentials before starting migration
   */
  async authenticate(credentials: Credentials): Promise<AuthResult> {
    // Validate required fields
    if (!credentials.username || !credentials.password) {
      return {
        success: false,
        message: 'Username and password are required'
      };
    }

    try {
      const result = await this.apiService.authenticateBluesky(credentials).toPromise();
      
      if (result?.success) {
        console.log('Bluesky authentication successful:', result.username);
        return {
          success: true,
          message: result.message || 'Authentication successful'
        };
      }
      
      return {
        success: false,
        message: 'Authentication failed'
      };
    } catch (error: any) {
      console.error('Bluesky authentication failed:', error);
      
      // Extract error message from API response
      const errorMessage = error.error?.details || error.error?.error || error.message || 'Authentication failed';
      
      return {
        success: false,
        message: errorMessage
      };
    }
  }

  /**
   * Create a post on Bluesky
   * Note: For Flock Murmur, posts are created via the migration API
   * This method is provided for interface compatibility
   */
  async createPost(post: PostRecordImpl): Promise<PostRecordImpl> {
    throw new Error('Direct post creation not supported in Flock Murmur. Use migration API.');
  }

  /**
   * Test connection to Bluesky
   * Uses the authenticate method to verify credentials
   */
  async testConnection(): Promise<ConnectionResult> {
    // For Murmur, connection testing is done via authentication endpoint
    // This is a placeholder that would need credentials passed in
    return {
      status: 'info',
      message: 'Use authenticate() method to test connection'
    };
  }
}
