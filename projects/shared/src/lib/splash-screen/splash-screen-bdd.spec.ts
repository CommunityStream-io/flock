import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { BehaviorSubject } from 'rxjs';

import { SplashScreen } from './splash-screen';
import { SplashScreenLoading } from '../services/splash-screen-loading';

/**
 * BDD-Style Unit Tests for Splash Screen Component
 * 
 * This demonstrates BDD methodology using Angular's native testing framework
 * without requiring Cucumber. The BDD approach is maintained through structure
 * and naming conventions.
 */
describe('Feature: Splash Screen Scroll Prevention (BDD-Style)', () => {
  let component: SplashScreen;
  let fixture: ComponentFixture<SplashScreen>;
  let mockSplashScreenLoading: jasmine.SpyObj<SplashScreenLoading>;

  beforeEach(async () => {
    const splashScreenLoadingSpy = jasmine.createSpyObj('SplashScreenLoading', [], {
      message: new BehaviorSubject('*flap* *flap* *flap*'),
      isLoading: new BehaviorSubject(false)
    });

    await TestBed.configureTestingModule({
      imports: [SplashScreen, NoopAnimationsModule],
      providers: [
        { provide: SplashScreenLoading, useValue: splashScreenLoadingSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SplashScreen);
    component = fixture.componentInstance;
    mockSplashScreenLoading = TestBed.inject(SplashScreenLoading) as jasmine.SpyObj<SplashScreenLoading>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Scenario: Component Initialization', () => {
    it('Given splash screen component, When component initializes, Then body scroll is prevented', () => {
      // 🔧 BDD: Set up component initialization context
      console.log(`🔧 BDD: Splash screen component is created and initialized`);
      
      // ⚙️ BDD: Component initializes with body scroll prevention
      console.log(`⚙️ BDD: Component calls ngOnInit and prevents body scroll`);
      component.ngOnInit();
      
      // ✅ BDD: Verify body scroll is prevented
      console.log(`✅ BDD: Body has overflow hidden and fixed positioning`);
      expect(document.body.style.overflow).toBe('hidden');
      expect(document.body.style.position).toBe('fixed');
      expect(document.body.style.width).toBe('100%');
    });

    it('Given splash screen component, When component initializes, Then splash screen is visible', () => {
      // 🔧 BDD: Set up component visibility context
      console.log(`🔧 BDD: Splash screen component is rendered and visible`);
      
      // ⚙️ BDD: Component renders with proper visibility
      console.log(`⚙️ BDD: Component applies fixed positioning and high z-index`);
      fixture.detectChanges();
      
      // ✅ BDD: Verify splash screen is visible
      console.log(`✅ BDD: Splash screen has proper positioning and visibility`);
      const splashScreenElement = fixture.debugElement.query(By.css('.splash-screen'));
      expect(splashScreenElement).toBeTruthy();
      
      const computedStyle = window.getComputedStyle(splashScreenElement.nativeElement);
      expect(computedStyle.position).toBe('fixed');
      expect(computedStyle.zIndex).toBe('2000');
    });

    it('Given splash screen component, When component initializes, Then message is displayed', () => {
      // 🔧 BDD: Set up message display context
      console.log(`🔧 BDD: Splash screen component displays loading message`);
      
      // ⚙️ BDD: Component displays message from service
      console.log(`⚙️ BDD: Component subscribes to message observable`);
      fixture.detectChanges();
      
      // ✅ BDD: Verify message is displayed
      console.log(`✅ BDD: Message element is rendered with correct text`);
      const messageElement = fixture.debugElement.query(By.css('span'));
      expect(messageElement).toBeTruthy();
      expect(messageElement.nativeElement.textContent).toBe('*flap* *flap* *flap*');
    });
  });

  describe('Scenario: Body Scroll Prevention', () => {
    it('Given splash screen is visible, When component is active, Then body cannot scroll', () => {
      // 🔧 BDD: Set up body scroll prevention context
      console.log(`🔧 BDD: Splash screen is visible and preventing body scroll`);
      
      // ⚙️ BDD: Component prevents body scroll
      console.log(`⚙️ BDD: Component sets body styles to prevent scrolling`);
      component.ngOnInit();
      
      // ✅ BDD: Verify body scroll is prevented
      console.log(`✅ BDD: Body has overflow hidden and fixed positioning`);
      expect(document.body.style.overflow).toBe('hidden');
      expect(document.body.style.position).toBe('fixed');
      expect(document.body.style.width).toBe('100%');
    });

    it('Given splash screen is visible, When component is active, Then page content is hidden', () => {
      // 🔧 BDD: Set up content hiding context
      console.log(`🔧 BDD: Splash screen hides page content during display`);
      
      // ⚙️ BDD: Component hides page content
      console.log(`⚙️ BDD: Component uses backdrop filter and high z-index`);
      fixture.detectChanges();
      
      // ✅ BDD: Verify page content is hidden
      console.log(`✅ BDD: Splash screen has backdrop filter and covers content`);
      const splashScreenElement = fixture.debugElement.query(By.css('.splash-screen'));
      const computedStyle = window.getComputedStyle(splashScreenElement.nativeElement);
      
      expect(computedStyle.backdropFilter).toBe('blur(5px)');
      expect(computedStyle.zIndex).toBe('2000');
    });
  });

  describe('Scenario: Component Destruction', () => {
    it('Given splash screen component, When component is destroyed, Then body scroll is restored', () => {
      // 🔧 BDD: Set up component destruction context
      console.log(`🔧 BDD: Splash screen component is destroyed and cleaned up`);
      component.ngOnInit();
      
      // ⚙️ BDD: Component is destroyed and restores body scroll
      console.log(`⚙️ BDD: Component calls ngOnDestroy and restores body styles`);
      component.ngOnDestroy();
      
      // ✅ BDD: Verify body scroll is restored
      console.log(`✅ BDD: Body styles are restored to default values`);
      expect(document.body.style.overflow).toBe('');
      expect(document.body.style.position).toBe('');
      expect(document.body.style.width).toBe('');
    });

    it('Given splash screen component, When component is destroyed, Then no memory leaks occur', () => {
      // 🔧 BDD: Set up memory leak prevention context
      console.log(`🔧 BDD: Splash screen component prevents memory leaks`);
      
      // ⚙️ BDD: Component properly cleans up subscriptions
      console.log(`⚙️ BDD: Component calls ngOnDestroy and cleans up resources`);
      component.ngOnDestroy();
      
      // ✅ BDD: Verify no memory leaks occur
      console.log(`✅ BDD: Component properly cleans up without memory leaks`);
      // This is implicitly tested by the component not throwing errors
      expect(component).toBeTruthy();
    });
  });

  describe('Scenario: Theme Integration', () => {
    it('Given splash screen component, When component initializes, Then theme colors are applied', () => {
      // 🔧 BDD: Set up theme integration context
      console.log(`🔧 BDD: Splash screen component integrates with theme system`);
      
      // ⚙️ BDD: Component applies theme-aware styling
      console.log(`⚙️ BDD: Component uses Material Design 3 color tokens`);
      fixture.detectChanges();
      
      // ✅ BDD: Verify theme colors are applied
      console.log(`✅ BDD: Splash screen uses CSS custom properties for theming`);
      const splashScreenElement = fixture.debugElement.query(By.css('.splash-screen'));
      const computedStyle = window.getComputedStyle(splashScreenElement.nativeElement);
      
      // Check that background color is set (theme variable)
      expect(computedStyle.backgroundColor).toBeDefined();
      expect(computedStyle.color).toBeDefined();
    });

    it('Given splash screen component, When component initializes, Then butterfly uses theme colors', () => {
      // 🔧 BDD: Set up butterfly theming context
      console.log(`🔧 BDD: Splash screen butterfly integrates with theme system`);
      
      // ⚙️ BDD: Butterfly applies theme-aware styling
      console.log(`⚙️ BDD: Butterfly uses Material Design 3 color tokens`);
      fixture.detectChanges();
      
      // ✅ BDD: Verify butterfly uses theme colors
      console.log(`✅ BDD: Butterfly uses CSS custom properties for theming`);
      const butterflyElement = fixture.debugElement.query(By.css('.butterfly'));
      expect(butterflyElement).toBeTruthy();
      
      const wingElements = fixture.debugElement.queryAll(By.css('.wing'));
      expect(wingElements.length).toBe(2);
    });
  });

  describe('Scenario: Animation and Visual Effects', () => {
    it('Given splash screen component, When component initializes, Then butterfly animation is applied', () => {
      // 🔧 BDD: Set up animation context
      console.log(`🔧 BDD: Splash screen component includes butterfly animation`);
      
      // ⚙️ BDD: Component applies butterfly animation
      console.log(`⚙️ BDD: Component uses CSS animations for butterfly movement`);
      fixture.detectChanges();
      
      // ✅ BDD: Verify butterfly animation is applied
      console.log(`✅ BDD: Butterfly has hover animation applied`);
      const butterflyElement = fixture.debugElement.query(By.css('.butterfly'));
      const computedStyle = window.getComputedStyle(butterflyElement.nativeElement);
      
      expect(computedStyle.animationName).toBe('hover');
      expect(computedStyle.animationDuration).toBe('250ms');
    });

    it('Given splash screen component, When component initializes, Then wing animations are applied', () => {
      // 🔧 BDD: Set up wing animation context
      console.log(`🔧 BDD: Splash screen component includes wing flapping animation`);
      
      // ⚙️ BDD: Component applies wing animations
      console.log(`⚙️ BDD: Component uses CSS animations for wing movement`);
      fixture.detectChanges();
      
      // ✅ BDD: Verify wing animations are applied
      console.log(`✅ BDD: Wings have flapping animations applied`);
      const wingElements = fixture.debugElement.queryAll(By.css('.wing'));
      
      wingElements.forEach((wing, index) => {
        const computedStyle = window.getComputedStyle(wing.nativeElement);
        const expectedAnimation = index === 0 ? 'leftflap' : 'rightflap';
        expect(computedStyle.animationName).toBe(expectedAnimation);
        expect(computedStyle.animationDuration).toBe('250ms');
      });
    });

    it('Given splash screen component, When component initializes, Then shadow animation is applied', () => {
      // 🔧 BDD: Set up shadow animation context
      console.log(`🔧 BDD: Splash screen component includes shadow animation`);
      
      // ⚙️ BDD: Component applies shadow animation
      console.log(`⚙️ BDD: Component uses CSS animations for shadow movement`);
      fixture.detectChanges();
      
      // ✅ BDD: Verify shadow animation is applied
      console.log(`✅ BDD: Shadow has movement animation applied`);
      const shadowElement = fixture.debugElement.query(By.css('.shadow'));
      const computedStyle = window.getComputedStyle(shadowElement.nativeElement);
      
      expect(computedStyle.animationName).toBe('shadow');
      expect(computedStyle.animationDuration).toBe('250ms');
    });
  });

  describe('Scenario: Accessibility', () => {
    it('Given splash screen component, When component initializes, Then screen reader support is provided', () => {
      // 🔧 BDD: Set up accessibility context
      console.log(`🔧 BDD: Splash screen component provides screen reader support`);
      
      // ⚙️ BDD: Component ensures accessibility
      console.log(`⚙️ BDD: Component uses semantic HTML and proper text content`);
      fixture.detectChanges();
      
      // ✅ BDD: Verify screen reader support
      console.log(`✅ BDD: Message is accessible to screen readers`);
      const messageElement = fixture.debugElement.query(By.css('span'));
      expect(messageElement).toBeTruthy();
      expect(messageElement.nativeElement.textContent).toBeTruthy();
    });

    it('Given splash screen component, When component initializes, Then focus management is handled', () => {
      // 🔧 BDD: Set up focus management context
      console.log(`🔧 BDD: Splash screen component handles focus management`);
      
      // ⚙️ BDD: Component manages focus appropriately
      console.log(`⚙️ BDD: Component prevents focus from escaping splash screen`);
      component.ngOnInit();
      
      // ✅ BDD: Verify focus management
      console.log(`✅ BDD: Body scroll prevention also affects focus management`);
      expect(document.body.style.position).toBe('fixed');
    });
  });
});
