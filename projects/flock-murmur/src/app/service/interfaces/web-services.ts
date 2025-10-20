import { FileService, BlueSkyService } from 'shared';

/**
 * Web-specific extension of FileService
 * Adds session tracking for serverless API integration
 */
export interface WebFileService extends FileService {
  /**
   * Get the session ID from the upload
   * Used to track the archive on the server
   */
  getSessionId(): string | null;

  /**
   * Clear the archived file and session
   */
  clearArchive(): void;
}

/**
 * Web-specific extension of BlueSkyService
 * Adds credential management for migration
 */
export interface WebBlueSkyService extends BlueSkyService {
  /**
   * Get stored credentials for migration
   */
  getCredentials(): { username: string; password: string } | null;

  /**
   * Clear stored credentials
   */
  clearCredentials(): void;
}

