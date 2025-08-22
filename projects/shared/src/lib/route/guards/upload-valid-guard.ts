import { inject } from '@angular/core';
import { CanDeactivateFn } from '@angular/router';
import { FileService, FILE_PROCESSOR } from '../../services';
import { MatSnackBar } from '@angular/material/snack-bar';

/**
 * Guard to prevent the user from leaving the upload step if the archive is not valid
 * Messages the user to upload a valid archive
 */
export const uploadValidGuard: CanDeactivateFn<unknown> = () => {
  const fileService = inject<FileService>(FILE_PROCESSOR);
  if (!fileService.archivedFile) {
    inject(MatSnackBar).open('Please upload a valid archive', 'Close', {
      duration: 3000,
    });
  }
  return !!fileService.archivedFile;
};
