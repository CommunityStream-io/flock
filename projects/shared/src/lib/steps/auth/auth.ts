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
import { Subject, takeUntil } from 'rxjs';
import { LOGGER, Logger } from '../../services';
import { ConfigServiceImpl } from '../../services/config';
import { HelpDialog } from './help-dialog/help-dialog';
import { SplashScreenLoading } from '../../services';
import { validateBlueskyUsername } from '../../services/validators/username.validator';

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
  private configService = inject(ConfigServiceImpl);
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
      this.storeCredentials(); // Store credentials when form is valid
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

    const validation = validateBlueskyUsername(value);
    
    if (!validation.isValid) {
      if (validation.error?.includes('@ symbol')) {
        return { atSymbolNotAllowed: true };
      }
      if (validation.error?.includes('dots')) {
        return { dotsRequired: true };
      }
    }

    return null;
  }

  /**
   * Get username validation error message
   */
  getUsernameErrorMessage(): string {
    const usernameControl = this.authForm.get('username');
    const value = usernameControl?.value;

    if (usernameControl?.hasError('required')) {
      return 'Username is required';
    }

    if (!value) {
      return '';
    }

    const validation = validateBlueskyUsername(value);
    return validation.error || '';
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
   * Store credentials when form is valid
   * Authentication will be handled by the auth resolver when navigating to next step
   */
  private storeCredentials(): void {
    if (this.authForm.valid) {
      const credentials = {
        username: '@' + (this.authForm.get('username')?.value || ''),
        password: this.authForm.get('password')?.value || ''
      };
      
      // Store credentials for the resolver to use
      this.configService.setBlueskyCredentials(credentials);
      this.configService.setAuthenticated(true);
      this.logger.workflow('Credentials stored for authentication');
    } else {
      // Clear authentication state when form is invalid
      this.configService.setAuthenticated(false);
    }
  }


}
