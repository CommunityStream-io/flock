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

  describe('Scenario: Valid credentials are stored automatically', () => {
    it('Given valid credentials, When form is valid, Then credentials are stored', () => {
      // Given: Set up valid credentials
      console.log(`🔧 BDD: Setting up valid username and password`);
      component.authForm.patchValue({
        username: 'username.bksy.social',
        password: 'validPassword123'
      });
      fixture.detectChanges();
      
      // When: Form becomes valid (triggers valueChanges subscription)
      console.log(`⚙️ BDD: Form becomes valid and triggers credential storage`);
      component.authForm.updateValueAndValidity();
      fixture.detectChanges();
      
      // Then: Credentials should be stored in config service
      console.log(`✅ BDD: Verifying credentials are stored for resolver`);
      expect(mockConfigService.setBlueskyCredentials).toHaveBeenCalledWith({
        username: '@username.bksy.social',
        password: 'validPassword123'
      });
    });

    it('Given valid credentials, When form changes, Then credentials are automatically stored', () => {
      // Given: Set up valid credentials
      console.log(`🔧 BDD: Setting up authentication flow`);
      component.authForm.patchValue({
        username: 'username.bksy.social',
        password: 'validPassword123'
      });
      fixture.detectChanges();
      
      // When: Form value changes (triggers valueChanges subscription)
      console.log(`⚙️ BDD: Form value changes trigger credential storage`);
      component.authForm.patchValue({
        username: 'username.bksy.social',
        password: 'validPassword123'
      });
      fixture.detectChanges();
      
      // Then: Credentials should be stored automatically
      console.log(`✅ BDD: Verifying credentials are stored automatically`);
      expect(mockConfigService.setBlueskyCredentials).toHaveBeenCalledWith({
        username: '@username.bksy.social',
        password: 'validPassword123'
      });
      
      // And: Form should be valid
      console.log(`✅ BDD: Verifying form is valid`);
      expect(component.isFormValid()).toBe(true);
    });
  });

  describe('Scenario: Invalid credentials are not stored', () => {
    it('Given invalid credentials, When form is invalid, Then credentials are not stored', () => {
      // Given: Set up invalid credentials (empty password)
      console.log(`🔧 BDD: Setting up invalid credentials`);
      component.authForm.patchValue({
        username: 'username.bksy.social',
        password: ''
      });
      fixture.detectChanges();
      
      // When: Form is invalid
      console.log(`⚙️ BDD: Form is invalid due to empty password`);
      component.authForm.updateValueAndValidity();
      fixture.detectChanges();
      
      // Then: Credentials should not be stored for invalid form
      console.log(`✅ BDD: Verifying credentials are not stored for invalid form`);
      expect(mockConfigService.setBlueskyCredentials).not.toHaveBeenCalled();
      
      // And: Form should be invalid
      console.log(`✅ BDD: Verifying form is invalid`);
      expect(component.isFormValid()).toBe(false);
    });
  });


});
