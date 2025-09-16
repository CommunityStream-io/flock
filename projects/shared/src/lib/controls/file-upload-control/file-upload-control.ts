import { Component, forwardRef, Input, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'shared-file-upload-control',
  standalone: true,
  imports: [CommonModule, MatButton, MatIconButton, MatIcon],
  templateUrl: './file-upload-control.html',
  styleUrl: './file-upload-control.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FileUploadControl),
      multi: true
    }
  ]
})
export class FileUploadControl implements ControlValueAccessor {
  @ViewChild('fileInput', { static: true }) fileInput!: ElementRef<HTMLInputElement>;
  
  @Input() accept: string = '.zip';
  @Input() disabled: boolean = false;

  private _value: File | null = null;

  // ControlValueAccessor implementation
  onChange = (file: File | null) => { void file; };
  onTouched = () => {};

  get value(): File | null {
    return this._value;
  }

  set value(value: File | null) {
    this._value = value;
    this.onChange(value);
  }

  // ControlValueAccessor methods
  writeValue(value: File | null): void {
    this._value = value;
  }

  registerOnChange(fn: (value: File | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  // File handling methods
  onFileInputChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0] || null;
    
    if (file) {
      this.value = file;
      this.onTouched();
    }
  }

  removeFile(): void {
    this.value = null;
    
    // Reset the file input
    if (this.fileInput?.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }
  }

  openFileDialog(): void {
    if (!this.disabled && this.fileInput?.nativeElement) {
      this.fileInput.nativeElement.click();
    }
  }
}
