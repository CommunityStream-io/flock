import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { of, throwError } from 'rxjs';
import { firstValueFrom } from 'rxjs';

import { authResolver } from './auth-resolver';
import { Bluesky, ConfigServiceImpl, LOGGER, Logger, SplashScreenLoading } from '../../services';
import { AuthResult, Credentials } from '../../services/interfaces/bluesky';

describe('Feature: Auth Resolver', () => {
  let mockBlueskyService: jasmine.SpyObj<Bluesky>;
  let mockConfigService: jasmine.SpyObj<ConfigServiceImpl>;
  let mockLogger: jasmine.SpyObj<Logger>;
  let mockSnackBar: jasmine.SpyObj<MatSnackBar>;
  let mockSplashScreenLoading: jasmine.SpyObj<SplashScreenLoading>;
  let mockRoute: ActivatedRouteSnapshot;
  let mockState: RouterStateSnapshot;

  const testCredentials: Credentials = {
    username: '@test.bksy.social',
    password: 'testpassword123'
  };

  beforeEach(() => {
    const blueskySpy = jasmine.createSpyObj('Bluesky', ['authenticate']);
    const configSpy = jasmine.createSpyObj('ConfigServiceImpl', [
      'isAuthenticated',
      'getBlueskyCredentials',
      'setAuthenticated'
    ]);
    const loggerSpy = jasmine.createSpyObj('Logger', ['log', 'error']);
    const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
    const splashSpy = jasmine.createSpyObj('SplashScreenLoading', ['show', 'hide']);

    TestBed.configureTestingModule({
      providers: [
        { provide: Bluesky, useValue: blueskySpy },
        { provide: ConfigServiceImpl, useValue: configSpy },
        { provide: LOGGER, useValue: loggerSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
        { provide: SplashScreenLoading, useValue: splashSpy }
      ]
    });

    mockBlueskyService = TestBed.inject(Bluesky) as jasmine.SpyObj<Bluesky>;
    mockConfigService = TestBed.inject(ConfigServiceImpl) as jasmine.SpyObj<ConfigServiceImpl>;
    mockLogger = TestBed.inject(LOGGER) as jasmine.SpyObj<Logger>;
    mockSnackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
    mockSplashScreenLoading = TestBed.inject(SplashScreenLoading) as jasmine.SpyObj<SplashScreenLoading>;

    // Create mock route and state
    mockRoute = {} as ActivatedRouteSnapshot;
    mockState = {} as RouterStateSnapshot;
  });

  describe('Scenario: User already authenticated', () => {
    it('Given user is already authenticated, When resolver executes, Then it should return true immediately', async () => {
      // Given: User is already authenticated
      console.log('🔧 BDD: Setting up already authenticated user');
      mockConfigService.isAuthenticated.and.returnValue(true);

      // When: Resolver executes
      console.log('⚙️ BDD: Executing auth resolver');
      const result = await firstValueFrom(TestBed.runInInjectionContext(() => authResolver(mockRoute, mockState)) as any);

      // Then: Should return true immediately
      console.log('✅ BDD: Verifying immediate authentication success');
      expect(result).toBe(true);
      expect(mockLogger.log).toHaveBeenCalledWith('User already authenticated, proceeding to next step');
      expect(mockBlueskyService.authenticate).not.toHaveBeenCalled();
      expect(mockSplashScreenLoading.show).not.toHaveBeenCalled();
    });
  });

  describe('Scenario: No credentials available', () => {
    it('Given no credentials are stored, When resolver executes, Then it should return false and show error', async () => {
      // Given: No credentials are stored
      console.log('🔧 BDD: Setting up scenario with no stored credentials');
      mockConfigService.isAuthenticated.and.returnValue(false);
      mockConfigService.getBlueskyCredentials.and.returnValue(null);

      // When: Resolver executes
      console.log('⚙️ BDD: Executing auth resolver without credentials');
      const result = await firstValueFrom(TestBed.runInInjectionContext(() => authResolver(mockRoute, mockState)) as any);

      // Then: Should return false and show error
      console.log('✅ BDD: Verifying no credentials error handling');
      expect(result).toBe(false);
      expect(mockLogger.error).toHaveBeenCalledWith('No credentials found for authentication');
      expect(mockSnackBar.open).toHaveBeenCalledWith(
        'Please provide valid Bluesky credentials',
        'Close',
        { duration: 3000 }
      );
      expect(mockBlueskyService.authenticate).not.toHaveBeenCalled();
    });
  });

  describe('Scenario: Successful authentication', () => {
    it('Given valid credentials, When authentication succeeds, Then it should return true and set authenticated state', async () => {
      // Given: Valid credentials and successful authentication
      console.log('🔧 BDD: Setting up successful authentication scenario');
      mockConfigService.isAuthenticated.and.returnValue(false);
      mockConfigService.getBlueskyCredentials.and.returnValue(testCredentials);
      
      const successResult: AuthResult = {
        success: true,
        message: 'Authentication successful'
      };
      mockBlueskyService.authenticate.and.returnValue(Promise.resolve(successResult));

      // When: Resolver executes
      console.log('⚙️ BDD: Executing auth resolver with valid credentials');
      const result = await firstValueFrom(TestBed.runInInjectionContext(() => authResolver(mockRoute, mockState)) as any);

      // Then: Should return true and set authenticated state
      console.log('✅ BDD: Verifying successful authentication flow');
      expect(result).toBe(true);
      expect(mockSplashScreenLoading.show).toHaveBeenCalledWith('Authenticating with bsky.social');
      expect(mockBlueskyService.authenticate).toHaveBeenCalledWith(testCredentials);
      expect(mockLogger.log).toHaveBeenCalledWith('Bluesky authentication successful');
      expect(mockConfigService.setAuthenticated).toHaveBeenCalledWith(true);
      expect(mockSplashScreenLoading.hide).toHaveBeenCalled();
    });
  });

  describe('Scenario: Failed authentication', () => {
    it('Given valid credentials, When authentication fails, Then it should return false and show error', async () => {
      // Given: Valid credentials but failed authentication
      console.log('🔧 BDD: Setting up failed authentication scenario');
      mockConfigService.isAuthenticated.and.returnValue(false);
      mockConfigService.getBlueskyCredentials.and.returnValue(testCredentials);
      
      const failureResult: AuthResult = {
        success: false,
        message: 'Invalid Bluesky credentials'
      };
      mockBlueskyService.authenticate.and.returnValue(Promise.resolve(failureResult));

      // When: Resolver executes
      console.log('⚙️ BDD: Executing auth resolver with invalid credentials');
      const result = await firstValueFrom(TestBed.runInInjectionContext(() => authResolver(mockRoute, mockState)) as any);

      // Then: Should return false and show error
      console.log('✅ BDD: Verifying failed authentication handling');
      expect(result).toBe(false);
      expect(mockSplashScreenLoading.show).toHaveBeenCalledWith('Authenticating with bsky.social');
      expect(mockBlueskyService.authenticate).toHaveBeenCalledWith(testCredentials);
      expect(mockLogger.error).toHaveBeenCalledWith('Bluesky authentication failed: Invalid Bluesky credentials');
      expect(mockSnackBar.open).toHaveBeenCalledWith(
        'Invalid Bluesky credentials',
        'Close',
        { duration: 3000 }
      );
      expect(mockConfigService.setAuthenticated).not.toHaveBeenCalled();
      expect(mockSplashScreenLoading.hide).toHaveBeenCalled();
    });
  });

  describe('Scenario: Authentication error', () => {
    it('Given valid credentials, When authentication throws error, Then it should return false and show error', async () => {
      // Given: Valid credentials but authentication throws error
      console.log('🔧 BDD: Setting up authentication error scenario');
      mockConfigService.isAuthenticated.and.returnValue(false);
      mockConfigService.getBlueskyCredentials.and.returnValue(testCredentials);
      
      const authError = new Error('Network connection failed');
      mockBlueskyService.authenticate.and.returnValue(Promise.reject(authError));

      // When: Resolver executes
      console.log('⚙️ BDD: Executing auth resolver with network error');
      const result = await firstValueFrom(TestBed.runInInjectionContext(() => authResolver(mockRoute, mockState)) as any);

      // Then: Should return false and show error
      console.log('✅ BDD: Verifying authentication error handling');
      expect(result).toBe(false);
      expect(mockSplashScreenLoading.show).toHaveBeenCalledWith('Authenticating with bsky.social');
      expect(mockBlueskyService.authenticate).toHaveBeenCalledWith(testCredentials);
      expect(mockLogger.error).toHaveBeenCalledWith('Authentication error: Network connection failed');
      expect(mockSnackBar.open).toHaveBeenCalledWith(
        'Authentication failed. Please check your credentials.',
        'Close',
        { duration: 3000 }
      );
      expect(mockConfigService.setAuthenticated).not.toHaveBeenCalled();
      expect(mockSplashScreenLoading.hide).toHaveBeenCalled();
    });
  });

  describe('Scenario: Authentication with no error message', () => {
    it('Given authentication fails without message, When resolver executes, Then it should show default error message', async () => {
      // Given: Authentication fails without specific message
      console.log('🔧 BDD: Setting up authentication failure without message');
      mockConfigService.isAuthenticated.and.returnValue(false);
      mockConfigService.getBlueskyCredentials.and.returnValue(testCredentials);
      
      const failureResult: AuthResult = {
        success: false,
        message: ''
      };
      mockBlueskyService.authenticate.and.returnValue(Promise.resolve(failureResult));

      // When: Resolver executes
      console.log('⚙️ BDD: Executing auth resolver with no error message');
      const result = await firstValueFrom(TestBed.runInInjectionContext(() => authResolver(mockRoute, mockState)) as any);

      // Then: Should show default error message
      console.log('✅ BDD: Verifying default error message handling');
      expect(result).toBe(false);
      expect(mockSnackBar.open).toHaveBeenCalledWith(
        'Authentication failed',
        'Close',
        { duration: 3000 }
      );
    });
  });

  describe('Scenario: Resolver execution context', () => {
    it('Given injection context, When resolver executes, Then dependencies should be properly injected', () => {
      // Given: Injection context is available
      console.log('🔧 BDD: Setting up injection context test');

      // When: Creating resolver executor
      console.log('⚙️ BDD: Creating resolver executor function');
      const resolver = authResolver;

      // Then: Resolver should be properly configured
      console.log('✅ BDD: Verifying resolver configuration');
      expect(resolver).toBeTruthy();
      expect(typeof resolver).toBe('function');
    });

    it('Given resolver parameters, When resolver executes, Then parameters should be passed correctly', async () => {
      // Given: Resolver parameters
      console.log('🔧 BDD: Setting up resolver parameters test');
      mockConfigService.isAuthenticated.and.returnValue(false);
      mockConfigService.getBlueskyCredentials.and.returnValue(testCredentials);
      
      const successResult: AuthResult = {
        success: true,
        message: 'Authentication successful'
      };
      mockBlueskyService.authenticate.and.returnValue(Promise.resolve(successResult));

      // When: Execute resolver
      console.log('⚙️ BDD: Executing resolver with test parameters');
      const result = await firstValueFrom(TestBed.runInInjectionContext(() => authResolver(mockRoute, mockState)) as any);

      // Then: Resolver should execute successfully
      console.log('✅ BDD: Verifying resolver execution with parameters');
      expect(result).toBe(true);
      expect(mockBlueskyService.authenticate).toHaveBeenCalled();
    });
  });

  describe('Scenario: Observable stream behavior', () => {
    it('Given authentication stream, When resolver executes, Then observable should complete properly', async () => {
      // Given: Authentication stream setup
      console.log('🔧 BDD: Setting up observable stream test');
      mockConfigService.isAuthenticated.and.returnValue(false);
      mockConfigService.getBlueskyCredentials.and.returnValue(testCredentials);
      
      const successResult: AuthResult = {
        success: true,
        message: 'Authentication successful'
      };
      mockBlueskyService.authenticate.and.returnValue(Promise.resolve(successResult));

      // When: Execute resolver and wait for completion
      console.log('⚙️ BDD: Executing resolver and waiting for stream completion');
      const result = await firstValueFrom(TestBed.runInInjectionContext(() => authResolver(mockRoute, mockState)) as any);

      // Then: Observable should complete with proper result
      console.log('✅ BDD: Verifying observable stream completion');
      expect(result).toBe(true);
      expect(mockSplashScreenLoading.hide).toHaveBeenCalled();
    });
  });
});
