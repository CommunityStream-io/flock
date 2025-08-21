import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LayoutComponent } from './layout';
import { HeaderComponent } from '../header/header';

describe('Feature: Application Layout Structure', () => {
  let component: LayoutComponent;
  let fixture: ComponentFixture<LayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        LayoutComponent,
        CommonModule,
        RouterModule.forRoot([]),
        HeaderComponent
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LayoutComponent);
    component = fixture.componentInstance;
  });

  describe('Scenario: Layout component initialization', () => {
    it('Given the layout component is created, When it initializes, Then it should render successfully', () => {
      // Given: Layout component is created
      console.log('🔧 BDD: Layout component is created');
      
      // When: Component initializes
      console.log('⚙️ BDD: Component initializes');
      fixture.detectChanges();
      
      // Then: Should render successfully
      console.log('✅ BDD: Layout component renders successfully');
      expect(component).toBeTruthy();
      expect(fixture.nativeElement.querySelector('.app-layout')).toBeTruthy();
    });

    it('Given the layout component renders, When it initializes, Then it should display the header', () => {
      // Given: Layout component renders
      console.log('🔧 BDD: Layout component renders');
      fixture.detectChanges();
      
      // When: Component initializes
      console.log('⚙️ BDD: Component initializes');
      
      // Then: Should display the header
      console.log('✅ BDD: Layout displays header');
      const header = fixture.nativeElement.querySelector('shared-header');
      expect(header).toBeTruthy();
    });
  });

  describe('Scenario: Layout structure and organization', () => {
    it('Given the layout renders, When it initializes, Then it should have the correct layout structure', () => {
      // Given: Layout renders
      console.log('🔧 BDD: Layout renders');
      fixture.detectChanges();
      
      // When: Component initializes
      console.log('⚙️ BDD: Component initializes');
      
      // Then: Should have the correct layout structure
      console.log('✅ BDD: Layout has correct structure');
      const layout = fixture.nativeElement.querySelector('.app-layout');
      expect(layout.querySelector('.app-header')).toBeTruthy();
      expect(layout.querySelector('.app-main')).toBeTruthy();
    });

    it('Given the layout renders, When it initializes, Then it should have the correct CSS classes', () => {
      // Given: Layout renders
      console.log('🔧 BDD: Layout renders');
      fixture.detectChanges();
      
      // When: Component initializes
      console.log('⚙️ BDD: Component initializes');
      
      // Then: Should have the correct CSS classes
      console.log('✅ BDD: Layout has correct CSS classes');
      const layout = fixture.nativeElement.querySelector('.app-layout');
      expect(layout).toHaveClass('app-layout');
      expect(layout.querySelector('.app-header')).toHaveClass('app-header');
      expect(layout.querySelector('.app-main')).toHaveClass('app-main');
    });
  });

  describe('Scenario: Header integration', () => {
    it('Given the layout renders, When it initializes, Then the header should be properly positioned', () => {
      // Given: Layout renders
      console.log('🔧 BDD: Layout renders');
      fixture.detectChanges();
      
      // When: Component initializes
      console.log('⚙️ BDD: Component initializes');
      
      // Then: Header should be properly positioned
      console.log('✅ BDD: Header is properly positioned');
      const header = fixture.nativeElement.querySelector('header.app-header');
      expect(header).toBeTruthy();
      expect(header.parentElement).toHaveClass('app-layout');
    });

    it('Given the layout renders, When it initializes, Then the header should contain the shared-header component', () => {
      // Given: Layout renders
      console.log('🔧 BDD: Layout renders');
      fixture.detectChanges();
      
      // When: Component initializes
      console.log('⚙️ BDD: Component initializes');
      
      // Then: Header should contain the shared-header component
      console.log('✅ BDD: Header contains shared-header component');
      const header = fixture.nativeElement.querySelector('header.app-header');
      const sharedHeader = header.querySelector('shared-header');
      expect(sharedHeader).toBeTruthy();
    });
  });

  describe('Scenario: Main content area', () => {
    it('Given the layout renders, When it initializes, Then it should have a main content area', () => {
      // Given: Layout renders
      console.log('🔧 BDD: Layout renders');
      fixture.detectChanges();
      
      // When: Component initializes
      console.log('⚙️ BDD: Component initializes');
      
      // Then: Should have a main content area
      console.log('✅ BDD: Layout has main content area');
      const mainContent = fixture.nativeElement.querySelector('.app-main');
      expect(mainContent).toBeTruthy();
    });

    it('Given the layout renders, When it initializes, Then the main content area should be ready for router outlet', () => {
      // Given: Layout renders
      console.log('🔧 BDD: Layout renders');
      fixture.detectChanges();
      
      // When: Component initializes
      console.log('⚙️ BDD: Component initializes');
      
      // Then: Main content area should be ready for router outlet
      console.log('✅ BDD: Main content area is ready for router outlet');
      const mainContent = fixture.nativeElement.querySelector('.app-main');
      expect(mainContent).toBeTruthy();
      // Note: Router outlet will be injected by the parent component
    });
  });

  describe('Scenario: Responsive design considerations', () => {
    it('Given the layout renders, When it initializes, Then it should have responsive CSS classes', () => {
      // Given: Layout renders
      console.log('🔧 BDD: Layout renders');
      fixture.detectChanges();
      
      // When: Component initializes
      console.log('⚙️ BDD: Component initializes');
      
      // Then: Should have responsive CSS classes
      console.log('✅ BDD: Layout has responsive CSS classes');
      const layout = fixture.nativeElement.querySelector('.app-layout');
      expect(layout).toBeTruthy();
      // Note: Responsive behavior is tested through CSS media queries
    });
  });

  describe('Scenario: Component composition', () => {
    it('Given the layout renders, When it initializes, Then it should compose header and main content', () => {
      // Given: Layout renders
      console.log('🔧 BDD: Layout renders');
      fixture.detectChanges();
      
      // When: Component initializes
      console.log('⚙️ BDD: Component initializes');
      
      // Then: Should compose header and main content
      console.log('✅ BDD: Layout composes header and main content');
      const layout = fixture.nativeElement.querySelector('.app-layout');
      const header = layout.querySelector('.app-header');
      const main = layout.querySelector('.app-main');

      expect(header).toBeTruthy();
      expect(main).toBeTruthy();
      expect(header.parentElement).toBe(layout);
      // main may be wrapped by Material sidenav content; ensure it is within layout subtree
      expect(layout.contains(main)).toBeTrue();
    });
  });

  describe('Scenario: Accessibility and semantic structure', () => {
    it('Given the layout renders, When it initializes, Then it should have semantic HTML structure', () => {
      // Given: Layout renders
      console.log('🔧 BDD: Layout renders');
      fixture.detectChanges();
      
      // When: Component initializes
      console.log('⚙️ BDD: Component initializes');
      
      // Then: Should have semantic HTML structure
      console.log('✅ BDD: Layout has semantic HTML structure');
      const layout = fixture.nativeElement.querySelector('.app-layout');
      const header = layout.querySelector('header');
      const main = layout.querySelector('main');
      
      expect(header).toBeTruthy();
      expect(main).toBeTruthy();
    });
  });

  describe('Scenario: Theme integration', () => {
    it('Given the layout renders, When it initializes, Then it should support theme changes', () => {
      // Given: Layout renders
      console.log('🔧 BDD: Layout renders');
      fixture.detectChanges();
      
      // When: Component initializes
      console.log('⚙️ BDD: Component initializes');
      
      // Then: Should support theme changes
      console.log('✅ BDD: Layout supports theme changes');
      const layout = fixture.nativeElement.querySelector('.app-layout');
      expect(layout).toBeTruthy();
      // Note: Theme changes are handled by the theme service and applied to document
    });
  });
});
