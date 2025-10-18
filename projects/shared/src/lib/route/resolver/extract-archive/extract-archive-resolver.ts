import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { FILE_PROCESSOR, FileService, LOGGER, Logger, SplashScreenLoading } from '../../../services';
import { catchError, finalize, from, Observable, of, tap } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

export const extractArchiveResolver: ResolveFn<Observable<boolean>> = () => {
  const logger = inject<Logger>(LOGGER);
  const splashScreenLoading = inject(SplashScreenLoading);
  const snackBar = inject(MatSnackBar);
  const router = inject(Router);
  
  logger.log('[ExtractArchiveResolver] Resolver called');
  
  // Check if there's an archive to extract first
  const fileService = inject<FileService>(FILE_PROCESSOR);
  
  // NOTE: Don't show splash screen here - let the file processor handle it
  // This ensures the component is set BEFORE the splash is shown
  logger.log('[ExtractArchiveResolver] Calling extractArchive()');
  
  return from(fileService.extractArchive()).pipe(
    tap((result) => {
      if (result) {
        logger.log('[ExtractArchiveResolver] Archive extracted successfully');
      } else {
        logger.log('[ExtractArchiveResolver] Archive extraction returned false');
      }
    }),
    catchError((error) => {
      logger.error('[ExtractArchiveResolver] Error extracting archive:', error);
      
      // Show user-friendly error message
      const errorMessage = error.message || 'Error extracting archive';
      snackBar.open(errorMessage, 'Close', { 
        duration: 5000,
        panelClass: ['error-snackbar']
      });
      
      // Redirect back to upload step for upload-related errors
      if (errorMessage.includes('File too large') || 
          errorMessage.includes('Upload failed') || 
          errorMessage.includes('Invalid file format') ||
          errorMessage.includes('Network error') ||
          errorMessage.includes('Server error')) {
        
        logger.log('[ExtractArchiveResolver] Redirecting to upload step due to upload error');
        router.navigate(['/step/upload']);
      }
      
      return of(false); // Return false to indicate failure
    }),
    finalize(() => {
      // Reset component and hide splash screen (similar to migration resolver pattern)
      logger.log('[ExtractArchiveResolver] Finalize: resetting component and hiding splash');
      splashScreenLoading.setComponent(null);
      splashScreenLoading.hide();
      logger.log('[ExtractArchiveResolver] Finalize complete');
    })
  );
};
