import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { firstValueFrom } from 'rxjs';

import { authDeactivateGuard } from './auth-deactivate-guard';
import { ConfigServiceImpl, Bluesky, LOGGER, Logger, SplashScreenLoading } from '../../services';

describe('AuthDeactivateGuard', () => {
  let mockConfigService: jasmine.SpyObj<ConfigServiceImpl>;
  let mockBlueskyService: jasmine.SpyObj<Bluesky>;
  let mockLogger: jasmine.SpyObj<Logger>;
  let mockSnackBar: jasmine.SpyObj<MatSnackBar>;
  let mockSplashScreenLoading: jasmine.SpyObj<SplashScreenLoading>;

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

    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, NoopAnimationsModule],
      providers: [
        { provide: ConfigServiceImpl, useValue: mockConfigService },
        { provide: Bluesky, useValue: mockBlueskyService },
        { provide: LOGGER, useValue: mockLogger },
        { provide: MatSnackBar, useValue: mockSnackBar },
        { provide: SplashScreenLoading, useValue: mockSplashScreenLoading }
      ]
    }).compileComponents();
  });

  it('should be created', () => {
    expect(authDeactivateGuard).toBeTruthy();
  });

  describe('Navigation to previous step', () => {
    it('should allow navigation to previous step', () => {
      const currentRoute = {
        url: '/step/auth',
        data: { next: 'config', previous: 'upload' }
      } as unknown as ActivatedRouteSnapshot;
      
      const nextState = {
        url: '/step/upload'
      } as RouterStateSnapshot;

      const result = TestBed.runInInjectionContext(() => 
        authDeactivateGuard(null, currentRoute, {} as RouterStateSnapshot, nextState)
      );

      expect(result).toBe(true);
      expect(mockLogger.log).toHaveBeenCalledWith('Navigating to previous step, allowing deactivation');
    });
  });

  describe('Navigation to next step', () => {
    it('should allow navigation when already authenticated', () => {
      mockConfigService.isAuthenticated.and.returnValue(true);

      const currentRoute = {
        url: '/step/auth',
        data: { next: 'config', previous: 'upload' }
      } as unknown as ActivatedRouteSnapshot;
      
      const nextState = {
        url: '/step/config'
      } as RouterStateSnapshot;

      const result = TestBed.runInInjectionContext(() => 
        authDeactivateGuard(null, currentRoute, {} as RouterStateSnapshot, nextState)
      );

      expect(result).toBe(true);
      expect(mockLogger.log).toHaveBeenCalledWith('User already authenticated, allowing navigation');
    });

    it('should block navigation when no credentials are provided', () => {
      mockConfigService.isAuthenticated.and.returnValue(false);
      mockConfigService.getBlueskyCredentials.and.returnValue(null);

      const currentRoute = {
        url: '/step/auth',
        data: { next: 'config', previous: 'upload' }
      } as unknown as ActivatedRouteSnapshot;
      
      const nextState = {
        url: '/step/config'
      } as RouterStateSnapshot;

      const result = TestBed.runInInjectionContext(() => 
        authDeactivateGuard(null, currentRoute, {} as RouterStateSnapshot, nextState)
      );

      expect(result).toBe(false);
      expect(mockSnackBar.open).toHaveBeenCalledWith('Please provide valid Bluesky credentials', 'Close', {
        duration: 3000,
      });
    });

    it('should authenticate and allow navigation with valid credentials', async () => {
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

      const result = TestBed.runInInjectionContext(() => 
        authDeactivateGuard(null, currentRoute, {} as RouterStateSnapshot, nextState)
      );

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

    it('should block navigation with invalid credentials', async () => {
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

      const result = TestBed.runInInjectionContext(() => 
        authDeactivateGuard(null, currentRoute, {} as RouterStateSnapshot, nextState)
      );

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

    it('should handle authentication errors', async () => {
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

      const result = TestBed.runInInjectionContext(() => 
        authDeactivateGuard(null, currentRoute, {} as RouterStateSnapshot, nextState)
      );

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

  describe('Other navigation', () => {
    it('should allow direct URL navigation', () => {
      const currentRoute = {
        url: '/step/auth',
        data: { next: 'config', previous: 'upload' }
      } as unknown as ActivatedRouteSnapshot;
      
      const nextState = {
        url: '/home'
      } as RouterStateSnapshot;

      const result = TestBed.runInInjectionContext(() => 
        authDeactivateGuard(null, currentRoute, {} as RouterStateSnapshot, nextState)
      );

      expect(result).toBe(true);
      expect(mockLogger.log).toHaveBeenCalledWith('Other navigation detected, allowing deactivation');
    });
  });
});