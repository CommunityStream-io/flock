import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';
import { LOGGER, Logger } from '../../services';

import { loggerInstrumentationResolver } from './logger-instrumentation-resolver';

describe('loggerInstrumentationResolver', () => {
  const executeResolver: ResolveFn<Promise<void>> = (...resolverParameters) =>
    TestBed.runInInjectionContext(() => loggerInstrumentationResolver(...resolverParameters));

  let mockLogger: jasmine.SpyObj<Logger>;

  beforeEach(() => {
    mockLogger = jasmine.createSpyObj('Logger', ['instrument']);
    mockLogger.instrument.and.returnValue(Promise.resolve());

    TestBed.configureTestingModule({
      providers: [{ provide: LOGGER, useValue: mockLogger }]
    });
  });

  it('returns a promise and calls instrument with AppName', async () => {
    const result = executeResolver({} as any, {} as any);
    expect(result).toBeTruthy();
    await result;
    expect(mockLogger.instrument).toHaveBeenCalledWith('AppName');
  });
});
