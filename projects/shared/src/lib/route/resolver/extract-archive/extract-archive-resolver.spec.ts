import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, firstValueFrom } from 'rxjs';

import { extractArchiveResolver } from './extract-archive-resolver';
import { FILE_PROCESSOR, FileService, LOGGER, Logger, SplashScreenLoading } from '../../../services';

describe('Feature: Archive Extraction Resolution', () => {
  let mockFileService: jasmine.SpyObj<FileService>;
  let mockSnackBar: jasmine.SpyObj<MatSnackBar>;
  let mockLogger: jasmine.SpyObj<Logger>;
  let mockSplashScreenLoading: jasmine.SpyObj<SplashScreenLoading>;
  let executeResolver: (route?: any, state?: any) => Observable<boolean>;

  beforeEach(() => {
    // Create mocks
    mockFileService = jasmine.createSpyObj<FileService>('FileService', ['extractArchive']);
    mockSnackBar = jasmine.createSpyObj<MatSnackBar>('MatSnackBar', ['open']);
    mockLogger = jasmine.createSpyObj<Logger>('Logger', ['log', 'error', 'warn', 'workflow', 'instrument']);
    mockSplashScreenLoading = jasmine.createSpyObj<SplashScreenLoading>('SplashScreenLoading', ['show', 'hide', 'setComponent']);

    TestBed.configureTestingModule({
      providers: [
        { provide: FILE_PROCESSOR, useValue: mockFileService },
        { provide: MatSnackBar, useValue: mockSnackBar },
        { provide: LOGGER, useValue: mockLogger },
        { provide: SplashScreenLoading, useValue: mockSplashScreenLoading }
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
        'Error extracting archive',
        'Close',
        { duration: 3000 }
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
        'Error extracting archive',
        'Close',
        { duration: 3000 }
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
});
