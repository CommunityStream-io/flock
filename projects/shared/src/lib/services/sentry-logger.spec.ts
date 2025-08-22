import { TestBed } from '@angular/core/testing';

import { SentryLogger } from './sentry-logger';

describe('SentryLogger', () => {
  let service: SentryLogger;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SentryLogger);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
