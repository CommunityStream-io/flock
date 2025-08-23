import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Component, inject } from '@angular/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { FILE_PROCESSOR, FileService, LOGGER, Logger } from '../../services';

@Component({
  selector: 'shared-upload',
  standalone: true,
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

  /**
   * Getter for the selected file
   */
  get selectedFile(): File | null {
    return this.fileUploadForm.get('instagramArchive')?.value || null;
  }

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

  onFileInputChange(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0] || null;
    this.onFileSelected(file);
  }

  removeFile(file: File) {
    this.fileUploadForm.reset();
    this.fileProcessorService.archivedFile = null;
  }


}
