import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router, ActivatedRoute } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { StepNavigationComponent } from './step-navigation';
import { LOGGER, Logger, ConfigServiceImpl, SplashScreenLoading } from '../services';
import { Subject, of } from 'rxjs';
import { ActivationEnd, ActivatedRouteSnapshot } from '@angular/router';

describe('Feature: Migration Step Navigation', () => {
  let component: StepNavigationComponent;
  let fixture: ComponentFixture<StepNavigationComponent>;
  let mockLogger: jasmine.SpyObj<Logger>;
  let mockConfigService: jasmine.SpyObj<ConfigServiceImpl>;
  let mockSplashScreenLoading: jasmine.SpyObj<SplashScreenLoading>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: jasmine.SpyObj<ActivatedRoute>;
  let routerEventsSubject: Subject<any>;

  beforeEach(async () => {
    mockLogger = jasmine.createSpyObj('Logger', ['log', 'error', 'warn', 'workflow', 'instrument']);
    mockConfigService = jasmine.createSpyObj('ConfigServiceImpl', ['getConfig']);
    mockSplashScreenLoading = jasmine.createSpyObj('SplashScreenLoading', ['show', 'hide'], {
      isLoading: new Subject<boolean>()
    });

    // Create router events subject to control router events
    routerEventsSubject = new Subject<any>();
    mockRouter = jasmine.createSpyObj('Router', ['navigate'], {
      events: routerEventsSubject.asObservable()
    });
    
    // Create mock ActivatedRoute
    mockActivatedRoute = jasmine.createSpyObj('ActivatedRoute', [], {
      snapshot: {} as ActivatedRouteSnapshot,
      url: of([]),
      params: of({}),
      queryParams: of({}),
      fragment: of(null),
      data: of({})
    });

    await TestBed.configureTestingModule({
      imports: [
        StepNavigationComponent
      ],
      providers: [
        { provide: LOGGER, useValue: mockLogger },
        { provide: ConfigServiceImpl, useValue: mockConfigService },
        { provide: SplashScreenLoading, useValue: mockSplashScreenLoading },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        provideNoopAnimations()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(StepNavigationComponent);
    component = fixture.componentInstance;
  });

  describe('Feature: Router Event Filtering and Signal Computation (BDD-Style)', () => {
    describe('Scenario: Router event filtering', () => {
      it('Given ActivationEnd event, When router events emit, Then event is filtered and processed', () => {
        // Given: ActivationEnd event with route data
        console.log('🔧 BDD: Setting up ActivationEnd event with route data');
        const mockSnapshot = {
          firstChild: {
            data: { next: '/step/upload', previous: '/step/config', description: 'Upload step' }
          }
        } as unknown as ActivatedRouteSnapshot;

        const activationEndEvent = new ActivationEnd(mockSnapshot);

        // When: Router events emit ActivationEnd
        console.log('⚙️ BDD: Emitting ActivationEnd event');
        routerEventsSubject.next(activationEndEvent);
        fixture.detectChanges();

        // Then: Event is filtered and processed (filter branch executed)
        console.log('✅ BDD: ActivationEnd event filter branch is executed');
        expect(component).toBeTruthy();
        expect(component.next()).toBe('/step/upload');
        expect(component.previous()).toBe('/step/config');
      });

      it('Given non-ActivationEnd event, When router events emit, Then event is filtered out', () => {
        // Given: Non-ActivationEnd event
        console.log('🔧 BDD: Setting up non-ActivationEnd event');
        const nonActivationEvent = { type: 'NavigationStart' };

        // When: Router events emit non-ActivationEnd event
        console.log('⚙️ BDD: Emitting non-ActivationEnd event');
        routerEventsSubject.next(nonActivationEvent);
        fixture.detectChanges();

        // Then: Event is filtered out (filter branch executed)
        console.log('✅ BDD: Non-ActivationEnd event filter branch is executed');
        expect(component).toBeTruthy();
        // Signals should be undefined since no valid events were processed
        expect(component.next()).toBeUndefined();
        expect(component.previous()).toBeUndefined();
      });

      it('Given null event, When router events emit, Then event is filtered out', () => {
        // Given: Null event
        console.log('🔧 BDD: Setting up null event');

        // When: Router events emit null event
        console.log('⚙️ BDD: Emitting null event');
        routerEventsSubject.next(null);
      fixture.detectChanges();

        // Then: Event is filtered out (filter branch executed)
        console.log('✅ BDD: Null event filter branch is executed');
        expect(component).toBeTruthy();
        // Signals should be undefined since no valid events were processed
        expect(component.next()).toBeUndefined();
        expect(component.previous()).toBeUndefined();
      });
    });

    describe('Scenario: Route data mapping and null coalescing', () => {
      it('Given route data with next and previous, When event is processed, Then data is mapped correctly', () => {
        // Given: Route data with next and previous
        console.log('🔧 BDD: Setting up route data with next and previous');
        const mockSnapshot = {
          firstChild: {
            data: { next: '/step/auth', previous: '/step/upload', description: 'Auth step' }
          }
        } as unknown as ActivatedRouteSnapshot;

        const activationEndEvent = new ActivationEnd(mockSnapshot);

        // When: Event is processed
        console.log('⚙️ BDD: Processing event with route data');
        routerEventsSubject.next(activationEndEvent);
        fixture.detectChanges();

        // Then: Data is mapped correctly (map branch executed)
        console.log('✅ BDD: Route data mapping branch is executed');
        expect(component.next()).toBe('/step/auth');
        expect(component.previous()).toBe('/step/upload');
      });

      it('Given route data with null next, When event is processed, Then null coalescing provides empty string', () => {
        // Given: Route data with null next
        console.log('🔧 BDD: Setting up route data with null next');
        const mockSnapshot = {
          firstChild: {
            data: { next: null, previous: '/step/upload', description: 'First step' }
          }
        } as unknown as ActivatedRouteSnapshot;

        const activationEndEvent = new ActivationEnd(mockSnapshot);

        // When: Event is processed
        console.log('⚙️ BDD: Processing event with null next');
        routerEventsSubject.next(activationEndEvent);
        fixture.detectChanges();

        // Then: Null coalescing provides empty string (|| '' branch executed)
        console.log('✅ BDD: Null coalescing branch is executed for next');
        expect(component.next()).toBe('');
        expect(component.previous()).toBe('/step/upload');
      });

      it('Given route data with undefined previous, When event is processed, Then null coalescing provides empty string', () => {
        // Given: Route data with undefined previous
        console.log('🔧 BDD: Setting up route data with undefined previous');
        const mockSnapshot = {
          firstChild: {
            data: { next: '/step/auth', previous: undefined, description: 'Last step' }
          }
        } as unknown as ActivatedRouteSnapshot;

        const activationEndEvent = new ActivationEnd(mockSnapshot);

        // When: Event is processed
        console.log('⚙️ BDD: Processing event with undefined previous');
        routerEventsSubject.next(activationEndEvent);
        fixture.detectChanges();

        // Then: Null coalescing provides empty string (|| '' branch executed)
        console.log('✅ BDD: Null coalescing branch is executed for previous');
        expect(component.next()).toBe('/step/auth');
        expect(component.previous()).toBe('');
      });

      it('Given route data with empty strings, When event is processed, Then empty strings are preserved', () => {
        // Given: Route data with empty strings
        console.log('🔧 BDD: Setting up route data with empty strings');
        const mockSnapshot = {
          firstChild: {
            data: { next: '', previous: '', description: 'Middle step' }
          }
        } as unknown as ActivatedRouteSnapshot;

        const activationEndEvent = new ActivationEnd(mockSnapshot);

        // When: Event is processed
        console.log('⚙️ BDD: Processing event with empty strings');
        routerEventsSubject.next(activationEndEvent);
        fixture.detectChanges();

        // Then: Empty strings are preserved (no null coalescing needed)
        console.log('✅ BDD: Empty string preservation branch is executed');
        expect(component.next()).toBe('');
        expect(component.previous()).toBe('');
      });

      it('Given route data with no firstChild, When event is processed, Then default data is used', () => {
        // Given: Route data with no firstChild
        console.log('🔧 BDD: Setting up route data with no firstChild');
        const mockSnapshot = {
          firstChild: null
        } as unknown as ActivatedRouteSnapshot;

        const activationEndEvent = new ActivationEnd(mockSnapshot);

        // When: Event is processed
        console.log('⚙️ BDD: Processing event with no firstChild');
        routerEventsSubject.next(activationEndEvent);
        fixture.detectChanges();

        // Then: Default data is used (|| { next: '', previous: '', description: '' } branch executed)
        console.log('✅ BDD: Default data fallback branch is executed');
        expect(component.next()).toBe('');
        expect(component.previous()).toBe('');
      });
    });

    describe('Scenario: Loading state signal behavior', () => {
      it('Given loading state is true, When component initializes, Then isLoading signal reflects true', () => {
        // Given: Loading state is true
        console.log('🔧 BDD: Setting up loading state as true');
        (mockSplashScreenLoading.isLoading as Subject<boolean>).next(true);

        // When: Component initializes
        console.log('⚙️ BDD: Component initializes with loading state');
      fixture.detectChanges();

        // Then: isLoading signal reflects true
        console.log('✅ BDD: Loading state true branch is executed');
        expect(component.isLoading()).toBe(true);
      });

      it('Given loading state is false, When component initializes, Then isLoading signal reflects false', () => {
        // Given: Loading state is false
        console.log('🔧 BDD: Setting up loading state as false');
        (mockSplashScreenLoading.isLoading as Subject<boolean>).next(false);

      // When: Component initializes
        console.log('⚙️ BDD: Component initializes with loading state');
        fixture.detectChanges();

        // Then: isLoading signal reflects false
        console.log('✅ BDD: Loading state false branch is executed');
        expect(component.isLoading()).toBe(false);
      });

      it('Given loading state changes, When component is running, Then isLoading signal updates', () => {
        // Given: Loading state changes
        console.log('🔧 BDD: Setting up changing loading state');
        (mockSplashScreenLoading.isLoading as Subject<boolean>).next(true);
        fixture.detectChanges();

        // When: Loading state changes
        console.log('⚙️ BDD: Loading state changes to false');
        (mockSplashScreenLoading.isLoading as Subject<boolean>).next(false);
        fixture.detectChanges();

        // Then: isLoading signal updates
        console.log('✅ BDD: Loading state change branch is executed');
        expect(component.isLoading()).toBe(false);
      });
    });

    describe('Scenario: Template conditional branches', () => {
      it('Given previous route exists and not loading, When template renders, Then previous button is enabled', () => {
        // Given: Previous route exists and not loading
        console.log('🔧 BDD: Setting up previous route exists and not loading');
        const mockSnapshot = {
          firstChild: {
            data: { next: '/step/auth', previous: '/step/upload', description: 'Auth step' }
          }
        } as unknown as ActivatedRouteSnapshot;

        routerEventsSubject.next(new ActivationEnd(mockSnapshot));
        (mockSplashScreenLoading.isLoading as Subject<boolean>).next(false);
        fixture.detectChanges();

        // When: Template renders
        console.log('⚙️ BDD: Template renders with previous route and not loading');

        // Then: Previous button is enabled ([disabled]="!previous() || isLoading()" branch executed)
        console.log('✅ BDD: Previous button enabled branch is executed');
        const previousButton = fixture.nativeElement.querySelector('.previous-step');
        expect(previousButton.disabled).toBe(false);
      });

      it('Given no previous route, When template renders, Then previous button is disabled', () => {
        // Given: No previous route
        console.log('🔧 BDD: Setting up no previous route');
        const mockSnapshot = {
          firstChild: {
            data: { next: '/step/auth', previous: '', description: 'First step' }
          }
        } as unknown as ActivatedRouteSnapshot;

        routerEventsSubject.next(new ActivationEnd(mockSnapshot));
        (mockSplashScreenLoading.isLoading as Subject<boolean>).next(false);
        fixture.detectChanges();

        // When: Template renders
        console.log('⚙️ BDD: Template renders with no previous route');

        // Then: Previous button is disabled ([disabled]="!previous() || isLoading()" branch executed)
        console.log('✅ BDD: Previous button disabled branch is executed');
        const previousButton = fixture.nativeElement.querySelector('.previous-step');
        expect(previousButton.disabled).toBe(true);
      });

      it('Given loading state is true, When template renders, Then both buttons are disabled', () => {
        // Given: Loading state is true
        console.log('🔧 BDD: Setting up loading state is true');
        const mockSnapshot = {
          firstChild: {
            data: { next: '/step/auth', previous: '/step/upload', description: 'Auth step' }
          }
        } as unknown as ActivatedRouteSnapshot;

        routerEventsSubject.next(new ActivationEnd(mockSnapshot));
        (mockSplashScreenLoading.isLoading as Subject<boolean>).next(true);
        fixture.detectChanges();

        // When: Template renders
        console.log('⚙️ BDD: Template renders with loading state true');

        // Then: Both buttons are disabled ([disabled]="!next() || isLoading()" branch executed)
        console.log('✅ BDD: Both buttons disabled due to loading branch is executed');
        const previousButton = fixture.nativeElement.querySelector('.previous-step');
        const nextButton = fixture.nativeElement.querySelector('.next-step');
        expect(previousButton.disabled).toBe(true);
        expect(nextButton.disabled).toBe(true);
      });

      it('Given next route exists and not loading, When template renders, Then next button is enabled', () => {
        // Given: Next route exists and not loading
        console.log('🔧 BDD: Setting up next route exists and not loading');
        const mockSnapshot = {
          firstChild: {
            data: { next: '/step/config', previous: '/step/auth', description: 'Config step' }
          }
        } as unknown as ActivatedRouteSnapshot;

        routerEventsSubject.next(new ActivationEnd(mockSnapshot));
        (mockSplashScreenLoading.isLoading as Subject<boolean>).next(false);
        fixture.detectChanges();

        // When: Template renders
        console.log('⚙️ BDD: Template renders with next route and not loading');

        // Then: Next button is enabled ([disabled]="!next() || isLoading()" branch executed)
        console.log('✅ BDD: Next button enabled branch is executed');
        const nextButton = fixture.nativeElement.querySelector('.next-step');
        expect(nextButton.disabled).toBe(false);
      });

      it('Given no next route, When template renders, Then next button is disabled', () => {
        // Given: No next route
        console.log('🔧 BDD: Setting up no next route');
        const mockSnapshot = {
          firstChild: {
            data: { next: '', previous: '/step/config', description: 'Last step' }
          }
        } as unknown as ActivatedRouteSnapshot;

        routerEventsSubject.next(new ActivationEnd(mockSnapshot));
        (mockSplashScreenLoading.isLoading as Subject<boolean>).next(false);
        fixture.detectChanges();

        // When: Template renders
        console.log('⚙️ BDD: Template renders with no next route');

        // Then: Next button is disabled ([disabled]="!next() || isLoading()" branch executed)
        console.log('✅ BDD: Next button disabled branch is executed');
        const nextButton = fixture.nativeElement.querySelector('.next-step');
        expect(nextButton.disabled).toBe(true);
      });
    });

    describe('Scenario: Logger workflow branches', () => {
      it('Given ActivationEnd event, When router events emit, Then logger workflow is called for current route', () => {
        // Given: ActivationEnd event with route data
        console.log('🔧 BDD: Setting up ActivationEnd event for logger workflow');
        const mockSnapshot = {
          firstChild: {
            data: { next: '/step/upload', previous: '/step/config', description: 'Upload step' }
          }
        } as unknown as ActivatedRouteSnapshot;
        
        const activationEndEvent = new ActivationEnd(mockSnapshot);

        // When: Router events emit ActivationEnd
        console.log('⚙️ BDD: Emitting ActivationEnd event for logger workflow');
        routerEventsSubject.next(activationEndEvent);
        fixture.detectChanges();

        // Then: Logger workflow is called (tap branch executed)
        console.log('✅ BDD: Logger workflow tap branch is executed for current route');
        expect(mockLogger.workflow).toHaveBeenCalledWith('Current route:', activationEndEvent);
        expect(mockLogger.log).toHaveBeenCalledWith('Snapshot:', activationEndEvent.snapshot);
      });

      it('Given route data with next route, When signal computes, Then logger workflow is called for next route', () => {
        // Given: Route data with next route
        console.log('🔧 BDD: Setting up route data with next route for logger workflow');
        const mockSnapshot = {
          firstChild: {
            data: { next: '/step/auth', previous: '/step/upload', description: 'Auth step' }
          }
        } as unknown as ActivatedRouteSnapshot;
        
        const activationEndEvent = new ActivationEnd(mockSnapshot);

        // When: Router events emit and signal computes
        console.log('⚙️ BDD: Processing event for next route logger workflow');
        routerEventsSubject.next(activationEndEvent);
        fixture.detectChanges();

        // Then: Logger workflow is called for next route (tap branch executed)
        console.log('✅ BDD: Logger workflow tap branch is executed for next route');
        expect(mockLogger.workflow).toHaveBeenCalledWith('Next route:', '/step/auth');
      });

      it('Given route data with previous route, When signal computes, Then logger workflow is called for previous route', () => {
        // Given: Route data with previous route
        console.log('🔧 BDD: Setting up route data with previous route for logger workflow');
        const mockSnapshot = {
          firstChild: {
            data: { next: '/step/config', previous: '/step/auth', description: 'Config step' }
          }
        } as unknown as ActivatedRouteSnapshot;
        
        const activationEndEvent = new ActivationEnd(mockSnapshot);

        // When: Router events emit and signal computes
        console.log('⚙️ BDD: Processing event for previous route logger workflow');
        routerEventsSubject.next(activationEndEvent);
        fixture.detectChanges();

        // Then: Logger workflow is called for previous route (tap branch executed)
        console.log('✅ BDD: Logger workflow tap branch is executed for previous route');
        expect(mockLogger.workflow).toHaveBeenCalledWith('Previous route:', '/step/auth');
      });

      it('Given route data with empty next route, When signal computes, Then logger workflow is called with empty string', () => {
        // Given: Route data with empty next route
        console.log('🔧 BDD: Setting up route data with empty next route for logger workflow');
        const mockSnapshot = {
          firstChild: {
            data: { next: '', previous: '/step/config', description: 'Last step' }
          }
        } as unknown as ActivatedRouteSnapshot;
        
        const activationEndEvent = new ActivationEnd(mockSnapshot);

        // When: Router events emit and signal computes
        console.log('⚙️ BDD: Processing event for empty next route logger workflow');
        routerEventsSubject.next(activationEndEvent);
        fixture.detectChanges();

        // Then: Logger workflow is called with empty string (tap branch executed)
        console.log('✅ BDD: Logger workflow tap branch is executed for empty next route');
        expect(mockLogger.workflow).toHaveBeenCalledWith('Next route:', '');
      });

      it('Given route data with empty previous route, When signal computes, Then logger workflow is called with empty string', () => {
        // Given: Route data with empty previous route
        console.log('🔧 BDD: Setting up route data with empty previous route for logger workflow');
        const mockSnapshot = {
          firstChild: {
            data: { next: '/step/auth', previous: '', description: 'First step' }
          }
        } as unknown as ActivatedRouteSnapshot;
        
        const activationEndEvent = new ActivationEnd(mockSnapshot);

        // When: Router events emit and signal computes
        console.log('⚙️ BDD: Processing event for empty previous route logger workflow');
        routerEventsSubject.next(activationEndEvent);
        fixture.detectChanges();

        // Then: Logger workflow is called with empty string (tap branch executed)
        console.log('✅ BDD: Logger workflow tap branch is executed for empty previous route');
        expect(mockLogger.workflow).toHaveBeenCalledWith('Previous route:', '');
      });

      it('Given route data with null next route, When signal computes, Then logger workflow is called with empty string after null coalescing', () => {
        // Given: Route data with null next route
        console.log('🔧 BDD: Setting up route data with null next route for logger workflow');
        const mockSnapshot = {
          firstChild: {
            data: { next: null, previous: '/step/upload', description: 'First step' }
          }
        } as unknown as ActivatedRouteSnapshot;
        
        const activationEndEvent = new ActivationEnd(mockSnapshot);

        // When: Router events emit and signal computes
        console.log('⚙️ BDD: Processing event for null next route logger workflow');
        routerEventsSubject.next(activationEndEvent);
        fixture.detectChanges();

        // Then: Logger workflow is called with empty string after null coalescing (tap branch executed)
        console.log('✅ BDD: Logger workflow tap branch is executed for null next route');
        expect(mockLogger.workflow).toHaveBeenCalledWith('Next route:', '');
      });

      it('Given route data with undefined previous route, When signal computes, Then logger workflow is called with empty string after null coalescing', () => {
        // Given: Route data with undefined previous route
        console.log('🔧 BDD: Setting up route data with undefined previous route for logger workflow');
        const mockSnapshot = {
          firstChild: {
            data: { next: '/step/auth', previous: undefined, description: 'Last step' }
          }
        } as unknown as ActivatedRouteSnapshot;
        
        const activationEndEvent = new ActivationEnd(mockSnapshot);

        // When: Router events emit and signal computes
        console.log('⚙️ BDD: Processing event for undefined previous route logger workflow');
        routerEventsSubject.next(activationEndEvent);
        fixture.detectChanges();

        // Then: Logger workflow is called with empty string after null coalescing (tap branch executed)
        console.log('✅ BDD: Logger workflow tap branch is executed for undefined previous route');
        expect(mockLogger.workflow).toHaveBeenCalledWith('Previous route:', '');
      });
    });

    describe('Scenario: Component lifecycle and subscriptions', () => {
      it('Given component initializes, When ngOnInit is called, Then subscriptions are established', () => {
        // Given: Component initializes
        console.log('🔧 BDD: Component initializes');

        // When: ngOnInit is called
        console.log('⚙️ BDD: ngOnInit is called');
        component.ngOnInit();
        fixture.detectChanges();

        // Then: Subscriptions are established (ngOnInit branch executed)
        console.log('✅ BDD: ngOnInit subscription branch is executed');
        expect(component).toBeTruthy();
        expect(component.next).toBeDefined();
        expect(component.previous).toBeDefined();
        expect(component.isLoading).toBeDefined();
      });

      it('Given component initializes, When detectChanges is called, Then component renders', () => {
        // Given: Component initializes
        console.log('🔧 BDD: Component initializes');

        // When: detectChanges is called
        console.log('⚙️ BDD: detectChanges is called');
        fixture.detectChanges();

        // Then: Component renders successfully
        console.log('✅ BDD: Component render branch is executed');
        expect(component).toBeTruthy();
        expect(fixture.nativeElement).toBeTruthy();
      });
    });
  });

});
