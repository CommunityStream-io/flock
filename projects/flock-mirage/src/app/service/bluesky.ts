import { inject, Injectable } from '@angular/core';
import { BlueSkyService, Credentials, AuthResult, ConnectionResult } from 'shared';
import { PostRecordImpl } from '@straiforos/instagramtobluesky';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Bluesky implements BlueSkyService {

  /**
   * Helper method to get network delay - extracted for testability
   * @returns delay in milliseconds
   */
  public getNetworkDelay(): number {
    return environment.archiveExtractDelay || 1000;
  }

  /**
   * Helper method to simulate network delay - extracted for testability
   * @returns Promise that resolves after the delay
   */
  public async simulateNetworkDelay(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, this.getNetworkDelay()));
  }

  /**
   * Helper method to get URL search parameters - extracted for testability
   * @returns URLSearchParams object
   */
  public getUrlSearchParams(): URLSearchParams {
    return new URLSearchParams(window.location.search);
  }

  /**
   * Helper method to check if authentication should fail - extracted for testability
   * @returns true if authentication should fail
   */
  public shouldAuthenticationFail(): boolean {
    return this.getUrlSearchParams().get('authFailed') === 'true';
  }

  /**
   * Helper method to check if connection should fail - extracted for testability
   * @returns true if connection should fail
   */
  public shouldConnectionFail(): boolean {
    return this.getUrlSearchParams().get('connectionFailed') === 'true';
  }

  /**
   * Simulate Bluesky authentication for testing purposes
   * @param credentials - Username and password for authentication
   * @returns Promise with authentication result
   */
  async authenticate(credentials: Credentials): Promise<AuthResult> {
    // Simulate network delay
    await this.simulateNetworkDelay();

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
        message: 'Username must contain at least two dots'
      };
    }

    if (!credentials.password || credentials.password.trim().length === 0) {
      return {
        success: false,
        message: 'Password is required'
      };
    }

    // Use demo query parameter to determine if authentication succeeds
    const isSuccess = !this.shouldAuthenticationFail();

    if (isSuccess) {
      return {
        success: true,
        message: 'Authentication successful'
      };
    } else {
      return {
        success: false,
        message: 'Invalid Bluesky credentials'
      };
    }
  }

  /**
   * Simulate creating a post on Bluesky
   * @param post - The post data to create
   * @returns Promise with the created post
   */
  async createPost(post: PostRecordImpl): Promise<PostRecordImpl> {
    // Simulate network delay
    await this.simulateNetworkDelay();

    // For testing, just return the post as-is
    return post;
  }

  /**
   * Test the connection to Bluesky
   * @returns Promise with connection test result
   */
  async testConnection(): Promise<ConnectionResult> {
    // Simulate network delay
    await this.simulateNetworkDelay();

    // Use demo query parameter to determine if connection succeeds
    const isSuccess = !this.shouldConnectionFail();

    if (isSuccess) {
      return {
        status: 'connected',
        message: 'Successfully connected to Bluesky'
      };
    } else {
      return {
        status: 'error',
        message: 'Failed to connect to Bluesky'
      };
    }
  }
}
