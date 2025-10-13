import { Injectable } from '@angular/core';
import { ElectronAPI } from '../../types/electron';

/**
 * Service wrapper for Electron API with type safety
 * Provides a clean Angular service interface to the Electron IPC layer
 */
@Injectable({
  providedIn: 'root'
})
export class ElectronService {
  private electronAPI: ElectronAPI | undefined;

  constructor() {
    // Access the Electron API from window
    this.electronAPI = window.electronAPI;

    if (!this.isElectron()) {
      console.warn('⚠️ ElectronService: Not running in Electron environment');
    } else {
      console.log('🦅 ElectronService: Electron API initialized');
      console.log(`📦 Platform: ${this.electronAPI?.platform}`);
      console.log(`🔧 Architecture: ${this.electronAPI?.arch}`);
    }
  }

  /**
   * Check if running in Electron environment
   */
  isElectron(): boolean {
    return this.electronAPI !== undefined && this.electronAPI.isElectron === true;
  }

  /**
   * Get the Electron API
   * @throws Error if not running in Electron
   */
  getAPI(): ElectronAPI {
    if (!this.electronAPI) {
      throw new Error('Not running in Electron environment. ElectronAPI is not available.');
    }
    return this.electronAPI;
  }

  /**
   * Get platform information
   */
  getPlatform(): string {
    return this.electronAPI?.platform || 'unknown';
  }

  /**
   * Get architecture information
   */
  getArch(): string {
    return this.electronAPI?.arch || 'unknown';
  }

  /**
   * Safely execute Electron API call with error handling
   */
  async safeExecute<T>(
    apiCall: (api: ElectronAPI) => Promise<T>,
    errorMessage: string
  ): Promise<T> {
    if (!this.isElectron()) {
      throw new Error(`${errorMessage}: Not running in Electron environment`);
    }

    try {
      return await apiCall(this.getAPI());
    } catch (error) {
      console.error(`${errorMessage}:`, error);
      throw error;
    }
  }
}

