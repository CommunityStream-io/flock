import { TestBed } from '@angular/core/testing';
import { CanDeactivateFn } from '@angular/router';

import { uploadValidGuard } from './upload-valid-guard';

describe('uploadValidGuard', () => {
  const executeGuard: CanDeactivateFn<unknown> = (...guardParameters) => 
      TestBed.runInInjectionContext(() => uploadValidGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
