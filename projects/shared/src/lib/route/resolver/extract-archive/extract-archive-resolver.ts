import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { FILE_PROCESSOR, FileService } from '../../../services';
import { catchError, from, Observable, of } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

export const extractArchiveResolver: ResolveFn<Observable<boolean>> = () => {
  return from(inject<FileService>(FILE_PROCESSOR).extractArchive()).pipe(
    catchError(() => {
      inject(MatSnackBar).open('Error extracting archive', 'Close', {
        duration: 3000,
      });
      return of(false);
    })
  );
};
