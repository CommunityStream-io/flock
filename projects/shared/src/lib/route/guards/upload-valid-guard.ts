import { inject } from '@angular/core';
import { CanDeactivateFn } from '@angular/router';
import { FileService, FILE_PROCESSOR } from '../../services';

/**
 * Guard to prevent the user from leaving the upload step if the archive is not valid
 * Messages the user to upload a valid archive
 */
export const uploadValidGuard: CanDeactivateFn<unknown> = () => {
  return inject<FileService>(FILE_PROCESSOR).validated;
};
