import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Migrate } from './migrate';
import { FILE_PROCESSOR, LOGGER } from '../../services';
import type { FileService } from '../../services/interfaces/file';
import type { Logger } from '../../services/interfaces/logger';

describe('Migrate', () => {
  let component: Migrate;
  let fixture: ComponentFixture<Migrate>;

  beforeEach(async () => {
    const fileProcessorMock: FileService = {
      archivedFile: null,
      validateArchive: () =>
        Promise.resolve({
          isValid: true,
          errors: [],
          warnings: [],
          timestamp: new Date(),
        }),
      extractArchive: () => Promise.resolve(true),
    };

    const loggerMock: jasmine.SpyObj<Logger> = jasmine.createSpyObj('Logger', [
      'log',
      'error',
      'warn',
      'workflow',
      'instrument',
    ]);
    loggerMock.instrument.and.returnValue(Promise.resolve());

    await TestBed.configureTestingModule({
      imports: [Migrate],
      providers: [
        { provide: FILE_PROCESSOR, useValue: fileProcessorMock },
        { provide: LOGGER, useValue: loggerMock },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(Migrate);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
