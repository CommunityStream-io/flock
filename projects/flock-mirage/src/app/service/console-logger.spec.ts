import { TestBed } from '@angular/core/testing';

import { ConsoleLogger } from './console-logger';

describe('ConsoleLogger', () => {
  let service: ConsoleLogger;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConsoleLogger);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
