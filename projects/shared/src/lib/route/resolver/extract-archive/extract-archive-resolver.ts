import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { FILE_PROCESSOR, FileService, LOGGER, Logger, SplashScreenLoading } from '../../../services';
import { catchError, finalize, from, Observable, of, tap } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

export const extractArchiveResolver: ResolveFn<Observable<boolean>> = () => {
  const logger = inject<Logger>(LOGGER);
  const snackbar = inject(MatSnackBar);
  const splashScreenLoading = inject(SplashScreenLoading);
  splashScreenLoading.show('Extracting Instagram Archive');
  return from(inject<FileService>(FILE_PROCESSOR).extractArchive()).pipe(
    catchError(() => {
      snackbar.open('Error extracting archive', 'Close', {
        duration: 3000,
      });
      logger.error('Error extracting archive');
      splashScreenLoading.hide();
      return of(false);
    }),
    tap((result) => {
      if (result) {
        logger.log('Archive extracted successfully');
      }
    }),
    finalize(() => {
      splashScreenLoading.hide();
    })
  );
};
