import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgressPanel } from './progress-panel';
import { LOGGER } from '../../../services';
import type { Logger } from '../../../services/interfaces/logger';
import { Migration } from '../../../services/migration';

describe('ProgressPanel', () => {
  let component: ProgressPanel;
  let fixture: ComponentFixture<ProgressPanel>;

  beforeEach(async () => {
    const loggerMock: jasmine.SpyObj<Logger> = jasmine.createSpyObj('Logger', [
      'log',
      'error',
      'warn',
      'workflow',
      'instrument',
    ]);
    loggerMock.instrument.and.returnValue(Promise.resolve());

    await TestBed.configureTestingModule({
      imports: [ProgressPanel],
      providers: [
        { provide: LOGGER, useValue: loggerMock },
        Migration,
      ]
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
