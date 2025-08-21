import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'shared-upload-step',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, MatCardModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule],
  templateUrl: './upload-step.html',
  styleUrl: './upload-step.css'
})
export class UploadStepComponent {
  private readonly formBuilder = inject(FormBuilder);

  readonly fileControl = this.formBuilder.control<File | null>(null, { validators: [Validators.required] });
  readonly form = this.formBuilder.group({ file: this.fileControl });

  readonly isValid = computed(() => this.form.valid);
  readonly fileName = signal<string>('');
  readonly isDragOver = signal<boolean>(false);
  readonly errorMessage = signal<string>('');

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files && input.files.length > 0 ? input.files[0] : null;
    this.applyFileSelection(file);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);
    const files = event.dataTransfer?.files;
    const file = files && files.length > 0 ? files[0] : null;
    this.applyFileSelection(file);
  }

  private applyFileSelection(file: File | null): void {
    if (!file) {
      this.fileControl.setValue(null);
      this.fileName.set('');
      this.errorMessage.set('');
      return;
    }

    const isZip = this.isZipFile(file);
    if (!isZip) {
      this.fileControl.setValue(null);
      this.fileName.set('');
      this.errorMessage.set('Only .zip files are allowed');
      return;
    }

    this.errorMessage.set('');
    this.fileControl.setValue(file);
    this.fileName.set(file.name);
  }

  private isZipFile(file: File): boolean {
    const lowerName = (file.name || '').toLowerCase();
    if (lowerName.endsWith('.zip')) {
      return true;
    }
    const type = (file.type || '').toLowerCase();
    return type === 'application/zip' || type === 'application/x-zip-compressed' || type === 'multipart/x-zip';
  }
}

