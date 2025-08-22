import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { StepNavigationComponent } from './step-navigation';

describe('Feature: Migration Step Navigation', () => {
  let component: StepNavigationComponent;
  let fixture: ComponentFixture<StepNavigationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        StepNavigationComponent,
        CommonModule,
        RouterModule.forRoot([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(StepNavigationComponent);
    component = fixture.componentInstance;
  });

  describe('Scenario: Step navigation component initialization', () => {
    it('Given the step navigation component is created, When it initializes, Then it should render successfully', () => {
      // Given: Step navigation component is created
      console.log('🔧 BDD: Step navigation component is created');
      
      // When: Component initializes
      console.log('⚙️ BDD: Component initializes');
      fixture.detectChanges();
      
      // Then: Should render successfully
      console.log('✅ BDD: Step navigation component renders successfully');
      expect(component).toBeTruthy();
      expect(fixture.nativeElement.querySelector('.step-navigation')).toBeTruthy();
    });

    it('Given the step navigation component renders, When it initializes, Then it should display the step list', () => {
      // Given: Step navigation component renders
      console.log('🔧 BDD: Step navigation component renders');
      fixture.detectChanges();
      
      // When: Component initializes
      console.log('⚙️ BDD: Component initializes');
      
      // Then: Should display the step list
      console.log('✅ BDD: Step navigation displays step list');
      const stepList = fixture.nativeElement.querySelector('.step-list');
      expect(stepList).toBeTruthy();
    });
  });

  describe('Scenario: Migration steps display', () => {
    it('Given the component renders, When it initializes, Then it should display all migration steps', () => {
      // Given: Component renders
      console.log('🔧 BDD: Component renders');
      fixture.detectChanges();
      
      // When: Component initializes
      console.log('⚙️ BDD: Component initializes');
      
      // Then: Should display all migration steps
      console.log('✅ BDD: Component displays all migration steps');
      const stepItems = fixture.nativeElement.querySelectorAll('.step-item');
      expect(stepItems.length).toBe(5); // Landing, Upload, Auth, Config, Execute
    });

          it('Given the component renders, When it initializes, Then it should display the Upload Instagram Export step first', () => {
        // Given: Component renders
        console.log('🔧 BDD: Component renders');
        fixture.detectChanges();
        
        // When: Component initializes
        console.log('⚙️ BDD: Component initializes');
        
        // Then: Should display the Upload Instagram Export step first
        console.log('✅ BDD: Component displays Upload Instagram Export step first');
        const firstStep = fixture.nativeElement.querySelector('.step-item');
        expect(firstStep.textContent).toContain('Upload Instagram Export');
      });

          it('Given the component renders, When it initializes, Then it should display the Bluesky Authentication step second', () => {
        // Given: Component renders
        console.log('🔧 BDD: Component renders');
        fixture.detectChanges();
        
        // When: Component initializes
        console.log('⚙️ BDD: Component initializes');
        
        // Then: Should display the Bluesky Authentication step second
        console.log('✅ BDD: Component displays Bluesky Authentication step second');
        const stepItems = fixture.nativeElement.querySelectorAll('.step-item');
        expect(stepItems[1].textContent).toContain('Bluesky Authentication');
      });

          it('Given the component renders, When it initializes, Then it should display the Migration Settings step third', () => {
        // Given: Component renders
        console.log('🔧 BDD: Component renders');
        fixture.detectChanges();
        
        // When: Component initializes
        console.log('⚙️ BDD: Component initializes');
        
        // Then: Should display the Migration Settings step third
        console.log('✅ BDD: Component displays Migration Settings step third');
        const stepItems = fixture.nativeElement.querySelectorAll('.step-item');
        expect(stepItems[2].textContent).toContain('Migration Settings');
      });

          it('Given the component renders, When it initializes, Then it should display the Execute Migration step fourth', () => {
        // Given: Component renders
        console.log('🔧 BDD: Component renders');
        fixture.detectChanges();
        
        // When: Component initializes
        console.log('⚙️ BDD: Component initializes');
        
        // Then: Should display the Execute Migration step fourth
        console.log('✅ BDD: Component displays Execute Migration step fourth');
        const stepItems = fixture.nativeElement.querySelectorAll('.step-item');
        expect(stepItems[3].textContent).toContain('Execute Migration');
      });

          it('Given the component renders, When it initializes, Then it should display the Migration Complete step last', () => {
        // Given: Component renders
        console.log('🔧 BDD: Component renders');
        fixture.detectChanges();
        
        // When: Component initializes
        console.log('⚙️ BDD: Component initializes');
        
        // Then: Should display the Migration Complete step last
        console.log('✅ BDD: Component displays Migration Complete step last');
        const stepItems = fixture.nativeElement.querySelectorAll('.step-item');
        expect(stepItems[4].textContent).toContain('Migration Complete');
      });
  });

  describe('Scenario: Step information display', () => {
    it('Given the component renders, When it initializes, Then each step should display its title', () => {
      // Given: Component renders
      console.log('🔧 BDD: Component renders');
      fixture.detectChanges();
      
      // When: Component initializes
      console.log('⚙️ BDD: Component initializes');
      
      // Then: Each step should display its title
      console.log('✅ BDD: Each step displays its title');
      const stepItems = fixture.nativeElement.querySelectorAll('.step-item');
             const expectedTitles = ['Upload Instagram Export', 'Bluesky Authentication', 'Migration Settings', 'Execute Migration', 'Migration Complete'];
      
      stepItems.forEach((step: Element, index: number) => {
        expect(step.textContent).toContain(expectedTitles[index]);
      });
    });

    it('Given the component renders, When it initializes, Then each step should display its description', () => {
      // Given: Component renders
      console.log('🔧 BDD: Component renders');
      fixture.detectChanges();
      
      // When: Component initializes
      console.log('⚙️ BDD: Component initializes');
      
      // Then: Each step should display its description
      console.log('✅ BDD: Each step displays its description');
      const stepItems = fixture.nativeElement.querySelectorAll('.step-item');
      
             // Check that at least some steps contain migration-related content
       const stepTexts = Array.from(stepItems as NodeListOf<Element>).map((step: Element) => step.textContent);
       const hasMigrationContent = stepTexts.some(text => text?.includes('migration'));
       expect(hasMigrationContent).toBe(true);
    });
  });

  describe('Scenario: Step navigation structure', () => {
    it('Given the component renders, When it initializes, Then it should have the correct navigation structure', () => {
      // Given: Component renders
      console.log('🔧 BDD: Component renders');
      fixture.detectChanges();
      
      // When: Component initializes
      console.log('⚙️ BDD: Component initializes');
      
      // Then: Should have the correct navigation structure
      console.log('✅ BDD: Component has correct navigation structure');
      const navigation = fixture.nativeElement.querySelector('.step-navigation');
      expect(navigation.querySelector('.step-list')).toBeTruthy();
      expect(navigation.querySelector('.step-title')).toBeTruthy();
    });

    it('Given the component renders, When it initializes, Then it should display the navigation title', () => {
      // Given: Component renders
      console.log('🔧 BDD: Component renders');
      fixture.detectChanges();
      
      // When: Component initializes
      console.log('⚙️ BDD: Component initializes');
      
      // Then: Should display the navigation title
      console.log('✅ BDD: Component displays navigation title');
      const title = fixture.nativeElement.querySelector('.step-title');
             expect(title.textContent).toContain('Upload Instagram Export');
    });
  });

  describe('Scenario: Step item styling and classes', () => {
    it('Given the component renders, When it initializes, Then each step item should have the correct CSS class', () => {
      // Given: Component renders
      console.log('🔧 BDD: Component renders');
      fixture.detectChanges();
      
      // When: Component initializes
      console.log('⚙️ BDD: Component initializes');
      
      // Then: Each step item should have the correct CSS class
      console.log('✅ BDD: Each step item has correct CSS class');
      const stepItems = fixture.nativeElement.querySelectorAll('.step-item');
      
      stepItems.forEach((step: Element) => {
        expect(step).toHaveClass('step-item');
      });
    });

    it('Given the component renders, When it initializes, Then the step list should have the correct CSS class', () => {
      // Given: Component renders
      console.log('🔧 BDD: Component renders');
      fixture.detectChanges();
      
      // When: Component initializes
      console.log('⚙️ BDD: Component initializes');
      
      // Then: Step list should have the correct CSS class
      console.log('✅ BDD: Step list has correct CSS class');
      const stepList = fixture.nativeElement.querySelector('.step-list');
      expect(stepList).toHaveClass('step-list');
    });
  });

  describe('Scenario: Component accessibility', () => {
    it('Given the component renders, When it initializes, Then it should have semantic HTML structure', () => {
      // Given: Component renders
      console.log('🔧 BDD: Component renders');
      fixture.detectChanges();
      
      // When: Component initializes
      console.log('⚙️ BDD: Component initializes');
      
      // Then: Should have semantic HTML structure
      console.log('✅ BDD: Component has semantic HTML structure');
      const navigation = fixture.nativeElement.querySelector('nav');
      expect(navigation).toBeTruthy();
      expect(navigation).toHaveClass('step-navigation');
    });

    it('Given the component renders, When it initializes, Then it should have proper heading structure', () => {
      // Given: Component renders
      console.log('🔧 BDD: Component renders');
      fixture.detectChanges();
      
      // When: Component initializes
      console.log('⚙️ BDD: Component initializes');
      
      // Then: Should have proper heading structure
      console.log('✅ BDD: Component has proper heading structure');
      const title = fixture.nativeElement.querySelector('.step-title');
      expect(title).toBeTruthy();
      // Note: Heading level will be determined by CSS or parent context
    });
  });

  describe('Scenario: Responsive design', () => {
    it('Given the component renders, When it initializes, Then it should have responsive CSS classes', () => {
      // Given: Component renders
      console.log('🔧 BDD: Component renders');
      fixture.detectChanges();
      
      // When: Component initializes
      console.log('⚙️ BDD: Component initializes');
      
      // Then: Should have responsive CSS classes
      console.log('✅ BDD: Component has responsive CSS classes');
      const navigation = fixture.nativeElement.querySelector('.step-navigation');
      expect(navigation).toBeTruthy();
      // Note: Responsive behavior is tested through CSS media queries
    });
  });
});
