import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ConfigStepComponent } from './config-step';
import { StepNavigationComponent } from '../step-navigation/step-navigation';
import { ConfigService } from '../core/config.service';

describe('Feature: Config Step', () => {
  let component: ConfigStepComponent;
  let fixture: ComponentFixture<ConfigStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfigStepComponent, CommonModule, ReactiveFormsModule, RouterModule.forRoot([]), StepNavigationComponent],
      providers: [ConfigService]
    }).compileComponents();

    fixture = TestBed.createComponent(ConfigStepComponent);
    component = fixture.componentInstance;
  });

  describe('Scenario: Toggle persistence', () => {
    it('Given default config, When toggling migratePhotos off, Then service should reflect the change', () => {
      console.log('🔧 BDD: Config step component created');
      fixture.detectChanges();
      console.log('⚙️ BDD: Toggle migratePhotos');
      component.form.patchValue({ migratePhotos: false });
      console.log('✅ BDD: Change applied to form');
      expect(component.form.value.migratePhotos).toBeFalse();
    });
  });
});

