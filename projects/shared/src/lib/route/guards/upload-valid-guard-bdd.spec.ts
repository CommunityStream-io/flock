import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { uploadValidGuard } from './upload-valid-guard';
import { FileService, FILE_PROCESSOR } from '../../services';

describe('Feature: Upload Guard Navigation (BDD-Style)', () => {
  let mockFileService: jasmine.SpyObj<FileService>;
  let mockSnackBar: jasmine.SpyObj<MatSnackBar>;

  beforeEach(async () => {
    mockFileService = jasmine.createSpyObj<FileService>('FileService', [], {
      archivedFile: null
    });
    mockSnackBar = jasmine.createSpyObj('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, NoopAnimationsModule],
      providers: [
        { provide: FILE_PROCESSOR, useValue: mockFileService },
        { provide: MatSnackBar, useValue: mockSnackBar }
      ]
    }).compileComponents();
  });

  describe('Scenario: Navigation to next step requires valid archive', () => {
    it('Given user is on upload step without archive, When navigating to next step, Then navigation should be blocked', () => {
      // Given: User is on upload step without archive
      console.log(`🔧 BDD: Setting up upload step without archive`);
      Object.defineProperty(mockFileService, 'archivedFile', {
        get: () => null,
        configurable: true
      });

      const currentRoute = {
        url: '/step/upload',
        data: { next: 'auth' }
      } as unknown as ActivatedRouteSnapshot;
      
      const nextState = {
        url: '/step/auth'
      } as RouterStateSnapshot;

      // When: User attempts to navigate to next step
      console.log(`⚙️ BDD: User attempts to navigate to next step without archive`);
      const result = TestBed.runInInjectionContext(() => 
        uploadValidGuard(null, currentRoute, {} as RouterStateSnapshot, nextState)
      );

      // Then: Navigation should be blocked
      console.log(`✅ BDD: Verifying navigation is blocked`);
      expect(result).toBe(false);
      expect(mockSnackBar.open).toHaveBeenCalledWith(
        'Please upload a valid archive',
        'Close',
        { duration: 3000 }
      );
    });

    it('Given user is on upload step with archive, When navigating to next step, Then navigation should be allowed', () => {
      // Given: User is on upload step with valid archive
      console.log(`🔧 BDD: Setting up upload step with valid archive`);
      const mockFile = new File(['test content'], 'test.zip', { type: 'application/zip' });
      Object.defineProperty(mockFileService, 'archivedFile', {
        get: () => mockFile,
        configurable: true
      });

      const currentRoute = {
        url: '/step/upload',
        data: { next: 'auth' }
      } as unknown as ActivatedRouteSnapshot;
      
      const nextState = {
        url: '/step/auth'
      } as RouterStateSnapshot;

      // When: User attempts to navigate to next step
      console.log(`⚙️ BDD: User attempts to navigate to next step with archive`);
      const result = TestBed.runInInjectionContext(() => 
        uploadValidGuard(null, currentRoute, {} as RouterStateSnapshot, nextState)
      );

      // Then: Navigation should be allowed
      console.log(`✅ BDD: Verifying navigation is allowed`);
      expect(result).toBe(true);
      expect(mockSnackBar.open).not.toHaveBeenCalled();
    });
  });

  describe('Scenario: Navigation to non-next routes is always allowed', () => {
    it('Given user is on upload step without archive, When navigating to home, Then navigation should be allowed', () => {
      // Given: User is on upload step without archive
      console.log(`🔧 BDD: Setting up upload step without archive`);
      Object.defineProperty(mockFileService, 'archivedFile', {
        get: () => null,
        configurable: true
      });

      const currentRoute = {
        url: '/step/upload',
        data: { next: 'auth' }
      } as unknown as ActivatedRouteSnapshot;
      
      const nextState = {
        url: '/home'
      } as RouterStateSnapshot;

      // When: User attempts to navigate to home
      console.log(`⚙️ BDD: User attempts to navigate to home without archive`);
      const result = TestBed.runInInjectionContext(() => 
        uploadValidGuard(null, currentRoute, {} as RouterStateSnapshot, nextState)
      );

      // Then: Navigation should be allowed
      console.log(`✅ BDD: Verifying navigation to home is allowed`);
      expect(result).toBe(true);
      expect(mockSnackBar.open).not.toHaveBeenCalled();
    });

    it('Given user is on upload step without archive, When navigating to help, Then navigation should be allowed', () => {
      // Given: User is on upload step without archive
      console.log(`🔧 BDD: Setting up upload step without archive`);
      Object.defineProperty(mockFileService, 'archivedFile', {
        get: () => null,
        configurable: true
      });

      const currentRoute = {
        url: '/step/upload',
        data: { next: 'auth' }
      } as unknown as ActivatedRouteSnapshot;
      
      const nextState = {
        url: '/help'
      } as RouterStateSnapshot;

      // When: User attempts to navigate to help
      console.log(`⚙️ BDD: User attempts to navigate to help without archive`);
      const result = TestBed.runInInjectionContext(() => 
        uploadValidGuard(null, currentRoute, {} as RouterStateSnapshot, nextState)
      );

      // Then: Navigation should be allowed
      console.log(`✅ BDD: Verifying navigation to help is allowed`);
      expect(result).toBe(true);
      expect(mockSnackBar.open).not.toHaveBeenCalled();
    });

    it('Given user is on upload step without archive, When navigating to support, Then navigation should be allowed', () => {
      // Given: User is on upload step without archive
      console.log(`🔧 BDD: Setting up upload step without archive`);
      Object.defineProperty(mockFileService, 'archivedFile', {
        get: () => null,
        configurable: true
      });

      const currentRoute = {
        url: '/step/upload',
        data: { next: 'auth' }
      } as unknown as ActivatedRouteSnapshot;
      
      const nextState = {
        url: '/support'
      } as RouterStateSnapshot;

      // When: User attempts to navigate to support
      console.log(`⚙️ BDD: User attempts to navigate to support without archive`);
      const result = TestBed.runInInjectionContext(() => 
        uploadValidGuard(null, currentRoute, {} as RouterStateSnapshot, nextState)
      );

      // Then: Navigation should be allowed
      console.log(`✅ BDD: Verifying navigation to support is allowed`);
      expect(result).toBe(true);
      expect(mockSnackBar.open).not.toHaveBeenCalled();
    });
  });

  describe('Scenario: Guard handles edge cases gracefully', () => {
    it('Given missing nextState, When guard is invoked, Then navigation should be allowed', () => {
      // Given: Missing nextState
      console.log(`🔧 BDD: Setting up scenario with missing nextState`);
      Object.defineProperty(mockFileService, 'archivedFile', {
        get: () => null,
        configurable: true
      });

      const currentRoute = {
        url: '/step/upload',
        data: { next: 'auth' }
      } as unknown as ActivatedRouteSnapshot;

      // When: Guard is invoked with undefined nextState
      console.log(`⚙️ BDD: Invoking guard with undefined nextState`);
      const result = TestBed.runInInjectionContext(() => 
        uploadValidGuard(null, currentRoute, {} as RouterStateSnapshot, undefined as any)
      );

      // Then: Navigation should be allowed
      console.log(`✅ BDD: Verifying navigation is allowed for missing nextState`);
      expect(result).toBe(true);
      expect(mockSnackBar.open).not.toHaveBeenCalled();
    });

    it('Given missing route data, When guard is invoked, Then navigation should be allowed', () => {
      // Given: Missing route data
      console.log(`🔧 BDD: Setting up scenario with missing route data`);
      Object.defineProperty(mockFileService, 'archivedFile', {
        get: () => null,
        configurable: true
      });

      const currentRoute = {} as ActivatedRouteSnapshot;
      
      const nextState = {
        url: '/step/auth'
      } as RouterStateSnapshot;

      // When: Guard is invoked with missing route data
      console.log(`⚙️ BDD: Invoking guard with missing route data`);
      const result = TestBed.runInInjectionContext(() => 
        uploadValidGuard(null, currentRoute, {} as RouterStateSnapshot, nextState)
      );

      // Then: Navigation should be allowed (can't determine next step)
      console.log(`✅ BDD: Verifying navigation is allowed for missing route data`);
      expect(result).toBe(true);
      expect(mockSnackBar.open).not.toHaveBeenCalled();
    });
  });

  describe('Scenario: Multiple navigation attempts show consistent behavior', () => {
    it('Given user is on upload step, When attempting to navigate to next step multiple times without archive, Then each attempt should show snackbar', () => {
      // Given: User is on upload step without archive
      console.log(`🔧 BDD: Setting up upload step for multiple navigation attempts`);
      Object.defineProperty(mockFileService, 'archivedFile', {
        get: () => null,
        configurable: true
      });

      const currentRoute = {
        url: '/step/upload',
        data: { next: 'auth' }
      } as unknown as ActivatedRouteSnapshot;
      
      const nextState = {
        url: '/step/auth'
      } as RouterStateSnapshot;

      // When: User attempts to navigate multiple times
      console.log(`⚙️ BDD: User attempts first navigation`);
      const result1 = TestBed.runInInjectionContext(() => 
        uploadValidGuard(null, currentRoute, {} as RouterStateSnapshot, nextState)
      );

      console.log(`⚙️ BDD: User attempts second navigation`);
      const result2 = TestBed.runInInjectionContext(() => 
        uploadValidGuard(null, currentRoute, {} as RouterStateSnapshot, nextState)
      );

      // Then: Both attempts should be blocked with snackbar
      console.log(`✅ BDD: Verifying both attempts are blocked`);
      expect(result1).toBe(false);
      expect(result2).toBe(false);
      expect(mockSnackBar.open).toHaveBeenCalledTimes(2);
    });
  });
});
