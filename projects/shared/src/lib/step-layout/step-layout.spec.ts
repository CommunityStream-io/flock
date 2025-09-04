import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { StepLayout } from './step-layout';
import { LOGGER, Logger } from '../services';

describe('StepLayout', () => {
  let component: StepLayout;
  let fixture: ComponentFixture<StepLayout>;
  let mockLogger: jasmine.SpyObj<Logger>;
  let mockActivatedRoute: jasmine.SpyObj<ActivatedRoute>;

  beforeEach(async () => {
    mockLogger = jasmine.createSpyObj('Logger', ['log', 'error', 'warn', 'workflow', 'instrument']);
    mockActivatedRoute = jasmine.createSpyObj('ActivatedRoute', [], {
      snapshot: { url: [] }
    });

    await TestBed.configureTestingModule({
      imports: [StepLayout],
      providers: [
        { provide: LOGGER, useValue: mockLogger },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
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
