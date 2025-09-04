import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { FileUploadControl } from './file-upload-control';

describe('FileUploadControl', () => {
  let component: FileUploadControl;
  let fixture: ComponentFixture<FileUploadControl>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FileUploadControl]
    }).compileComponents();

    fixture = TestBed.createComponent(FileUploadControl);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('onFileInputChange sets value and calls touched when file selected', () => {
    spyOn(component, 'onTouched');
    const file = new File(['data'], 'a.zip');
    const input = fixture.debugElement.query(By.css('input'));
    const native: HTMLInputElement = input.nativeElement;
    Object.defineProperty(native, 'files', { value: [file] });
    const event = new Event('change');

    native.dispatchEvent(event);
    fixture.detectChanges();

    expect(component.value).toBe(file);
    expect(component.onTouched).toHaveBeenCalled();
  });

  it('onFileInputChange ignores when no file selected', () => {
    component.value = null;
    const input = fixture.debugElement.query(By.css('input'));
    const native: HTMLInputElement = input.nativeElement;
    Object.defineProperty(native, 'files', { value: [] });
    native.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(component.value).toBeNull();
  });

  it('removeFile clears value and notifies change', () => {
    component.onChange = jasmine.createSpy('onChange');
    component.value = new File(['x'], 'b.zip');
    component.removeFile();
    expect(component.value).toBeNull();
    expect(component.onChange).toHaveBeenCalledWith(null);
  });

  it('openFileDialog clicks input when enabled', () => {
    const input = fixture.debugElement.query(By.css('input'));
    const native: HTMLInputElement = input.nativeElement;
    spyOn(native, 'click');

    component.disabled = false;
    component.openFileDialog();
    expect(native.click).toHaveBeenCalled();
  });

  it('openFileDialog does nothing when disabled', () => {
    const input = fixture.debugElement.query(By.css('input'));
    const native: HTMLInputElement = input.nativeElement;
    spyOn(native, 'click');

    component.disabled = true;
    component.openFileDialog();
    expect(native.click).not.toHaveBeenCalled();
  });
});
