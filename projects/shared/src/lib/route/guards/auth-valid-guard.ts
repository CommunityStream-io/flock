import { inject } from '@angular/core';
import { CanDeactivateFn } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfigServiceImpl } from '../../services/config';

/**
 * Guard to prevent the user from leaving the auth step if form is not valid
 * Shows a snackbar message to complete authentication before proceeding
 */
export const authValidGuard: CanDeactivateFn<unknown> = (component) => {
  void component;
  const configService = inject(ConfigServiceImpl);
  
  // Check if we have valid credentials stored (form was valid)
  const credentials = configService.getBlueskyCredentials();
  
  if (!credentials || !credentials.username || !credentials.password) {
    inject(MatSnackBar).open('Please provide valid Bluesky credentials', 'Close', {
      duration: 3000,
    });
    return false;
  }
  
  return true;
};
