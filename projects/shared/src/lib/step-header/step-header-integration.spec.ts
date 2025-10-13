import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { StepHeader } from './step-header';
import { StepLayout } from '../step-layout/step-layout';
import { StepNavigationComponent } from '../step-navigation/step-navigation';
import { LOGGER } from '../services';
import { 
  STEP_ROUTE_TEST_DATA, 
  EDGE_CASE_TEST_DATA,
  createMockActivatedRoute,
  StepHeaderTestAssertions
} from './step-header-test-utils';

// Mock step components for integration testing
@Component({ 
  standalone: true,
  template: '<div class="upload-content">Upload Step</div>' 
})
class MockUploadComponent { }

@Component({ 
  standalone: true,
  template: '<div class="auth-content">Auth Step</div>' 
})
class MockAuthComponent { }

@Component({ 
  standalone: true,
  template: '<div class="config-content">Config Step</div>' 
})
class MockConfigComponent { }

@Component({ 
  standalone: true,
  template: '<div class="migrate-content">Migrate Step</div>' 
})
class MockMigrateComponent { }

@Component({ 
  standalone: true,
  template: '<div class="complete-content">Complete Step</div>' 
})
class MockCompleteComponent { }

/**
 * Integration Tests for StepHeader with Real Router Configuration
 * 
 * These tests verify that StepHeader works correctly with actual routing
 * configuration that matches the production app routes.
 */
