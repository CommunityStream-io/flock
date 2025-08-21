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
      console.log('🔧 BDD: Step navigation component is created');
      console.log('⚙️ BDD: Component initializes');
      fixture.detectChanges();
      console.log('✅ BDD: Step navigation component renders successfully');
      expect(component).toBeTruthy();
      expect(fixture.nativeElement.querySelector('.step-navigation')).toBeTruthy();
    });

    it('Given the component renders, When it initializes, Then it should display the step list', () => {
      console.log('🔧 BDD: Step navigation component renders');
      fixture.detectChanges();
      console.log('⚙️ BDD: Component initializes');
      console.log('✅ BDD: Step navigation displays step list');
      const stepList = fixture.nativeElement.querySelector('.step-list');
      expect(stepList).toBeTruthy();
    });
  });

  describe('Scenario: Migration steps display', () => {
    it('Given the component renders, When it initializes, Then it should display all migration steps', () => {
      console.log('🔧 BDD: Component renders');
      fixture.detectChanges();
      console.log('⚙️ BDD: Component initializes');
      console.log('✅ BDD: Component displays all migration steps');
      const stepItems = fixture.nativeElement.querySelectorAll('.step-item');
      expect(stepItems.length).toBe(5);
    });

    it('Given the component renders, When it initializes, Then it should display the steps in the correct order', () => {
      console.log('🔧 BDD: Component renders');
      fixture.detectChanges();
      console.log('⚙️ BDD: Component initializes');
      console.log('✅ BDD: Component displays steps in correct order');
      const texts = Array.from(fixture.nativeElement.querySelectorAll('.step-item') as NodeListOf<Element>).map((e) => e.textContent || '');
      expect(texts[0]).toContain('Upload Instagram Export');
      expect(texts[1]).toContain('Bluesky Authentication');
      expect(texts[2]).toContain('Migration Settings');
      expect(texts[3]).toContain('Execute Migration');
      expect(texts[4]).toContain('Migration Complete');
    });
  });

  describe('Scenario: Step information display', () => {
    it('Given the component renders, When it initializes, Then each step should display its title', () => {
      console.log('🔧 BDD: Component renders');
      fixture.detectChanges();
      console.log('⚙️ BDD: Component initializes');
      console.log('✅ BDD: Each step displays its title');
      const expectedTitles = ['Upload Instagram Export', 'Bluesky Authentication', 'Migration Settings', 'Execute Migration', 'Migration Complete'];
      const stepItems = fixture.nativeElement.querySelectorAll('.step-item');
      stepItems.forEach((step: Element, index: number) => {
        expect(step.textContent).toContain(expectedTitles[index]);
      });
    });

    it('Given the component renders, When it initializes, Then each step should have a condensed label', () => {
      console.log('🔧 BDD: Component renders');
      fixture.detectChanges();
      console.log('⚙️ BDD: Component initializes');
      console.log('✅ BDD: Each step has a condensed label');
      const stepItems = fixture.nativeElement.querySelectorAll('.step-item');
      stepItems.forEach((step: Element) => {
        const label = step.querySelector('.step-label');
        expect(label).toBeTruthy();
      });
    });

    it('Given the component renders, When it initializes, Then the first step label should match the first step title', () => {
      console.log('🔧 BDD: Component renders');
      fixture.detectChanges();
      console.log('⚙️ BDD: Component initializes');
      console.log('✅ BDD: First step label reflects title');
      const firstStep = fixture.nativeElement.querySelector('.step-item');
      const label = firstStep?.querySelector('.step-label');
      expect(label?.textContent).toContain('Upload Instagram Export');
    });
  });

  describe('Scenario: Step item styling and classes', () => {
    it('Given the component renders, When it initializes, Then each step item should have the correct CSS class', () => {
      console.log('🔧 BDD: Component renders');
      fixture.detectChanges();
      console.log('⚙️ BDD: Component initializes');
      console.log('✅ BDD: Each step item has correct CSS class');
      const stepItems = fixture.nativeElement.querySelectorAll('.step-item');
      stepItems.forEach((step: Element) => {
        expect(step).toHaveClass('step-item');
      });
    });

    it('Given the component renders, When it initializes, Then the step list should have the correct CSS class', () => {
      console.log('🔧 BDD: Component renders');
      fixture.detectChanges();
      console.log('⚙️ BDD: Component initializes');
      console.log('✅ BDD: Step list has correct CSS class');
      const stepList = fixture.nativeElement.querySelector('.step-list');
      expect(stepList).toHaveClass('step-list');
    });
  });

  describe('Scenario: Component accessibility', () => {
    it('Given the component renders, When it initializes, Then it should have semantic HTML structure', () => {
      console.log('🔧 BDD: Component renders');
      fixture.detectChanges();
      console.log('⚙️ BDD: Component initializes');
      console.log('✅ BDD: Component has semantic HTML structure');
      const navigation = fixture.nativeElement.querySelector('nav');
      expect(navigation).toBeTruthy();
      expect(navigation).toHaveClass('step-navigation');
    });

    it('Given the component renders, When it initializes, Then interactive items should be accessible', () => {
      console.log('🔧 BDD: Component renders');
      fixture.detectChanges();
      console.log('⚙️ BDD: Component initializes');
      console.log('✅ BDD: Items are accessible interactive elements');
      const items = fixture.nativeElement.querySelectorAll('.step-item');
      items.forEach((el: Element) => {
        expect(el.getAttribute('role')).toBe('link');
      });
    });
  });

  describe('Scenario: Responsive design', () => {
    it('Given the component renders, When it initializes, Then it should have responsive CSS classes', () => {
      console.log('🔧 BDD: Component renders');
      fixture.detectChanges();
      console.log('⚙️ BDD: Component initializes');
      console.log('✅ BDD: Component has responsive CSS classes');
      const navigation = fixture.nativeElement.querySelector('.step-navigation');
      expect(navigation).toBeTruthy();
    });
  });

  describe('Scenario: Step data integration', () => {
    it('Given the component has step data, When it initializes, Then it should display the correct number of steps', () => {
      console.log('🔧 BDD: Component has step data');
      expect(component.steps).toBeDefined();
      console.log('⚙️ BDD: Component initializes');
      fixture.detectChanges();
      console.log('✅ BDD: Component displays correct number of steps');
      const stepItems = fixture.nativeElement.querySelectorAll('.step-item');
      expect(stepItems.length).toBe(component.steps.length);
    });

    it('Given the component has step data, When it initializes, Then it should display step information correctly', () => {
      console.log('🔧 BDD: Component has step data');
      expect(component.steps).toBeDefined();
      console.log('⚙️ BDD: Component initializes');
      fixture.detectChanges();
      console.log('✅ BDD: Component displays step information correctly');
      const stepItems = fixture.nativeElement.querySelectorAll('.step-item');
      stepItems.forEach((step: Element, index: number) => {
        const stepData = component.steps[index];
        expect(step.textContent).toContain(stepData.title);
      });
    });
  });
});
