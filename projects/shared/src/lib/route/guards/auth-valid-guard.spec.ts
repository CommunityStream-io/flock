/**
 * BDD-Style Unit Tests for Auth Valid Guard
 * 
 * This demonstrates BDD methodology using Angular's native testing framework
 * following the project's approach of validation through snackbars via guards and resolvers.
 */
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { authValidGuard } from './auth-valid-guard';
import { ConfigServiceImpl } from '../../services/config';

describe('Feature: Authentication Validation Guard (BDD-Style)', () => {
  let mockConfigService: jasmine.SpyObj<ConfigServiceImpl>;
  let mockSnackBar: jasmine.SpyObj<MatSnackBar>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    mockConfigService = jasmine.createSpyObj('ConfigServiceImpl', ['getBlueskyCredentials']);
    mockSnackBar = jasmine.createSpyObj('MatSnackBar', ['open']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [NoopAnimationsModule],
      providers: [
        { provide: ConfigServiceImpl, useValue: mockConfigService },
        { provide: MatSnackBar, useValue: mockSnackBar },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();
  });

  describe('Scenario: User tries to leave auth step with valid credentials', () => {
    it('Given valid credentials are stored, When user tries to navigate away, Then navigation is allowed', () => {
      // Given: Valid credentials are stored
      console.log('🔧 BDD: Setting up valid credentials in config service');
      const validCredentials = {
        username: 'user.bksy.social',
        password: 'validPassword123'
      };
      mockConfigService.getBlueskyCredentials.and.returnValue(validCredentials);

      // When: User tries to navigate away from auth step
      console.log('⚙️ BDD: User attempts to navigate away with valid credentials');
      const result = TestBed.runInInjectionContext(() => authValidGuard({} as any, {} as any, {} as any, {} as any));

      // Then: Navigation should be allowed
      console.log('✅ BDD: Verifying navigation is allowed with valid credentials');
      expect(result).toBe(true);
      expect(mockConfigService.getBlueskyCredentials).toHaveBeenCalled();
      expect(mockSnackBar.open).not.toHaveBeenCalled();
    });
  });

  describe('Scenario: User tries to leave auth step without credentials', () => {
    it('Given no credentials are stored, When user tries to navigate away, Then navigation is blocked with snackbar', () => {
      // Given: No credentials are stored
      console.log('🔧 BDD: Setting up missing credentials in config service');
      mockConfigService.getBlueskyCredentials.and.returnValue(null);

      // When: User tries to navigate away from auth step
      console.log('⚙️ BDD: User attempts to navigate away without credentials');
      const result = TestBed.runInInjectionContext(() => authValidGuard({} as any, {} as any, {} as any, {} as any));

      // Then: Navigation should be blocked and snackbar should be shown
      console.log('✅ BDD: Verifying navigation is blocked and snackbar is shown');
      expect(result).toBe(false);
      expect(mockConfigService.getBlueskyCredentials).toHaveBeenCalled();
      expect(mockSnackBar.open).toHaveBeenCalledWith(
        'Please provide valid Bluesky credentials',
        'Close',
        { duration: 3000 }
      );
    });

    it('Given empty credentials object, When user tries to navigate away, Then navigation is blocked with snackbar', () => {
      // Given: Empty credentials object is stored
      console.log('🔧 BDD: Setting up empty credentials object in config service');
      mockConfigService.getBlueskyCredentials.and.returnValue({} as any);

      // When: User tries to navigate away from auth step
      console.log('⚙️ BDD: User attempts to navigate away with empty credentials');
      const result = TestBed.runInInjectionContext(() => authValidGuard({} as any, {} as any, {} as any, {} as any));

      // Then: Navigation should be blocked and snackbar should be shown
      console.log('✅ BDD: Verifying navigation is blocked for empty credentials');
      expect(result).toBe(false);
      expect(mockConfigService.getBlueskyCredentials).toHaveBeenCalled();
      expect(mockSnackBar.open).toHaveBeenCalledWith(
        'Please provide valid Bluesky credentials',
        'Close',
        { duration: 3000 }
      );
    });
  });

  describe('Scenario: User tries to leave auth step with incomplete credentials', () => {
    it('Given credentials with missing username, When user tries to navigate away, Then navigation is blocked with snackbar', () => {
      // Given: Credentials missing username
      console.log('🔧 BDD: Setting up credentials with missing username');
      const incompleteCredentials = {
        username: '',
        password: 'validPassword123'
      };
      mockConfigService.getBlueskyCredentials.and.returnValue(incompleteCredentials);

      // When: User tries to navigate away from auth step
      console.log('⚙️ BDD: User attempts to navigate away with missing username');
      const result = TestBed.runInInjectionContext(() => authValidGuard({} as any, {} as any, {} as any, {} as any));

      // Then: Navigation should be blocked and snackbar should be shown
      console.log('✅ BDD: Verifying navigation is blocked for missing username');
      expect(result).toBe(false);
      expect(mockConfigService.getBlueskyCredentials).toHaveBeenCalled();
      expect(mockSnackBar.open).toHaveBeenCalledWith(
        'Please provide valid Bluesky credentials',
        'Close',
        { duration: 3000 }
      );
    });

    it('Given credentials with missing password, When user tries to navigate away, Then navigation is blocked with snackbar', () => {
      // Given: Credentials missing password
      console.log('🔧 BDD: Setting up credentials with missing password');
      const incompleteCredentials = {
        username: 'user.bksy.social',
        password: ''
      };
      mockConfigService.getBlueskyCredentials.and.returnValue(incompleteCredentials);

      // When: User tries to navigate away from auth step
      console.log('⚙️ BDD: User attempts to navigate away with missing password');
      const result = TestBed.runInInjectionContext(() => authValidGuard({} as any, {} as any, {} as any, {} as any));

      // Then: Navigation should be blocked and snackbar should be shown
      console.log('✅ BDD: Verifying navigation is blocked for missing password');
      expect(result).toBe(false);
      expect(mockConfigService.getBlueskyCredentials).toHaveBeenCalled();
      expect(mockSnackBar.open).toHaveBeenCalledWith(
        'Please provide valid Bluesky credentials',
        'Close',
        { duration: 3000 }
      );
    });

    it('Given credentials with undefined values, When user tries to navigate away, Then navigation is blocked with snackbar', () => {
      // Given: Credentials with undefined values
      console.log('🔧 BDD: Setting up credentials with undefined values');
      const undefinedCredentials = {
        username: undefined,
        password: undefined
      };
      mockConfigService.getBlueskyCredentials.and.returnValue(undefinedCredentials as any);

      // When: User tries to navigate away from auth step
      console.log('⚙️ BDD: User attempts to navigate away with undefined credentials');
      const result = TestBed.runInInjectionContext(() => authValidGuard({} as any, {} as any, {} as any, {} as any));

      // Then: Navigation should be blocked and snackbar should be shown
      console.log('✅ BDD: Verifying navigation is blocked for undefined credentials');
      expect(result).toBe(false);
      expect(mockConfigService.getBlueskyCredentials).toHaveBeenCalled();
      expect(mockSnackBar.open).toHaveBeenCalledWith(
        'Please provide valid Bluesky credentials',
        'Close',
        { duration: 3000 }
      );
    });
  });

  describe('Scenario: Service integration verification', () => {
    it('Given guard execution, When services are injected, Then dependencies are properly resolved', () => {
      // Given: Guard is about to execute
      console.log('🔧 BDD: Setting up guard execution context');
      mockConfigService.getBlueskyCredentials.and.returnValue({
        username: 'test.bksy.social',
        password: 'testpass'
      });

      // When: Guard executes and injects services
      console.log('⚙️ BDD: Executing guard with service injection');
      const result = TestBed.runInInjectionContext(() => authValidGuard({} as any, {} as any, {} as any, {} as any));

      // Then: Services should be properly injected and called
      console.log('✅ BDD: Verifying service injection and calls');
      expect(result).toBe(true);
      expect(mockConfigService.getBlueskyCredentials).toHaveBeenCalledTimes(1);
    });
  });
});