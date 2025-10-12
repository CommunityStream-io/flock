import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompletionSummary } from './completion-summary';

describe('CompletionSummary', () => {
  let component: CompletionSummary;
  let fixture: ComponentFixture<CompletionSummary>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompletionSummary]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompletionSummary);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
