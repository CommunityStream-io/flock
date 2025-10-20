import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

/**
 * API Service for communicating with backend services
 * Currently prepared for future backend integration
 */
@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  // TODO: Implement backend integration methods
  // These methods will be implemented when DigitalOcean backend is ready
}
