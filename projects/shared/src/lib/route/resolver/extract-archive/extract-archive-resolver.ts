import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { FILE_PROCESSOR, FileService, LOGGER, Logger, SplashScreenLoading } from '../../../services';
import { catchError, finalize, from, Observable, of, tap } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

export const extractArchiveResolver: ResolveFn<Observable<boolean>> = () => {
  const logger = inject<Logger>(LOGGER);
  const splashScreenLoading = inject(SplashScreenLoading);
  
  // Check if there's an archive to extract first
  const fileService = inject<FileService>(FILE_PROCESSOR);
  
  splashScreenLoading.show('Extracting Instagram Archive');
  
  return from(fileService.extractArchive()).pipe(
    catchError((error) => {
      logger.warn('Archive extraction failed or no archive available:', error);
      // Don't show error to user, just log it and continue
      // The auth step can still work without extracted archive
      return of(true); // Return true to allow navigation to continue
    }),
    tap((result) => {
      if (result) {
        logger.log('Archive extraction completed');
      }
    }),
    finalize(() => {
      splashScreenLoading.hide();
    })
  );
};
