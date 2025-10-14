import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { Component } from '@angular/core';
import { Subject } from 'rxjs';

import { StepLayout } from './step-layout';
import { StepHeader } from '../step-header/step-header';
import { StepNavigationComponent } from '../step-navigation/step-navigation';
import { LOGGER, Logger, ConfigServiceImpl, SplashScreenLoading } from '../';

// Mock components for testing
@Component({
  standalone: true,
  selector: 'mock-step-component',
  template: '<div class="mock-step-content">Mock Step Content</div>'
})
class MockStepComponent { }

/**
 * BDD-Style Integration Tests for StepLayout with StepHeader
 * 
 * Tests the integration between StepLayout and StepHeader components
 * to ensure proper step navigation workflow and header display.
 */
describe('Feature: Step Layout Integration with Header (BDD-Style)', () => {
  let component: StepLayout;
  let fixture: ComponentFixture<StepLayout>;
  let mockActivatedRoute: jasmine.SpyObj<ActivatedRoute>;
  let mockRouter: jasmine.SpyObj<Router>;
  let routerEventsSubject: Subject<any>;

  beforeEach(async () => {
    routerEventsSubject = new Subject();
    
    const activatedRouteSpy = jasmine.createSpyObj('ActivatedRoute', [], {
      snapshot: {
        title: 'Test Layout Title',
        data: { description: 'Test Layout Description' }
      },
      firstChild: {
        snapshot: {
          title: 'Test Layout Title',
          data: { description: 'Test Layout Description' }
        }
      }
    });

    const routerSpy = jasmine.createSpyObj('Router', ['navigate'], {
      events: routerEventsSubject.asObservable()
    });

    const mockLogger = jasmine.createSpyObj('Logger', ['log', 'error', 'workflow']);
    const mockConfigService = jasmine.createSpyObj('ConfigServiceImpl', ['getConfig']);
    const mockLoading = jasmine.createSpyObj('SplashScreenLoading', ['setComponent'], {
      isLoading: new Subject()
    });

    await TestBed.configureTestingModule({
      imports: [
        StepLayout, 
        StepHeader, 
        StepNavigationComponent,
        MockStepComponent,
        RouterTestingModule.withRoutes([
          { path: 'test', component: MockStepComponent }
        ]),
        NoopAnimationsModule
      ],
      providers: [
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
        { provide: Router, useValue: routerSpy },
        { provide: LOGGER, useValue: mockLogger },
        { provide: ConfigServiceImpl, useValue: mockConfigService },
        { provide: SplashScreenLoading, useValue: mockLoading }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(StepLayout);
    component = fixture.componentInstance;
    mockActivatedRoute = TestBed.inject(ActivatedRoute) as jasmine.SpyObj<ActivatedRoute>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  // Helper function to update route data
  const updateRouteData = (title: string | null, description: string | null) => {
    Object.defineProperty(mockActivatedRoute, 'snapshot', {
      value: {
        title,
        data: description ? { description } : null
      },
      writable: true
    });
    Object.defineProperty(mockActivatedRoute, 'firstChild', {
      value: {
        snapshot: {
          title,
          data: description ? { description } : null
        }
      },
      writable: true
    });
  };

  describe('Scenario: Step layout displays header and navigation components', () => {
    it('Given step layout loads, When initialized, Then should display header, content area, and navigation', () => {
      // Given: Step layout is being loaded
      console.log('🔧 BDD: Setting up step layout with all components');
      updateRouteData('Upload Data', 'Upload instagram archive');

      // When: Layout initializes
      console.log('⚙️ BDD: Step layout initializes with header and navigation');
      fixture.detectChanges();

      // Then: Should display all layout components
      console.log('✅ BDD: Verifying all layout components are present');
      const headerComponent = fixture.debugElement.query(By.directive(StepHeader));
      const contentArea = fixture.debugElement.query(By.css('.app-content'));
      const routerOutlet = fixture.debugElement.query(By.css('router-outlet'));
      const navigationComponent = fixture.debugElement.query(By.directive(StepNavigationComponent));
      const footer = fixture.debugElement.query(By.css('footer'));

      expect(headerComponent).toBeTruthy();
      expect(contentArea).toBeTruthy();
      expect(routerOutlet).toBeTruthy();
      expect(navigationComponent).toBeTruthy();
      expect(footer).toBeTruthy();
    });

    it('Given step layout with proper structure, When checking component hierarchy, Then header should be above router outlet', () => {
      // Given: Step layout with proper component hierarchy
      console.log('🔧 BDD: Setting up step layout for hierarchy verification');
      
      // When: Layout renders with components
      console.log('⚙️ BDD: Step layout renders with component hierarchy');
      fixture.detectChanges();

      // Then: Header should be positioned above router outlet
      console.log('✅ BDD: Verifying component hierarchy and positioning');
      const contentArea = fixture.debugElement.query(By.css('.app-content'));
      const headerComponent = contentArea.query(By.directive(StepHeader));
      const routerOutlet = contentArea.query(By.css('router-outlet'));

      expect(headerComponent).toBeTruthy();
      expect(routerOutlet).toBeTruthy();
      
      // Verify header comes before router outlet in DOM order
      const contentChildren = contentArea.nativeElement.children;
      const headerIndex = Array.from(contentChildren).findIndex((child: unknown) => 
        (child as HTMLElement).tagName.toLowerCase() === 'shared-step-header'
      );
      const outletIndex = Array.from(contentChildren).findIndex((child: unknown) => 
        (child as HTMLElement).tagName.toLowerCase() === 'router-outlet'
      );
      
      expect(headerIndex).toBeLessThan(outletIndex);
    });
  });

  describe('Scenario: Header content updates with step navigation', () => {
    it('Given user navigates to auth step, When navigation completes, Then header should display auth step information', () => {
      // Given: User is navigating to auth step
      console.log('🔧 BDD: Setting up navigation to auth step in layout');
      updateRouteData('Authenticate with Bluesky', 'Authenticate with Bluesky to migrate');

      fixture.detectChanges();

      // When: Navigation to auth step completes
      console.log('⚙️ BDD: Navigation completes and updates layout header');
      routerEventsSubject.next(new NavigationEnd(1, '/step/auth', '/step/auth'));
      fixture.detectChanges();

      // Then: Header should display auth step information
      console.log('✅ BDD: Verifying auth step information in layout header');
      const headerComponent = fixture.debugElement.query(By.directive(StepHeader));
      const titleElement = headerComponent.query(By.css('.step-title'));
      const descriptionElement = headerComponent.query(By.css('.step-description'));
      
      expect(titleElement.nativeElement.textContent.trim()).toBe('Authenticate with Bluesky');
      expect(descriptionElement.nativeElement.textContent.trim()).toBe('Authenticate with Bluesky to migrate');
    });

    it('Given user navigates through multiple steps, When each navigation occurs, Then header should update accordingly', () => {
      // Given: User starts at upload step
      console.log('🔧 BDD: Setting up multi-step navigation in layout');
      updateRouteData('Upload Data', 'Upload instagram archive');

      fixture.detectChanges();

      // When: User navigates to auth step
      console.log('⚙️ BDD: User navigates to auth step through layout');
      updateRouteData('Authenticate with Bluesky', 'Authenticate with Bluesky to migrate');
      routerEventsSubject.next(new NavigationEnd(1, '/step/auth', '/step/auth'));
      fixture.detectChanges();

      // Then: Header should show auth step
      console.log('✅ BDD: Verifying auth step content in layout');
      let headerComponent = fixture.debugElement.query(By.directive(StepHeader));
      let titleElement = headerComponent.query(By.css('.step-title'));
      let descriptionElement = headerComponent.query(By.css('.step-description'));
      expect(titleElement.nativeElement.textContent.trim()).toBe('Authenticate with Bluesky');
      expect(descriptionElement.nativeElement.textContent.trim()).toBe('Authenticate with Bluesky to migrate');

      // When: User navigates to config step
      console.log('⚙️ BDD: User navigates to config step through layout');
      updateRouteData('Configuration', 'Configure migration settings');
      routerEventsSubject.next(new NavigationEnd(2, '/step/config', '/step/config'));
      fixture.detectChanges();

      // Then: Header should show config step
      console.log('✅ BDD: Verifying config step content in layout');
      headerComponent = fixture.debugElement.query(By.directive(StepHeader));
      titleElement = headerComponent.query(By.css('.step-title'));
      descriptionElement = headerComponent.query(By.css('.step-description'));
      expect(titleElement.nativeElement.textContent.trim()).toBe('Configuration');
      expect(descriptionElement.nativeElement.textContent.trim()).toBe('Configure migration settings');
    });
  });

  describe('Scenario: Layout handles missing step data gracefully', () => {
    it('Given step route has no title or description, When layout loads, Then should display gracefully with empty header', () => {
      // Given: Step route with missing data
      console.log('🔧 BDD: Setting up step route with missing title and description');
      updateRouteData(null, null);

      // When: Layout loads with missing data
      console.log('⚙️ BDD: Layout loads with missing route data');
      fixture.detectChanges();

      // Then: Should display gracefully without errors
      console.log('✅ BDD: Verifying layout handles missing data gracefully');
      const headerComponent = fixture.debugElement.query(By.directive(StepHeader));
      const titleElement = headerComponent.query(By.css('.step-title'));
      const descriptionElement = headerComponent.query(By.css('.step-description'));
      const navigationComponent = fixture.debugElement.query(By.directive(StepNavigationComponent));

      expect(headerComponent).toBeTruthy();
      expect(titleElement.nativeElement.textContent.trim()).toBe('');
      expect(descriptionElement.nativeElement.textContent.trim()).toBe('');
      expect(navigationComponent).toBeTruthy();
    });

    it('Given step route has partial data, When layout loads, Then should display available data correctly', () => {
      // Given: Step route with only title, no description
      console.log('🔧 BDD: Setting up step route with partial data');
      updateRouteData('Migration Complete', null);

      // When: Layout loads with partial data
      console.log('⚙️ BDD: Layout loads with partial route data');
      fixture.detectChanges();

      // Then: Should display available data correctly
      console.log('✅ BDD: Verifying layout displays partial data correctly');
      const headerComponent = fixture.debugElement.query(By.directive(StepHeader));
      const titleElement = headerComponent.query(By.css('.step-title'));
      const descriptionElement = headerComponent.query(By.css('.step-description'));

      expect(titleElement.nativeElement.textContent.trim()).toBe('Migration Complete');
      expect(descriptionElement.nativeElement.textContent.trim()).toBe('');
    });
  });

  describe('Scenario: Layout CSS and styling integration', () => {
    it('Given layout components are rendered, When checking styling, Then should have proper CSS classes and host attributes', () => {
      // Given: Layout is fully rendered
      console.log('🔧 BDD: Setting up layout for CSS inspection');
      
      // When: Checking component styling and classes
      console.log('⚙️ BDD: Inspecting layout CSS classes and structure');
      fixture.detectChanges();

      // Then: Should have proper CSS classes
      console.log('✅ BDD: Verifying layout CSS classes and host attributes');
      const hostElement = fixture.debugElement.nativeElement;
      const contentArea = fixture.debugElement.query(By.css('.app-content'));
      const footer = fixture.debugElement.query(By.css('footer'));

      expect(hostElement.classList.contains('step-layout')).toBe(true);
      expect(contentArea).toBeTruthy();
      expect(footer).toBeTruthy();
    });

    it('Given header and navigation are present, When checking component integration, Then should have consistent styling', () => {
      // Given: All layout components are present
      console.log('🔧 BDD: Setting up full component integration check');
      updateRouteData('Migrate Data', 'Start the migration process');

      // When: Checking component integration styling
      console.log('⚙️ BDD: Checking component integration and consistency');
      fixture.detectChanges();

      // Then: Should have consistent component styling
      console.log('✅ BDD: Verifying consistent component integration styling');
      const headerComponent = fixture.debugElement.query(By.directive(StepHeader));
      const navigationComponent = fixture.debugElement.query(By.directive(StepNavigationComponent));

      expect(headerComponent.nativeElement.classList.contains('step-header')).toBe(true);
      expect(navigationComponent).toBeTruthy();
      
      // Verify components are properly contained within layout structure
      const contentArea = fixture.debugElement.query(By.css('.app-content'));
      const footer = fixture.debugElement.query(By.css('footer'));
      
      expect(contentArea.query(By.directive(StepHeader))).toBeTruthy();
      expect(footer.query(By.directive(StepNavigationComponent))).toBeTruthy();
    });
  });

  describe('Scenario: Router outlet integration within layout', () => {
    it('Given layout with router outlet, When step component loads, Then should display within layout structure', () => {
      // Given: Layout with router outlet ready for step components
      console.log('🔧 BDD: Setting up layout with router outlet for step components');
      updateRouteData('Upload Data', 'Upload instagram archive');

      // When: Step component loads through router outlet
      console.log('⚙️ BDD: Step component loads through layout router outlet');
      fixture.detectChanges();

      // Then: Should maintain layout structure with step content
      console.log('✅ BDD: Verifying step content displays within layout structure');
      const contentArea = fixture.debugElement.query(By.css('.app-content'));
      const headerComponent = contentArea.query(By.directive(StepHeader));
      const routerOutlet = contentArea.query(By.css('router-outlet'));
      const navigationComponent = fixture.debugElement.query(By.directive(StepNavigationComponent));

      expect(contentArea).toBeTruthy();
      expect(headerComponent).toBeTruthy();
      expect(routerOutlet).toBeTruthy();
      expect(navigationComponent).toBeTruthy();
      
      // Verify the layout maintains its structure
      expect(contentArea.nativeElement.children.length).toBeGreaterThanOrEqual(2); // header + router-outlet
    });
  });
});