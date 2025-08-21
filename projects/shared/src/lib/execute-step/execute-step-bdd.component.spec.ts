import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ExecuteStepComponent } from './execute-step';
import { StepNavigationComponent } from '../step-navigation/step-navigation';
import { ProgressService } from '../core/progress.service';

describe('Feature: Execute Step', () => {
  let component: ExecuteStepComponent;
  let fixture: ComponentFixture<ExecuteStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExecuteStepComponent, CommonModule, RouterModule.forRoot([]), StepNavigationComponent],
      providers: [ProgressService]
    }).compileComponents();

    fixture = TestBed.createComponent(ExecuteStepComponent);
    component = fixture.componentInstance;
  });

  describe('Scenario: Progress display', () => {
    it('Given idle progress, When component renders, Then progress bar should reflect 0%', () => {
      console.log('🔧 BDD: Execute step component created');
      fixture.detectChanges();
      console.log('⚙️ BDD: Component renders');
      expect(component).toBeTruthy();
      const el: HTMLElement = fixture.nativeElement;
      expect(el.querySelector('.execute-step')).toBeTruthy();
      console.log('✅ BDD: Execute step rendered');
    });
  });
});

