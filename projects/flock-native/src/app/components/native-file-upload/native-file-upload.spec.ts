import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NativeFileUploadControl } from './native-file-upload';
import { NativeFileProcessor } from '../../service/native-file-processor/native-file-processor';

describe('NativeFileUploadControl', () => {
  let component: NativeFileUploadControl;
  let fixture: ComponentFixture<NativeFileUploadControl>;
  let mockFileProcessor: jasmine.SpyObj<NativeFileProcessor>;
  let consoleLogSpy: jasmine.Spy;
  let consoleErrorSpy: jasmine.Spy;

  beforeEach(async () => {
    mockFileProcessor = jasmine.createSpyObj('NativeFileProcessor', ['selectFile']);
    consoleLogSpy = spyOn(console, 'log');
    consoleErrorSpy = spyOn(console, 'error');

    await TestBed.configureTestingModule({
      imports: [NativeFileUploadControl],
      providers: [
        { provide: NativeFileProcessor, useValue: mockFileProcessor }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NativeFileUploadControl);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.accept).toBe('.zip');
    expect(component.disabled).toBe(false);
    expect(component.value).toBeNull();
    expect(component.isSelecting).toBe(false);
  });

  describe('ControlValueAccessor', () => {
    it('should write value', () => {
      const file = new File(['content'], 'test.zip');
      
      component.writeValue(file);
      
      expect(component.value).toBe(file);
    });

    it('should write null value', () => {
      component.writeValue(null);
      
      expect(component.value).toBeNull();
    });

    it('should register onChange callback', () => {
      const onChangeSpy = jasmine.createSpy('onChange');
      
      component.registerOnChange(onChangeSpy);
      component.value = new File(['content'], 'test.zip');
      
      expect(onChangeSpy).toHaveBeenCalledWith(component.value);
    });

    it('should register onTouched callback', () => {
      const onTouchedSpy = jasmine.createSpy('onTouched');
      
      component.registerOnTouched(onTouchedSpy);
      
      expect(component.onTouched).toBe(onTouchedSpy);
    });

    it('should set disabled state', () => {
      component.setDisabledState(true);
      expect(component.disabled).toBe(true);
      
      component.setDisabledState(false);
      expect(component.disabled).toBe(false);
    });

    it('should call onChange when value is set', () => {
      const onChangeSpy = jasmine.createSpy('onChange');
      component.registerOnChange(onChangeSpy);
      
      const file = new File(['content'], 'test.zip');
      component.value = file;
      
      expect(onChangeSpy).toHaveBeenCalledWith(file);
    });
  });

  describe('openFileDialog', () => {
    it('should open native file picker and select file', async () => {
      const mockFile = new File(['content'], 'archive.zip');
      mockFileProcessor.selectFile.and.returnValue(Promise.resolve(mockFile));

      await component.openFileDialog();

      expect(mockFileProcessor.selectFile).toHaveBeenCalled();
      expect(component.value).toBe(mockFile);
      expect(component.isSelecting).toBe(false);
      expect(consoleLogSpy).toHaveBeenCalledWith('🦅 Opening native file picker...');
      expect(consoleLogSpy).toHaveBeenCalledWith('🦅 File selected via native picker:', 'archive.zip');
    });

    it('should handle file selection cancellation', async () => {
      mockFileProcessor.selectFile.and.returnValue(Promise.resolve(null));

      await component.openFileDialog();

      expect(mockFileProcessor.selectFile).toHaveBeenCalled();
      expect(component.value).toBeNull();
      expect(component.isSelecting).toBe(false);
      expect(consoleLogSpy).toHaveBeenCalledWith('🦅 File selection canceled');
    });

    it('should not open picker when disabled', async () => {
      component.disabled = true;

      await component.openFileDialog();

      expect(mockFileProcessor.selectFile).not.toHaveBeenCalled();
    });

    it('should not open picker when already selecting', async () => {
      component.isSelecting = true;

      await component.openFileDialog();

      expect(mockFileProcessor.selectFile).not.toHaveBeenCalled();
    });

    it('should set isSelecting flag during selection', async () => {
      let selectingDuringCall = false;
      
      mockFileProcessor.selectFile.and.callFake(async () => {
        selectingDuringCall = component.isSelecting;
        return new File(['content'], 'test.zip');
      });

      await component.openFileDialog();

      expect(selectingDuringCall).toBe(true);
      expect(component.isSelecting).toBe(false); // Reset after completion
    });

    it('should call onTouched when file is selected', async () => {
      const onTouchedSpy = jasmine.createSpy('onTouched');
      component.registerOnTouched(onTouchedSpy);
      
      const mockFile = new File(['content'], 'test.zip');
      mockFileProcessor.selectFile.and.returnValue(Promise.resolve(mockFile));

      await component.openFileDialog();

      expect(onTouchedSpy).toHaveBeenCalled();
    });

    it('should not call onTouched when selection is canceled', async () => {
      const onTouchedSpy = jasmine.createSpy('onTouched');
      component.registerOnTouched(onTouchedSpy);
      
      mockFileProcessor.selectFile.and.returnValue(Promise.resolve(null));

      await component.openFileDialog();

      expect(onTouchedSpy).not.toHaveBeenCalled();
    });

    it('should handle errors during file selection', async () => {
      const error = new Error('Selection failed');
      mockFileProcessor.selectFile.and.returnValue(Promise.reject(error));

      await component.openFileDialog();

      expect(consoleErrorSpy).toHaveBeenCalledWith('🦅 Error opening native file picker:', error);
      expect(component.isSelecting).toBe(false); // Ensure flag is reset
    });

    it('should reset isSelecting flag even if error occurs', async () => {
      mockFileProcessor.selectFile.and.returnValue(Promise.reject(new Error('Test error')));

      await component.openFileDialog();

      expect(component.isSelecting).toBe(false);
    });
  });

  describe('removeFile', () => {
    it('should remove selected file', () => {
      const file = new File(['content'], 'test.zip');
      component.value = file;

      component.removeFile();

      expect(component.value).toBeNull();
      expect(consoleLogSpy).toHaveBeenCalledWith('🦅 File removed');
    });

    it('should call onChange with null when removing file', () => {
      const onChangeSpy = jasmine.createSpy('onChange');
      component.registerOnChange(onChangeSpy);
      
      const file = new File(['content'], 'test.zip');
      component.value = file;
      onChangeSpy.calls.reset(); // Clear the call from setting value

      component.removeFile();

      expect(onChangeSpy).toHaveBeenCalledWith(null);
    });

    it('should work when no file is selected', () => {
      component.value = null;

      component.removeFile();

      expect(component.value).toBeNull();
      expect(consoleLogSpy).toHaveBeenCalledWith('🦅 File removed');
    });
  });

  describe('Input properties', () => {
    it('should accept custom accept attribute', () => {
      component.accept = '.tar.gz';
      
      expect(component.accept).toBe('.tar.gz');
    });

    it('should accept disabled state', () => {
      component.disabled = true;
      
      expect(component.disabled).toBe(true);
    });
  });

  describe('Integration with file selection', () => {
    it('should handle full file selection workflow', async () => {
      const onChangeSpy = jasmine.createSpy('onChange');
      const onTouchedSpy = jasmine.createSpy('onTouched');
      
      component.registerOnChange(onChangeSpy);
      component.registerOnTouched(onTouchedSpy);
      
      const mockFile = new File(['content'], 'instagram-archive.zip');
      mockFileProcessor.selectFile.and.returnValue(Promise.resolve(mockFile));

      // Open dialog
      await component.openFileDialog();

      // Verify file was selected
      expect(component.value).toBe(mockFile);
      expect(onChangeSpy).toHaveBeenCalledWith(mockFile);
      expect(onTouchedSpy).toHaveBeenCalled();
      
      // Remove file
      component.removeFile();
      
      // Verify file was removed
      expect(component.value).toBeNull();
      expect(onChangeSpy).toHaveBeenCalledWith(null);
    });
  });
});

