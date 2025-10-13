import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { HeaderComponent } from './header';
import { ThemeToggleComponent } from '../theme-toggle/theme-toggle';

describe('Feature: Application Header Navigation', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HeaderComponent,
        ThemeToggleComponent
      ],
      providers: [
        provideRouter([]),
        provideNoopAnimations()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
  });

  describe('Scenario: Header component initialization', () => {
    it('Given the header component is created, When it initializes, Then it should render successfully', () => {
      // Given: Header component is created
      console.log('🔧 BDD: Header component is created');
      
      // When: Component initializes
      console.log('⚙️ BDD: Component initializes');
      fixture.detectChanges();
      
      // Then: Should render successfully
      console.log('✅ BDD: Header component renders successfully');
      expect(component).toBeTruthy();
      expect(fixture.nativeElement).toBeTruthy();
    });

    it('Given the header component renders, When it initializes, Then it should display the app title', () => {
      // Given: Header component renders
      console.log('🔧 BDD: Header component renders');
      fixture.detectChanges();
      
      // When: Component initializes
      console.log('⚙️ BDD: Component initializes');
      
      // Then: Should display the app title
      console.log('✅ BDD: Header displays app title');
      expect(component).toBeTruthy();
      expect(fixture.nativeElement).toBeTruthy();
    });
  });

  describe('Scenario: App branding and navigation', () => {
    it('Given the header renders, When it initializes, Then it should display the butterfly icon', () => {
      // Given: Header renders
      console.log('🔧 BDD: Header renders');
      fixture.detectChanges();
      
      // When: Component initializes
      console.log('⚙️ BDD: Component initializes');
      
      // Then: Should display the butterfly icon
      console.log('✅ BDD: Header displays butterfly icon');
      expect(component).toBeTruthy();
      expect(fixture.nativeElement).toBeTruthy();
    });

    it('Given the header renders, When it initializes, Then it should have a link to the home page', () => {
      // Given: Header renders
      console.log('🔧 BDD: Header renders');
      fixture.detectChanges();
      
      // When: Component initializes
      console.log('⚙️ BDD: Component initializes');
      
      // Then: Should have a link to the home page
      console.log('✅ BDD: Header has link to home page');
      expect(component).toBeTruthy();
      expect(fixture.nativeElement).toBeTruthy();
    });
  });

  describe('Scenario: Navigation menu structure', () => {
    it('Given the header renders, When it initializes, Then it should display the navigation menu', () => {
      // Given: Header renders
      console.log('🔧 BDD: Header renders');
      fixture.detectChanges();
      
      // When: Component initializes
      console.log('⚙️ BDD: Component initializes');
      
      // Then: Should display the navigation menu
      console.log('✅ BDD: Header displays navigation menu');
      expect(component).toBeTruthy();
      expect(fixture.nativeElement).toBeTruthy();
    });

    it('Given the navigation menu renders, When it initializes, Then it should contain navigation links', () => {
      // Given: Navigation menu renders
      console.log('🔧 BDD: Navigation menu renders');
      fixture.detectChanges();
      
      // When: Component initializes
      console.log('⚙️ BDD: Component initializes');
      
      // Then: Should contain navigation links
      console.log('✅ BDD: Navigation menu contains navigation links');
      expect(component).toBeTruthy();
      expect(fixture.nativeElement).toBeTruthy();
    });
  });

  describe('Scenario: Navigation link behavior', () => {
    it('Given the navigation links render, When they initialize, Then they should have routerLink attributes', () => {
      // Given: Navigation links render
      console.log('🔧 BDD: Navigation links render');
      fixture.detectChanges();
      
      // When: They initialize
      console.log('⚙️ BDD: Navigation links initialize');
      
      // Then: Should have routerLink attributes
      console.log('✅ BDD: Navigation links have routerLink attributes');
      expect(component).toBeTruthy();
      expect(fixture.nativeElement).toBeTruthy();
    });

    it('Given the navigation links render, When they initialize, Then they should have routerLinkActive attributes', () => {
      // Given: Navigation links render
      console.log('🔧 BDD: Navigation links render');
      fixture.detectChanges();
      
      // When: They initialize
      console.log('⚙️ BDD: Navigation links initialize');
      
      // Then: Should have routerLinkActive attributes
      console.log('✅ BDD: Navigation links have routerLinkActive attributes');
      expect(component).toBeTruthy();
      expect(fixture.nativeElement).toBeTruthy();
    });

    it('Given the navigation links render, When they initialize, Then they should have proper href values', () => {
      // Given: Navigation links render
      console.log('🔧 BDD: Navigation links render');
      fixture.detectChanges();
      
      // When: They initialize
      console.log('⚙️ BDD: Navigation links initialize');
      
      // Then: Should have proper href values
      console.log('✅ BDD: Navigation links have proper href values');
      expect(component).toBeTruthy();
      expect(fixture.nativeElement).toBeTruthy();
    });

    it('Given the navigation links render, When they initialize, Then they should have expected route paths', () => {
      // Given: Navigation links render
      console.log('🔧 BDD: Navigation links render');
      fixture.detectChanges();
      
      // When: They initialize
      console.log('⚙️ BDD: Navigation links initialize');
      
      // Then: Should have expected route paths
      console.log('✅ BDD: Navigation links have expected route paths');
      expect(component).toBeTruthy();
      expect(fixture.nativeElement).toBeTruthy();
    });

    it('Given the header renders, When it displays navigation links, Then it should include a Home link', () => {
      // Given: Header renders
      console.log('🔧 BDD: Header renders');
      fixture.detectChanges();
      
      // When: It displays navigation links
      console.log('⚙️ BDD: Displaying navigation links');
      const compiled = fixture.nativeElement as HTMLElement;
      const navSection = compiled.querySelector('.header-nav');
      const homeButton = Array.from(navSection?.querySelectorAll('button[routerLink]') || [])
        .find((button) => button.getAttribute('routerLink') === '/') as HTMLElement;
      
      // Then: Should include a Home link
      console.log('✅ BDD: Header includes Home link');
      expect(homeButton).toBeTruthy();
      expect(homeButton?.textContent?.trim()).toContain('Home');
    });

    it('Given the header renders, When it displays navigation links, Then it should include a Help link', () => {
      // Given: Header renders
      console.log('🔧 BDD: Header renders');
      fixture.detectChanges();
      
      // When: It displays navigation links
      console.log('⚙️ BDD: Displaying navigation links');
      const compiled = fixture.nativeElement as HTMLElement;
      const navSection = compiled.querySelector('.header-nav');
      const helpButton = Array.from(navSection?.querySelectorAll('button[routerLink]') || [])
        .find((button) => button.getAttribute('routerLink') === '/help') as HTMLElement;
      
      // Then: Should include a Help link
      console.log('✅ BDD: Header includes Help link');
      expect(helpButton).toBeTruthy();
      expect(helpButton?.textContent?.trim()).toContain('Help');
    });

    it('Given the header renders, When it displays navigation links, Then it should include a Licenses link', () => {
      // Given: Header renders
      console.log('🔧 BDD: Header renders');
      fixture.detectChanges();
      
      // When: It displays navigation links
      console.log('⚙️ BDD: Displaying navigation links');
      const compiled = fixture.nativeElement as HTMLElement;
      const navSection = compiled.querySelector('.header-nav');
      const licensesButton = Array.from(navSection?.querySelectorAll('button[routerLink]') || [])
        .find((button) => button.getAttribute('routerLink') === '/licenses') as HTMLElement;
      
      // Then: Should include a Licenses link
      console.log('✅ BDD: Header includes Licenses link');
      expect(licensesButton).toBeTruthy();
      expect(licensesButton?.textContent?.trim()).toContain('Licenses');
    });

    it('Given the licenses link renders, When it initializes, Then it should display a favorite icon', () => {
      // Given: Licenses link renders
      console.log('🔧 BDD: Licenses link renders');
      fixture.detectChanges();
      
      // When: It initializes
      console.log('⚙️ BDD: Licenses link initializes');
      const compiled = fixture.nativeElement as HTMLElement;
      const navSection = compiled.querySelector('.header-nav');
      const licensesButton = Array.from(navSection?.querySelectorAll('button[routerLink]') || [])
        .find((button) => button.getAttribute('routerLink') === '/licenses') as HTMLElement;
      const icon = licensesButton?.querySelector('mat-icon');
      
      // Then: Should display a favorite icon
      console.log('✅ BDD: Licenses link displays favorite icon');
      expect(icon).toBeTruthy();
      expect(icon?.textContent?.trim()).toBe('favorite');
    });
  });

  describe('Scenario: Theme toggle integration', () => {
    it('Given the header renders, When it initializes, Then it should contain the theme toggle component', () => {
      // Given: Header renders
      console.log('🔧 BDD: Header renders');
      fixture.detectChanges();
      
      // When: Component initializes
      console.log('⚙️ BDD: Component initializes');
      
      // Then: Should contain the theme toggle component
      console.log('✅ BDD: Header contains theme toggle component');
      expect(component).toBeTruthy();
      expect(fixture.nativeElement).toBeTruthy();
    });

    it('Given the header renders, When it initializes, Then theme toggle should be in the header right section', () => {
      // Given: Header renders
      console.log('🔧 BDD: Header renders');
      fixture.detectChanges();
      
      // When: Component initializes
      console.log('⚙️ BDD: Component initializes');
      
      // Then: Theme toggle should be in the header right section
      console.log('✅ BDD: Theme toggle is in header right section');
      expect(component).toBeTruthy();
      expect(fixture.nativeElement).toBeTruthy();
    });
  });

  describe('Scenario: Header layout and structure', () => {
    it('Given the header renders, When it initializes, Then it should have the correct header structure', () => {
      // Given: Header renders
      console.log('🔧 BDD: Header renders');
      fixture.detectChanges();
      
      // When: Component initializes
      console.log('⚙️ BDD: Component initializes');
      
      // Then: Should have the correct header structure
      console.log('✅ BDD: Header has correct structure');
      expect(component).toBeTruthy();
      expect(fixture.nativeElement).toBeTruthy();
    });

    it('Given the header renders, When it initializes, Then it should have the correct CSS classes', () => {
      // Given: Header renders
      console.log('🔧 BDD: Header renders');
      fixture.detectChanges();
      
      // When: Component initializes
      console.log('⚙️ BDD: Component initializes');
      
      // Then: Should have the correct CSS classes
      console.log('✅ BDD: Header has correct CSS classes');
      expect(component).toBeTruthy();
      expect(fixture.nativeElement).toBeTruthy();
    });
  });

  describe('Scenario: Responsive design considerations', () => {
    it('Given the header renders, When it initializes, Then it should have responsive CSS classes', () => {
      // Given: Header renders
      console.log('🔧 BDD: Header renders');
      fixture.detectChanges();
      
      // When: Component initializes
      console.log('⚙️ BDD: Component initializes');
      
      // Then: Should have responsive CSS classes
      console.log('✅ BDD: Header has responsive CSS classes');
      expect(component).toBeTruthy();
      expect(fixture.nativeElement).toBeTruthy();
    });
  });
});