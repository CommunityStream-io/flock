import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { Upload } from './upload';
import { FILE_PROCESSOR, LOGGER, FileService, Logger } from '../../services';

describe('Feature: File Upload Component', () => {
  let component: Upload;
  let fixture: ComponentFixture<Upload>;
  let mockFileService: jasmine.SpyObj<FileService>;
  let mockLogger: jasmine.SpyObj<Logger>;

  beforeEach(async () => {
    mockFileService = jasmine.createSpyObj('FileService', ['validateArchive', 'extractArchive'], {
      archivedFile: null
    });
    mockLogger = jasmine.createSpyObj('Logger', ['log', 'error', 'warn', 'workflow', 'instrument']);

    // Set up default mock return values
    mockFileService.validateArchive.and.returnValue(Promise.resolve({
      isValid: true,
      errors: [],
      warnings: [],
      timestamp: new Date()
    }));

    await TestBed.configureTestingModule({
      imports: [Upload],
      providers: [
        { provide: FILE_PROCESSOR, useValue: mockFileService },
        { provide: LOGGER, useValue: mockLogger },
        provideNoopAnimations()
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Upload);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Scenario: Component initialization', () => {
    it('Given the component is created, When it initializes, Then it should be truthy', () => {
      // Given: Component is created
      console.log('🔧 BDD: Upload component is created');

      // When: Component initializes
      console.log('⚙️ BDD: Component initializes');

      // Then: Should be truthy
      console.log('✅ BDD: Component is created successfully');
      expect(component).toBeTruthy();
    });

    it('Given the component is created, When it initializes, Then it should have a file upload form', () => {
      // Given: Component is created
      console.log('🔧 BDD: Upload component is created');

      // When: Component initializes
      console.log('⚙️ BDD: Component initializes');

      // Then: Should have a file upload form
      console.log('✅ BDD: Component has file upload form');
      expect(component.fileUploadForm).toBeTruthy();
      expect(component.fileUploadForm.get('instagramArchive')).toBeTruthy();
    });
  });

  describe('Scenario: File selection handling', () => {
    it('Given a file is selected, When onFileSelected is called, Then it should log the selection', () => {
      // Given: A file is selected
      console.log('🔧 BDD: Setting up test file');
      const testFile = new File(['test content'], 'test.zip', { type: 'application/zip' });

      // When: onFileSelected is called
      console.log('⚙️ BDD: File is selected');
      component.onFileSelected(testFile);

      // Then: Should log the selection
      console.log('✅ BDD: File selection is logged');
      expect(mockLogger.workflow).toHaveBeenCalledWith('File selected: test.zip');
    });

    it('Given a file is selected, When onFileSelected is called, Then it should validate the archive', async () => {
      // Given: A file is selected and validation succeeds
      console.log('🔧 BDD: Setting up test file with successful validation');
      const testFile = new File(['test content'], 'test.zip', { type: 'application/zip' });
      mockFileService.validateArchive.and.returnValue(Promise.resolve({
        isValid: true,
        errors: [],
        warnings: [],
        timestamp: new Date()
      }));

      // When: onFileSelected is called
      console.log('⚙️ BDD: File is selected');
      component.onFileSelected(testFile);

      // Wait for validation to complete
      await fixture.whenStable();

      // Then: Should validate the archive
      console.log('✅ BDD: Archive validation is called');
      expect(mockFileService.validateArchive).toHaveBeenCalledWith(testFile);
      expect(mockLogger.log).toHaveBeenCalledWith('File test.zip is valid.');
    });

    it('Given a file is selected, When validation fails, Then it should log the error', async () => {
      // Given: A file is selected and validation fails
      console.log('🔧 BDD: Setting up test file with failed validation');
      const testFile = new File(['test content'], 'test.zip', { type: 'application/zip' });
      mockFileService.validateArchive.and.returnValue(Promise.resolve({
        isValid: false,
        errors: ['Invalid archive format'],
        warnings: [],
        timestamp: new Date()
      }));

      // When: onFileSelected is called
      console.log('⚙️ BDD: File is selected');
      component.onFileSelected(testFile);

      // Wait for validation to complete
      await fixture.whenStable();

      // Then: Should log the error
      console.log('✅ BDD: Validation error is logged');
      expect(mockLogger.error).toHaveBeenCalledWith('File test.zip is invalid: Invalid archive format');
    });
  });

  describe('Scenario: File removal handling', () => {
    it('Given a file is removed, When onFileRemoved is called, Then it should log the removal', () => {
      // Given: A file is removed
      console.log('🔧 BDD: Setting up file removal scenario');

      // When: onFileRemoved is called
      console.log('⚙️ BDD: File is removed');
      component.onFileRemoved();

      // Then: Should log the removal
      console.log('✅ BDD: File removal is logged');
      expect(mockLogger.workflow).toHaveBeenCalledWith('File removed');
      expect(mockFileService.archivedFile).toBeNull();
    });
  });

  describe('Scenario: Form validation', () => {
    it('Given no file is selected, When form is checked, Then selectedFile should return null', () => {
      // Given: No file is selected
      console.log('🔧 BDD: No file is selected');
      component.fileUploadForm.patchValue({ instagramArchive: null });

      // When: Form is checked
      console.log('⚙️ BDD: Checking selected file');

      // Then: Should return null
      console.log('✅ BDD: Selected file is null');
      expect(component.selectedFile).toBeNull();
    });

    it('Given a file is selected, When form is checked, Then selectedFile should return the file', () => {
      // Given: A file is selected
      console.log('🔧 BDD: Setting up test file');
      const testFile = new File(['test content'], 'test.zip', { type: 'application/zip' });
      component.fileUploadForm.patchValue({ instagramArchive: testFile });

      // When: Form is checked
      console.log('⚙️ BDD: Checking selected file');

      // Then: Should return the file
      console.log('✅ BDD: Selected file is returned');
      expect(component.selectedFile).toBe(testFile);
    });
  });

  describe('Feature: Conditional Branch Coverage (BDD-Style)', () => {
    it('Given form control does not exist, When getting selectedFile, Then null fallback is used', () => {
      // Given: Form control is missing
      console.log('🔧 BDD: Setting up scenario with missing form control');
      spyOn(component.fileUploadForm, 'get').and.returnValue(null);

      // When: Getting selected file
      console.log('⚙️ BDD: Getting selected file with missing control');
      const file = component.selectedFile;

      // Then: Null fallback is used
      console.log('✅ BDD: Verifying null fallback branch is executed');
      expect(file).toBeNull();
    });

    it('Given validation error without message, When catching error, Then error.message branch is covered', (done) => {
      // Given: Error without message property
      console.log('🔧 BDD: Setting up validation error without message');
      const errorWithoutMessage = { code: 'VALIDATION_ERROR' };
      mockFileService.validateArchive.and.returnValue(Promise.reject(errorWithoutMessage));
      const testFile = new File(['test'], 'test.zip', { type: 'application/zip' });

      // When: File is selected and validation fails
      console.log('⚙️ BDD: Selecting file with validation error');
      component.onFileSelected(testFile);

      // Then: Error.message fallback branch is executed
      console.log('✅ BDD: Verifying error.message fallback branch');
      setTimeout(() => {
        expect(mockLogger.error).toHaveBeenCalled();
        done();
      }, 100);
    });

    it('Given form control returns undefined value, When checking selectedFile, Then null fallback is used', () => {
      // Given: Form control returns undefined
      console.log('🔧 BDD: Setting up form control with undefined value');
      const control = component.fileUploadForm.get('instagramArchive');
      if (control) {
        control.setValue(undefined as any);
      }

      // When: Getting selected file
      console.log('⚙️ BDD: Getting selected file with undefined value');
      const file = component.selectedFile;

      // Then: Null fallback is used
      console.log('✅ BDD: Verifying null fallback for undefined value');
      expect(file).toBeNull();
    });

    it('Given valueChanges emits null, When ngOnInit subscribes, Then else branch is executed', (done) => {
      // Given: Component initialized
      console.log('🔧 BDD: Setting up valueChanges with null value');
      mockFileService.validateArchive.and.returnValue(Promise.resolve({
        isValid: true,
        errors: [],
        warnings: [],
        timestamp: new Date(),
        value: null
      }));

      // When: valueChanges emits null
      console.log('⚙️ BDD: Emitting null value from valueChanges');
      component.ngOnInit();

      const control = component.fileUploadForm.get('instagramArchive');
      if (control) {
        control.setValue(null);
      }

      // Then: Else branch (onFileRemoved) is executed
      console.log('✅ BDD: Verifying else branch for null value');
      setTimeout(() => {
        expect(mockLogger.workflow).toHaveBeenCalledWith('File removed');
        expect(mockFileService.archivedFile).toBeNull();
        done();
      }, 100);
    });

    it('Given valueChanges emits file, When ngOnInit subscribes, Then if branch is executed', (done) => {
      // Given: Component initialized
      console.log('🔧 BDD: Setting up valueChanges with file value');
      mockFileService.validateArchive.and.returnValue(Promise.resolve({
        isValid: true,
        errors: [],
        warnings: [],
        timestamp: new Date(),
        value: null
      }));
      const testFile = new File(['test'], 'test.zip', { type: 'application/zip' });

      // When: valueChanges emits file
      console.log('⚙️ BDD: Emitting file value from valueChanges');
      component.ngOnInit();

      const control = component.fileUploadForm.get('instagramArchive');
      if (control) {
        control.setValue(testFile);
      }

      // Then: If branch (onFileSelected) is executed
      console.log('✅ BDD: Verifying if branch for file value');
      setTimeout(() => {
        expect(mockLogger.workflow).toHaveBeenCalledWith(`File selected: ${testFile.name}`);
        done();
      }, 100);
    });
  });
});
