import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Component, inject, OnInit, OnDestroy, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { LOGGER, Logger } from '../../services';
import { Bluesky } from '../../services/bluesky';

@Component({
  selector: 'shared-auth',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatCardModule
  ],
  templateUrl: './auth.html',
  styleUrl: './auth.css'
})
export class Auth implements OnInit, OnDestroy {
  private logger = inject(LOGGER) as Logger;
  private blueskyService = inject(Bluesky);
  private router = inject(Router);
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

  ngOnInit() {
    // Subscribe to form value changes for real-time validation
    this.authForm.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.clearAuthError();
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Custom validator for username format
   * Requires @ prefix and at least two dots
   */
  private usernameFormatValidator(control: FormControl<string>): { [key: string]: boolean } | null {
    const value = control.value;

    if (!value) {
      return null; // Let required validator handle empty values
    }

    // Check for @ prefix
    if (!value.startsWith('@')) {
      return { prefixRequired: true };
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

    if (usernameControl?.hasError('prefixRequired')) {
      return '@ prefix is required';
    }

    if (usernameControl?.hasError('dotsRequired')) {
      return 'Username must contain at least two dots';
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
   * Check if form is valid
   */
  public isFormValid = computed(() => {
    return this.authForm.valid && !this.isAuthenticating();
  });

  /**
   * Check if step is complete (ready for navigation)
   */
  public isStepComplete = computed(() => {
    return this.isAuthenticated() && !this.authError();
  });

  /**
   * Clear authentication error message
   */
  private clearAuthError(): void {
    this.authError.set('');
  }

  /**
   * Handle form submission
   * This validates credentials but doesn't navigate - navigation is handled by the stepper
   */
  async onSubmit(): Promise<void> {
    if (this.authForm.invalid || this.isAuthenticating()) {
      return;
    }

    this.isAuthenticating.set(true);
    this.clearAuthError();

    try {
      const credentials = {
        username: this.authForm.get('username')?.value || '',
        password: this.authForm.get('password')?.value || ''
      };

      this.logger.workflow('Attempting Bluesky authentication');

      // Call the authentication service
      const result = await this.blueskyService.authenticate(credentials);

      if (result.success) {
        this.logger.log('Bluesky authentication successful');
        this.isAuthenticated.set(true);
        this.clearAuthError();
        // Authentication successful - the navigation stepper will handle navigation
        // when the user clicks "Next"
      } else {
        this.logger.error(`Bluesky authentication failed: ${result.message}`);
        this.authError.set(result.message || 'Authentication failed');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Authentication error: ${errorMessage}`);
      this.authError.set('An unexpected error occurred during authentication');
    } finally {
      this.isAuthenticating.set(false);
    }
  }

  /**
   * Handle navigation away from the step
   * This ensures credentials are validated before allowing progression
   */
  canDeactivate(): boolean {
    // Allow navigation if authentication was successful
    if (this.isAuthenticated()) {
      return true;
    }

    // If authentication hasn't been completed, prevent navigation
    if (!this.isAuthenticated()) {
      this.authError.set('Please complete authentication before proceeding');
    }
    return false;
  }
}
