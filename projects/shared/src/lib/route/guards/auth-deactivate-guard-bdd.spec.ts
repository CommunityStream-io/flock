import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { firstValueFrom } from 'rxjs';

import { authDeactivateGuard } from './auth-deactivate-guard';
import { ConfigServiceImpl, Bluesky, LOGGER, Logger, SplashScreenLoading } from '../../services';

describe('Feature: Auth Guard Navigation (BDD-Style)', () => {
  let mockConfigService: jasmine.SpyObj<ConfigServiceImpl>;
  let mockBlueskyService: jasmine.SpyObj<Bluesky>;
  let mockLogger: jasmine.SpyObj<Logger>;
  let mockSnackBar: jasmine.SpyObj<MatSnackBar>;
  let mockSplashScreenLoading: jasmine.SpyObj<SplashScreenLoading>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    mockConfigService = jasmine.createSpyObj('ConfigServiceImpl', [
      'isAuthenticated',
      'getBlueskyCredentials',
      'setAuthenticated'
    ]);
    mockBlueskyService = jasmine.createSpyObj('Bluesky', ['authenticate']);
    mockLogger = jasmine.createSpyObj('Logger', ['log', 'error']);
    mockSnackBar = jasmine.createSpyObj('MatSnackBar', ['open']);
    mockSplashScreenLoading = jasmine.createSpyObj('SplashScreenLoading', ['show', 'hide']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, NoopAnimationsModule],
      providers: [
        { provide: ConfigServiceImpl, useValue: mockConfigService },
        { provide: Bluesky, useValue: mockBlueskyService },
        { provide: LOGGER, useValue: mockLogger },
        { provide: MatSnackBar, useValue: mockSnackBar },
        { provide: SplashScreenLoading, useValue: mockSplashScreenLoading },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();
  });

  describe('Scenario: Navigation to previous step is always allowed', () => {
    it('Given user is on auth step, When navigating to previous step, Then navigation should be allowed', () => {
      // Given: User is on auth step with previous step defined
      console.log(`🔧 BDD: Setting up auth step with previous step navigation`);
      const currentRoute = {
        url: '/step/auth',
        data: { next: 'config', previous: 'upload' }
      } as unknown as ActivatedRouteSnapshot;

      const nextState = {
        url: '/step/upload'
      } as RouterStateSnapshot;

      // When: User attempts to navigate to previous step
      console.log(`⚙️ BDD: User attempts to navigate to previous step`);
      const result = TestBed.runInInjectionContext(() =>
        authDeactivateGuard(null, currentRoute, {} as RouterStateSnapshot, nextState)
      );

      // Then: Navigation should be allowed
      console.log(`✅ BDD: Verifying navigation to previous step is allowed`);
      expect(result).toBe(true);
      expect(mockLogger.log).toHaveBeenCalledWith('Navigating to previous step, allowing deactivation');
    });
  });

  describe('Scenario: Navigation to next step triggers authentication with valid credentials', () => {
    it('Given user has valid credentials, When navigating to next step, Then authentication should succeed', async () => {
      // Given: User has valid credentials and is not authenticated
      console.log(`🔧 BDD: Setting up valid credentials for authentication`);
      mockConfigService.isAuthenticated.and.returnValue(false);
      mockConfigService.getBlueskyCredentials.and.returnValue({
        username: 'test.user',
        password: 'validPassword'
      });
      mockBlueskyService.authenticate.and.returnValue(Promise.resolve({ success: true, message: 'Success' }));

      const currentRoute = {
        url: '/step/auth',
        data: { next: 'config', previous: 'upload' }
      } as unknown as ActivatedRouteSnapshot;

      const nextState = {
        url: '/step/config'
      } as RouterStateSnapshot;

      // When: User attempts to navigate to next step
      console.log(`⚙️ BDD: User attempts to navigate to next step with valid credentials`);
      const result = TestBed.runInInjectionContext(() =>
        authDeactivateGuard(null, currentRoute, {} as RouterStateSnapshot, nextState)
      );

      // Then: Authentication should succeed and navigation should be allowed
      console.log(`✅ BDD: Verifying authentication succeeds and navigation is allowed`);
      if (result instanceof Promise || (result as any).subscribe) {
        const authResult = await firstValueFrom(result as any);
        expect(authResult).toBe(true);
        expect(mockSplashScreenLoading.show).toHaveBeenCalledWith('Authenticating with bsky.social');
        expect(mockBlueskyService.authenticate).toHaveBeenCalled();
        expect(mockConfigService.setAuthenticated).toHaveBeenCalledWith(true);
        expect(mockSplashScreenLoading.hide).toHaveBeenCalled();
      } else {
        expect(result).toBe(true);
      }
    });
  });

  describe('Scenario: Navigation to next step fails with invalid credentials', () => {
    it('Given user has invalid credentials, When navigating to next step, Then authentication should fail', async () => {
      // Given: User has invalid credentials
      console.log(`🔧 BDD: Setting up invalid credentials for authentication`);
      mockConfigService.isAuthenticated.and.returnValue(false);
      mockConfigService.getBlueskyCredentials.and.returnValue({
        username: 'invalid.user',
        password: 'wrongPassword'
      });
      mockBlueskyService.authenticate.and.returnValue(Promise.resolve({
        success: false,
        message: 'Invalid credentials'
      }));

      const currentRoute = {
        url: '/step/auth',
        data: { next: 'config', previous: 'upload' }
      } as unknown as ActivatedRouteSnapshot;

      const nextState = {
        url: '/step/config'
      } as RouterStateSnapshot;

      // When: User attempts to navigate to next step
      console.log(`⚙️ BDD: User attempts to navigate to next step with invalid credentials`);
      const result = TestBed.runInInjectionContext(() =>
        authDeactivateGuard(null, currentRoute, {} as RouterStateSnapshot, nextState)
      );

      // Then: Authentication should fail and navigation should be blocked
      console.log(`✅ BDD: Verifying authentication fails and navigation is blocked`);
      if (result instanceof Promise || (result as any).subscribe) {
        const authResult = await firstValueFrom(result as any);
        expect(authResult).toBe(false);
        expect(mockSplashScreenLoading.show).toHaveBeenCalledWith('Authenticating with bsky.social');
        expect(mockBlueskyService.authenticate).toHaveBeenCalled();
        expect(mockSnackBar.open).toHaveBeenCalledWith('Invalid credentials', 'Close', {
          duration: 3000,
        });
        expect(mockSplashScreenLoading.hide).toHaveBeenCalled();
      } else {
        expect(result).toBe(false);
      }
    });
  });

  describe('Scenario: Navigation to next step fails when no credentials are provided', () => {
    it('Given user has no credentials, When navigating to next step, Then navigation should be blocked', () => {
      // Given: User has no credentials
      console.log(`🔧 BDD: Setting up no credentials scenario`);
      mockConfigService.isAuthenticated.and.returnValue(false);
      mockConfigService.getBlueskyCredentials.and.returnValue(null);

      const currentRoute = {
        url: '/step/auth',
        data: { next: 'config', previous: 'upload' }
      } as unknown as ActivatedRouteSnapshot;

      const nextState = {
        url: '/step/config'
      } as RouterStateSnapshot;

      // When: User attempts to navigate to next step
      console.log(`⚙️ BDD: User attempts to navigate to next step without credentials`);
      const result = TestBed.runInInjectionContext(() =>
        authDeactivateGuard(null, currentRoute, {} as RouterStateSnapshot, nextState)
      );

      // Then: Navigation should be blocked
      console.log(`✅ BDD: Verifying navigation is blocked without credentials`);
      expect(result).toBe(false);
      expect(mockSnackBar.open).toHaveBeenCalledWith('Please provide valid Bluesky credentials', 'Close', {
        duration: 3000,
      });
      expect(mockBlueskyService.authenticate).not.toHaveBeenCalled();
    });
  });

  describe('Scenario: Already authenticated user can navigate to next step without re-authentication', () => {
    it('Given user is already authenticated, When navigating to next step, Then navigation should be allowed immediately', () => {
      // Given: User is already authenticated
      console.log(`🔧 BDD: Setting up already authenticated user`);
      mockConfigService.isAuthenticated.and.returnValue(true);

      const currentRoute = {
        url: '/step/auth',
        data: { next: 'config', previous: 'upload' }
      } as unknown as ActivatedRouteSnapshot;

      const nextState = {
        url: '/step/config'
      } as RouterStateSnapshot;

      // When: User attempts to navigate to next step
      console.log(`⚙️ BDD: Already authenticated user attempts to navigate to next step`);
      const result = TestBed.runInInjectionContext(() =>
        authDeactivateGuard(null, currentRoute, {} as RouterStateSnapshot, nextState)
      );

      // Then: Navigation should be allowed immediately
      console.log(`✅ BDD: Verifying navigation is allowed without re-authentication`);
      expect(result).toBe(true);
      expect(mockLogger.log).toHaveBeenCalledWith('User already authenticated, allowing navigation');
      expect(mockBlueskyService.authenticate).not.toHaveBeenCalled();
    });
  });

  describe('Scenario: Direct URL navigation is allowed by default', () => {
    it('Given user is on auth step, When navigating to different URL, Then navigation should be allowed', () => {
      // Given: User is on auth step
      console.log(`🔧 BDD: Setting up direct URL navigation scenario`);
      const currentRoute = {
        url: '/step/auth',
        data: { next: 'config', previous: 'upload' }
      } as unknown as ActivatedRouteSnapshot;

      const nextState = {
        url: '/home'
      } as RouterStateSnapshot;

      // When: User attempts to navigate to different URL
      console.log(`⚙️ BDD: User attempts direct URL navigation`);
      const result = TestBed.runInInjectionContext(() =>
        authDeactivateGuard(null, currentRoute, {} as RouterStateSnapshot, nextState)
      );

      // Then: Navigation should be allowed
      console.log(`✅ BDD: Verifying direct URL navigation is allowed`);
      expect(result).toBe(true);
      expect(mockLogger.log).toHaveBeenCalledWith('Other navigation detected, allowing deactivation');
      expect(mockBlueskyService.authenticate).not.toHaveBeenCalled();
    });
  });

  describe('Scenario: Authentication error handling shows appropriate message', () => {
    it('Given credentials cause network error, When navigating to next step, Then error should be shown', async () => {
      // Given: Credentials will cause a network error
      console.log(`🔧 BDD: Setting up network error scenario`);
      mockConfigService.isAuthenticated.and.returnValue(false);
      mockConfigService.getBlueskyCredentials.and.returnValue({
        username: 'test.user',
        password: 'validPassword'
      });
      mockBlueskyService.authenticate.and.returnValue(Promise.reject(new Error('Network error')));

      const currentRoute = {
        url: '/step/auth',
        data: { next: 'config', previous: 'upload' }
      } as unknown as ActivatedRouteSnapshot;

      const nextState = {
        url: '/step/config'
      } as RouterStateSnapshot;

      // When: User attempts to navigate to next step
      console.log(`⚙️ BDD: User attempts to navigate with credentials that cause network error`);
      const result = TestBed.runInInjectionContext(() =>
        authDeactivateGuard(null, currentRoute, {} as RouterStateSnapshot, nextState)
      );

      // Then: Error should be shown and navigation should be blocked
      console.log(`✅ BDD: Verifying network error is handled and navigation is blocked`);
      if (result instanceof Promise || (result as any).subscribe) {
        const authResult = await firstValueFrom(result as any);
        expect(authResult).toBe(false);
        expect(mockSplashScreenLoading.show).toHaveBeenCalledWith('Authenticating with bsky.social');
        expect(mockBlueskyService.authenticate).toHaveBeenCalled();
        expect(mockSnackBar.open).toHaveBeenCalledWith('Authentication failed. Please check your credentials.', 'Close', {
          duration: 3000,
        });
        expect(mockSplashScreenLoading.hide).toHaveBeenCalled();
      } else {
        expect(result).toBe(false);
      }
    });
  });

  describe('Feature: Conditional Branch Coverage (BDD-Style)', () => {
    it('Given nextState is null, When checking target URL, Then empty string branch is used', () => {
      // Given: nextState is null
      console.log('🔧 BDD: Setting up scenario with null nextState');
      const currentRoute = {
        url: '/step/auth',
        data: { next: 'config', previous: 'upload' }
      } as unknown as ActivatedRouteSnapshot;

      // When: Guard is invoked with null nextState
      console.log('⚙️ BDD: Invoking guard with null nextState');
      const result = TestBed.runInInjectionContext(() =>
        authDeactivateGuard(null, currentRoute, {} as RouterStateSnapshot, null as any)
      );

      // Then: Empty string fallback is used and other navigation is allowed
      console.log('✅ BDD: Verifying empty string fallback branch is executed');
      expect(result).toBe(true);
      expect(mockLogger.log).toHaveBeenCalledWith('Other navigation detected, allowing deactivation');
    });

    it('Given authentication fails without message, When authenticating, Then default message branch is used', async () => {
      // Given: Authentication fails without message
      console.log('🔧 BDD: Setting up authentication failure without message');
      mockConfigService.isAuthenticated.and.returnValue(false);
      mockConfigService.getBlueskyCredentials.and.returnValue({
        username: 'test.user',
        password: 'password'
      });
      mockBlueskyService.authenticate.and.returnValue(Promise.resolve({
        success: false,
        message: ''
      }));

      const currentRoute = {
        url: '/step/auth',
        data: { next: 'config', previous: 'upload' }
      } as unknown as ActivatedRouteSnapshot;

      const nextState = {
        url: '/step/config'
      } as RouterStateSnapshot;

      // When: User attempts to navigate to next step
      console.log('⚙️ BDD: Attempting navigation with authentication failure without message');
      const result = TestBed.runInInjectionContext(() =>
        authDeactivateGuard(null, currentRoute, {} as RouterStateSnapshot, nextState)
      );

      // Then: Default message branch is executed
      console.log('✅ BDD: Verifying default message fallback branch is executed');
      const authResult = await firstValueFrom(result as any);
      expect(authResult).toBe(false);
      expect(mockSnackBar.open).toHaveBeenCalledWith('Authentication failed', 'Close', {
        duration: 3000,
      });
    });

    it('Given authentication error without message property, When error occurs, Then error object branch is used', async () => {
      // Given: Authentication error without message property
      console.log('🔧 BDD: Setting up authentication error without message property');
      mockConfigService.isAuthenticated.and.returnValue(false);
      mockConfigService.getBlueskyCredentials.and.returnValue({
        username: 'test.user',
        password: 'password'
      });
      const errorWithoutMessage = 'String error without message property';
      mockBlueskyService.authenticate.and.returnValue(Promise.reject(errorWithoutMessage));

      const currentRoute = {
        url: '/step/auth',
        data: { next: 'config', previous: 'upload' }
      } as unknown as ActivatedRouteSnapshot;

      const nextState = {
        url: '/step/config'
      } as RouterStateSnapshot;

      // When: User attempts to navigate to next step
      console.log('⚙️ BDD: Attempting navigation with error without message property');
      const result = TestBed.runInInjectionContext(() =>
        authDeactivateGuard(null, currentRoute, {} as RouterStateSnapshot, nextState)
      );

      // Then: Error object fallback branch is executed
      console.log('✅ BDD: Verifying error object fallback branch is executed');
      const authResult = await firstValueFrom(result as any);
      expect(authResult).toBe(false);
      expect(mockLogger.error).toHaveBeenCalledWith(`Authentication error: ${errorWithoutMessage}`);
    });

    it('Given authentication error with null value, When error occurs, Then fallback branch is used', async () => {
      // Given: Authentication error with null value
      console.log('🔧 BDD: Setting up authentication error with null value');
      mockConfigService.isAuthenticated.and.returnValue(false);
      mockConfigService.getBlueskyCredentials.and.returnValue({
        username: 'test.user',
        password: 'password'
      });
      mockBlueskyService.authenticate.and.returnValue(Promise.reject(null));

      const currentRoute = {
        url: '/step/auth',
        data: { next: 'config', previous: 'upload' }
      } as unknown as ActivatedRouteSnapshot;

      const nextState = {
        url: '/step/config'
      } as RouterStateSnapshot;

      // When: User attempts to navigate to next step
      console.log('⚙️ BDD: Attempting navigation with null error');
      const result = TestBed.runInInjectionContext(() =>
        authDeactivateGuard(null, currentRoute, {} as RouterStateSnapshot, nextState)
      );

      // Then: Null fallback branch is executed
      console.log('✅ BDD: Verifying null error fallback branch is executed');
      const authResult = await firstValueFrom(result as any);
      expect(authResult).toBe(false);
      expect(mockLogger.error).toHaveBeenCalledWith('Authentication error: null');
    });

    it('Given nextState with undefined url, When checking navigation, Then empty string branch is used', () => {
      // Given: nextState with undefined url
      console.log('🔧 BDD: Setting up nextState with undefined url');
      const currentRoute = {
        url: '/step/auth',
        data: { next: 'config', previous: 'upload' }
      } as unknown as ActivatedRouteSnapshot;

      const nextState = {
        url: undefined
      } as any as RouterStateSnapshot;

      // When: Guard checks navigation
      console.log('⚙️ BDD: Checking navigation with undefined url');
      const result = TestBed.runInInjectionContext(() =>
        authDeactivateGuard(null, currentRoute, {} as RouterStateSnapshot, nextState)
      );

      // Then: Empty string fallback is used
      console.log('✅ BDD: Verifying empty string fallback for undefined url');
      expect(result).toBe(true);
      expect(mockLogger.log).toHaveBeenCalledWith('Other navigation detected, allowing deactivation');
    });
  });
});
