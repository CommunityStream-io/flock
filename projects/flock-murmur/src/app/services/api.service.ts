import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from, switchMap } from 'rxjs';
import { environment } from '../../environments/environment';
import { put } from '@vercel/blob';

/**
 * API Service for communicating with Vercel edge functions
 * Handles file upload, migration, and progress tracking
 */
@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  /**
   * Upload Instagram archive using client-side multipart upload to Vercel Blob
   * This bypasses the serverless function's 4.5MB request body limit
   * @param file ZIP file containing Instagram export
   * @returns Observable with upload result including sessionId
   */
  uploadArchive(file: File): Observable<{
    success: boolean;
    sessionId: string;
    filename: string;
    size: number;
    message: string;
  }> {
    // Generate session ID
    const sessionId = `upload_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    // Upload directly to Vercel Blob using client-side multipart upload
    // Note: Client-side uploads are always public due to Vercel Blob API limitations
    return from(put(`archives/${sessionId}/${file.name}`, file, {
      access: 'public',
      addRandomSuffix: false,
    })).pipe(
      switchMap(blob => 
        // Store metadata in our API (not the file data)
        this.storeUploadMetadata(sessionId, file, blob.url).pipe(
          switchMap(() => 
            // Return the final result
            from([{
              success: true,
              sessionId,
              filename: file.name,
              size: file.size,
              message: 'File uploaded successfully to Blob storage'
            }])
          )
        )
      )
    );
  }

  /**
   * Store upload metadata in our API (not the file data)
   * @param sessionId Session ID for tracking
   * @param file Original file object
   * @param blobUrl URL of the uploaded blob
   * @returns Observable with metadata storage result
   */
  private storeUploadMetadata(sessionId: string, file: File, blobUrl: string): Observable<{
    success: boolean;
    message: string;
  }> {
    const metadata = {
      sessionId,
      filename: file.name,
      size: file.size,
      mimetype: file.type,
      blobUrl,
      uploadedAt: new Date().toISOString(),
      status: 'uploaded'
    };

    return this.http.post<{
      success: boolean;
      message: string;
    }>(`${this.apiUrl}/upload-metadata`, metadata);
  }

  /**
   * Start migration process
   * @param sessionId Session ID from upload
   * @param config Migration configuration
   * @returns Observable with migration results
   */
  startMigration(sessionId: string, config: {
    blueskyCredentials: {
      username: string;
      password: string;
    };
    simulate?: boolean;
    startDate?: string;
    endDate?: string;
    stopOnError?: boolean;
  }): Observable<{
    success: boolean;
    results: {
      postsImported: number;
      postsFailed: number;
      mediaCount: number;
      duration: string;
      sessionId: string;
    };
  }> {
    return this.http.post<{
      success: boolean;
      results: {
        postsImported: number;
        postsFailed: number;
        mediaCount: number;
        duration: string;
        sessionId: string;
      };
    }>(`${this.apiUrl}/migrate`, {
      sessionId,
      config
    });
  }

  /**
   * Get migration progress
   * @param sessionId Session ID from upload
   * @returns Observable with current progress
   */
  getProgress(sessionId: string): Observable<{
    success: boolean;
    progress: {
      status: 'starting' | 'processing' | 'complete' | 'error';
      phase: string;
      message: string;
      percentage: number;
      currentPost?: number;
      totalPosts?: number;
      updatedAt: string;
      results?: {
        postsImported: number;
        postsFailed: number;
        mediaCount: number;
        duration: string;
      };
      error?: string;
    };
  }> {
    return this.http.get<{
      success: boolean;
      progress: {
        status: 'starting' | 'processing' | 'complete' | 'error';
        phase: string;
        message: string;
        percentage: number;
        currentPost?: number;
        totalPosts?: number;
        updatedAt: string;
        results?: {
          postsImported: number;
          postsFailed: number;
          mediaCount: number;
          duration: string;
        };
        error?: string;
      };
    }>(`${this.apiUrl}/progress`, {
      params: { sessionId }
    });
  }

  /**
   * Authenticate with Bluesky
   * Validates credentials before starting migration
   * @param credentials Bluesky username and password
   * @returns Observable with authentication result
   */
  authenticateBluesky(credentials: {
    username: string;
    password: string;
  }): Observable<{
    success: boolean;
    message: string;
    username: string;
  }> {
    return this.http.post<{
      success: boolean;
      message: string;
      username: string;
    }>(`${this.apiUrl}/auth-bluesky`, credentials);
  }
}
