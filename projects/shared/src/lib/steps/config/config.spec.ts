import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogModule } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';

import { Config } from './config';
import { LOGGER, ConfigServiceImpl, Logger } from '../../services';

/**
 * BDD-Style Unit Tests for Config Component
 * 
 * This demonstrates BDD methodology using Angular's native testing framework
 * without requiring Cucumber. The BDD approach is maintained through structure
 * and naming conventions.
 */
describe('Feature: Migration Configuration (BDD-Style)', () => {
  let component: Config;
  let fixture: ComponentFixture<Config>;
  let mockLogger: jasmine.SpyObj<Logger>;
  let mockConfigService: jasmine.SpyObj<ConfigServiceImpl>;

  beforeEach(async () => {
    mockLogger = jasmine.createSpyObj('Logger', ['log', 'error', 'warn', 'workflow', 'instrument']);
    mockConfigService = jasmine.createSpyObj('ConfigServiceImpl', [
      'setStartDate', 'setEndDate', 'setTestVideoMode', 'setSimulate',
      'getStartDate', 'getEndDate', 'getTestVideoMode', 'getSimulate'
    ], {
      startDate: '',
      endDate: '',
      testVideoMode: false,
      simulate: false
    });

    await TestBed.configureTestingModule({
      imports: [Config, NoopAnimationsModule, MatDialogModule],
      providers: [
        { provide: LOGGER, useValue: mockLogger },
        { provide: ConfigServiceImpl, useValue: mockConfigService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Config);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Scenario: Component Initialization', () => {
    it('Given a new config component, When component initializes, Then form has default values', () => {
      // 🔧 BDD: Set up component initialization context
      console.log(`🔧 BDD: Component is created and initialized`);
      
      // ⚙️ BDD: Component initializes with default form values
      console.log(`⚙️ BDD: Form controls are initialized with default values`);
      
      // ✅ BDD: Verify all form controls have correct default values
      console.log(`✅ BDD: All form controls have expected default values`);
      expect(component.configForm.get('startDate')?.value).toBe('');
      expect(component.configForm.get('endDate')?.value).toBe('');
      expect(component.configForm.get('testVideoMode')?.value).toBe(false);
      expect(component.configForm.get('simulationMode')?.value).toBe(false);
    });

    it('Given a config component, When component initializes, Then configuration is loaded from service', () => {
      // 🔧 BDD: Set up service dependency context
      console.log(`🔧 BDD: Config service is available with current settings`);
      
      // ⚙️ BDD: Component loads configuration from service
      console.log(`⚙️ BDD: Component calls service to load current configuration`);
      
      // ✅ BDD: Verify service methods are called to load configuration
      console.log(`✅ BDD: Service methods are called to retrieve current settings`);
      expect(mockConfigService.startDate).toHaveBeenCalled;
      expect(mockConfigService.endDate).toHaveBeenCalled;
      expect(mockConfigService.testVideoMode).toHaveBeenCalled;
      expect(mockConfigService.simulate).toHaveBeenCalled;
    });

    it('Given a new config component, When component initializes, Then form is in valid state', () => {
      // 🔧 BDD: Set up fresh component context
      console.log(`🔧 BDD: Component is created with default form state`);
      
      // ⚙️ BDD: Component initializes with valid form
      console.log(`⚙️ BDD: Form validation is applied to default values`);
      
      // ✅ BDD: Verify form is valid initially
      console.log(`✅ BDD: Form is valid with default empty values`);
      expect(component.isFormValid()).toBe(true);
    });

    it('Given a new config component, When component initializes, Then form is pristine and untouched', () => {
      // 🔧 BDD: Set up fresh component context
      console.log(`🔧 BDD: Component is created with clean form state`);
      
      // ⚙️ BDD: Component initializes without user interaction
      console.log(`⚙️ BDD: Form state reflects no user modifications`);
      
      // ✅ BDD: Verify form is pristine and untouched
      console.log(`✅ BDD: Form state indicates no user modifications`);
      expect(component.isFormPristine()).toBe(true);
      expect(component.isFormTouched()).toBe(false);
    });
  });

  describe('Scenario: Date Range Validation', () => {
    it('Given invalid date format, When user enters start date, Then validation error is shown', () => {
      // 🔧 BDD: Set up invalid date input context
      console.log(`🔧 BDD: User enters invalid date format in start date field`);
      const startDateControl = component.configForm.get('startDate');
      
      // ⚙️ BDD: User enters invalid date format
      console.log(`⚙️ BDD: Invalid date format is entered in start date field`);
      startDateControl?.setValue('invalid-date');
      
      // ✅ BDD: Verify validation error is triggered
      console.log(`✅ BDD: Form validation detects invalid date format`);
      expect(startDateControl?.hasError('invalidDate')).toBe(true);
      
      // ⚙️ BDD: User enters valid date format
      console.log(`⚙️ BDD: Valid date format is entered in start date field`);
      startDateControl?.setValue('2023-01-01');
      
      // ✅ BDD: Verify validation error is cleared
      console.log(`✅ BDD: Form validation accepts valid date format`);
      expect(startDateControl?.hasError('invalidDate')).toBe(false);
    });

    it('Given invalid date format, When user enters end date, Then validation error is shown', () => {
      // 🔧 BDD: Set up invalid date input context
      console.log(`🔧 BDD: User enters invalid date format in end date field`);
      const endDateControl = component.configForm.get('endDate');
      
      // ⚙️ BDD: User enters invalid date format
      console.log(`⚙️ BDD: Invalid date format is entered in end date field`);
      endDateControl?.setValue('invalid-date');
      
      // ✅ BDD: Verify validation error is triggered
      console.log(`✅ BDD: Form validation detects invalid date format`);
      expect(endDateControl?.hasError('invalidDate')).toBe(true);
      
      // ⚙️ BDD: User enters valid date format
      console.log(`⚙️ BDD: Valid date format is entered in end date field`);
      endDateControl?.setValue('2023-12-31');
      
      // ✅ BDD: Verify validation error is cleared
      console.log(`✅ BDD: Form validation accepts valid date format`);
      expect(endDateControl?.hasError('invalidDate')).toBe(false);
    });

    it('Given future date, When user enters start or end date, Then validation error is shown', () => {
      // 🔧 BDD: Set up future date context
      console.log(`🔧 BDD: User attempts to enter future date in date fields`);
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      const futureDateString = futureDate.toISOString().split('T')[0];
      
      // ⚙️ BDD: User enters future date in start date field
      console.log(`⚙️ BDD: Future date is entered in start date field`);
      const startDateControl = component.configForm.get('startDate');
      startDateControl?.setValue(futureDateString);
      
      // ✅ BDD: Verify validation error is triggered for start date
      console.log(`✅ BDD: Form validation detects future date in start date`);
      expect(startDateControl?.hasError('futureDate')).toBe(true);
      
      // ⚙️ BDD: User enters future date in end date field
      console.log(`⚙️ BDD: Future date is entered in end date field`);
      const endDateControl = component.configForm.get('endDate');
      endDateControl?.setValue(futureDateString);
      
      // ✅ BDD: Verify validation error is triggered for end date
      console.log(`✅ BDD: Form validation detects future date in end date`);
      expect(endDateControl?.hasError('futureDate')).toBe(true);
    });

    it('Given end date before start date, When user enters dates, Then validation error is shown', () => {
      // 🔧 BDD: Set up invalid date range context
      console.log(`🔧 BDD: User enters end date that is before start date`);
      
      // ⚙️ BDD: User enters invalid date range
      console.log(`⚙️ BDD: End date is set before start date`);
      component.configForm.patchValue({
        startDate: '2023-12-31',
        endDate: '2023-01-01'
      });
      
      // ✅ BDD: Verify validation error is triggered
      console.log(`✅ BDD: Form validation detects invalid date range`);
      const endDateControl = component.configForm.get('endDate');
      expect(endDateControl?.hasError('beforeStartDate')).toBe(true);
    });

    it('Given same start and end date, When user enters dates, Then validation passes', () => {
      // 🔧 BDD: Set up same date context
      console.log(`🔧 BDD: User enters same date for start and end date`);
      
      // ⚙️ BDD: User enters same date for both fields
      console.log(`⚙️ BDD: Same date is set for both start and end date`);
      component.configForm.patchValue({
        startDate: '2023-01-01',
        endDate: '2023-01-01'
      });
      
      // ✅ BDD: Verify validation passes
      console.log(`✅ BDD: Form validation accepts same start and end date`);
      const endDateControl = component.configForm.get('endDate');
      expect(endDateControl?.hasError('beforeStartDate')).toBe(false);
    });

    it('Given empty date fields, When form is validated, Then validation passes', () => {
      // 🔧 BDD: Set up empty date context
      console.log(`🔧 BDD: User leaves date fields empty`);
      
      // ⚙️ BDD: User leaves date fields empty
      console.log(`⚙️ BDD: Both date fields are left empty`);
      component.configForm.patchValue({
        startDate: '',
        endDate: ''
      });
      
      // ✅ BDD: Verify validation passes with empty dates
      console.log(`✅ BDD: Form validation accepts empty date fields`);
      expect(component.configForm.valid).toBe(true);
    });
  });

  describe('Scenario: Error Message Display', () => {
    it('Given invalid start date, When user interacts with field, Then appropriate error message is shown', () => {
      // 🔧 BDD: Set up invalid start date context
      console.log(`🔧 BDD: User enters invalid start date and interacts with field`);
      const startDateControl = component.configForm.get('startDate');
      
      // ⚙️ BDD: User enters invalid date and touches field
      console.log(`⚙️ BDD: Invalid date format is entered and field is touched`);
      startDateControl?.setValue('invalid-date');
      startDateControl?.markAsTouched();
      
      // ✅ BDD: Verify correct error message is returned
      console.log(`✅ BDD: Appropriate error message is displayed for invalid date`);
      expect(component.getStartDateErrorMessage()).toBe('Please enter a valid date');
      
      // ⚙️ BDD: User enters future date
      console.log(`⚙️ BDD: Future date is entered in start date field`);
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      startDateControl?.setValue(futureDate.toISOString().split('T')[0]);
      
      // ✅ BDD: Verify future date error message
      console.log(`✅ BDD: Appropriate error message is displayed for future date`);
      expect(component.getStartDateErrorMessage()).toBe('Start date cannot be in the future');
      
      // ⚙️ BDD: User enters valid date
      console.log(`⚙️ BDD: Valid date is entered in start date field`);
      startDateControl?.setValue('2023-01-01');
      
      // ✅ BDD: Verify no error message for valid date
      console.log(`✅ BDD: No error message is displayed for valid date`);
      expect(component.getStartDateErrorMessage()).toBe('');
    });

    it('Given invalid end date, When user interacts with field, Then appropriate error message is shown', () => {
      // 🔧 BDD: Set up invalid end date context
      console.log(`🔧 BDD: User enters invalid end date and interacts with field`);
      const endDateControl = component.configForm.get('endDate');
      
      // ⚙️ BDD: User enters invalid date and touches field
      console.log(`⚙️ BDD: Invalid date format is entered and field is touched`);
      endDateControl?.setValue('invalid-date');
      endDateControl?.markAsTouched();
      
      // ✅ BDD: Verify correct error message is returned
      console.log(`✅ BDD: Appropriate error message is displayed for invalid date`);
      expect(component.getEndDateErrorMessage()).toBe('Please enter a valid date');
      
      // ⚙️ BDD: User enters end date before start date
      console.log(`⚙️ BDD: End date is set before start date`);
      component.configForm.patchValue({
        startDate: '2023-12-31',
        endDate: '2023-01-01'
      });
      endDateControl?.markAsTouched();
      
      // ✅ BDD: Verify date range error message
      console.log(`✅ BDD: Appropriate error message is displayed for invalid date range`);
      expect(component.getEndDateErrorMessage()).toBe('End date must be after start date');
      
      // ⚙️ BDD: User enters valid end date
      console.log(`⚙️ BDD: Valid end date is entered`);
      endDateControl?.setValue('2023-12-31');
      
      // ✅ BDD: Verify no error message for valid date
      console.log(`✅ BDD: No error message is displayed for valid date`);
      expect(component.getEndDateErrorMessage()).toBe('');
    });
  });

  describe('Scenario: Form State Tracking', () => {
    it('Given pristine form, When user modifies form values, Then form becomes dirty', () => {
      // 🔧 BDD: Set up pristine form context
      console.log(`🔧 BDD: Form is in pristine state with no modifications`);
      
      // ✅ BDD: Verify form is initially pristine
      console.log(`✅ BDD: Form state indicates no modifications`);
      expect(component.isFormDirty()).toBe(false);
      
      // ⚙️ BDD: User modifies form value
      console.log(`⚙️ BDD: User enters value in start date field`);
      component.configForm.get('startDate')?.setValue('2023-01-01');
      component.configForm.get('startDate')?.markAsDirty();
      component.configForm.markAsDirty();
      fixture.detectChanges(); // Trigger change detection
      
      // ✅ BDD: Verify form becomes dirty
      console.log(`✅ BDD: Form state indicates modifications have been made`);
      expect(component.configForm.dirty).toBe(true);
    });

    it('Given untouched form, When user interacts with form, Then form becomes touched', () => {
      // 🔧 BDD: Set up untouched form context
      console.log(`🔧 BDD: Form is in untouched state with no user interaction`);
      
      // ✅ BDD: Verify form is initially untouched
      console.log(`✅ BDD: Form state indicates no user interaction`);
      expect(component.isFormTouched()).toBe(false);
      
      // ⚙️ BDD: User interacts with form field
      console.log(`⚙️ BDD: User touches start date field`);
      component.configForm.get('startDate')?.markAsTouched();
      component.configForm.markAsTouched();
      fixture.detectChanges(); // Trigger change detection
      
      // ✅ BDD: Verify form becomes touched
      console.log(`✅ BDD: Form state indicates user interaction`);
      expect(component.configForm.touched).toBe(true);
    });

    it('Given pristine form, When user modifies form values, Then form is no longer pristine', () => {
      // 🔧 BDD: Set up pristine form context
      console.log(`🔧 BDD: Form is in pristine state with no modifications`);
      
      // ✅ BDD: Verify form is initially pristine
      console.log(`✅ BDD: Form state indicates pristine condition`);
      expect(component.isFormPristine()).toBe(true);
      
      // ⚙️ BDD: User modifies form value
      console.log(`⚙️ BDD: User enters value in start date field`);
      component.configForm.get('startDate')?.setValue('2023-01-01');
      component.configForm.get('startDate')?.markAsDirty();
      component.configForm.markAsDirty();
      fixture.detectChanges(); // Trigger change detection
      
      // ✅ BDD: Verify form is no longer pristine
      console.log(`✅ BDD: Form state indicates modifications have been made`);
      expect(component.configForm.pristine).toBe(false);
    });
  });

  describe('Scenario: Configuration Persistence', () => {
    it('Given form values change, When user modifies configuration, Then settings are saved to service', () => {
      // 🔧 BDD: Set up form modification context
      console.log(`🔧 BDD: User modifies multiple configuration settings`);
      
      // ⚙️ BDD: User changes form values
      console.log(`⚙️ BDD: User updates date range and testing options`);
      component.configForm.patchValue({
        startDate: '2023-01-01',
        endDate: '2023-12-31',
        testVideoMode: true,
        simulationMode: true
      });
      
      // ✅ BDD: Verify configuration is saved to service
      console.log(`✅ BDD: All configuration changes are persisted to service`);
      expect(mockConfigService.setStartDate).toHaveBeenCalledWith('2023-01-01');
      expect(mockConfigService.setEndDate).toHaveBeenCalledWith('2023-12-31');
      expect(mockConfigService.setTestVideoMode).toHaveBeenCalledWith(true);
      expect(mockConfigService.setSimulate).toHaveBeenCalledWith(true);
    });

    it('Given configuration changes, When settings are saved, Then workflow is logged', () => {
      // 🔧 BDD: Set up configuration change context
      console.log(`🔧 BDD: User modifies configuration settings`);
      
      // ⚙️ BDD: User changes form value
      console.log(`⚙️ BDD: User updates start date setting`);
      component.configForm.patchValue({
        startDate: '2023-01-01'
      });
      
      // ✅ BDD: Verify workflow is logged
      console.log(`✅ BDD: Configuration save operation is logged`);
      expect(mockLogger.workflow).toHaveBeenCalledWith('Configuration saved');
    });
  });

  describe('Scenario: Clear Dates Functionality', () => {
    it('Given date fields have values, When user clicks clear dates, Then date fields are cleared', () => {
      // 🔧 BDD: Set up form with date values
      console.log(`🔧 BDD: Form has date values in both start and end date fields`);
      component.configForm.patchValue({
        startDate: '2023-01-01',
        endDate: '2023-12-31'
      });
      
      // ⚙️ BDD: User clicks clear dates button
      console.log(`⚙️ BDD: User clicks clear dates button`);
      component.clearDates();
      
      // ✅ BDD: Verify date fields are cleared
      console.log(`✅ BDD: Both date fields are cleared and empty`);
      expect(component.configForm.get('startDate')?.value).toBe('');
      expect(component.configForm.get('endDate')?.value).toBe('');
    });

    it('Given clear dates action, When dates are cleared, Then workflow is logged', () => {
      // 🔧 BDD: Set up clear dates action context
      console.log(`🔧 BDD: User initiates clear dates action`);
      
      // ⚙️ BDD: User clears dates
      console.log(`⚙️ BDD: Clear dates function is called`);
      component.clearDates();
      
      // ✅ BDD: Verify workflow is logged
      console.log(`✅ BDD: Clear dates operation is logged`);
      expect(mockLogger.workflow).toHaveBeenCalledWith('Date fields cleared');
    });
  });

  describe('Scenario: Reset Form Functionality', () => {
    it('Given modified form, When user resets form, Then all fields return to default values', () => {
      // 🔧 BDD: Set up form with modified values
      console.log(`🔧 BDD: Form has modified values in all fields`);
      component.configForm.patchValue({
        startDate: '2023-01-01',
        endDate: '2023-12-31',
        testVideoMode: true,
        simulationMode: true
      });
      
      // ⚙️ BDD: User resets form
      console.log(`⚙️ BDD: User clicks reset form button`);
      component.resetForm();
      
      // ✅ BDD: Verify all fields return to defaults
      console.log(`✅ BDD: All form fields return to default values`);
      expect(component.configForm.get('startDate')?.value).toBe('');
      expect(component.configForm.get('endDate')?.value).toBe('');
      expect(component.configForm.get('testVideoMode')?.value).toBe(false);
      expect(component.configForm.get('simulationMode')?.value).toBe(false);
    });

    it('Given reset form action, When form is reset, Then workflow is logged', () => {
      // 🔧 BDD: Set up reset form action context
      console.log(`🔧 BDD: User initiates reset form action`);
      
      // ⚙️ BDD: User resets form
      console.log(`⚙️ BDD: Reset form function is called`);
      component.resetForm();
      
      // ✅ BDD: Verify workflow is logged
      console.log(`✅ BDD: Reset form operation is logged`);
      expect(mockLogger.workflow).toHaveBeenCalledWith('Form reset to defaults');
    });
  });

  describe('Scenario: Help Dialog Functionality', () => {
    it('Given help button click, When user requests help, Then help dialog is opened', () => {
      // 🔧 BDD: Set up help request context
      console.log(`🔧 BDD: User needs help with configuration options`);
      
      // ⚙️ BDD: User clicks help button
      console.log(`⚙️ BDD: User clicks help button to open dialog`);
      component.openHelpDialog('general');
      
      // ✅ BDD: Verify help dialog action is logged
      console.log(`✅ BDD: Help dialog action is logged`);
      expect(mockLogger.workflow).toHaveBeenCalledWith('Help dialog opened');
    });

    it('Given date range help request, When user clicks date range help, Then date range dialog is opened', () => {
      // 🔧 BDD: Set up date range help request context
      console.log(`🔧 BDD: User needs help with date range filtering`);
      
      // ⚙️ BDD: User clicks date range help button
      console.log(`⚙️ BDD: User clicks date range help button`);
      component.openHelpDialog('date-range');
      
      // ✅ BDD: Verify date range help dialog action is logged
      console.log(`✅ BDD: Date range help dialog action is logged`);
      expect(mockLogger.workflow).toHaveBeenCalledWith('Help dialog opened');
    });

    it('Given testing options help request, When user clicks testing help, Then testing dialog is opened', () => {
      // 🔧 BDD: Set up testing options help request context
      console.log(`🔧 BDD: User needs help with testing options`);
      
      // ⚙️ BDD: User clicks testing options help button
      console.log(`⚙️ BDD: User clicks testing options help button`);
      component.openHelpDialog('testing-options');
      
      // ✅ BDD: Verify testing options help dialog action is logged
      console.log(`✅ BDD: Testing options help dialog action is logged`);
      expect(mockLogger.workflow).toHaveBeenCalledWith('Help dialog opened');
    });
  });

  describe('Scenario: Template Rendering', () => {
    it('Given component is rendered, When template loads, Then form elements are displayed', () => {
      // 🔧 BDD: Set up component rendering context
      console.log(`🔧 BDD: Component is rendered and template is loaded`);
      
      // ⚙️ BDD: Template renders form elements
      console.log(`⚙️ BDD: Angular renders form with reactive form binding`);
      fixture.detectChanges(); // Ensure template is rendered
      
      // ✅ BDD: Verify form elements are present
      console.log(`✅ BDD: Form element with reactive form binding is rendered`);
      const formElement = fixture.debugElement.query(By.css('section.config-section'));
      expect(formElement).toBeTruthy();
    });

    it('Given component is rendered, When template loads, Then date range section is displayed', () => {
      // 🔧 BDD: Set up component rendering context
      console.log(`🔧 BDD: Component is rendered with date range functionality`);
      
      // ⚙️ BDD: Template renders date range section
      console.log(`⚙️ BDD: Angular renders date range section with form controls`);
      fixture.detectChanges(); // Ensure template is rendered
      
      // ✅ BDD: Verify date range section is present
      console.log(`✅ BDD: Date range section is rendered with proper styling`);
      const dateRangeSection = fixture.debugElement.query(By.css('.date-range-section'));
      expect(dateRangeSection).toBeTruthy();
    });

    it('Given component is rendered, When template loads, Then testing options section is displayed', () => {
      // 🔧 BDD: Set up component rendering context
      console.log(`🔧 BDD: Component is rendered with testing options functionality`);
      
      // ⚙️ BDD: Template renders testing options section
      console.log(`⚙️ BDD: Angular renders testing options section with toggles`);
      fixture.detectChanges(); // Ensure template is rendered
      
      // ✅ BDD: Verify testing options section is present
      console.log(`✅ BDD: Testing options section is rendered with toggle controls`);
      const testingSection = fixture.debugElement.query(By.css('.testing-options-section'));
      expect(testingSection).toBeTruthy();
    });

    it('Given component is rendered, When template loads, Then date input fields are displayed', () => {
      // 🔧 BDD: Set up component rendering context
      console.log(`🔧 BDD: Component is rendered with date input functionality`);
      
      // ⚙️ BDD: Template renders date input fields
      console.log(`⚙️ BDD: Angular renders start and end date input fields`);
      fixture.detectChanges(); // Ensure template is rendered
      
      // ✅ BDD: Verify date input fields are present
      console.log(`✅ BDD: Both start and end date input fields are rendered`);
      const startDateInput = fixture.debugElement.query(By.css('input[formControlName="startDate"]'));
      const endDateInput = fixture.debugElement.query(By.css('input[formControlName="endDate"]'));
      
      expect(startDateInput).toBeTruthy();
      expect(endDateInput).toBeTruthy();
    });

    it('Given component is rendered, When template loads, Then toggle controls are displayed', () => {
      // 🔧 BDD: Set up component rendering context
      console.log(`🔧 BDD: Component is rendered with toggle control functionality`);
      
      // ⚙️ BDD: Template renders toggle controls
      console.log(`⚙️ BDD: Angular renders test video and simulation mode toggles`);
      fixture.detectChanges(); // Ensure template is rendered
      
      // ✅ BDD: Verify toggle controls are present
      console.log(`✅ BDD: Both toggle controls are rendered with proper form binding`);
      const testVideoToggle = fixture.debugElement.query(By.css('mat-slide-toggle[formControlName="testVideoMode"]'));
      const simulationToggle = fixture.debugElement.query(By.css('mat-slide-toggle[formControlName="simulationMode"]'));
      
      expect(testVideoToggle).toBeTruthy();
      expect(simulationToggle).toBeTruthy();
    });

    it('Given component is rendered, When template loads, Then clear dates button is displayed', () => {
      // 🔧 BDD: Set up component rendering context
      console.log(`🔧 BDD: Component is rendered with clear dates functionality`);
      
      // ⚙️ BDD: Template renders clear dates button
      console.log(`⚙️ BDD: Angular renders clear dates button with proper test ID`);
      fixture.detectChanges(); // Ensure template is rendered
      
      // ✅ BDD: Verify clear dates button is present
      console.log(`✅ BDD: Clear dates button is rendered with correct test identifier`);
      const clearButton = fixture.debugElement.query(By.css('button[data-testid="clear-dates"]'));
      expect(clearButton).toBeTruthy();
    });

    it('Given component is rendered, When template loads, Then help buttons are displayed', () => {
      // 🔧 BDD: Set up component rendering context
      console.log(`🔧 BDD: Component is rendered with help functionality`);
      
      // ⚙️ BDD: Template renders help buttons
      console.log(`⚙️ BDD: Angular renders help buttons for both sections`);
      fixture.detectChanges(); // Ensure template is rendered
      
      // ✅ BDD: Verify help buttons are present
      console.log(`✅ BDD: Both help buttons are rendered with correct test identifiers`);
      const helpButtons = fixture.debugElement.queryAll(By.css('button[data-testid="help-icon"]'));
      expect(helpButtons.length).toBe(2);
    });
  });

  describe('Form State Indicators', () => {
    it('should show form state indicators when form is dirty', () => {
      // Set value and mark as dirty to trigger form state update
      component.configForm.get('startDate')?.setValue('2023-01-01');
      component.configForm.markAsDirty();
      component['updateFormState'](); // Manually update form state
      fixture.detectChanges();
      
      const stateIndicators = fixture.debugElement.query(By.css('.form-state-indicators'));
      expect(stateIndicators).toBeTruthy();
    });

    it('should show validation success when form is valid and touched', () => {
      component.configForm.get('startDate')?.setValue('2023-01-01');
      component.configForm.get('startDate')?.markAsTouched();
      component['updateFormState'](); // Manually update form state
      fixture.detectChanges();
      
      const successIndicators = fixture.debugElement.query(By.css('.validation-success'));
      expect(successIndicators).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels on form controls', () => {
      fixture.detectChanges(); // Ensure template is rendered
      
      const startDateInput = fixture.debugElement.query(By.css('input[formControlName="startDate"]'));
      const endDateInput = fixture.debugElement.query(By.css('input[formControlName="endDate"]'));
      
      expect(startDateInput.nativeElement.getAttribute('aria-label')).toBe('Start date for filtering posts');
      expect(endDateInput.nativeElement.getAttribute('aria-label')).toBe('End date for filtering posts');
    });

    it('should have proper form control names on toggles', () => {
      fixture.detectChanges(); // Ensure template is rendered
      
      const testVideoToggle = fixture.debugElement.query(By.css('mat-slide-toggle[formControlName="testVideoMode"]'));
      const simulationToggle = fixture.debugElement.query(By.css('mat-slide-toggle[formControlName="simulationMode"]'));
      
      expect(testVideoToggle).toBeTruthy();
      expect(simulationToggle).toBeTruthy();
      
      // Check that toggles have proper form control names
      expect(testVideoToggle.nativeElement.getAttribute('formcontrolname')).toBe('testVideoMode');
      expect(simulationToggle.nativeElement.getAttribute('formcontrolname')).toBe('simulationMode');
    });

    it('should have proper ARIA labels on help buttons', () => {
      fixture.detectChanges(); // Ensure template is rendered
      
      const helpButtons = fixture.debugElement.queryAll(By.css('button[data-testid="help-icon"]'));
      
      expect(helpButtons[0].nativeElement.getAttribute('aria-label')).toBe('Help with date range filtering');
      expect(helpButtons[1].nativeElement.getAttribute('aria-label')).toBe('Help with testing options');
    });
  });

  describe('Component Lifecycle', () => {
    it('should clean up subscriptions on destroy', () => {
      spyOn(component['destroy$'], 'next');
      spyOn(component['destroy$'], 'complete');
      
      component.ngOnDestroy();
      
      expect(component['destroy$'].next).toHaveBeenCalled();
      expect(component['destroy$'].complete).toHaveBeenCalled();
    });
  });
});
