import { Injectable, signal } from '@angular/core';
import { ConfigService } from './interfaces/config';
import { Credentials } from './interfaces/bluesky';

@Injectable({
  providedIn: 'root'
})
export class ConfigServiceImpl implements ConfigService {
  /**
   * Signal to track archive path
   */
  private archivePathSignal = signal<string>('');

  /**
   * Signal to track Bluesky credentials
   */
  private blueskyCredentialsSignal = signal<Credentials | null>(null);

  /**
   * Signal to track simulation mode
   */
  private simulateSignal = signal<boolean>(false);

  /**
   * Signal to track if user is authenticated
   */
  private isAuthenticatedSignal = signal<boolean>(false);

  /**
   * Get the current archive path
   */
  public get archivePath(): string {
    return this.archivePathSignal();
  }

  /**
   * Set the archive path
   */
  public setArchivePath(path: string): void {
    this.archivePathSignal.set(path);
  }

  /**
   * Get the current Bluesky credentials
   */
  public get blueskyCredentials(): Credentials | null {
    return this.blueskyCredentialsSignal();
  }

  /**
   * Get the Bluesky credentials
   */
  public getBlueskyCredentials(): Credentials | null {
    return this.blueskyCredentialsSignal();
  }

  /**
   * Set the Bluesky credentials
   */
  public setBlueskyCredentials(credentials: Credentials): void {
    this.blueskyCredentialsSignal.set(credentials);
  }

  /**
   * Get the simulation mode
   */
  public get simulate(): boolean {
    return this.simulateSignal();
  }

  /**
   * Set the simulation mode
   */
  public setSimulate(value: boolean): void {
    this.simulateSignal.set(value);
  }

  /**
   * Check if user is authenticated
   */
  public isAuthenticated(): boolean {
    return this.isAuthenticatedSignal();
  }

  /**
   * Set authentication state
   */
  public setAuthenticated(value: boolean): void {
    this.isAuthenticatedSignal.set(value);
  }

  /**
   * Get authentication state signal
   */
  public getIsAuthenticatedSignal() {
    return this.isAuthenticatedSignal.asReadonly();
  }

  /**
   * Validate the current configuration
   */
  public async validateConfig(): Promise<boolean> {
    return this.archivePath !== '' && this.blueskyCredentials !== null && this.isAuthenticated();
  }

  /**
   * Reset the configuration
   */
  public async resetConfig(): Promise<void> {
    this.archivePathSignal.set('');
    this.blueskyCredentialsSignal.set(null);
    this.simulateSignal.set(false);
    this.isAuthenticatedSignal.set(false);
  }
}
