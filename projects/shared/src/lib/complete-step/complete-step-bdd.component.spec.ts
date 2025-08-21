import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CompleteStepComponent } from './complete-step';
import { StepNavigationComponent } from '../step-navigation/step-navigation';

describe('Feature: Complete Step', () => {
  let component: CompleteStepComponent;
  let fixture: ComponentFixture<CompleteStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompleteStepComponent, CommonModule, RouterModule.forRoot([]), StepNavigationComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(CompleteStepComponent);
    component = fixture.componentInstance;
  });

  describe('Scenario: Summary display', () => {
    it('Given the component renders, When it initializes, Then it should show the summary card', () => {
      console.log('🔧 BDD: Complete step component created');
      fixture.detectChanges();
      console.log('⚙️ BDD: Component initializes');
      expect(component).toBeTruthy();
      expect(fixture.nativeElement.querySelector('.complete-step')).toBeTruthy();
      console.log('✅ BDD: Summary card is visible');
    });
  });
});

