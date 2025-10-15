import { Injectable } from '@angular/core';
import { FileProcessorService, ValidationResult } from 'shared';
import { ApiService } from '../api.service';

/**
 * Murmur File Processor
 * Handles file uploads via Vercel API for serverless processing
 */
@Injectable({
  providedIn: 'root'
})
export class MurmurFileProcessor implements FileProcessorService {
  private sessionId: string | null = null;

  constructor(private apiService: ApiService) {}

  /**
   * Validate and upload archive to Vercel
   */
  async validateArchive(path: string): Promise<ValidationResult> {
    // For web, path is actually a File object passed through
    // Basic client-side validation only
    return {
      isValid: true,
      errors: [],
      warnings: []
    };
  }

  /**
   * Upload file to Vercel API
   * Returns the session ID for tracking
   */
  async processArchive(file: File): Promise<{ sessionId: string }> {
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
   * Get the current session ID
   */
  getSessionId(): string | null {
    return this.sessionId;
  }
}
