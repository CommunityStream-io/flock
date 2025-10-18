import { Injectable } from '@angular/core';
import { ValidationResult } from 'shared';
import { ApiService } from '../../services';
import { WebFileService } from '../interfaces';

/**
 * Murmur File Processor
 * Handles file uploads via Vercel API for serverless processing
 * Implements WebFileService with session tracking
 */
@Injectable({
  providedIn: 'root'
})
export class MurmurFileProcessor implements WebFileService {
  private _archivedFile: File | null = null;
  private sessionId: string | null = null;

  constructor(private apiService: ApiService) {}

  /**
   * Get the archived file
   */
  get archivedFile(): File | null {
    return this._archivedFile;
  }

  /**
   * Validate and upload archive to Vercel
   */
  async validateArchive(file: File): Promise<ValidationResult> {
    // For web, basic client-side validation only
    // Store the file for later use
    this._archivedFile = file;
    
    return {
      isValid: true,
      errors: [],
      warnings: [],
      timestamp: new Date()
    };
  }

  /**
   * Upload file to Vercel API (called by extractArchive)
   */
  async extractArchive(): Promise<boolean> {
    if (!this._archivedFile) {
      throw new Error('No file to upload');
    }
    
    const result = await this.uploadFile(this._archivedFile);
    return !!result.sessionId;
  }

  /**
   * Internal method: Upload file to Vercel API
   * Returns the session ID for tracking
   */
  private async uploadFile(file: File): Promise<{ sessionId: string }> {
    try {
      const result = await this.apiService.uploadArchive(file).toPromise();
      if (result && result.sessionId) {
        this.sessionId = result.sessionId;
        return { sessionId: result.sessionId };
      }
      throw new Error('Failed to upload archive');
    } catch (error: any) {
      console.error('Archive upload error:', error);
      throw new Error(`Upload failed: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Get the current session ID (for migration service)
   */
  getSessionId(): string | null {
    return this.sessionId;
  }

  /**
   * Clear the archived file and session
   */
  clearArchive(): void {
    this._archivedFile = null;
    this.sessionId = null;
  }
}
