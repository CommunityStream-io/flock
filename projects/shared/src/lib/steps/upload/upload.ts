import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Component, inject, OnInit } from '@angular/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { FILE_PROCESSOR, FileService, LOGGER, Logger } from '../../services';
import { FileUploadControl } from '../../controls/file-upload-control/file-upload-control';
import { filter, tap } from 'rxjs/operators';

@Component({
  selector: 'shared-upload',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FileUploadControl],
  templateUrl: './upload.html',
  styleUrl: './upload.css',
})
export class Upload implements OnInit {
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

  onFileSelected(file: File) {
    this.logger.workflow(`File selected: ${file.name}`);
    
    // Validate the archive
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

  onFileRemoved() {
    this.logger.workflow('File removed');
    this.fileProcessorService.archivedFile = null;
  }

  ngOnInit() {
    this.fileUploadForm.get('instagramArchive')?.valueChanges.pipe(
      tap((value) => {
        if (value) {
          this.onFileSelected(value);
        } else {
          this.onFileRemoved();
        }
      })
    ).subscribe();
  }
}
