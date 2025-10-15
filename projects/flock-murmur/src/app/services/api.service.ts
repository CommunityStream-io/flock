import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

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
   * Upload Instagram archive to server
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
    const formData = new FormData();
    formData.append('archive', file);

    return this.http.post<{
      success: boolean;
      sessionId: string;
      filename: string;
      size: number;
      message: string;
    }>(`${this.apiUrl}/upload`, formData);
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
}
