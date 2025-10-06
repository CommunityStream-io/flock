import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgressPanel } from './progress-panel';

describe('ProgressPanel', () => {
  let component: ProgressPanel;
  let fixture: ComponentFixture<ProgressPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProgressPanel]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProgressPanel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
