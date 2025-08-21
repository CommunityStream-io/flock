import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StepLayout } from './step-layout';

describe('StepLayout', () => {
  let component: StepLayout;
  let fixture: ComponentFixture<StepLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StepLayout]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StepLayout);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
