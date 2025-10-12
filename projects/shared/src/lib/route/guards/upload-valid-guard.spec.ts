import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { uploadValidGuard } from './upload-valid-guard';
import { FileService, FILE_PROCESSOR } from '../../services';

describe('uploadValidGuard', () => {
  let mockFileService: jasmine.SpyObj<FileService>;
  let mockSnackBar: jasmine.SpyObj<MatSnackBar>;
  let mockComponent: unknown;
  let mockCurrentRoute: ActivatedRouteSnapshot;
  let mockCurrentState: RouterStateSnapshot;
  let mockNextState: RouterStateSnapshot;

  beforeEach(() => {
    // Create mock FileService
    mockFileService = jasmine.createSpyObj<FileService>('FileService', [], {
      archivedFile: null
    });

    // Create mock MatSnackBar
    mockSnackBar = jasmine.createSpyObj<MatSnackBar>('MatSnackBar', ['open']);

    // Create mock router parameters (guards receive these but our guard doesn't use them)
    mockComponent = {};
    mockCurrentRoute = {} as ActivatedRouteSnapshot;
    mockCurrentState = { url: '/step/upload' } as RouterStateSnapshot;
    mockNextState = { url: '/step/auth' } as RouterStateSnapshot;

    TestBed.configureTestingModule({
      providers: [
        { provide: FILE_PROCESSOR, useValue: mockFileService },
        { provide: MatSnackBar, useValue: mockSnackBar }
      ]
    });
  });

  it('should be created', () => {
    const result = TestBed.runInInjectionContext(() => 
      uploadValidGuard(mockComponent, mockCurrentRoute, mockCurrentState, mockNextState)
    );
    expect(result).toBeDefined();
  });

  describe('when archivedFile is null', () => {
    beforeEach(() => {
      // Set archivedFile to null
      Object.defineProperty(mockFileService, 'archivedFile', {
        get: () => null,
        configurable: true
      });
    });

    it('should return false (block navigation)', () => {
      const result = TestBed.runInInjectionContext(() => 
        uploadValidGuard(mockComponent, mockCurrentRoute, mockCurrentState, mockNextState)
      );
      expect(result).toBe(false);
    });

    it('should show snackbar with correct message', () => {
      TestBed.runInInjectionContext(() => 
        uploadValidGuard(mockComponent, mockCurrentRoute, mockCurrentState, mockNextState)
      );
      
      expect(mockSnackBar.open).toHaveBeenCalledWith(
        'Please upload a valid archive',
        'Close',
        { duration: 3000 }
      );
    });

    it('should call snackbar.open exactly once', () => {
      TestBed.runInInjectionContext(() => 
        uploadValidGuard(mockComponent, mockCurrentRoute, mockCurrentState, mockNextState)
      );
      expect(mockSnackBar.open).toHaveBeenCalledTimes(1);
    });
  });

  describe('when archivedFile exists', () => {
    beforeEach(() => {
      // Create a mock File
      const mockFile = new File(['test content'], 'test.zip', { type: 'application/zip' });
      
      // Set archivedFile to mock file
      Object.defineProperty(mockFileService, 'archivedFile', {
        get: () => mockFile,
        configurable: true
      });
    });

    it('should return true (allow navigation)', () => {
      const result = TestBed.runInInjectionContext(() => 
        uploadValidGuard(mockComponent, mockCurrentRoute, mockCurrentState, mockNextState)
      );
      expect(result).toBe(true);
    });

    it('should NOT show snackbar', () => {
      TestBed.runInInjectionContext(() => 
        uploadValidGuard(mockComponent, mockCurrentRoute, mockCurrentState, mockNextState)
      );
      expect(mockSnackBar.open).not.toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('should handle undefined archivedFile', () => {
      Object.defineProperty(mockFileService, 'archivedFile', {
        get: () => undefined,
        configurable: true
      });

      const result = TestBed.runInInjectionContext(() => 
        uploadValidGuard(mockComponent, mockCurrentRoute, mockCurrentState, mockNextState)
      );
      
      expect(result).toBe(false);
      expect(mockSnackBar.open).toHaveBeenCalled();
    });

    it('should handle empty file (0 bytes)', () => {
      const emptyFile = new File([], 'empty.zip', { type: 'application/zip' });
      Object.defineProperty(mockFileService, 'archivedFile', {
        get: () => emptyFile,
        configurable: true
      });

      const result = TestBed.runInInjectionContext(() => 
        uploadValidGuard(mockComponent, mockCurrentRoute, mockCurrentState, mockNextState)
      );
      
      // Guard still allows navigation if file exists, even if empty
      // (validation happens elsewhere)
      expect(result).toBe(true);
      expect(mockSnackBar.open).not.toHaveBeenCalled();
    });
  });
});
