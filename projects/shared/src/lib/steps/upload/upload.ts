import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Component, inject } from '@angular/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { FILE_PROCESSOR, FileService, LOGGER, Logger } from '../../services';
import { tap } from 'rxjs';

@Component({
  selector: 'shared-upload',
  imports: [MatIcon, MatButton, CommonModule, MatIconButton, ReactiveFormsModule],
  templateUrl: './upload.html',
  styleUrl: './upload.css',
})
export class Upload {
  private fileProcessorService: FileService = inject(
    FILE_PROCESSOR
  ) as FileService;
  private logger = inject(LOGGER) as Logger;

  /**
   * Form group for file upload and resetting
   */
  public fileUploadForm = new FormGroup({
    instagramArchive: new FormControl<File | null>(null, [Validators.required])
  });

  onFileSelected(file: File | null) {
    this.logger.workflow(`File selected: ${file?.name}`);
    if (file) {
      this.fileProcessorService
        .validateArchive(file)
        .then((result) => {
          if (result.isValid) {
            this.logger.log(`File ${file.name} is valid.`);
          } else {
            this.logger.error(`File ${file.name} is invalid: ${result.errors.join(', ')}`);
          }
        })
        .catch((error) => {
          this.logger.error(`Error validating file: ${error.message}`);
        });
    }
  }

  removeFile(file: File) {
    this.fileUploadForm.reset();
  }

  ngOnInit() {
    this.fileUploadForm.get('instagramArchive')?.valueChanges.pipe(tap((file: File | null) => {
      this.onFileSelected(file);
    })).subscribe();
  }
}
