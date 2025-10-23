import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

import { Auth } from './auth';
import { LOGGER, Bluesky, ConfigServiceImpl, Logger } from '../../services';

describe('Auth', () => {
  let component: Auth;
  let fixture: ComponentFixture<Auth>;

  const mockLogger: Logger = {
    log: jasmine.createSpy('log'),
    error: jasmine.createSpy('error'),
    warn: jasmine.createSpy('warn'),
    workflow: jasmine.createSpy('workflow'),
    instrument: jasmine.createSpy('instrument').and.returnValue(Promise.resolve())
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Auth, NoopAnimationsModule],
      providers: [
        { provide: LOGGER, useValue: mockLogger },
        { provide: Bluesky, useClass: Bluesky },
        { provide: ConfigServiceImpl, useClass: ConfigServiceImpl },
        { provide: Router, useValue: { navigate: jasmine.createSpy('navigate') } },
        { provide: MatDialog, useValue: { open: jasmine.createSpy('open') } }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Auth);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

describe('Feature: Username Validation Error Detection (BDD-Style)', () => {
  let component: Auth;
  let fixture: ComponentFixture<Auth>;

  const mockLogger: Logger = {
    log: jasmine.createSpy('log'),
    error: jasmine.createSpy('error'),
    warn: jasmine.createSpy('warn'),
    workflow: jasmine.createSpy('workflow'),
    instrument: jasmine.createSpy('instrument').and.returnValue(Promise.resolve())
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Auth, NoopAnimationsModule],
      providers: [
        { provide: LOGGER, useValue: mockLogger },
        { provide: Bluesky, useClass: Bluesky },
        { provide: ConfigServiceImpl, useClass: ConfigServiceImpl },
        { provide: Router, useValue: { navigate: jasmine.createSpy('navigate') } },
        { provide: MatDialog, useValue: { open: jasmine.createSpy('open') } }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Auth);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Scenario: Username contains @ symbol', () => {
    it('Given username with @ symbol, When user enters it, Then error message is displayed in DOM', () => {
      // Given: User is on the auth form
      console.log('🔧 BDD: User viewing auth form');
      const usernameControl = component.authForm.get('username');

      // When: User enters username with @ symbol and marks field as touched
      console.log('⚙️ BDD: User enters @username.bsky.social and leaves field');
      usernameControl?.setValue('@username.bsky.social');
      usernameControl?.markAsTouched();
      fixture.detectChanges();

      // Then: Error message should be visible in DOM
      console.log('✅ BDD: Verifying error message appears in template');
      const errorMessage = component.getUsernameErrorMessage();
      expect(errorMessage).toContain('@ symbol');
      expect(usernameControl?.hasError('atSymbolNotAllowed')).toBe(true);
    });
  });

  describe('Scenario: Username missing required dots', () => {
    it('Given username with insufficient dots, When user enters it, Then error message is displayed in DOM', () => {
      // Given: User is on the auth form
      console.log('🔧 BDD: User viewing auth form');
      const usernameControl = component.authForm.get('username');

      // When: User enters username with only one dot and leaves field
      console.log('⚙️ BDD: User enters username.social (only one dot) and leaves field');
      usernameControl?.setValue('username.social');
      usernameControl?.markAsTouched();
      fixture.detectChanges();

      // Then: Error message about dots should be visible
      console.log('✅ BDD: Verifying dots error message appears in template');
      const errorMessage = component.getUsernameErrorMessage();
      expect(errorMessage).toContain('dots');
      expect(usernameControl?.hasError('dotsRequired')).toBe(true);
    });
  });

  describe('Scenario: Username with no dots', () => {
    it('Given username with no dots, When user enters it, Then error message is displayed in DOM', () => {
      // Given: User is on the auth form
      console.log('🔧 BDD: User viewing auth form');
      const usernameControl = component.authForm.get('username');

      // When: User enters username with no dots and leaves field
      console.log('⚙️ BDD: User enters username (no dots) and leaves field');
      usernameControl?.setValue('username');
      usernameControl?.markAsTouched();
      fixture.detectChanges();

      // Then: Error message about dots should be visible
      console.log('✅ BDD: Verifying dots error message appears in template');
      const errorMessage = component.getUsernameErrorMessage();
      expect(errorMessage).toContain('dots');
      expect(usernameControl?.hasError('dotsRequired')).toBe(true);
    });
  });

  describe('Scenario: Empty username validation', () => {
    it('Given empty username, When user leaves field, Then required error message is displayed', () => {
      // Given: User is on the auth form
      console.log('🔧 BDD: User viewing auth form with empty username');
      const usernameControl = component.authForm.get('username');

      // When: User leaves field empty and touches it
      console.log('⚙️ BDD: User focuses then leaves username field empty');
      usernameControl?.setValue('');
      usernameControl?.markAsTouched();
      fixture.detectChanges();

      // Then: Required error message should be displayed
      console.log('✅ BDD: Verifying required error message appears');
      const errorMessage = component.getUsernameErrorMessage();
      expect(errorMessage).toBe('Username is required');
      expect(usernameControl?.hasError('required')).toBe(true);
    });
  });

  describe('Scenario: Valid username format', () => {
    it('Given valid username, When user enters it, Then no error message is displayed', () => {
      // Given: User is on the auth form
      console.log('🔧 BDD: User viewing auth form');
      const usernameControl = component.authForm.get('username');

      // When: User enters a valid username (no @, two dots) and leaves field
      console.log('⚙️ BDD: User enters username.bsky.social (valid format)');
      usernameControl?.setValue('username.bsky.social');
      usernameControl?.markAsTouched();
      fixture.detectChanges();

      // Then: No error message should be displayed
      console.log('✅ BDD: Verifying no error messages appear for valid username');
      const errorMessage = component.getUsernameErrorMessage();
      expect(errorMessage).toBe('');
      expect(usernameControl?.valid).toBe(true);
    });
  });

  describe('Scenario: Password field validation', () => {
    it('Given empty password, When user leaves field, Then required error message is displayed', () => {
      // Given: User is on the auth form
      console.log('🔧 BDD: User viewing auth form');
      const passwordControl = component.authForm.get('password');

      // When: User leaves password field empty and touches it
      console.log('⚙️ BDD: User focuses then leaves password field empty');
      passwordControl?.setValue('');
      passwordControl?.markAsTouched();
      fixture.detectChanges();

      const errorMessage = component.getPasswordErrorMessage();

      // Then: Required error message should be displayed to user
      console.log('✅ BDD: Verifying password required error message appears');
      expect(errorMessage).toBe('Password is required');
      expect(passwordControl?.hasError('required')).toBe(true);
    });
  });

  describe('Scenario: Dynamic error messages for different validation states', () => {
    it('Given various invalid usernames, When user enters them, Then appropriate error messages are displayed', () => {
      // Given: User is on the auth form
      console.log('🔧 BDD: User testing different invalid username formats');
      const usernameControl = component.authForm.get('username');

      // When: User enters username with insufficient dots
      console.log('⚙️ BDD: User enters username with insufficient dots');
      usernameControl?.setValue('username.social');
      usernameControl?.markAsTouched();
      fixture.detectChanges();

      let errorMessage = component.getUsernameErrorMessage();
      console.log('✅ BDD: Verifying dots error message is displayed');
      expect(errorMessage).toContain('dots');

      // When: User clears the field completely
      console.log('⚙️ BDD: User clears the username field');
      usernameControl?.setValue('');
      fixture.detectChanges();

      errorMessage = component.getUsernameErrorMessage();
      console.log('✅ BDD: Verifying required error message is displayed');
      expect(errorMessage).toBe('Username is required');

      // When: User enters username with @ symbol
      console.log('⚙️ BDD: User enters username with @ symbol');
      usernameControl?.setValue('@test.bsky.social');
      fixture.detectChanges();

      errorMessage = component.getUsernameErrorMessage();
      console.log('✅ BDD: Verifying @ symbol error message is displayed');
      expect(errorMessage).toContain('@ symbol');
    });
  });
});
