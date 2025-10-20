import { Injectable } from '@angular/core';
import { Credentials, AuthResult, ConnectionResult } from 'shared';
import { PostRecordImpl } from '@straiforos/instagramtobluesky';
import { WebBlueSkyService } from '../interfaces';

/**
 * Murmur Bluesky Service
 * Handles Bluesky authentication and credential management
 * Implements WebBlueSkyService with credential storage for migration
 */
@Injectable({
  providedIn: 'root'
})
export class MurmurBluesky implements WebBlueSkyService {
  private credentials: Credentials | null = null;

  /**
   * Authenticate with Bluesky (placeholder for future backend integration)
   * Currently performs basic validation only
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
      // TODO: Implement backend authentication
      // For now, just store credentials and return success
      console.log('Bluesky authentication (placeholder):', credentials.username);
      
      // Store credentials for later use in migration
      this.credentials = credentials;
      
      return {
        success: true,
        message: 'Authentication successful (placeholder)'
      };
    } catch (error: any) {
      console.error('Bluesky authentication failed:', error);
      
      return {
        success: false,
        message: error.message || 'Authentication failed'
      };
    }
  }

  /**
   * Get stored credentials (for migration service)
   */
  getCredentials(): Credentials | null {
    return this.credentials;
  }

  /**
   * Clear stored credentials
   */
  clearCredentials(): void {
    this.credentials = null;
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
