import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreflightSummary } from './preflight-summary';

describe('PreflightSummary', () => {
  let component: PreflightSummary;
  let fixture: ComponentFixture<PreflightSummary>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PreflightSummary]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PreflightSummary);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
