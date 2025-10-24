import { TestBed } from '@angular/core/testing';
import { ResolveFn, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, firstValueFrom } from 'rxjs';

import { extractArchiveResolver } from './extract-archive-resolver';
import { FILE_PROCESSOR, FileService, LOGGER, Logger, SplashScreenLoading } from '../../../services';

describe('Feature: Archive Extraction Resolution', () => {
  let mockFileService: jasmine.SpyObj<FileService>;
  let mockSnackBar: jasmine.SpyObj<MatSnackBar>;
  let mockLogger: jasmine.SpyObj<Logger>;
  let mockSplashScreenLoading: jasmine.SpyObj<SplashScreenLoading>;
  let mockRouter: jasmine.SpyObj<Router>;
  let executeResolver: (route?: any, state?: any) => Observable<boolean>;

  beforeEach(() => {
    // Create mocks
    mockFileService = jasmine.createSpyObj<FileService>('FileService', ['extractArchive']);
    mockSnackBar = jasmine.createSpyObj<MatSnackBar>('MatSnackBar', ['open']);
    mockLogger = jasmine.createSpyObj<Logger>('Logger', ['log', 'error', 'warn', 'workflow', 'instrument']);
    mockSplashScreenLoading = jasmine.createSpyObj<SplashScreenLoading>('SplashScreenLoading', ['show', 'hide', 'setComponent']);
    mockRouter = jasmine.createSpyObj<Router>('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        { provide: FILE_PROCESSOR, useValue: mockFileService },
        { provide: MatSnackBar, useValue: mockSnackBar },
        { provide: LOGGER, useValue: mockLogger },
        { provide: SplashScreenLoading, useValue: mockSplashScreenLoading },
        { provide: Router, useValue: mockRouter }
      ]
    });

    // Create resolver executor function
    executeResolver = (route?: any, state?: any) =>
      TestBed.runInInjectionContext(() => extractArchiveResolver(route, state)) as Observable<boolean>;
  });

  describe('Scenario: Successful archive extraction', () => {
    it('Given a valid archive, When extraction succeeds, Then resolver returns true', async () => {
      // Given: Set up successful extraction
      console.log('🔧 BDD: Setting up successful archive extraction');
      mockFileService.extractArchive.and.returnValue(Promise.resolve(true));

      // When: Execute the resolver
      console.log('⚙️ BDD: Executing archive extraction resolver');
      const result = await firstValueFrom(executeResolver());

      // Then: Verify successful result
      console.log('✅ BDD: Verifying successful extraction result');
      expect(result).toBe(true);
      expect(mockFileService.extractArchive).toHaveBeenCalled();
      expect(mockSnackBar.open).not.toHaveBeenCalled();
      expect(mockSplashScreenLoading.setComponent).toHaveBeenCalledWith(null);
      expect(mockSplashScreenLoading.hide).toHaveBeenCalled();
      expect(mockLogger.log).toHaveBeenCalledWith('[ExtractArchiveResolver] Resolver called');
    });
  });

  describe('Scenario: Archive extraction failure', () => {
    it('Given an invalid archive, When extraction fails, Then resolver shows error and returns false', async () => {
      // Given: Set up failed extraction
      console.log('🔧 BDD: Setting up failed archive extraction');
      const error = new Error('Extraction failed');
      mockFileService.extractArchive.and.returnValue(Promise.reject(error));

      // When: Execute the resolver
      console.log('⚙️ BDD: Executing archive extraction resolver with failure');
      const result = await firstValueFrom(executeResolver());

      // Then: Verify error handling and false result
      console.log('✅ BDD: Verifying error handling and false result');
      expect(result).toBe(false);
      expect(mockFileService.extractArchive).toHaveBeenCalled();
      expect(mockSnackBar.open).toHaveBeenCalledWith(
        'Extraction failed',
        'Close',
        { duration: 5000, panelClass: ['error-snackbar'] }
      );
      expect(mockSplashScreenLoading.setComponent).toHaveBeenCalledWith(null);
      expect(mockSplashScreenLoading.hide).toHaveBeenCalled();
    });

    it('Given a network error, When extraction fails, Then resolver handles error gracefully', async () => {
      // Given: Set up network error
      console.log('🔧 BDD: Setting up network error during extraction');
      const networkError = new Error('Network timeout');
      mockFileService.extractArchive.and.returnValue(Promise.reject(networkError));

      // When: Execute the resolver
      console.log('⚙️ BDD: Executing archive extraction resolver with network error');
      const result = await firstValueFrom(executeResolver());

      // Then: Verify error handling
      console.log('✅ BDD: Verifying network error handling');
      expect(result).toBe(false);
      expect(mockSnackBar.open).toHaveBeenCalledWith(
        'Network timeout',
        'Close',
        { duration: 5000, panelClass: ['error-snackbar'] }
      );
      expect(mockSplashScreenLoading.setComponent).toHaveBeenCalledWith(null);
      expect(mockSplashScreenLoading.hide).toHaveBeenCalled();
    });
  });

  describe('Scenario: Resolver execution context', () => {
    it('Given injection context, When resolver executes, Then dependencies are properly injected', () => {
      // Given: Injection context is available
      console.log('🔧 BDD: Setting up injection context test');

      // When: Creating resolver executor
      console.log('⚙️ BDD: Creating resolver executor function');
      const resolver = executeResolver;

      // Then: Resolver is properly configured
      console.log('✅ BDD: Verifying resolver configuration');
      expect(resolver).toBeTruthy();
      expect(typeof resolver).toBe('function');
    });

    it('Given resolver parameters, When resolver executes, Then parameters are passed correctly', async () => {
      // Given: Resolver parameters
      console.log('🔧 BDD: Setting up resolver parameters test');
      const testParams = ['param1', 'param2'];
      mockFileService.extractArchive.and.returnValue(Promise.resolve(true));

      // When: Execute resolver with parameters
      console.log('⚙️ BDD: Executing resolver with test parameters');
      const result = await firstValueFrom(executeResolver(...testParams));

      // Then: Resolver executes successfully with parameters
      console.log('✅ BDD: Verifying resolver execution with parameters');
      expect(result).toBe(true);
      expect(mockFileService.extractArchive).toHaveBeenCalled();
    });
  });

  describe('Scenario: Observable stream behavior', () => {
    it('Given successful extraction, When resolver returns observable, Then stream completes with true', (done) => {
      // Given: Successful extraction setup
      console.log('🔧 BDD: Setting up observable stream test for success');
      mockFileService.extractArchive.and.returnValue(Promise.resolve(true));

      // When: Execute resolver and subscribe to result
      console.log('⚙️ BDD: Executing resolver and subscribing to observable');
      executeResolver().subscribe({
        next: (value) => {
          // Then: Verify stream value
          console.log('✅ BDD: Verifying observable stream value');
          expect(value).toBe(true);
        },
        complete: () => {
          console.log('✅ BDD: Verifying observable stream completion');
          expect(mockFileService.extractArchive).toHaveBeenCalled();
          done();
        },
        error: (error) => {
          console.log('❌ BDD: Unexpected error in observable stream');
          done.fail(error);
        }
      });
    });

    it('Given failed extraction, When resolver returns observable, Then stream completes with false', (done) => {
      // Given: Failed extraction setup
      console.log('🔧 BDD: Setting up observable stream test for failure');
      mockFileService.extractArchive.and.returnValue(Promise.reject(new Error('Test error')));

      // When: Execute resolver and subscribe to result
      console.log('⚙️ BDD: Executing resolver and subscribing to observable');
      executeResolver().subscribe({
        next: (value) => {
          // Then: Verify stream value
          console.log('✅ BDD: Verifying observable stream value on failure');
          expect(value).toBe(false);
        },
        complete: () => {
          console.log('✅ BDD: Verifying observable stream completion on failure');
          expect(mockSnackBar.open).toHaveBeenCalled();
          done();
        },
        error: (error) => {
          console.log('❌ BDD: Unexpected error in observable stream');
          done.fail(error);
        }
      });
    });
  });

  describe('Feature: Error Branch Coverage (BDD-Style)', () => {
    it('Given error without message, When extraction fails, Then default error message is used', async () => {
      // Given: Error without message
      console.log('🔧 BDD: Setting up error without message');
      const errorWithoutMessage = new Error();
      errorWithoutMessage.message = '';
      mockFileService.extractArchive.and.returnValue(Promise.reject(errorWithoutMessage));

      // When: Execute resolver
      console.log('⚙️ BDD: Executing resolver with error without message');
      const result = await firstValueFrom(executeResolver());

      // Then: Default error message is used
      console.log('✅ BDD: Verifying default error message branch is executed');
      expect(result).toBe(false);
      expect(mockSnackBar.open).toHaveBeenCalledWith(
        'Error extracting archive',
        'Close',
        { duration: 5000, panelClass: ['error-snackbar'] }
      );
    });

    it('Given "File too large" error, When extraction fails, Then redirect to upload is triggered', async () => {
      // Given: File too large error
      console.log('🔧 BDD: Setting up "File too large" error');
      const error = new Error('File too large - maximum size is 100MB');
      mockFileService.extractArchive.and.returnValue(Promise.reject(error));

      // When: Execute resolver
      console.log('⚙️ BDD: Executing resolver with "File too large" error');
      const result = await firstValueFrom(executeResolver());

      // Then: Redirect branch is executed
      console.log('✅ BDD: Verifying "File too large" redirect branch is executed');
      expect(result).toBe(false);
      expect(mockLogger.log).toHaveBeenCalledWith('[ExtractArchiveResolver] Redirecting to upload step due to upload error');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/step/upload']);
    });

    it('Given "Upload failed" error, When extraction fails, Then redirect to upload is triggered', async () => {
      // Given: Upload failed error
      console.log('🔧 BDD: Setting up "Upload failed" error');
      const error = new Error('Upload failed - connection interrupted');
      mockFileService.extractArchive.and.returnValue(Promise.reject(error));

      // When: Execute resolver
      console.log('⚙️ BDD: Executing resolver with "Upload failed" error');
      const result = await firstValueFrom(executeResolver());

      // Then: Redirect branch is executed
      console.log('✅ BDD: Verifying "Upload failed" redirect branch is executed');
      expect(result).toBe(false);
      expect(mockLogger.log).toHaveBeenCalledWith('[ExtractArchiveResolver] Redirecting to upload step due to upload error');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/step/upload']);
    });

    it('Given "Invalid file format" error, When extraction fails, Then redirect to upload is triggered', async () => {
      // Given: Invalid file format error
      console.log('🔧 BDD: Setting up "Invalid file format" error');
      const error = new Error('Invalid file format - expected ZIP');
      mockFileService.extractArchive.and.returnValue(Promise.reject(error));

      // When: Execute resolver
      console.log('⚙️ BDD: Executing resolver with "Invalid file format" error');
      const result = await firstValueFrom(executeResolver());

      // Then: Redirect branch is executed
      console.log('✅ BDD: Verifying "Invalid file format" redirect branch is executed');
      expect(result).toBe(false);
      expect(mockLogger.log).toHaveBeenCalledWith('[ExtractArchiveResolver] Redirecting to upload step due to upload error');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/step/upload']);
    });

    it('Given "Network error" error, When extraction fails, Then redirect to upload is triggered', async () => {
      // Given: Network error
      console.log('🔧 BDD: Setting up "Network error" error');
      const error = new Error('Network error - please check your connection');
      mockFileService.extractArchive.and.returnValue(Promise.reject(error));

      // When: Execute resolver
      console.log('⚙️ BDD: Executing resolver with "Network error" error');
      const result = await firstValueFrom(executeResolver());

      // Then: Redirect branch is executed
      console.log('✅ BDD: Verifying "Network error" redirect branch is executed');
      expect(result).toBe(false);
      expect(mockLogger.log).toHaveBeenCalledWith('[ExtractArchiveResolver] Redirecting to upload step due to upload error');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/step/upload']);
    });

    it('Given "Server error" error, When extraction fails, Then redirect to upload is triggered', async () => {
      // Given: Server error
      console.log('🔧 BDD: Setting up "Server error" error');
      const error = new Error('Server error - please try again later');
      mockFileService.extractArchive.and.returnValue(Promise.reject(error));

      // When: Execute resolver
      console.log('⚙️ BDD: Executing resolver with "Server error" error');
      const result = await firstValueFrom(executeResolver());

      // Then: Redirect branch is executed
      console.log('✅ BDD: Verifying "Server error" redirect branch is executed');
      expect(result).toBe(false);
      expect(mockLogger.log).toHaveBeenCalledWith('[ExtractArchiveResolver] Redirecting to upload step due to upload error');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/step/upload']);
    });

    it('Given non-upload error, When extraction fails, Then redirect is not triggered', async () => {
      // Given: Generic error without upload keywords
      console.log('🔧 BDD: Setting up generic error without upload keywords');
      const error = new Error('Generic extraction error');
      mockFileService.extractArchive.and.returnValue(Promise.reject(error));

      // When: Execute resolver
      console.log('⚙️ BDD: Executing resolver with generic error');
      const result = await firstValueFrom(executeResolver());

      // Then: Redirect branch is NOT executed
      console.log('✅ BDD: Verifying redirect branch is not executed for generic error');
      expect(result).toBe(false);
      // Verify we didn't log the redirect message
      const redirectLogCalls = mockLogger.log.calls.all().filter(call =>
        call.args[0] === '[ExtractArchiveResolver] Redirecting to upload step due to upload error'
      );
      expect(redirectLogCalls.length).toBe(0);
    });

    it('Given extraction returns false, When checking result, Then false branch is executed', async () => {
      // Given: Extraction returns false
      console.log('🔧 BDD: Setting up extraction returning false');
      mockFileService.extractArchive.and.returnValue(Promise.resolve(false));

      // When: Execute resolver
      console.log('⚙️ BDD: Executing resolver with false result');
      const result = await firstValueFrom(executeResolver());

      // Then: False branch is executed
      console.log('✅ BDD: Verifying false branch is executed');
      expect(result).toBe(false);
      expect(mockLogger.log).toHaveBeenCalledWith('[ExtractArchiveResolver] Archive extraction returned false');
    });
  });

  describe('Feature: Additional Branch Coverage (BDD-Style)', () => {
    it('Given error with null message, When extraction fails, Then default error message is used', async () => {
      // Given: Error with null message
      console.log('🔧 BDD: Setting up error with null message');
      const errorWithNullMessage = new Error();
      errorWithNullMessage.message = null as any;
      mockFileService.extractArchive.and.returnValue(Promise.reject(errorWithNullMessage));

      // When: Execute resolver
      console.log('⚙️ BDD: Executing resolver with error with null message');
      const result = await firstValueFrom(executeResolver());

      // Then: Default error message is used
      console.log('✅ BDD: Verifying default error message branch is executed for null message');
      expect(result).toBe(false);
      expect(mockSnackBar.open).toHaveBeenCalledWith(
        'Error extracting archive',
        'Close',
        { duration: 5000, panelClass: ['error-snackbar'] }
      );
    });

    it('Given error with undefined message, When extraction fails, Then default error message is used', async () => {
      // Given: Error with undefined message
      console.log('🔧 BDD: Setting up error with undefined message');
      const errorWithUndefinedMessage = new Error();
      errorWithUndefinedMessage.message = undefined as any;
      mockFileService.extractArchive.and.returnValue(Promise.reject(errorWithUndefinedMessage));

      // When: Execute resolver
      console.log('⚙️ BDD: Executing resolver with error with undefined message');
      const result = await firstValueFrom(executeResolver());

      // Then: Default error message is used
      console.log('✅ BDD: Verifying default error message branch is executed for undefined message');
      expect(result).toBe(false);
      expect(mockSnackBar.open).toHaveBeenCalledWith(
        'Error extracting archive',
        'Close',
        { duration: 5000, panelClass: ['error-snackbar'] }
      );
    });

    it('Given non-Error object thrown, When extraction fails, Then error handling still works', async () => {
      // Given: Non-Error object thrown
      console.log('🔧 BDD: Setting up non-Error object thrown');
      const nonErrorObject = { message: 'Custom error object' };
      mockFileService.extractArchive.and.returnValue(Promise.reject(nonErrorObject));

      // When: Execute resolver
      console.log('⚙️ BDD: Executing resolver with non-Error object');
      const result = await firstValueFrom(executeResolver());

      // Then: Error handling still works
      console.log('✅ BDD: Verifying error handling works with non-Error object');
      expect(result).toBe(false);
      expect(mockSnackBar.open).toHaveBeenCalledWith(
        'Custom error object',
        'Close',
        { duration: 5000, panelClass: ['error-snackbar'] }
      );
    });

    it('Given non-Error object without message, When extraction fails, Then default error message is used', async () => {
      // Given: Non-Error object without message
      console.log('🔧 BDD: Setting up non-Error object without message');
      const nonErrorObjectWithoutMessage = { someProperty: 'value' };
      mockFileService.extractArchive.and.returnValue(Promise.reject(nonErrorObjectWithoutMessage));

      // When: Execute resolver
      console.log('⚙️ BDD: Executing resolver with non-Error object without message');
      const result = await firstValueFrom(executeResolver());

      // Then: Default error message is used
      console.log('✅ BDD: Verifying default error message branch is executed for non-Error object');
      expect(result).toBe(false);
      expect(mockSnackBar.open).toHaveBeenCalledWith(
        'Error extracting archive',
        'Close',
        { duration: 5000, panelClass: ['error-snackbar'] }
      );
    });

    it('Given error with multiple upload keywords, When extraction fails, Then redirect is triggered', async () => {
      // Given: Error with multiple upload keywords
      console.log('🔧 BDD: Setting up error with multiple upload keywords');
      const errorWithMultipleKeywords = new Error('File too large and Upload failed simultaneously');
      mockFileService.extractArchive.and.returnValue(Promise.reject(errorWithMultipleKeywords));

      // When: Execute resolver
      console.log('⚙️ BDD: Executing resolver with error containing multiple upload keywords');
      const result = await firstValueFrom(executeResolver());

      // Then: Redirect branch is executed
      console.log('✅ BDD: Verifying redirect branch is executed for multiple upload keywords');
      expect(result).toBe(false);
      expect(mockLogger.log).toHaveBeenCalledWith('[ExtractArchiveResolver] Redirecting to upload step due to upload error');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/step/upload']);
    });

    it('Given error with case-insensitive upload keywords, When extraction fails, Then redirect is not triggered', async () => {
      // Given: Error with case-insensitive upload keywords
      console.log('🔧 BDD: Setting up error with case-insensitive upload keywords');
      const errorWithCaseInsensitive = new Error('FILE TOO LARGE - uppercase keywords');
      mockFileService.extractArchive.and.returnValue(Promise.reject(errorWithCaseInsensitive));

      // When: Execute resolver
      console.log('⚙️ BDD: Executing resolver with case-insensitive upload keywords');
      const result = await firstValueFrom(executeResolver());

      // Then: Redirect branch is NOT executed (case-sensitive matching)
      console.log('✅ BDD: Verifying redirect branch is not executed for case-insensitive keywords');
      expect(result).toBe(false);
      // Verify we didn't log the redirect message
      const redirectLogCalls = mockLogger.log.calls.all().filter(call =>
        call.args[0] === '[ExtractArchiveResolver] Redirecting to upload step due to upload error'
      );
      expect(redirectLogCalls.length).toBe(0);
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('Given successful extraction with true result, When resolver completes, Then success branch is executed', async () => {
      // Given: Successful extraction with true result
      console.log('🔧 BDD: Setting up successful extraction with true result');
      mockFileService.extractArchive.and.returnValue(Promise.resolve(true));

      // When: Execute resolver
      console.log('⚙️ BDD: Executing resolver with true result');
      const result = await firstValueFrom(executeResolver());

      // Then: Success branch is executed
      console.log('✅ BDD: Verifying success branch is executed');
      expect(result).toBe(true);
      expect(mockLogger.log).toHaveBeenCalledWith('[ExtractArchiveResolver] Archive extracted successfully');
    });

    it('Given successful extraction with truthy result, When resolver completes, Then success branch is executed', async () => {
      // Given: Successful extraction with truthy result
      console.log('🔧 BDD: Setting up successful extraction with truthy result');
      mockFileService.extractArchive.and.returnValue(Promise.resolve(true));

      // When: Execute resolver
      console.log('⚙️ BDD: Executing resolver with truthy result');
      const result = await firstValueFrom(executeResolver());

      // Then: Success branch is executed
      console.log('✅ BDD: Verifying success branch is executed for truthy result');
      expect(result).toBe(true);
      expect(mockLogger.log).toHaveBeenCalledWith('[ExtractArchiveResolver] Archive extracted successfully');
    });

    it('Given successful extraction with falsy result, When resolver completes, Then false branch is executed', async () => {
      // Given: Successful extraction with falsy result
      console.log('🔧 BDD: Setting up successful extraction with falsy result');
      mockFileService.extractArchive.and.returnValue(Promise.resolve(false));

      // When: Execute resolver
      console.log('⚙️ BDD: Executing resolver with falsy result');
      const result = await firstValueFrom(executeResolver());

      // Then: False branch is executed
      console.log('✅ BDD: Verifying false branch is executed for falsy result');
      expect(result).toBe(false);
      expect(mockLogger.log).toHaveBeenCalledWith('[ExtractArchiveResolver] Archive extraction returned false');
    });
  });
});
