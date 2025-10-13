import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { Support } from './support';

describe('Feature: Support Page', () => {
  let component: Support;
  let fixture: ComponentFixture<Support>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Support],
      providers: [
        provideRouter([]),
        provideNoopAnimations()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Support);
    component = fixture.componentInstance;
  });

  describe('Scenario: Support page initialization', () => {
    it('Given the support page is created, When it initializes, Then it should render successfully', () => {
      // Given: Support page is created
      console.log('🔧 BDD: Support page is created');
      
      // When: Component initializes
      console.log('⚙️ BDD: Component initializes');
      fixture.detectChanges();
      
      // Then: Should render successfully
      console.log('✅ BDD: Support page renders successfully');
      expect(component).toBeTruthy();
      expect(fixture.nativeElement).toBeTruthy();
    });

    it('Given the support page renders, When it initializes, Then it should display the page title', () => {
      // Given: Support page renders
      console.log('🔧 BDD: Support page renders');
      fixture.detectChanges();
      
      // When: Component initializes
      console.log('⚙️ BDD: Component initializes');
      const compiled = fixture.nativeElement as HTMLElement;
      const title = compiled.querySelector('.page-title');
      
      // Then: Should display the page title
      console.log('✅ BDD: Support page displays title');
      expect(title).toBeTruthy();
      expect(title?.textContent).toContain('Support Flock');
    });

    it('Given the support page renders, When it initializes, Then it should display the Ko-fi iframe', () => {
      // Given: Support page renders
      console.log('🔧 BDD: Support page renders');
      fixture.detectChanges();
      
      // When: Component initializes
      console.log('⚙️ BDD: Component initializes');
      const compiled = fixture.nativeElement as HTMLElement;
      const iframe = compiled.querySelector('iframe#kofiframe');
      
      // Then: Should display the Ko-fi iframe
      console.log('✅ BDD: Support page displays Ko-fi iframe');
      expect(iframe).toBeTruthy();
    });

    it('Given the support page renders, When it initializes, Then it should display benefits list', () => {
      // Given: Support page renders
      console.log('🔧 BDD: Support page renders');
      fixture.detectChanges();
      
      // When: Component initializes
      console.log('⚙️ BDD: Component initializes');
      const compiled = fixture.nativeElement as HTMLElement;
      const benefits = compiled.querySelectorAll('.benefit-item');
      
      // Then: Should display benefits list
      console.log('✅ BDD: Support page displays benefits');
      expect(benefits.length).toBeGreaterThan(0);
    });

    it('Given the support page renders, When it initializes, Then it should have navigation buttons', () => {
      // Given: Support page renders
      console.log('🔧 BDD: Support page renders');
      fixture.detectChanges();
      
      // When: Component initializes
      console.log('⚙️ BDD: Component initializes');
      const compiled = fixture.nativeElement as HTMLElement;
      const buttons = compiled.querySelectorAll('.page-footer button');
      
      // Then: Should have navigation buttons
      console.log('✅ BDD: Support page has navigation buttons');
      expect(buttons.length).toBeGreaterThanOrEqual(2);
    });
  });
});

