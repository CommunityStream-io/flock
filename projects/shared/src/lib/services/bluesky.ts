import { Injectable } from '@angular/core';
import {
  BlueSkyService,
  Credentials,
  AuthResult,
  ConnectionResult,
} from './interfaces/bluesky';
import { PostRecordImpl } from '@straiforos/instagramtobluesky';
import { validateBlueskyUsername, validateBlueskyUsernameWithAt } from './validators/username.validator';

@Injectable({
  providedIn: 'root',
})
export class Bluesky implements BlueSkyService {
  /**
   * Authenticate with Bluesky using provided credentials
   * @param credentials - Username and password for authentication
   * @returns Promise with authentication result
   */
  async authenticate(credentials: Credentials): Promise<AuthResult> {
    try {
      // TODO: Implement actual Bluesky authentication logic
      // For now, simulate authentication for testing purposes

      // Validate credentials format using shared validator
      // Note: Username should already have @ symbol added by the form component
      const usernameValidation = validateBlueskyUsernameWithAt(credentials.username);
      if (!usernameValidation.isValid) {
        return {
          success: false,
          message: usernameValidation.error || 'Invalid username format',
        };
      }

      if (!credentials.password || credentials.password.trim().length === 0) {
        return {
          success: false,
          message: 'Password is required',
        };
      }

      // Simulate successful authentication for valid credentials
      // In production, this would make an actual API call to Bluesky
      if (
        (credentials.username === '@test.bksy.social' || credentials.username === '@username.bksy.social') &&
        credentials.password === 'testpassword123'
      ) {
        return {
          success: true,
          message: 'Authentication successful',
        };
      }

      // Simulate failed authentication for invalid credentials
      return {
        success: false,
        message: 'Invalid Bluesky credentials',
      };
    } catch (error) {
      return {
        success: false,
        message: 'An unexpected error occurred during authentication',
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
      // TODO: Implement actual Bluesky post creation
      // For now, return the post as-is for testing purposes
      return post;
    } catch (error) {
      throw new Error('Failed to create post on Bluesky');
    }
  }

  /**
   * Test the connection to Bluesky
   * @returns Promise with connection test result
   */
  async testConnection(): Promise<ConnectionResult> {
    return {
      status: 'connected',
      message: 'Successfully connected to Bluesky',
    };
  }
}
