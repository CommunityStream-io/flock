import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup } from '@angular/forms';
import { NativeUpload } from './upload';
import { FILE_PROCESSOR, FileService, LOGGER, Logger, ValidationResult } from 'shared';
import { NativeFileUploadControl } from '../../components/native-file-upload/native-file-upload';

describe('NativeUpload', () => {
  let component: NativeUpload;
  let fixture: ComponentFixture<NativeUpload>;
  let mockFileService: jasmine.SpyObj<FileService>;
  let mockLogger: jasmine.SpyObj<Logger>;

  beforeEach(async () => {
    mockFileService = jasmine.createSpyObj('FileService', ['validateArchive'], {
      archivedFile: null
    });
    // Default mock implementation to prevent undefined errors
    mockFileService.validateArchive.and.returnValue(Promise.resolve({
      isValid: true,
      errors: [],
      warnings: [],
      timestamp: new Date()
    }));
    mockLogger = jasmine.createSpyObj('Logger', ['log', 'error', 'workflow']);

    await TestBed.configureTestingModule({
      imports: [NativeUpload],
      providers: [
        { provide: FILE_PROCESSOR, useValue: mockFileService },
        { provide: LOGGER, useValue: mockLogger }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NativeUpload);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should initialize form group with required validator', () => {
      expect(component.fileUploadForm).toBeDefined();
      expect(component.fileUploadForm.get('instagramArchive')).toBeDefined();
      
      const control = component.fileUploadForm.get('instagramArchive');
      expect(control?.hasError('required')).toBe(true);
    });

    it('should initialize with null file value', () => {
      expect(component.fileUploadForm.get('instagramArchive')?.value).toBeNull();
      expect(component.selectedFile).toBeNull();
    });

    it('should log initialization message on ngOnInit', () => {
      fixture.detectChanges(); // triggers ngOnInit

      expect(mockLogger.log).toHaveBeenCalledWith('🦅 Native Upload step initialized');
    });

    it('should subscribe to form value changes on ngOnInit', () => {
      fixture.detectChanges(); // triggers ngOnInit

      const file = new File(['content'], 'test.zip');
      component.fileUploadForm.get('instagramArchive')?.setValue(file);

      expect(mockLogger.workflow).toHaveBeenCalledWith('🦅 Native file selected: test.zip');
    });
  });

  describe('selectedFile getter', () => {
    it('should return the selected file', () => {
      const file = new File(['content'], 'archive.zip');
      component.fileUploadForm.get('instagramArchive')?.setValue(file);

      expect(component.selectedFile).toBe(file);
    });

    it('should return null when no file is selected', () => {
      component.fileUploadForm.get('instagramArchive')?.setValue(null);

      expect(component.selectedFile).toBeNull();
    });

    it('should return null when form control does not exist', () => {
      // This is a theoretical edge case
      expect(component.selectedFile).toBeNull();
    });
  });

  describe('onFileSelected', () => {
    it('should log workflow message when file is selected', () => {
      const file = new File(['content'], 'instagram-archive.zip');

      component.onFileSelected(file);

      expect(mockLogger.workflow).toHaveBeenCalledWith('🦅 Native file selected: instagram-archive.zip');
    });

    it('should call validateArchive on file service', () => {
      const file = new File(['content'], 'test.zip');
      const validationResult: ValidationResult = {
        isValid: true,
        errors: [],
        warnings: [],
        timestamp: new Date()
      };
      mockFileService.validateArchive.and.returnValue(Promise.resolve(validationResult));

      component.onFileSelected(file);

      expect(mockFileService.validateArchive).toHaveBeenCalledWith(file);
    });

    it('should log success message when file is valid', async () => {
      const file = new File(['content'], 'valid.zip');
      const validationResult: ValidationResult = {
        isValid: true,
        errors: [],
        warnings: [],
        timestamp: new Date()
      };
      mockFileService.validateArchive.and.returnValue(Promise.resolve(validationResult));

      await component.onFileSelected(file);

      expect(mockLogger.log).toHaveBeenCalledWith('🦅 File valid.zip is valid.');
    });

    it('should log error message when file is invalid', async () => {
      const file = new File(['content'], 'invalid.zip');
      const validationResult: ValidationResult = {
        isValid: false,
        errors: ['Missing required structure', 'Invalid JSON format'],
        warnings: [],
        timestamp: new Date()
      };
      mockFileService.validateArchive.and.returnValue(Promise.resolve(validationResult));

      await component.onFileSelected(file);

      expect(mockLogger.error).toHaveBeenCalledWith(
        '🦅 File invalid.zip is invalid: Missing required structure, Invalid JSON format'
      );
    });

    it('should handle validation errors', async () => {
      const file = new File(['content'], 'error.zip');
      const error = new Error('Validation service unavailable');
      mockFileService.validateArchive.and.returnValue(Promise.reject(error));

      component.onFileSelected(file);
      
      // Wait for promise to resolve
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(mockLogger.error).toHaveBeenCalledWith('🦅 Error validating file: Validation service unavailable');
    });

    it('should handle validation result with empty errors array', async () => {
      const file = new File(['content'], 'valid.zip');
      const validationResult: ValidationResult = {
        isValid: true,
        errors: [],
        warnings: [],
        timestamp: new Date()
      };
      mockFileService.validateArchive.and.returnValue(Promise.resolve(validationResult));

      await component.onFileSelected(file);

      expect(mockLogger.log).toHaveBeenCalledWith('🦅 File valid.zip is valid.');
      expect(mockLogger.error).not.toHaveBeenCalled();
    });

    it('should handle validation result with multiple errors', async () => {
      const file = new File(['content'], 'multi-error.zip');
      const validationResult: ValidationResult = {
        isValid: false,
        errors: ['Error 1', 'Error 2', 'Error 3'],
        warnings: [],
        timestamp: new Date()
      };
      mockFileService.validateArchive.and.returnValue(Promise.resolve(validationResult));

      await component.onFileSelected(file);

      expect(mockLogger.error).toHaveBeenCalledWith(
        '🦅 File multi-error.zip is invalid: Error 1, Error 2, Error 3'
      );
    });
  });

  describe('onFileRemoved', () => {
    it('should log workflow message when file is removed', () => {
      component.onFileRemoved();

      expect(mockLogger.workflow).toHaveBeenCalledWith('🦅 Native file removed');
    });

    it('should set archivedFile to null in file service', () => {
      const file = new File(['content'], 'test.zip');
      mockFileService.archivedFile = file;

      component.onFileRemoved();

      expect(mockFileService.archivedFile).toBeNull();
    });

    it('should work when archivedFile is already null', () => {
      mockFileService.archivedFile = null;

      component.onFileRemoved();

      expect(mockFileService.archivedFile).toBeNull();
      expect(mockLogger.workflow).toHaveBeenCalledWith('🦅 Native file removed');
    });
  });

  describe('Form value changes subscription', () => {
    it('should call onFileSelected when file is added', () => {
      const validationResult: ValidationResult = {
        isValid: true,
        errors: [],
        warnings: [],
        timestamp: new Date()
      };
      mockFileService.validateArchive.and.returnValue(Promise.resolve(validationResult));
      
      spyOn(component, 'onFileSelected');
      fixture.detectChanges(); // triggers ngOnInit and subscription

      const file = new File(['content'], 'new-file.zip');
      component.fileUploadForm.get('instagramArchive')?.setValue(file);

      expect(component.onFileSelected).toHaveBeenCalledWith(file);
    });

    it('should call onFileRemoved when file is cleared', () => {
      spyOn(component, 'onFileRemoved');
      fixture.detectChanges(); // triggers ngOnInit and subscription

      component.fileUploadForm.get('instagramArchive')?.setValue(null);

      expect(component.onFileRemoved).toHaveBeenCalled();
    });

    it('should handle rapid file changes', () => {
      const validationResult: ValidationResult = {
        isValid: true,
        errors: [],
        warnings: [],
        timestamp: new Date()
      };
      mockFileService.validateArchive.and.returnValue(Promise.resolve(validationResult));
      
      fixture.detectChanges(); // triggers ngOnInit

      const file1 = new File(['content1'], 'file1.zip');
      const file2 = new File(['content2'], 'file2.zip');

      component.fileUploadForm.get('instagramArchive')?.setValue(file1);
      component.fileUploadForm.get('instagramArchive')?.setValue(file2);
      component.fileUploadForm.get('instagramArchive')?.setValue(null);

      expect(mockLogger.workflow).toHaveBeenCalledWith('🦅 Native file selected: file1.zip');
      expect(mockLogger.workflow).toHaveBeenCalledWith('🦅 Native file selected: file2.zip');
      expect(mockLogger.workflow).toHaveBeenCalledWith('🦅 Native file removed');
    });
  });

  describe('Form validation', () => {
    it('should be invalid when no file is selected', () => {
      expect(component.fileUploadForm.valid).toBe(false);
      expect(component.fileUploadForm.get('instagramArchive')?.hasError('required')).toBe(true);
    });

    it('should be valid when a file is selected', () => {
      const file = new File(['content'], 'archive.zip');
      component.fileUploadForm.get('instagramArchive')?.setValue(file);

      expect(component.fileUploadForm.valid).toBe(true);
      expect(component.fileUploadForm.get('instagramArchive')?.hasError('required')).toBe(false);
    });

    it('should become invalid again when file is removed after being set', () => {
      const file = new File(['content'], 'archive.zip');
      component.fileUploadForm.get('instagramArchive')?.setValue(file);
      expect(component.fileUploadForm.valid).toBe(true);

      component.fileUploadForm.get('instagramArchive')?.setValue(null);
      expect(component.fileUploadForm.valid).toBe(false);
    });
  });

  describe('Integration workflow', () => {
    it('should handle complete file selection and removal workflow', async () => {
      const validationResult: ValidationResult = {
        isValid: true,
        errors: [],
        warnings: [],
        timestamp: new Date()
      };
      mockFileService.validateArchive.and.returnValue(Promise.resolve(validationResult));
      
      fixture.detectChanges(); // Initialize component

      // Select file
      const file = new File(['content'], 'instagram-data.zip');
      component.fileUploadForm.get('instagramArchive')?.setValue(file);

      await fixture.whenStable();

      expect(component.selectedFile).toBe(file);
      expect(mockLogger.workflow).toHaveBeenCalledWith('🦅 Native file selected: instagram-data.zip');
      expect(mockFileService.validateArchive).toHaveBeenCalledWith(file);
      expect(component.fileUploadForm.valid).toBe(true);

      // Remove file
      component.fileUploadForm.get('instagramArchive')?.setValue(null);

      expect(component.selectedFile).toBeNull();
      expect(mockLogger.workflow).toHaveBeenCalledWith('🦅 Native file removed');
      expect(mockFileService.archivedFile).toBeNull();
      expect(component.fileUploadForm.valid).toBe(false);
    });

    it('should handle validation failure during file selection', async () => {
      const validationResult: ValidationResult = {
        isValid: false,
        errors: ['Corrupted archive', 'Missing metadata'],
        warnings: [],
        timestamp: new Date()
      };
      mockFileService.validateArchive.and.returnValue(Promise.resolve(validationResult));
      
      fixture.detectChanges();

      const file = new File(['bad content'], 'corrupted.zip');
      component.fileUploadForm.get('instagramArchive')?.setValue(file);

      await fixture.whenStable();

      expect(mockLogger.workflow).toHaveBeenCalledWith('🦅 Native file selected: corrupted.zip');
      expect(mockLogger.error).toHaveBeenCalledWith(
        '🦅 File corrupted.zip is invalid: Corrupted archive, Missing metadata'
      );
    });
  });

  describe('Edge cases', () => {
    it('should handle undefined form control gracefully', () => {
      // Spy on the get method to return null (simulating missing control)
      spyOn(component.fileUploadForm, 'get').and.returnValue(null);

      expect(component.selectedFile).toBeNull();
    });

    it('should handle file with special characters in name', async () => {
      const file = new File(['content'], 'instagram_archive_2024-01-01_~!@#$%^&()_+.zip');
      const validationResult: ValidationResult = {
        isValid: true,
        errors: [],
        warnings: [],
        timestamp: new Date()
      };
      mockFileService.validateArchive.and.returnValue(Promise.resolve(validationResult));

      await component.onFileSelected(file);

      expect(mockLogger.workflow).toHaveBeenCalledWith(
        `🦅 Native file selected: instagram_archive_2024-01-01_~!@#$%^&()_+.zip`
      );
    });

    it('should handle very large file names', async () => {
      const longName = 'a'.repeat(200) + '.zip';
      const file = new File(['content'], longName);
      const validationResult: ValidationResult = {
        isValid: true,
        errors: [],
        warnings: [],
        timestamp: new Date()
      };
      mockFileService.validateArchive.and.returnValue(Promise.resolve(validationResult));

      await component.onFileSelected(file);

      expect(mockLogger.workflow).toHaveBeenCalledWith(`🦅 Native file selected: ${longName}`);
    });

    it('should handle validation errors with no message', async () => {
      const file = new File(['content'], 'test.zip');
      const error = new Error();
      error.message = '';
      mockFileService.validateArchive.and.returnValue(Promise.reject(error));

      component.onFileSelected(file);
      
      // Wait for promise to resolve
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(mockLogger.error).toHaveBeenCalledWith('🦅 Error validating file: ');
    });
  });

  describe('Dependency injection', () => {
    it('should inject FILE_PROCESSOR service', () => {
      expect((component as any).fileProcessorService).toBe(mockFileService);
    });

    it('should inject LOGGER service', () => {
      expect((component as any).logger).toBe(mockLogger);
    });
  });
});

