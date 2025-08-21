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

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files && input.files.length > 0 ? input.files[0] : null;
    this.fileControl.setValue(file);
    this.fileName.set(file ? file.name : '');
  }
}

