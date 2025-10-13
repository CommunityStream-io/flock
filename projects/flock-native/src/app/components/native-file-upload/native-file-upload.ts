import { Component, forwardRef, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { NativeFileProcessor } from '../../service/native-file-processor/native-file-processor';

/**
 * Native file upload control for Flock Native
 * Uses NativeFileProcessor to leverage Electron's native file picker
 * 
 * This component wraps the native file selection logic and provides
 * the same interface as the shared FileUploadControl, but delegates
 * to the Electron IPC layer for actual file selection.
 */
@Component({
  selector: 'native-file-upload-control',
  standalone: true,
  imports: [CommonModule, MatButton, MatIconButton, MatIcon],
  templateUrl: './native-file-upload.html',
  styleUrl: './native-file-upload.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NativeFileUploadControl),
      multi: true
    }
  ]
})
export class NativeFileUploadControl implements ControlValueAccessor {
  private fileProcessor = inject(NativeFileProcessor);
  
  @Input() accept: string = '.zip';
  @Input() disabled: boolean = false;

  private _value: File | null = null;
  isSelecting = false;

  // ControlValueAccessor implementation
  onChange = (value: File | null) => {};
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

  /**
   * Opens native file picker via Electron IPC
   * Delegates to NativeFileProcessor.selectFile()
   */
  async openFileDialog(): Promise<void> {
    if (this.disabled || this.isSelecting) {
      return;
    }

    try {
      this.isSelecting = true;
      console.log('🦅 Opening native file picker...');
      
      // Delegate to NativeFileProcessor which handles all Electron IPC
      const file = await this.fileProcessor.selectFile();
      
      if (file) {
        this.value = file;
        this.onTouched();
        console.log('🦅 File selected via native picker:', file.name);
      } else {
        console.log('🦅 File selection canceled');
      }
    } catch (error) {
      console.error('🦅 Error opening native file picker:', error);
    } finally {
      this.isSelecting = false;
    }
  }

  /**
   * Removes the selected file
   */
  removeFile(): void {
    this.value = null;
    console.log('🦅 File removed');
  }
}

