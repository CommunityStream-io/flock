import { TestBed } from '@angular/core/testing';
import { CanDeactivateFn } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FILE_PROCESSOR } from '../../services';
import { FileService } from '../../services/interfaces/file';

import { uploadValidGuard } from './upload-valid-guard';

describe('uploadValidGuard', () => {
  const executeGuard: CanDeactivateFn<unknown> = (...guardParameters) =>
    TestBed.runInInjectionContext(() => uploadValidGuard(...guardParameters));

  let mockFileService: FileService;
  let mockSnack: jasmine.SpyObj<MatSnackBar>;

  beforeEach(() => {
    mockFileService = {
      archivedFile: null,
      validateArchive: jasmine.createSpy('validateArchive') as any,
      extractArchive: jasmine.createSpy('extractArchive') as any
    } as unknown as FileService;
    mockSnack = jasmine.createSpyObj('MatSnackBar', ['open']);

    TestBed.configureTestingModule({
      providers: [
        { provide: FILE_PROCESSOR, useValue: mockFileService },
        { provide: MatSnackBar, useValue: mockSnack }
      ]
    });
  });

  it('blocks and notifies when no archived file present', () => {
    mockFileService.archivedFile = null as any;
    const result = executeGuard({} as any, {} as any, {} as any, {} as any);
    expect(result).toBeFalse();
    expect(mockSnack.open).toHaveBeenCalledWith('Please upload a valid archive', 'Close', { duration: 3000 });
  });

  it('allows when archived file is present', () => {
    mockFileService.archivedFile = {} as any; // any truthy value
    const result = executeGuard({} as any, {} as any, {} as any, {} as any);
    expect(result).toBeTrue();
    expect(mockSnack.open).not.toHaveBeenCalled();
  });
});
