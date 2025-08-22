import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { FILE_PROCESSOR, FileService, LOGGER, Logger } from '../../../services';
import { catchError, from, Observable, of, tap } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

export const extractArchiveResolver: ResolveFn<Observable<boolean>> = () => {
  const logger = inject<Logger>(LOGGER);
  const snackbar = inject(MatSnackBar);
  return from(inject<FileService>(FILE_PROCESSOR).extractArchive()).pipe(
    catchError(() => {
      snackbar.open('Error extracting archive', 'Close', {
        duration: 3000,
      });
      logger.error('Error extracting archive');
      return of(false);
    }),
    tap((result) => {
      if (result) {
        logger.log('Archive extracted successfully');
      }
    }),
  );
};
