import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'shared-upload',
  imports: [MatIcon, MatButton, CommonModule],
  templateUrl: './upload.html',
  styleUrl: './upload.css'
})
export class Upload {
  files: File[] = [];
  // TODO wire up file processor service when available
onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.files = Array.from(input.files);
      const file = input.files[0];
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
    }
  }
}
