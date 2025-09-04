import { inject } from '@angular/core';
import { CanDeactivateFn, Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfigServiceImpl, Bluesky, LOGGER, Logger, SplashScreenLoading } from '../../services';
import { catchError, finalize, from, map, Observable, of } from 'rxjs';

/**
 * Guard to handle authentication when navigating from the auth step
 * - Allows deactivation when going to previous step
 * - Runs authentication logic when going to next step
 */
export const authDeactivateGuard: CanDeactivateFn<unknown> = (component, currentRoute, currentState, nextState) => {
  const logger = inject<Logger>(LOGGER);
  const snackbar = inject(MatSnackBar);
  const splashScreenLoading = inject(SplashScreenLoading);
  const configService = inject(ConfigServiceImpl);
  const blueskyService = inject(Bluesky);
  const router = inject(Router);

  // Get current route data to determine next/previous steps
  const currentRouteData = currentRoute?.data;
  const nextStep = currentRouteData?.['next'];
  const previousStep = currentRouteData?.['previous'];

  // Determine target step from nextState URL
  const targetUrl = nextState?.url || '';
  const isNavigatingToNext = nextStep && targetUrl.includes(`/step/${nextStep}`);
  const isNavigatingToPrevious = previousStep && targetUrl.includes(`/step/${previousStep}`);

  logger.log(`Auth guard: navigating from ${currentRoute?.url} to ${targetUrl}`);
  logger.log(`Is navigating to next: ${isNavigatingToNext}, previous: ${isNavigatingToPrevious}`);

  // If navigating to previous step, always allow
  if (isNavigatingToPrevious) {
    logger.log('Navigating to previous step, allowing deactivation');
    return true;
  }

  // If navigating to next step, run authentication logic
  if (isNavigatingToNext) {
    logger.log('Navigating to next step, running authentication logic');

    // Check if already authenticated
    if (configService.isAuthenticated()) {
      logger.log('User already authenticated, allowing navigation');
      return true;
    }

    // Get stored credentials
    const credentials = configService.getBlueskyCredentials();
    if (!credentials) {
      logger.error('No credentials found for authentication');
      snackbar.open('Please provide valid Bluesky credentials', 'Close', {
        duration: 3000,
      });
      return false;
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
  }

  // For any other navigation (like direct URL access), allow by default
  logger.log('Other navigation detected, allowing deactivation');
  return true;
};
