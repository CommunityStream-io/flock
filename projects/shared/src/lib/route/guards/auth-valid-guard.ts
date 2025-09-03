import { inject } from '@angular/core';
import { CanDeactivateFn, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfigServiceImpl } from '../../services/config';

/**
 * Guard to prevent the user from leaving the auth step if authentication is not valid
 * Shows a snackbar message to complete authentication before proceeding
 */
export const authValidGuard: CanDeactivateFn<unknown> = () => {
  const configService = inject(ConfigServiceImpl);
  
  if (!configService.isAuthenticated()) {
    inject(MatSnackBar).open('Please provide valid Bluesky credentials', 'Close', {
      duration: 3000,
    });
    return false;
  }
  
  return true;
};
