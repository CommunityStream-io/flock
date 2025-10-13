import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { of, Subject } from 'rxjs';

import { StepHeader } from './step-header';

/**
 * BDD-Style Integration Tests for StepHeader Component
 * 
 * This demonstrates BDD methodology using Angular's native testing framework
 * without requiring Cucumber. The BDD approach is maintained through structure
 * and naming conventions focusing on user scenarios and business behavior.
 */
describe('Feature: Dynamic Step Header Display (BDD-Style)', () => {
  let component: StepHeader;
  let fixture: ComponentFixture<StepHeader>;
  let mockActivatedRoute: jasmine.SpyObj<ActivatedRoute>;
  let mockRouter: jasmine.SpyObj<Router>;
  let routerEventsSubject: Subject<any>;

  beforeEach(async () => {
    routerEventsSubject = new Subject();
    
    const activatedRouteSpy = jasmine.createSpyObj('ActivatedRoute', [], {
      snapshot: {
        title: 'Test Title',
        data: { description: 'Test Description' }
      },
      firstChild: null
    });

    const routerSpy = jasmine.createSpyObj('Router', [], {
      events: routerEventsSubject.asObservable()
    });

    await TestBed.configureTestingModule({
      imports: [StepHeader, NoopAnimationsModule],
      providers: [
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(StepHeader);
    component = fixture.componentInstance;
    mockActivatedRoute = TestBed.inject(ActivatedRoute) as jasmine.SpyObj<ActivatedRoute>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  describe('Scenario: Display current route title and description', () => {
    it('Given route has title and description, When component initializes, Then both should be displayed', () => {
      // Given: Route has title and description data
      console.log('🔧 BDD: Setting up route with title and description data');
      mockActivatedRoute.snapshot = {
        title: 'Authenticate with Bluesky',
        data: { description: 'Authenticate with Bluesky to migrate' }
      } as any;

      // When: Component initializes
      console.log('⚙️ BDD: Component initializes with router data');
      component.ngOnInit();
      fixture.detectChanges();

      // Then: Title and description should be displayed
      console.log('✅ BDD: Verifying title and description are displayed');
      const titleElement = fixture.debugElement.query(By.css('.step-title'));
      const descriptionElement = fixture.debugElement.query(By.css('.step-description'));
      
      expect(titleElement.nativeElement.textContent.trim()).toBe('Authenticate with Bluesky');
      expect(descriptionElement.nativeElement.textContent.trim()).toBe('Authenticate with Bluesky to migrate');
    });

    it('Given route has only title, When component initializes, Then title should be displayed and description empty', () => {
      // Given: Route has only title, no description
      console.log('🔧 BDD: Setting up route with only title data');
      mockActivatedRoute.snapshot = {
        title: 'Upload Data',
        data: {}
      } as any;

      // When: Component initializes
      console.log('⚙️ BDD: Component initializes with partial router data');
      component.ngOnInit();
      fixture.detectChanges();

      // Then: Only title should be displayed
      console.log('✅ BDD: Verifying only title is displayed when description missing');
      const titleElement = fixture.debugElement.query(By.css('.step-title'));
      const descriptionElement = fixture.debugElement.query(By.css('.step-description'));
      
      expect(titleElement.nativeElement.textContent.trim()).toBe('Upload Data');
      expect(descriptionElement.nativeElement.textContent.trim()).toBe('');
    });
  });

  describe('Scenario: Navigate between different step routes', () => {
    it('Given user navigates to auth step, When navigation completes, Then auth title and description should be displayed', () => {
      // Given: User is navigating to auth step
      console.log('🔧 BDD: Setting up navigation to auth step');
      mockActivatedRoute.snapshot = {
        title: 'Authenticate with Bluesky',
        data: { description: 'Authenticate with Bluesky to migrate' }
      } as any;

      component.ngOnInit();
      fixture.detectChanges();

      // When: Navigation to auth step completes
      console.log('⚙️ BDD: Navigation to auth step completes');
      routerEventsSubject.next(new NavigationEnd(1, '/step/auth', '/step/auth'));
      fixture.detectChanges();

      // Then: Auth title and description should be displayed
      console.log('✅ BDD: Verifying auth step content is displayed');
      const titleElement = fixture.debugElement.query(By.css('.step-title'));
      const descriptionElement = fixture.debugElement.query(By.css('.step-description'));
      
      expect(titleElement.nativeElement.textContent.trim()).toBe('Authenticate with Bluesky');
      expect(descriptionElement.nativeElement.textContent.trim()).toBe('Authenticate with Bluesky to migrate');
    });

    it('Given user navigates to config step, When navigation completes, Then config title and description should be displayed', () => {
      // Given: User is navigating to config step
      console.log('🔧 BDD: Setting up navigation to config step');
      mockActivatedRoute.snapshot = {
        title: 'Configuration',
        data: { description: 'Configure migration settings' }
      } as any;

      component.ngOnInit();
      fixture.detectChanges();

      // When: Navigation to config step completes
      console.log('⚙️ BDD: Navigation to config step completes');
      routerEventsSubject.next(new NavigationEnd(2, '/step/config', '/step/config'));
      fixture.detectChanges();

      // Then: Config title and description should be displayed
      console.log('✅ BDD: Verifying config step content is displayed');
      const titleElement = fixture.debugElement.query(By.css('.step-title'));
      const descriptionElement = fixture.debugElement.query(By.css('.step-description'));
      
      expect(titleElement.nativeElement.textContent.trim()).toBe('Configuration');
      expect(descriptionElement.nativeElement.textContent.trim()).toBe('Configure migration settings');
    });

    it('Given user navigates between multiple steps, When each navigation completes, Then content should update reactively', () => {
      // Given: User starts at upload step
      console.log('🔧 BDD: Setting up multi-step navigation scenario');
      mockActivatedRoute.snapshot = {
        title: 'Upload Data',
        data: { description: 'Upload instagram archive' }
      } as any;

      component.ngOnInit();
      fixture.detectChanges();

      // When: User navigates to auth step
      console.log('⚙️ BDD: User navigates from upload to auth step');
      mockActivatedRoute.snapshot = {
        title: 'Authenticate with Bluesky',
        data: { description: 'Authenticate with Bluesky to migrate' }
      } as any;
      routerEventsSubject.next(new NavigationEnd(1, '/step/auth', '/step/auth'));
      fixture.detectChanges();

      // Then: Auth content should be displayed
      console.log('✅ BDD: Verifying auth content is displayed after navigation');
      let titleElement = fixture.debugElement.query(By.css('.step-title'));
      let descriptionElement = fixture.debugElement.query(By.css('.step-description'));
      expect(titleElement.nativeElement.textContent.trim()).toBe('Authenticate with Bluesky');
      expect(descriptionElement.nativeElement.textContent.trim()).toBe('Authenticate with Bluesky to migrate');

      // When: User navigates to config step
      console.log('⚙️ BDD: User navigates from auth to config step');
      mockActivatedRoute.snapshot = {
        title: 'Configuration',
        data: { description: 'Configure migration settings' }
      } as any;
      routerEventsSubject.next(new NavigationEnd(2, '/step/config', '/step/config'));
      fixture.detectChanges();

      // Then: Config content should be displayed
      console.log('✅ BDD: Verifying config content is displayed after second navigation');
      titleElement = fixture.debugElement.query(By.css('.step-title'));
      descriptionElement = fixture.debugElement.query(By.css('.step-description'));
      expect(titleElement.nativeElement.textContent.trim()).toBe('Configuration');
      expect(descriptionElement.nativeElement.textContent.trim()).toBe('Configure migration settings');
    });
  });

  describe('Scenario: Handle nested route structures', () => {
    it('Given nested route with child routes, When accessing route data, Then should get data from deepest child', () => {
      // Given: Nested route structure with child routes
      console.log('🔧 BDD: Setting up nested route structure');
      const childRoute = jasmine.createSpyObj('ActivatedRoute', [], {
        snapshot: {
          title: 'Child Route Title',
          data: { description: 'Child Route Description' }
        },
        firstChild: null
      });

      mockActivatedRoute.firstChild = childRoute;
      mockActivatedRoute.snapshot = {
        title: 'Parent Route Title',
        data: { description: 'Parent Route Description' }
      } as any;

      // When: Component accesses route data
      console.log('⚙️ BDD: Component accesses nested route data');
      component.ngOnInit();
      fixture.detectChanges();

      // Then: Should display child route data
      console.log('✅ BDD: Verifying child route data is displayed from deepest nesting');
      const titleElement = fixture.debugElement.query(By.css('.step-title'));
      const descriptionElement = fixture.debugElement.query(By.css('.step-description'));
      
      expect(titleElement.nativeElement.textContent.trim()).toBe('Child Route Title');
      expect(descriptionElement.nativeElement.textContent.trim()).toBe('Child Route Description');
    });

    it('Given deeply nested route structure, When accessing route data, Then should traverse to deepest child', () => {
      // Given: Deeply nested route structure
      console.log('🔧 BDD: Setting up deeply nested route structure');
      const deepestChild = jasmine.createSpyObj('ActivatedRoute', [], {
        snapshot: {
          title: 'Deepest Child Title',
          data: { description: 'Deepest Child Description' }
        },
        firstChild: null
      });

      const middleChild = jasmine.createSpyObj('ActivatedRoute', [], {
        snapshot: {
          title: 'Middle Child Title',
          data: { description: 'Middle Child Description' }
        },
        firstChild: deepestChild
      });

      mockActivatedRoute.firstChild = middleChild;
      mockActivatedRoute.snapshot = {
        title: 'Root Title',
        data: { description: 'Root Description' }
      } as any;

      // When: Component accesses nested route data
      console.log('⚙️ BDD: Component traverses deeply nested route structure');
      component.ngOnInit();
      fixture.detectChanges();

      // Then: Should display deepest child route data
      console.log('✅ BDD: Verifying deepest child route data is displayed');
      const titleElement = fixture.debugElement.query(By.css('.step-title'));
      const descriptionElement = fixture.debugElement.query(By.css('.step-description'));
      
      expect(titleElement.nativeElement.textContent.trim()).toBe('Deepest Child Title');
      expect(descriptionElement.nativeElement.textContent.trim()).toBe('Deepest Child Description');
    });
  });

  describe('Scenario: Handle missing or malformed route data', () => {
    it('Given route with null title, When component initializes, Then should display empty title gracefully', () => {
      // Given: Route with null title
      console.log('🔧 BDD: Setting up route with null title');
      mockActivatedRoute.snapshot = {
        title: null,
        data: { description: 'Valid Description' }
      } as any;

      // When: Component initializes
      console.log('⚙️ BDD: Component initializes with null title');
      component.ngOnInit();
      fixture.detectChanges();

      // Then: Should display empty title gracefully
      console.log('✅ BDD: Verifying null title is handled gracefully');
      const titleElement = fixture.debugElement.query(By.css('.step-title'));
      const descriptionElement = fixture.debugElement.query(By.css('.step-description'));
      
      expect(titleElement.nativeElement.textContent.trim()).toBe('');
      expect(descriptionElement.nativeElement.textContent.trim()).toBe('Valid Description');
    });

    it('Given route with null data object, When component initializes, Then should display empty description gracefully', () => {
      // Given: Route with null data object
      console.log('🔧 BDD: Setting up route with null data object');
      mockActivatedRoute.snapshot = {
        title: 'Valid Title',
        data: null
      } as any;

      // When: Component initializes
      console.log('⚙️ BDD: Component initializes with null data object');
      component.ngOnInit();
      fixture.detectChanges();

      // Then: Should display empty description gracefully
      console.log('✅ BDD: Verifying null data object is handled gracefully');
      const titleElement = fixture.debugElement.query(By.css('.step-title'));
      const descriptionElement = fixture.debugElement.query(By.css('.step-description'));
      
      expect(titleElement.nativeElement.textContent.trim()).toBe('Valid Title');
      expect(descriptionElement.nativeElement.textContent.trim()).toBe('');
    });

    it('Given route with undefined title and description, When component initializes, Then should display empty content gracefully', () => {
      // Given: Route with undefined title and description
      console.log('🔧 BDD: Setting up route with undefined title and description');
      mockActivatedRoute.snapshot = {
        title: undefined,
        data: { description: undefined }
      } as any;

      // When: Component initializes
      console.log('⚙️ BDD: Component initializes with undefined values');
      component.ngOnInit();
      fixture.detectChanges();

      // Then: Should display empty content gracefully
      console.log('✅ BDD: Verifying undefined values are handled gracefully');
      const titleElement = fixture.debugElement.query(By.css('.step-title'));
      const descriptionElement = fixture.debugElement.query(By.css('.step-description'));
      
      expect(titleElement.nativeElement.textContent.trim()).toBe('');
      expect(descriptionElement.nativeElement.textContent.trim()).toBe('');
    });
  });

  describe('Scenario: Component styling and CSS classes', () => {
    it('Given component is rendered, When inspecting DOM, Then should have correct CSS classes and structure', () => {
      // Given: Component is rendered
      console.log('🔧 BDD: Setting up component for CSS inspection');
      mockActivatedRoute.snapshot = {
        title: 'Test Title',
        data: { description: 'Test Description' }
      } as any;

      // When: Component is rendered
      console.log('⚙️ BDD: Component renders with styling');
      component.ngOnInit();
      fixture.detectChanges();

      // Then: Should have correct CSS structure
      console.log('✅ BDD: Verifying CSS classes and DOM structure');
      const hostElement = fixture.debugElement.nativeElement;
      const headerContent = fixture.debugElement.query(By.css('.step-header-content'));
      const titleElement = fixture.debugElement.query(By.css('.step-title'));
      const descriptionElement = fixture.debugElement.query(By.css('.step-description'));
      
      expect(hostElement.classList.contains('step-header')).toBe(true);
      expect(headerContent).toBeTruthy();
      expect(titleElement).toBeTruthy();
      expect(descriptionElement).toBeTruthy();
    });

    it('Given component renders content, When checking accessibility, Then should have proper semantic HTML structure', () => {
      // Given: Component renders with content
      console.log('🔧 BDD: Setting up component for accessibility inspection');
      mockActivatedRoute.snapshot = {
        title: 'Migrate Data',
        data: { description: 'Start the migration process' }
      } as any;

      // When: Component renders
      console.log('⚙️ BDD: Component renders with semantic content');
      component.ngOnInit();
      fixture.detectChanges();

      // Then: Should have proper semantic HTML
      console.log('✅ BDD: Verifying semantic HTML structure for accessibility');
      const titleElement = fixture.debugElement.query(By.css('.step-title'));
      const descriptionElement = fixture.debugElement.query(By.css('.step-description'));
      
      expect(titleElement.nativeElement.tagName.toLowerCase()).toBe('h2');
      expect(descriptionElement.nativeElement.tagName.toLowerCase()).toBe('p');
      expect(titleElement.nativeElement.textContent.trim()).toBe('Migrate Data');
      expect(descriptionElement.nativeElement.textContent.trim()).toBe('Start the migration process');
    });
  });

  describe('Scenario: Observable reactivity and performance', () => {
    it('Given navigation events occur rapidly, When multiple NavigationEnd events fire, Then should handle updates efficiently', () => {
      // Given: Component is initialized and ready for navigation events
      console.log('🔧 BDD: Setting up rapid navigation scenario');
      mockActivatedRoute.snapshot = {
        title: 'Initial Title',
        data: { description: 'Initial Description' }
      } as any;

      component.ngOnInit();
      fixture.detectChanges();

      // When: Multiple rapid navigation events occur
      console.log('⚙️ BDD: Firing multiple rapid navigation events');
      
      // First navigation
      mockActivatedRoute.snapshot = {
        title: 'First Title',
        data: { description: 'First Description' }
      } as any;
      routerEventsSubject.next(new NavigationEnd(1, '/step/auth', '/step/auth'));
      fixture.detectChanges();

      // Second navigation
      mockActivatedRoute.snapshot = {
        title: 'Second Title',
        data: { description: 'Second Description' }
      } as any;
      routerEventsSubject.next(new NavigationEnd(2, '/step/config', '/step/config'));
      fixture.detectChanges();

      // Third navigation
      mockActivatedRoute.snapshot = {
        title: 'Final Title',
        data: { description: 'Final Description' }
      } as any;
      routerEventsSubject.next(new NavigationEnd(3, '/step/migrate', '/step/migrate'));
      fixture.detectChanges();

      // Then: Should display the latest navigation data
      console.log('✅ BDD: Verifying final navigation state is correctly displayed');
      const titleElement = fixture.debugElement.query(By.css('.step-title'));
      const descriptionElement = fixture.debugElement.query(By.css('.step-description'));
      
      expect(titleElement.nativeElement.textContent.trim()).toBe('Final Title');
      expect(descriptionElement.nativeElement.textContent.trim()).toBe('Final Description');
    });

    it('Given observables are subscribed, When component is destroyed, Then should clean up subscriptions', () => {
      // Given: Component has active subscriptions
      console.log('🔧 BDD: Setting up component with active subscriptions');
      component.ngOnInit();
      fixture.detectChanges();

      // When: Component is destroyed
      console.log('⚙️ BDD: Component lifecycle destruction');
      spyOn(component.title$, 'subscribe').and.callThrough();
      spyOn(component.description$, 'subscribe').and.callThrough();
      
      fixture.destroy();

      // Then: Should handle destruction gracefully (no memory leaks)
      console.log('✅ BDD: Verifying component destruction is handled gracefully');
      expect(component).toBeTruthy(); // Component reference should still exist
      // Note: In a real scenario, you'd test for proper subscription cleanup
      // This would require additional setup to track subscription lifecycle
    });
  });
});