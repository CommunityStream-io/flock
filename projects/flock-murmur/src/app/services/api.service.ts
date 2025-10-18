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
   * Upload Instagram archive using client-side multipart upload with security measures
   * Bypasses 4.5MB serverless limit while maintaining data security
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
    // Generate session ID with additional entropy for security
    const sessionId = `upload_${Date.now()}_${Math.random().toString(36).substring(7)}_${Math.random().toString(36).substring(7)}`;
    
    // Upload directly to Vercel Blob with security measures
    return from(put(`archives/${sessionId}/${file.name}`, file, {
      access: 'public', // Required for client-side uploads
      addRandomSuffix: true, // Additional security: random suffix makes URL unpredictable
    })).pipe(
      switchMap(blob => 
        // Store metadata and security info in our API
        this.storeUploadMetadata(sessionId, file, blob.url).pipe(
          switchMap(() => 
            // Return the final result
            from([{
              success: true,
              sessionId,
              filename: file.name,
              size: file.size,
              message: 'File uploaded successfully with security measures'
            }])
          )
        )
      )
    );
  }

  /**
   * Store upload metadata and security info in our API
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
      status: 'uploaded',
      // Security measures
      isPublicBlob: true, // Flag to indicate this needs special handling
      securityNote: 'Client-side upload with random suffix for URL unpredictability'
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
