import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, NavigationStart, NavigationEnd, NavigationCancel } from '@angular/router';
import { of, Subject, BehaviorSubject } from 'rxjs';
import { fakeAsync, tick } from '@angular/core/testing';

import { RouterSplash } from './router-splash';
import { LOGGER, Logger, SplashScreenLoading } from '../services';

describe('Feature: Router Splash Screen', () => {
  let component: RouterSplash;
  let fixture: ComponentFixture<RouterSplash>;
  let mockLogger: jasmine.SpyObj<Logger>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockSplashScreenLoading: jasmine.SpyObj<SplashScreenLoading>;
  let routerEventsSubject: Subject<any>;
  let isLoadingSubject: BehaviorSubject<boolean>;
  let messageSubject: BehaviorSubject<string>;

  beforeEach(async () => {
    mockLogger = jasmine.createSpyObj('Logger', ['log', 'error', 'warn', 'workflow', 'instrument']);
    
    routerEventsSubject = new Subject();
    isLoadingSubject = new BehaviorSubject(false);
    messageSubject = new BehaviorSubject('*flap* *flap* *flap*');
    
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    Object.defineProperty(mockRouter, 'events', {
      value: routerEventsSubject.asObservable(),
      writable: false
    });
    
    mockSplashScreenLoading = jasmine.createSpyObj('SplashScreenLoading', ['show', 'hide']);
    Object.defineProperty(mockSplashScreenLoading, 'isLoading', {
      value: isLoadingSubject,
      writable: false
    });
    Object.defineProperty(mockSplashScreenLoading, 'message', {
      value: messageSubject,
      writable: false
    });

    await TestBed.configureTestingModule({
      imports: [RouterSplash],
      providers: [
        { provide: LOGGER, useValue: mockLogger },
        { provide: Router, useValue: mockRouter },
        { provide: SplashScreenLoading, useValue: mockSplashScreenLoading }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RouterSplash);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Scenario: Component initialization', () => {
    it('Given router splash component, When component initializes, Then it should be created successfully', () => {
      // Given: Router splash component
      console.log('🔧 BDD: Setting up router splash component');
      
      // When: Component initializes
      console.log('⚙️ BDD: Component initializes');
      
      // Then: Component should be created successfully
      console.log('✅ BDD: Verifying component creation');
      expect(component).toBeTruthy();
      expect(component['MIN_SPLASH_DURATION']).toBe(500);
    });
  });

  describe('Scenario: Navigation start triggers splash screen', () => {
    it('Given router is idle, When navigation starts, Then splash screen should be shown immediately', fakeAsync(() => {
      // Given: Router is idle and observable is subscribed
      console.log('🔧 BDD: Setting up idle router state');
      const emittedValues: boolean[] = [];
      component.shouldShowSplash.subscribe((value: boolean) => emittedValues.push(value));
      isLoadingSubject.next(false);
      tick();
      
      // When: Navigation starts
      console.log('⚙️ BDD: Navigation starts');
      const navigationStart = new NavigationStart(1, '/test');
      routerEventsSubject.next(navigationStart);
      tick(150); // Wait for delay
      
      // Then: Splash screen should be shown immediately
      console.log('✅ BDD: Verifying splash screen is shown');
      expect(emittedValues).toContain(true);
      expect(mockLogger.log).toHaveBeenCalledWith('Splash screen shown - navigation or loading active');
    }));
  });

  describe('Scenario: Navigation end with minimum duration', () => {
    it('Given navigation is active, When navigation ends, Then splash screen should show for minimum duration', fakeAsync(() => {
      // Given: Navigation is active and observable is subscribed
      console.log('🔧 BDD: Setting up active navigation state');
      const emittedValues: boolean[] = [];
      component.shouldShowSplash.subscribe((value: boolean) => emittedValues.push(value));
      
      // Start navigation
      const navigationStart = new NavigationStart(1, '/test');
      routerEventsSubject.next(navigationStart);
      tick(150);
      
      // When: Navigation ends
      console.log('⚙️ BDD: Navigation ends');
      const navigationEnd = new NavigationEnd(1, '/test', '/test');
      routerEventsSubject.next(navigationEnd);
      tick(150); // Wait for the delay and processing
      
      // Then: Splash screen should continue showing during minimum duration
      console.log('✅ BDD: Verifying minimum splash duration');
      expect(mockLogger.log).toHaveBeenCalledWith('Navigation ended, ensuring minimum splash duration');
      
      // And: After minimum duration, splash should hide
      tick(500); // Wait for minimum duration
      expect(emittedValues).toContain(false); // Should eventually hide
    }));
  });

  describe('Scenario: SplashScreenLoading service integration', () => {
    it('Given router is idle, When SplashScreenLoading becomes active, Then splash screen should be shown', fakeAsync(() => {
      // Given: Router is idle and observable is subscribed
      console.log('🔧 BDD: Setting up idle router and loading service');
      const emittedValues: boolean[] = [];
      component.shouldShowSplash.subscribe((value: boolean) => emittedValues.push(value));
      isLoadingSubject.next(false);
      tick();
      
      // When: SplashScreenLoading becomes active
      console.log('⚙️ BDD: SplashScreenLoading service becomes active');
      isLoadingSubject.next(true);
      tick();
      
      // Then: Splash screen should be shown
      console.log('✅ BDD: Verifying splash screen is shown for loading');
      expect(emittedValues).toContain(true);
      expect(mockLogger.log).toHaveBeenCalledWith('Splash screen shown - navigation or loading active');
    }));
  });

  describe('Scenario: Minimum splash duration configuration', () => {
    it('Given component is created, When checking configuration, Then minimum duration should be set correctly', () => {
      // Given: Component is created
      console.log('🔧 BDD: Setting up component configuration check');
      
      // When: Checking configuration
      console.log('⚙️ BDD: Checking minimum splash duration configuration');
      
      // Then: Minimum duration should be set correctly
      console.log('✅ BDD: Verifying minimum duration is 500ms');
      expect(component['MIN_SPLASH_DURATION']).toBe(500);
    });
  });
});
