import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Component, inject, OnInit } from '@angular/core';
import { FILE_PROCESSOR, FileService, LOGGER, Logger } from 'shared';
import { NativeFileUploadControl } from '../../components/native-file-upload/native-file-upload';
import { tap } from 'rxjs/operators';

/**
 * Native Upload Step Component
 * Uses native file picker via NativeFileUploadControl
 * Delegates all file operations to NativeFileProcessor via IPC
 */
@Component({
  selector: 'native-upload',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NativeFileUploadControl],
  templateUrl: './upload.html',
  styleUrl: './upload.css',
})
export class NativeUpload implements OnInit {
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
    this.logger.workflow(`🦅 Native file selected: ${file.name}`);
    
    // Validate the archive using native file processor
    this.fileProcessorService
      .validateArchive(file)
      .then((result) => {
        if (result.isValid) {
          this.logger.log(`🦅 File ${file.name} is valid.`);
        } else {
          this.logger.error(`🦅 File ${file.name} is invalid: ${result.errors.join(', ')}`);
        }
      })
      .catch((error) => {
        this.logger.error(`🦅 Error validating file: ${error.message}`);
      });
  }

  onFileRemoved() {
    this.logger.workflow('🦅 Native file removed');
    this.fileProcessorService.archivedFile = null;
  }

  ngOnInit() {
    this.logger.log('🦅 Native Upload step initialized');
    
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

