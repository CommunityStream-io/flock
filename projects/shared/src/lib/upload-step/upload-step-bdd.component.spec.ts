import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { UploadStepComponent } from './upload-step';
import { StepNavigationComponent } from '../step-navigation/step-navigation';

describe('Feature: Upload Step', () => {
  let component: UploadStepComponent;
  let fixture: ComponentFixture<UploadStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UploadStepComponent, CommonModule, ReactiveFormsModule, RouterModule.forRoot([]), StepNavigationComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(UploadStepComponent);
    component = fixture.componentInstance;
  });

  describe('Scenario: Component initialization', () => {
    it('Given the component is created, When it initializes, Then it should render the upload form', () => {
      console.log('🔧 BDD: Upload step component is created');
      console.log('⚙️ BDD: Component initializes');
      fixture.detectChanges();
      console.log('✅ BDD: Upload step form renders');
      expect(fixture.nativeElement.querySelector('.upload-step')).toBeTruthy();
    });
  });

  describe('Scenario: File field validation', () => {
    it('Given no file selected, When validating, Then the form should be invalid', () => {
      console.log('🔧 BDD: No file selected');
      fixture.detectChanges();
      console.log('⚙️ BDD: Validate form');
      expect(component.form.invalid).toBeTrue();
      console.log('✅ BDD: Form is invalid as expected');
    });
  });
});

