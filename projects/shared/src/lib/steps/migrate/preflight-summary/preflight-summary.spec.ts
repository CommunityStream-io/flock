import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreflightSummary } from './preflight-summary';
import { FILE_PROCESSOR } from '../../../services';
import type { FileService } from '../../../services/interfaces/file';
import { ConfigServiceImpl } from '../../../services/config';

describe('PreflightSummary', () => {
  let component: PreflightSummary;
  let fixture: ComponentFixture<PreflightSummary>;

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

    const config = new ConfigServiceImpl();
    config.setArchivePath('C:/tmp/archive.zip');
    config.setBlueskyCredentials({ username: 'alice', password: 'x' } as any);
    config.setSimulate(true);
    config.setStartDate('2024-01-01');
    config.setEndDate('2024-12-31');

    await TestBed.configureTestingModule({
      imports: [PreflightSummary],
      providers: [
        { provide: FILE_PROCESSOR, useValue: fileProcessorMock },
        { provide: ConfigServiceImpl, useValue: config },
      ],
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
