import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { FILE_PROCESSOR, FileService, LOGGER, Logger, SplashScreenLoading } from '../../../services';
import { catchError, finalize, from, of, tap } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

export const extractArchiveResolver: ResolveFn<Observable<boolean>> = () => {
  const logger = inject<Logger>(LOGGER);
  const splashScreenLoading = inject(SplashScreenLoading);
  const snackBar = inject(MatSnackBar);
  
  // Check if there's an archive to extract first
  const fileService = inject<FileService>(FILE_PROCESSOR);
  
  splashScreenLoading.show('Extracting Instagram Archive');
  
  return from(fileService.extractArchive()).pipe(
    tap((result) => {
      if (result) {
        logger.log('Archive extracted successfully');
      }
    }),
    catchError((error) => {
      logger.error('Error extracting archive', error);
      snackBar.open('Error extracting archive', 'Close', { duration: 3000 });
      return of(false); // Return false to indicate failure
    }),
    finalize(() => {
      splashScreenLoading.hide();
    })
  );
};
