import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { extractArchiveResolver } from './extract-archive-resolver';

describe('extractArchiveResolver', () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) => 
      TestBed.runInInjectionContext(() => extractArchiveResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
