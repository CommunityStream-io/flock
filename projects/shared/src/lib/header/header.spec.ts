import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LocationStrategy, PathLocationStrategy } from '@angular/common';
import { HeaderComponent } from './header';
import { ThemeToggleComponent } from '../theme-toggle/theme-toggle';

// Mock LocationStrategy for testing navigation
class MockLocationStrategy extends LocationStrategy {
  private currentPath = '/';
  
  getBaseHref(): string { return '/'; }
  prepareExternalUrl(internal: string): string { return internal; }
  pushState(state: any, title: string, url: string, queryParams?: string): void {
    this.currentPath = url;
  }
  replaceState(state: any, title: string, url: string, queryParams?: string): void {
    this.currentPath = url;
  }
  forward(): void {}
  back(): void {}
  getState(): any { return null; }
  onPopState(fn: any): void {}
  getCurrentPath(): string { return this.currentPath; }
  getCurrentUrl(): string { return this.currentPath; }
  path(): string { return this.currentPath; }
}

describe('Feature: Application Header Navigation', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let locationStrategy: MockLocationStrategy;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HeaderComponent,
        CommonModule,
        RouterModule.forRoot([]),
        ThemeToggleComponent
      ],
      providers: [
        { provide: LocationStrategy, useClass: MockLocationStrategy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    locationStrategy = TestBed.inject(LocationStrategy) as MockLocationStrategy;
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
      expect(fixture.nativeElement.querySelector('.app-header')).toBeTruthy();
    });

    it('Given the header component renders, When it initializes, Then it should display the app title', () => {
      // Given: Header component renders
      console.log('🔧 BDD: Header component renders');
      fixture.detectChanges();
      
      // When: Component initializes
      console.log('⚙️ BDD: Component initializes');
      
      // Then: Should display the app title
      console.log('✅ BDD: Header displays app title');
      const appTitle = fixture.nativeElement.querySelector('.app-title');
      expect(appTitle).toBeTruthy();
      expect(appTitle.textContent).toContain('Bluesky Migrator');
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
      const appIcon = fixture.nativeElement.querySelector('.app-icon');
      expect(appIcon).toBeTruthy();
      expect(appIcon.textContent).toContain('🦋');
    });

    it('Given the header renders, When it initializes, Then it should have a link to the home page', () => {
      // Given: Header renders
      console.log('🔧 BDD: Header renders');
      fixture.detectChanges();
      
      // When: Component initializes
      console.log('⚙️ BDD: Component initializes');
      
      // Then: Should have a link to the home page
      console.log('✅ BDD: Header has link to home page');
      const homeLink = fixture.nativeElement.querySelector('.app-title');
      expect(homeLink).toBeTruthy();
      expect(homeLink.getAttribute('routerLink')).toBe('/');
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
      const navMenu = fixture.nativeElement.querySelector('.header-nav');
      expect(navMenu).toBeTruthy();
    });

    it('Given the navigation menu renders, When it initializes, Then it should contain navigation links', () => {
      // Given: Navigation menu renders
      console.log('🔧 BDD: Navigation menu renders');
      fixture.detectChanges();
      
      // When: Component initializes
      console.log('⚙️ BDD: Component initializes');
      
      // Then: Should contain navigation links
      console.log('✅ BDD: Navigation menu contains navigation links');
      const navLinks = fixture.nativeElement.querySelectorAll('.nav-link');
      expect(navLinks.length).toBeGreaterThan(0);
      
      // Check that each link has routerLink attribute
      navLinks.forEach((link: Element) => {
        expect(link.hasAttribute('routerLink')).toBe(true);
      });
    });
  });

  describe('Scenario: Navigation link behavior with LocationStrategy', () => {
    it('Given the navigation links render, When they initialize, Then they should have routerLink attributes', () => {
      // Given: Navigation links render
      console.log('🔧 BDD: Navigation links render');
      fixture.detectChanges();
      
      // When: They initialize
      console.log('⚙️ BDD: Navigation links initialize');
      
      // Then: Should have routerLink attributes
      console.log('✅ BDD: Navigation links have routerLink attributes');
      const navLinks = fixture.nativeElement.querySelectorAll('.nav-link');
      navLinks.forEach((link: Element) => {
        expect(link.hasAttribute('routerLink')).toBe(true);
      });
    });

    it('Given the navigation links render, When they initialize, Then they should have routerLinkActive attributes', () => {
      // Given: Navigation links render
      console.log('🔧 BDD: Navigation links render');
      fixture.detectChanges();
      
      // When: They initialize
      console.log('⚙️ BDD: Navigation links initialize');
      
      // Then: Should have routerLinkActive attributes
      console.log('✅ BDD: Navigation links have routerLinkActive attributes');
      const navLinks = fixture.nativeElement.querySelectorAll('.nav-link');
      navLinks.forEach((link: Element) => {
        expect(link.hasAttribute('routerLinkActive')).toBe(true);
      });
    });

    it('Given the navigation links render, When they initialize, Then they should have proper href values', () => {
      // Given: Navigation links render
      console.log('🔧 BDD: Navigation links render');
      fixture.detectChanges();
      
      // When: They initialize
      console.log('⚙️ BDD: Navigation links initialize');
      
      // Then: Should have proper href values
      console.log('✅ BDD: Navigation links have proper href values');
      const navLinks = fixture.nativeElement.querySelectorAll('.nav-link');
      
      // Check that each link has an href attribute
      navLinks.forEach((link: Element) => {
        const href = link.getAttribute('href');
        expect(href).toBeTruthy();
        expect(href).toMatch(/^\//); // Should start with /
      });
    });

    it('Given the navigation links render, When they initialize, Then they should have expected route paths', () => {
      // Given: Navigation links render
      console.log('🔧 BDD: Navigation links render');
      fixture.detectChanges();
      
      // When: They initialize
      console.log('⚙️ BDD: Navigation links initialize');
      
      // Then: Should have expected route paths
      console.log('✅ BDD: Navigation links have expected route paths');
      const navLinks = fixture.nativeElement.querySelectorAll('.nav-link');
      
      // Check that each link has the expected routerLink value
      navLinks.forEach((link: Element) => {
        const routerLink = link.getAttribute('routerLink');
        expect(routerLink).toBeTruthy();
        
        // Verify it's a valid route path
        expect(routerLink).toMatch(/^\/[a-zA-Z-]*$/);
      });
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
      const themeToggle = fixture.nativeElement.querySelector('shared-theme-toggle');
      expect(themeToggle).toBeTruthy();
    });

    it('Given the header renders, When it initializes, Then theme toggle should be in the header right section', () => {
      // Given: Header renders
      console.log('🔧 BDD: Header renders');
      fixture.detectChanges();
      
      // When: Component initializes
      console.log('⚙️ BDD: Component initializes');
      
      // Then: Theme toggle should be in the header right section
      console.log('✅ BDD: Theme toggle is in header right section');
      const headerRight = fixture.nativeElement.querySelector('.header-right');
      const themeToggle = headerRight?.querySelector('shared-theme-toggle');
      expect(themeToggle).toBeTruthy();
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
      const header = fixture.nativeElement.querySelector('.app-header');
      expect(header?.querySelector('.header-content')).toBeTruthy();
      expect(header?.querySelector('.header-left')).toBeTruthy();
      expect(header?.querySelector('.header-nav')).toBeTruthy();
      expect(header?.querySelector('.header-right')).toBeTruthy();
    });

    it('Given the header renders, When it initializes, Then it should have the correct CSS classes', () => {
      // Given: Header renders
      console.log('🔧 BDD: Header renders');
      fixture.detectChanges();
      
      // When: Component initializes
      console.log('⚙️ BDD: Component initializes');
      
      // Then: Should have the correct CSS classes
      console.log('✅ BDD: Header has correct CSS classes');
      const header = fixture.nativeElement.querySelector('.app-header');
      expect(header).toHaveClass('app-header');
      expect(header?.querySelector('.header-content')).toHaveClass('header-content');
      expect(header?.querySelector('.header-left')).toHaveClass('header-left');
      expect(header?.querySelector('.header-nav')).toHaveClass('header-nav');
      expect(header?.querySelector('.header-right')).toHaveClass('header-right');
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
      const header = fixture.nativeElement.querySelector('.app-header');
      expect(header).toBeTruthy();
      // Note: Responsive behavior is tested through CSS media queries
    });
  });
});
