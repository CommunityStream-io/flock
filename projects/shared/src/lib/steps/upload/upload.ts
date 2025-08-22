import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { FILE_PROCESSOR, FileService } from '../../services';

@Component({
  selector: 'shared-upload',
  imports: [MatIcon, MatButton, CommonModule, MatIconButton],
  templateUrl: './upload.html',
  styleUrl: './upload.css'
})
export class Upload {
  files: File[] = [];
  // TODO wire up file processor service when available
  private fileProcessorService: FileService = inject(FILE_PROCESSOR) as FileService;
onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.files = Array.from(input.files);
      const file: File = input.files[0];
      console.log('Selected file:', file.name);
      console.log('File size:', file.size);
      console.log('File type:', file.type);
      // You can add further processing logic here, such as uploading the file to a server
      // or reading its contents using FileReader API.
      // For example:
      // const reader = new FileReader();
      // reader.onload = (e) => {
      //   console.log('File content:', e.target?.result);
      // };
      // reader.readAsText(file);       
      // Handle the file upload logic here
      this.fileProcessorService.validateArchive(file.name)
        .then(result => {
          if (result.isValid) {
            console.log('File is valid');
          } else {
            console.error('File is invalid:', result.errors);
          }
        })
        .catch(error => {
          console.error('Error validating file:', error);
        });
    }
  }

  removeFile(file: File) {
    this.files = this.files.filter(f => f !== file);
    console.log('Removed file:', file.name);
  }
}
