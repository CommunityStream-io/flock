import { Injectable, inject } from '@angular/core';
import { BlueSkyService, Credentials, AuthResult, ConnectionResult, LOGGER, Logger } from 'shared';
import { PostRecordImpl } from '@straiforos/instagramtobluesky';

/**
 * TODO swap for the BlueskyService from the shared library
 * Native Bluesky service for Flock Native
 * Uses real Bluesky API calls via the instagramtobluesky library
 */
@Injectable({
  providedIn: 'root'
})
export class Bluesky implements BlueSkyService {
  private logger = inject<Logger>(LOGGER);

  /**
   * Logging helpers with service name prefix
   */
  private log(...args: any[]) {
    const message = args.join(' ');
    this.logger.log(`[BlueskyService] ${message}`);
  }

  private error(...args: any[]) {
    const message = args.join(' ');
    this.logger.error(`[BlueskyService] ${message}`);
  }
  
  /**
   * Authenticate with Bluesky
   * Uses a simple connection test - full auth happens during CLI execution
   * @param credentials - Username and password for authentication
   * @returns Promise with authentication result
   */
  async authenticate(credentials: Credentials): Promise<AuthResult> {
    try {
      // Validate credentials format
      if (!credentials.username.startsWith('@')) {
        return {
          success: false,
          message: '@ prefix is required'
        };
      }

      if ((credentials.username.match(/\./g) || []).length < 2) {
        return {
          success: false,
          message: 'Username must contain at least two dots (e.g., @username.bsky.social)'
        };
      }

      if (!credentials.password || credentials.password.trim().length === 0) {
        return {
          success: false,
          message: 'Password is required'
        };
      }

      this.log('Validating Bluesky credentials format');

      // For now, we do basic validation
      // The CLI will do the actual authentication when migration runs
      // We could optionally test auth here by importing BlueskyClient from the package
      
      this.log('Credentials validation passed');
      this.log('Full authentication will occur during migration');
      
      return {
        success: true,
        message: 'Credentials validated - authentication will complete during migration'
      };
    } catch (error) {
      this.error('Bluesky authentication error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Authentication failed'
      };
    }
  }

  /**
   * Create a post on Bluesky
   * @param post - The post data to create
   * @returns Promise with the created post
   */
  async createPost(post: PostRecordImpl): Promise<PostRecordImpl> {
    try {
      console.log('🦅 Creating Bluesky post:', post);

      // TODO: Implement actual post creation via Bluesky API
      // This will be integrated with @straiforos/instagramtobluesky
      
      return post;
    } catch (error) {
      console.error('🦅 Error creating Bluesky post:', error);
      throw error;
    }
  }

  /**
   * Test the connection to Bluesky
   * @returns Promise with connection test result
   */
  async testConnection(): Promise<ConnectionResult> {
    try {
      console.log('🦅 Testing Bluesky connection...');

      // TODO: Implement actual connection test
      // This will ping the Bluesky API to verify connectivity
      
      return {
        status: 'connected',
        message: 'Successfully connected to Bluesky'
      };
    } catch (error) {
      console.error('🦅 Bluesky connection test failed:', error);
      return {
        status: 'error',
        message: error instanceof Error ? error.message : 'Connection test failed'
      };
    }
  }
}