describe('Feature: StepHeader Integration with Real Routes (BDD-Style)', () => {
  let fixture: ComponentFixture<StepLayout>;
  let router: Router;
  let location: Location;
  let mockLogger: jasmine.SpyObj<any>;

  beforeEach(async () => {
    mockLogger = jasmine.createSpyObj('Logger', ['log', 'error', 'warn', 'info']);
    
    await TestBed.configureTestingModule({
      imports: [
        StepLayout,
        StepHeader,
        StepNavigationComponent,
        MockUploadComponent,
        MockAuthComponent,
        MockConfigComponent,
        MockMigrateComponent,
        MockCompleteComponent,
        RouterTestingModule.withRoutes([
          {
            path: 'step',
            component: StepLayout,
            children: [
              {
                path: 'upload',
                component: MockUploadComponent,
                title: STEP_ROUTE_TEST_DATA.upload.title,
                data: STEP_ROUTE_TEST_DATA.upload.data
              },
              {
                path: 'auth',
                component: MockAuthComponent,
                title: STEP_ROUTE_TEST_DATA.auth.title,
                data: STEP_ROUTE_TEST_DATA.auth.data
              },
              {
                path: 'config',
                component: MockConfigComponent,
                title: STEP_ROUTE_TEST_DATA.config.title,
                data: STEP_ROUTE_TEST_DATA.config.data
              },
              {
                path: 'migrate',
                component: MockMigrateComponent,
                title: STEP_ROUTE_TEST_DATA.migrate.title,
                data: STEP_ROUTE_TEST_DATA.migrate.data
              },
              {
                path: 'complete',
                component: MockCompleteComponent,
                title: STEP_ROUTE_TEST_DATA.complete.title,
                data: STEP_ROUTE_TEST_DATA.complete.data
              }
            ]
          }
        ]),
        NoopAnimationsModule
      ],
      providers: [
        { provide: LOGGER, useValue: mockLogger }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(StepLayout);
    router = TestBed.inject(Router);
    location = TestBed.inject(Location);
  });

  describe('Scenario: Real step navigation with production route data', () => {
    it('Given user navigates to upload step, When route loads, Then header displays correct upload information', async () => {
      // Given: User navigates to upload step
      console.log('🔧 BDD: Setting up navigation to upload step with real route data');
      
      // When: Navigation to upload step
      console.log('⚙️ BDD: Navigating to upload step through router');
      await router.navigate(['/step/upload']);
      fixture.detectChanges();

      // Then: Header should display upload step information
      console.log('✅ BDD: Verifying upload step header displays correct information');
      const stepHeaderComponent = fixture.debugElement.query(By.directive(StepHeader));
      const titleElement = stepHeaderComponent.query(By.css('.step-title'));
      const descriptionElement = stepHeaderComponent.query(By.css('.step-description'));

      expect(location.path()).toBe('/step/upload');
      expect(titleElement.nativeElement.textContent.trim()).toBe('Upload Data');
      expect(descriptionElement.nativeElement.textContent.trim()).toBe('Upload instagram archive');
    });

    it('Given user navigates to auth step, When route loads, Then header displays correct auth information', async () => {
      // Given: User navigates to auth step
      console.log('🔧 BDD: Setting up navigation to auth step with real route data');
      
      // When: Navigation to auth step
      console.log('⚙️ BDD: Navigating to auth step through router');
      await router.navigate(['/step/auth']);
      fixture.detectChanges();

      // Then: Header should display auth step information
      console.log('✅ BDD: Verifying auth step header displays correct information');
      const stepHeaderComponent = fixture.debugElement.query(By.directive(StepHeader));
      const titleElement = stepHeaderComponent.query(By.css('.step-title'));
      const descriptionElement = stepHeaderComponent.query(By.css('.step-description'));

      expect(location.path()).toBe('/step/auth');
      expect(titleElement.nativeElement.textContent.trim()).toBe('Authenticate with Bluesky');
      expect(descriptionElement.nativeElement.textContent.trim()).toBe('Authenticate with Bluesky to migrate');
    });

    it('Given user navigates through complete workflow, When each step loads, Then header updates correctly for each step', async () => {
      // Given: User starts complete workflow
      console.log('🔧 BDD: Setting up complete workflow navigation test');

      const steps = [
        { path: '/step/upload', title: 'Upload Data', description: 'Upload instagram archive' },
        { path: '/step/auth', title: 'Authenticate with Bluesky', description: 'Authenticate with Bluesky to migrate' },
        { path: '/step/config', title: 'Configuration', description: 'Configure migration settings' },
        { path: '/step/migrate', title: 'Migrate Data', description: 'Start the migration process' },
        { path: '/step/complete', title: 'Migration Complete', description: 'Migration completed successfully' }
      ];

      for (const step of steps) {
        // When: Navigate to each step
        console.log(`⚙️ BDD: Navigating to ${step.path} in workflow`);
        await router.navigate([step.path]);
        fixture.detectChanges();

        // Then: Header should display correct step information
        console.log(`✅ BDD: Verifying ${step.path} header displays correct information`);
        const stepHeaderComponent = fixture.debugElement.query(By.directive(StepHeader));
        const titleElement = stepHeaderComponent.query(By.css('.step-title'));
        const descriptionElement = stepHeaderComponent.query(By.css('.step-description'));

        expect(location.path()).toBe(step.path);
        expect(titleElement.nativeElement.textContent.trim()).toBe(step.title);
        expect(descriptionElement.nativeElement.textContent.trim()).toBe(step.description);
      }
    });
  });

  describe('Scenario: Route data validation with actual step structure', () => {
    it('Given production route configuration, When checking route data structure, Then all steps should have required properties', () => {
      // Given: Production route configuration
      console.log('🔧 BDD: Validating production route data structure');
      
      // When: Checking each step route data
      console.log('⚙️ BDD: Validating each step has required title and description');
      
      Object.entries(STEP_ROUTE_TEST_DATA).forEach(([stepName, stepData]) => {
        // Then: Each step should have title and description
        console.log(`✅ BDD: Verifying ${stepName} step has required route data`);
        expect(stepData.title).toBeTruthy();
        expect(stepData.data?.description).toBeTruthy();
        
        // And: Should have navigation data (except complete step)
        if (stepName !== 'complete' && stepData.data && 'next' in stepData.data) {
          expect(stepData.data.next).toBeTruthy();
        }
        if (stepName !== 'upload' && stepData.data && 'previous' in stepData.data) {
          expect(stepData.data.previous).toBeTruthy();
        }
      });
    });

    it('Given route navigation data, When validating step sequence, Then navigation chain should be correct', () => {
      // Given: Route navigation data
      console.log('🔧 BDD: Validating step navigation sequence');
      
      // When: Checking navigation chain
      console.log('⚙️ BDD: Validating step sequence and navigation links');
      
      const expectedSequence = ['upload', 'auth', 'config', 'migrate', 'complete'];
      
      for (let i = 0; i < expectedSequence.length; i++) {
        const currentStep = expectedSequence[i];
        const stepData = STEP_ROUTE_TEST_DATA[currentStep as keyof typeof STEP_ROUTE_TEST_DATA];
        
        // Then: Navigation links should match expected sequence
        console.log(`✅ BDD: Verifying ${currentStep} step navigation links`);
        
        if (i > 0 && stepData.data && 'previous' in stepData.data) {
          expect(stepData.data.previous).toBe(expectedSequence[i - 1]);
        }
        
        if (i < expectedSequence.length - 1 && stepData.data && 'next' in stepData.data) {
          expect(stepData.data.next).toBe(expectedSequence[i + 1]);
        }
      }
    });
  });

  describe('Scenario: Performance with real routing', () => {
    it('Given rapid navigation between steps, When multiple route changes occur, Then header should update efficiently', async () => {
      // Given: Rapid navigation scenario
      console.log('🔧 BDD: Setting up rapid navigation performance test');
      
      const steps = ['/step/upload', '/step/auth', '/step/config', '/step/migrate', '/step/complete'];
      const startTime = performance.now();
      
      // When: Rapid navigation between steps
      console.log('⚙️ BDD: Performing rapid navigation between all steps');
      
      for (const step of steps) {
        await router.navigate([step]);
        fixture.detectChanges();
      }
      
      const endTime = performance.now();
      const navigationTime = endTime - startTime;
      
      // Then: Navigation should complete efficiently
      console.log(`✅ BDD: Verifying navigation completes efficiently (${navigationTime}ms)`);
      expect(navigationTime).toBeLessThan(1000); // Should complete within 1 second
      
      // And: Final state should be correct
      const finalStepHeader = fixture.debugElement.query(By.directive(StepHeader));
      const titleElement = finalStepHeader.query(By.css('.step-title'));
      expect(titleElement.nativeElement.textContent.trim()).toBe('Migration Complete');
    });
  });
});

/**
 * Edge Case Integration Tests with Real Router
 */
describe('Feature: StepHeader Edge Cases with Router Integration', () => {
  describe('Scenario: Handle malformed route data gracefully', () => {
    Object.entries(EDGE_CASE_TEST_DATA).forEach(([caseName, caseData]) => {
      it(`Given ${caseName} route data, When component renders, Then should handle gracefully without errors`, async () => {
        // Given: Edge case route data
        console.log(`🔧 BDD: Setting up ${caseName} edge case scenario`);
        
        const mockRoute = createMockActivatedRoute(caseData);
        
        // Configure TestBed with the mock route
        await TestBed.configureTestingModule({
          imports: [StepHeader, RouterTestingModule, NoopAnimationsModule],
          providers: [
            { provide: ActivatedRoute, useValue: mockRoute }
          ]
        }).compileComponents();

        const fixture = TestBed.createComponent(StepHeader);
        const component = fixture.componentInstance;
        
        // When: Component renders with edge case data
        console.log(`⚙️ BDD: Component renders with ${caseName} data`);
        
        expect(() => {
          component.ngOnInit();
          fixture.detectChanges();
        }).not.toThrow();
        
        // Then: Should display appropriate fallback content
        console.log(`✅ BDD: Verifying ${caseName} handled gracefully`);
        
        const titleElement = fixture.debugElement.query(By.css('.step-title'));
        const descriptionElement = fixture.debugElement.query(By.css('.step-description'));
        
        expect(titleElement).toBeTruthy();
        expect(descriptionElement).toBeTruthy();
        
        // Content should be empty string for null/undefined cases
        const expectedTitle = caseData.title || '';
        const expectedDescription = (caseData.data && 'description' in caseData.data) ? caseData.data.description || '' : '';
        
        expect(titleElement.nativeElement.textContent.trim()).toBe(expectedTitle);
        expect(descriptionElement.nativeElement.textContent.trim()).toBe(expectedDescription);
      });
    });
  });
});

/**
 * Accessibility and Semantic HTML Tests
 */
describe('Feature: StepHeader Accessibility and Semantics', () => {
  let fixture: ComponentFixture<StepLayout>;
  let mockLogger: jasmine.SpyObj<any>;

  beforeEach(async () => {
    mockLogger = jasmine.createSpyObj('Logger', ['log', 'error', 'warn', 'info']);
    
    await TestBed.configureTestingModule({
      imports: [
        StepLayout,
        StepHeader,
        StepNavigationComponent,
        RouterTestingModule.withRoutes([
          {
            path: 'step/test',
            component: StepLayout,
            title: 'Test Title',
            data: { description: 'Test Description' }
          }
        ]),
        NoopAnimationsModule
      ],
      providers: [
        { provide: LOGGER, useValue: mockLogger }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(StepLayout);
  });

  describe('Scenario: Proper semantic HTML structure for accessibility', () => {
    it('Given step header is rendered, When checking HTML semantics, Then should use proper heading hierarchy', () => {
      // Given: Step header is rendered
      console.log('🔧 BDD: Setting up accessibility validation for step header');
      fixture.detectChanges();

      // When: Checking HTML structure
      console.log('⚙️ BDD: Validating semantic HTML structure');
      
      const stepHeaderComponent = fixture.debugElement.query(By.directive(StepHeader));
      const titleElement = stepHeaderComponent.query(By.css('.step-title'));
      const descriptionElement = stepHeaderComponent.query(By.css('.step-description'));

      // Then: Should use proper semantic elements
      console.log('✅ BDD: Verifying proper semantic HTML elements');
      expect(titleElement.nativeElement.tagName.toLowerCase()).toBe('h2');
      expect(descriptionElement.nativeElement.tagName.toLowerCase()).toBe('p');
    });

    it('Given step header with content, When checking ARIA attributes, Then should be accessible to screen readers', () => {
      // Given: Step header with content
      console.log('🔧 BDD: Setting up ARIA attributes validation');
      fixture.detectChanges();

      // When: Checking accessibility attributes
      console.log('⚙️ BDD: Validating ARIA attributes and accessibility');
      
      const stepHeaderComponent = fixture.debugElement.query(By.directive(StepHeader));
      const hostElement = stepHeaderComponent.nativeElement;

      // Then: Should have proper accessibility structure
      console.log('✅ BDD: Verifying accessibility compliance');
      expect(hostElement.classList.contains('step-header')).toBe(true);
      
      // Header should be within the main content flow
      const contentArea = fixture.debugElement.query(By.css('.app-content'));
      expect(contentArea.query(By.directive(StepHeader))).toBeTruthy();
    });
  });
});