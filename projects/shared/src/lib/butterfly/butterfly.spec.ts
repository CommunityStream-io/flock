import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Butterfly } from './butterfly';

describe('Feature: Butterfly Animation Component', () => {
  let component: Butterfly;
  let fixture: ComponentFixture<Butterfly>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Butterfly]
    }).compileComponents();

    fixture = TestBed.createComponent(Butterfly);
    component = fixture.componentInstance;
  });

  describe('Scenario: Butterfly component initialization', () => {
    it('Given the butterfly component is created, When it initializes, Then it should render successfully', () => {
      // Given: Butterfly component is created
      console.log('🔧 BDD: Butterfly component is created');
      
      // When: Component initializes
      console.log('⚙️ BDD: Component initializes');
      fixture.detectChanges();
      
      // Then: Should render successfully
      console.log('✅ BDD: Butterfly component renders successfully');
      expect(component).toBeTruthy();
      expect(fixture.nativeElement).toBeTruthy();
    });

    it('Given the butterfly renders, When it initializes, Then it should display the butterfly container', () => {
      // Given: Butterfly renders
      console.log('🔧 BDD: Butterfly renders');
      fixture.detectChanges();
      
      // When: Component initializes
      console.log('⚙️ BDD: Component initializes');
      const compiled = fixture.nativeElement as HTMLElement;
      const container = compiled.querySelector('.butterfly-container');
      
      // Then: Should display the butterfly container
      console.log('✅ BDD: Butterfly displays container');
      expect(container).toBeTruthy();
    });

    it('Given the butterfly renders, When it initializes, Then it should have two wings', () => {
      // Given: Butterfly renders
      console.log('🔧 BDD: Butterfly renders');
      fixture.detectChanges();
      
      // When: Component initializes
      console.log('⚙️ BDD: Component initializes');
      const compiled = fixture.nativeElement as HTMLElement;
      const wings = compiled.querySelectorAll('.wing');
      
      // Then: Should have two wings
      console.log('✅ BDD: Butterfly has two wings');
      expect(wings.length).toBe(2);
    });

    it('Given the butterfly renders, When it initializes, Then it should have a shadow element', () => {
      // Given: Butterfly renders
      console.log('🔧 BDD: Butterfly renders');
      fixture.detectChanges();
      
      // When: Component initializes
      console.log('⚙️ BDD: Component initializes');
      const compiled = fixture.nativeElement as HTMLElement;
      const shadow = compiled.querySelector('.shadow');
      
      // Then: Should have a shadow element
      console.log('✅ BDD: Butterfly has shadow element');
      expect(shadow).toBeTruthy();
    });

    it('Given the butterfly renders, When it initializes, Then each wing should have two bits', () => {
      // Given: Butterfly renders
      console.log('🔧 BDD: Butterfly renders');
      fixture.detectChanges();
      
      // When: Component initializes
      console.log('⚙️ BDD: Component initializes');
      const compiled = fixture.nativeElement as HTMLElement;
      const wings = compiled.querySelectorAll('.wing');
      
      // Then: Each wing should have two bits
      console.log('✅ BDD: Each wing has two bits');
      wings.forEach((wing, index) => {
        const bits = wing.querySelectorAll('.bit');
        expect(bits.length).toBe(2, `Wing ${index + 1} should have 2 bits`);
      });
    });
  });
});

