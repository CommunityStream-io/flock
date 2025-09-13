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
   * Signal to track test video mode
   */
  private testVideoModeSignal = signal<boolean>(false);

  /**
   * Signal to track start date
   */
  private startDateSignal = signal<string>('');

  /**
   * Signal to track end date
   */
  private endDateSignal = signal<string>('');

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
   * Get the test video mode
   */
  public get testVideoMode(): boolean {
    return this.testVideoModeSignal();
  }

  /**
   * Set the test video mode
   */
  public setTestVideoMode(value: boolean): void {
    this.testVideoModeSignal.set(value);
  }

  /**
   * Get the start date
   */
  public get startDate(): string {
    return this.startDateSignal();
  }

  /**
   * Set the start date
   */
  public setStartDate(value: string): void {
    this.startDateSignal.set(value);
  }

  /**
   * Get the end date
   */
  public get endDate(): string {
    return this.endDateSignal();
  }

  /**
   * Set the end date
   */
  public setEndDate(value: string): void {
    this.endDateSignal.set(value);
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
    this.testVideoModeSignal.set(false);
    this.startDateSignal.set('');
    this.endDateSignal.set('');
    this.isAuthenticatedSignal.set(false);
  }
}
