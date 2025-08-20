import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthStepComponent } from './auth-step';
import { StepNavigationComponent } from '../step-navigation/step-navigation';

describe('Feature: Auth Step', () => {
  let component: AuthStepComponent;
  let fixture: ComponentFixture<AuthStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthStepComponent, CommonModule, ReactiveFormsModule, RouterModule.forRoot([]), StepNavigationComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(AuthStepComponent);
    component = fixture.componentInstance;
  });

  describe('Scenario: Form initialization', () => {
    it('Given the component is created, When it initializes, Then required fields should be invalid when empty', () => {
      console.log('🔧 BDD: Auth step component created');
      fixture.detectChanges();
      console.log('⚙️ BDD: Validate form');
      expect(component.form.invalid).toBeTrue();
      console.log('✅ BDD: Form invalid as expected with empty fields');
    });
  });
});

