import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { Bluesky, ConfigServiceImpl, LOGGER, Logger, SplashScreenLoading } from '../../services';
import { catchError, finalize, from, map, Observable, of, tap } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

/**
 * Resolver to authenticate with Bluesky before proceeding to the next step
 * This ensures the user has valid credentials before accessing protected routes
 */
export const authResolver: ResolveFn<Observable<boolean>> = () => {
  const logger = inject<Logger>(LOGGER);
  const snackbar = inject(MatSnackBar);
  const splashScreenLoading = inject(SplashScreenLoading);
  const configService = inject(ConfigServiceImpl);
  const blueskyService = inject(Bluesky);

  // Check if already authenticated
  if (configService.isAuthenticated()) {
    logger.log('User already authenticated, proceeding to next step');
    return of(true);
  }

  // Get stored credentials
  const credentials = configService.getBlueskyCredentials();
  if (!credentials) {
    logger.error('No credentials found for authentication');
    snackbar.open('Please provide valid Bluesky credentials', 'Close', {
      duration: 3000,
    });
    return of(false);
  }

  // Show authentication splash screen
  splashScreenLoading.show('Authenticating with bsky.social');

  return from(blueskyService.authenticate(credentials)).pipe(
    map((result) => {
      if (result.success) {
        logger.log('Bluesky authentication successful');
        configService.setAuthenticated(true);
        return true;
      } else {
        logger.error(`Bluesky authentication failed: ${result.message}`);
        snackbar.open(result.message || 'Authentication failed', 'Close', {
          duration: 3000,
        });
        return false;
      }
    }),
    catchError((error) => {
      logger.error(`Authentication error: ${error?.message || error}`);
      snackbar.open('Authentication failed. Please check your credentials.', 'Close', {
        duration: 3000,
      });
      return of(false);
    }),
    finalize(() => {
      splashScreenLoading.hide();
    })
  );
};
