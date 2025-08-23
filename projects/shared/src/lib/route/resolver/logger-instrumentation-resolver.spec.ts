import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { loggerInstrumentationResolver } from './logger-instrumentation-resolver';

describe('loggerInstrumentationResolver', () => {
  const executeResolver: ResolveFn<Promise<void>> = (...resolverParameters) => 
      TestBed.runInInjectionContext(() => loggerInstrumentationResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
