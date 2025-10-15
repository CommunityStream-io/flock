import { inject } from '@angular/core';
import { CanDeactivateFn, Router } from '@angular/router';
import { FileService, FILE_PROCESSOR } from '../../services';
import { MatSnackBar } from '@angular/material/snack-bar';

/**
 * Guard to prevent the user from leaving the upload step if the archive is not valid
 * - Allows navigation to any route except the next step without an archive
 * - Only blocks navigation to the next step if no valid archive is uploaded
 */
export const uploadValidGuard: CanDeactivateFn<unknown> = (component, currentRoute, currentState, nextState) => {
  const fileService = inject<FileService>(FILE_PROCESSOR);
  
  // Get current route data to determine next step
  const currentRouteData = currentRoute?.data;
  const nextStep = currentRouteData?.['next'];
  
  // Determine target step from nextState URL
  const targetUrl = nextState?.url || '';
  const isNavigatingToNext = nextStep && targetUrl.includes(`/step/${nextStep}`);
  
  // If not navigating to next step, always allow (e.g., going back to home, help, etc.)
  if (!isNavigatingToNext) {
    return true;
  }
  
  // If navigating to next step, check if archive is uploaded
  if (!fileService.archivedFile) {
    inject(MatSnackBar).open('Please upload a valid archive', 'Close', {
      duration: 3000,
    });
    return false;
  }
  
  return true;
};
