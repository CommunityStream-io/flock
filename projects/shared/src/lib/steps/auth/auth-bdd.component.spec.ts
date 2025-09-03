import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';

import { Auth } from './auth';
import { LOGGER, Bluesky, ConfigServiceImpl, Logger, SplashScreenLoading } from '../../services';

/**
 * BDD-Style Integration Tests for Auth Component
 * 
 * This demonstrates BDD methodology using Angular's native testing framework
 * without requiring Cucumber. The BDD approach is maintained through structure
 * and naming conventions.
 */
describe('Feature: User Authentication (BDD-Style)', () => {
  let component: Auth;
  let fixture: ComponentFixture<Auth>;
  let mockBlueskyService: jasmine.SpyObj<Bluesky>;
  let mockConfigService: jasmine.SpyObj<ConfigServiceImpl>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockLogger: jasmine.SpyObj<Logger>;
  let mockSplashScreenLoading: jasmine.SpyObj<SplashScreenLoading>;

  beforeEach(async () => {
    mockBlueskyService = jasmine.createSpyObj('Bluesky', ['authenticate']);
    mockConfigService = jasmine.createSpyObj('ConfigServiceImpl', ['setBlueskyCredentials', 'setAuthenticated']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockLogger = jasmine.createSpyObj('Logger', ['log', 'error', 'warn', 'workflow', 'instrument']);
    mockSplashScreenLoading = jasmine.createSpyObj('SplashScreenLoading', ['show', 'hide'], {
      message: { asObservable: jasmine.createSpy('asObservable').and.returnValue({ subscribe: jasmine.createSpy('subscribe') }) },
      isLoading: { asObservable: jasmine.createSpy('asObservable').and.returnValue({ subscribe: jasmine.createSpy('subscribe') }) }
    });

    await TestBed.configureTestingModule({
      imports: [Auth, NoopAnimationsModule],
      providers: [
        { provide: LOGGER, useValue: mockLogger },
        { provide: Bluesky, useValue: mockBlueskyService },
        { provide: ConfigServiceImpl, useValue: mockConfigService },
        { provide: Router, useValue: mockRouter },
        { provide: MatDialog, useValue: { open: jasmine.createSpy('open') } },
        { provide: SplashScreenLoading, useValue: mockSplashScreenLoading }
      ]
    }).compileComponents();
    
    fixture = TestBed.createComponent(Auth);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Scenario: Valid credentials trigger authentication splash screen', () => {
    it('Given valid credentials, When user clicks Next, Then splash screen appears', async () => {
      // Given: Set up valid credentials
      console.log(`🔧 BDD: Setting up valid username and password`);
      component.authForm.patchValue({
        username: 'username.bksy.social',
        password: 'validPassword123'
      });
      fixture.detectChanges();
      
      // Mock successful authentication
      mockBlueskyService.authenticate.and.returnValue(Promise.resolve({
        success: true,
        message: 'Authentication successful'
      }));

      // When: User clicks Next button
      console.log(`⚙️ BDD: User clicks Next button`);
      const form = fixture.debugElement.query(By.css('form'));
      form.triggerEventHandler('ngSubmit', null);
      fixture.detectChanges();
      
      // Then: Splash screen service should be called
      console.log(`✅ BDD: Verifying splash screen service is called with authentication message`);
      expect(mockSplashScreenLoading.show).toHaveBeenCalledWith('Authenticating with bsky.social');
      
      // And: Authentication should process in the background
      console.log(`✅ BDD: Verifying authentication processes in background`);
      expect(mockBlueskyService.authenticate).toHaveBeenCalledWith({
        username: '@username.bksy.social',
        password: 'validPassword123'
      });
    });

    it('Given valid credentials, When authentication completes, Then user navigates to config step', async () => {
      // Given: Set up valid credentials and start authentication
      console.log(`🔧 BDD: Setting up authentication flow`);
      component.authForm.patchValue({
        username: 'username.bksy.social',
        password: 'validPassword123'
      });
      fixture.detectChanges();
      
      // Mock successful authentication
      mockBlueskyService.authenticate.and.returnValue(Promise.resolve({
        success: true,
        message: 'Authentication successful'
      }));

      // When: User clicks Next and authentication completes
      console.log(`⚙️ BDD: Starting authentication process`);
      const form = fixture.debugElement.query(By.css('form'));
      form.triggerEventHandler('ngSubmit', null);
      
      // Wait for authentication to complete
      await fixture.whenStable();
      fixture.detectChanges();
      
      // Then: User should be navigated to config step
      console.log(`✅ BDD: Verifying navigation to config step`);
      expect(mockConfigService.setBlueskyCredentials).toHaveBeenCalledWith({
        username: '@username.bksy.social',
        password: 'validPassword123'
      });
      expect(mockConfigService.setAuthenticated).toHaveBeenCalledWith(true);
      expect(component.isAuthenticated()).toBe(true);
      
      // And: Splash screen should be hidden
      console.log(`✅ BDD: Verifying splash screen is hidden after authentication`);
      expect(mockSplashScreenLoading.hide).toHaveBeenCalled();
    });
  });

  describe('Scenario: Invalid credentials show error without splash screen', () => {
    it('Given invalid credentials, When user clicks Next, Then error is shown', async () => {
      // Given: Set up invalid credentials
      console.log(`🔧 BDD: Setting up invalid credentials`);
      component.authForm.patchValue({
        username: 'username.bksy.social',
        password: 'wrongPassword'
      });
      fixture.detectChanges();
      
      // Mock failed authentication
      mockBlueskyService.authenticate.and.returnValue(Promise.resolve({
        success: false,
        message: 'Invalid Bluesky credentials'
      }));

      // When: User clicks Next button
      console.log(`⚙️ BDD: User clicks Next with invalid credentials`);
      const form = fixture.debugElement.query(By.css('form'));
      form.triggerEventHandler('ngSubmit', null);
      
      // Wait for authentication to complete
      await fixture.whenStable();
      fixture.detectChanges();
      
      // Then: Error should be shown and splash screen should be hidden
      console.log(`✅ BDD: Verifying error message is displayed`);
      expect(component.authError()).toBe('Invalid Bluesky credentials');
      
      const errorMessage = fixture.debugElement.query(By.css('.auth-error'));
      expect(errorMessage).toBeTruthy();
      expect(errorMessage.nativeElement.textContent).toContain('Invalid Bluesky credentials');
      
      // And: Splash screen should be hidden after error
      console.log(`✅ BDD: Verifying splash screen is hidden after authentication error`);
      expect(mockSplashScreenLoading.hide).toHaveBeenCalled();
    });
  });

  describe('Scenario: Form validation prevents submission', () => {
    it('Given invalid form, When user clicks Next, Then button is disabled', () => {
      // Given: Form with invalid data
      console.log(`🔧 BDD: Setting up invalid form data`);
      component.authForm.patchValue({
        username: 'invalid-username',
        password: ''
      });
      fixture.detectChanges();
      
      // When: User attempts to click Next
      console.log(`⚙️ BDD: Attempting to click Next button`);
      const nextButton = fixture.debugElement.query(By.css('.submit-button'));
      
      // Then: Button should be disabled
      console.log(`✅ BDD: Verifying Next button is disabled`);
      expect(nextButton.nativeElement.disabled).toBe(true);
      expect(component.isFormValid()).toBe(false);
    });
  });
});
