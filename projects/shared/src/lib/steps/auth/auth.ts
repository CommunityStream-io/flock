import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Component, inject, OnInit, OnDestroy, signal, computed, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { LOGGER, Logger } from '../../services';
import { Bluesky } from '../../services/bluesky';
import { ConfigServiceImpl } from '../../services/config';
import { HelpDialog } from './help-dialog/help-dialog';
import { SplashScreenLoading } from '../../services';

@Component({
  selector: 'shared-auth',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatDialogModule
  ],
  templateUrl: './auth.html',
  styleUrl: './auth.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Auth implements OnInit, OnDestroy {
  private logger = inject(LOGGER) as Logger;
  private blueskyService = inject(Bluesky);
  private configService = inject(ConfigServiceImpl);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private dialog = inject(MatDialog);
  public splashScreenLoading = inject(SplashScreenLoading);

  private destroy$ = new Subject<void>();

  /**
   * Form group for Bluesky authentication
   */
  public authForm = new FormGroup({
    username: new FormControl<string>('', [
      Validators.required,
      this.usernameFormatValidator.bind(this)
    ]),
    password: new FormControl<string>('', [
      Validators.required
    ])
  });

  /**
   * Loading state for authentication
   */
  public isAuthenticating = signal(false);

  /**
   * Error message for authentication failures
   */
  public authError = signal('');

  /**
   * Track if authentication was successful
   */
  public isAuthenticated = signal(false);



  /**
   * Check if form is valid
   */
  public isFormValid = computed(() => {
    return this.authForm.valid && !this.isAuthenticating();
  });

  /**
   * Open help dialog
   */
  public openHelpDialog(): void {
    this.dialog.open(HelpDialog, {
      width: '500px',
      maxWidth: '90vw',
      disableClose: false,
      autoFocus: true,
      restoreFocus: true
    });
  }

  ngOnInit() {
    // Subscribe to form value changes for real-time validation
    this.authForm.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.clearAuthError();
      this.cdr.markForCheck(); // Trigger change detection for OnPush
    });

    // Subscribe to form status changes to trigger validation display
    this.authForm.statusChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.cdr.markForCheck(); // Trigger change detection for OnPush
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Custom validator for username format
   * Prevents @ symbol and requires at least two dots
   */
  private usernameFormatValidator(control: FormControl): { [key: string]: any } | null {
    const value = control.value;

    if (!value) {
      return null; // Let required validator handle empty values
    }

    // Check if user entered @ symbol (which is discouraged)
    if (value.includes('@')) {
      return { atSymbolNotAllowed: true };
    }

    // Check for at least two dots
    const dotCount = (value.match(/\./g) || []).length;
    if (dotCount < 2) {
      return { dotsRequired: true };
    }

    return null;
  }

  /**
   * Get username validation error message
   */
  getUsernameErrorMessage(): string {
    const usernameControl = this.authForm.get('username');

    if (usernameControl?.hasError('required')) {
      return 'Username is required';
    }

    if (usernameControl?.hasError('atSymbolNotAllowed')) {
      return 'Do not include the @ symbol - it is automatically added';
    }

    if (usernameControl?.hasError('dotsRequired')) {
      return 'Username must contain at least two dots (e.g., username.bksy.social)';
    }

    return '';
  }

  /**
   * Get password validation error message
   */
  getPasswordErrorMessage(): string {
    const passwordControl = this.authForm.get('password');

    if (passwordControl?.hasError('required')) {
      return 'Password is required';
    }

    return '';
  }



  /**
   * Clear authentication error message
   */
  private clearAuthError(): void {
    this.authError.set('');
  }



  /**
   * Handle form submission
   * This validates credentials and stores authentication state
   * Navigation validation is handled by guards and resolvers
   */
  async onSubmit(): Promise<void> {
    if (this.authForm.invalid || this.isAuthenticating()) {
      return;
    }

    this.isAuthenticating.set(true);
    this.clearAuthError();

    // Show splash screen with authentication message
    this.splashScreenLoading.show('Authenticating with bsky.social');

    try {
      const credentials = {
        username: '@' + (this.authForm.get('username')?.value || ''),
        password: this.authForm.get('password')?.value || ''
      };

      this.logger.workflow('Attempting Bluesky authentication');

      // Call the authentication service
      const result = await this.blueskyService.authenticate(credentials);

      if (result.success) {
        this.logger.log('Bluesky authentication successful');
        this.isAuthenticated.set(true);
        this.clearAuthError();
        
        // Store credentials and authentication state in config service
        this.configService.setBlueskyCredentials(credentials);
        this.configService.setAuthenticated(true);
        
        // Authentication successful - guards will handle navigation validation
      } else {
        this.logger.error(`Bluesky authentication failed: ${result.message}`);
        this.authError.set(result.message || 'Authentication failed');
      }
    } catch (error: any) {
      this.logger.error(`Authentication error: ${error?.message || error}`);
      this.authError.set('An unexpected error occurred during authentication');
    } finally {
      this.isAuthenticating.set(false);
      this.splashScreenLoading.hide();
    }
  }


}
