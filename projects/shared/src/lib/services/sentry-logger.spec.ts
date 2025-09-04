import { TestBed } from '@angular/core/testing';
import { SentryLogger } from './sentry-logger';

describe('Feature: SentryLogger (BDD-Style)', () => {
  let service: SentryLogger;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SentryLogger);
  });

  it('Given service, When created, Then is truthy', () => {
    expect(service).toBeTruthy();
  });

  it('Given service, When instrument is called, Then it throws', () => {
    const call = () => service.instrument('App');
    expect(call).toThrowError('Method not implemented.');
  });

  it('Given service, When log/error/warn/workflow are called, Then no errors are thrown', () => {
    expect(() => service.log('m')).not.toThrow();
    expect(() => service.error('m')).not.toThrow();
    expect(() => service.warn('m')).not.toThrow();
    expect(() => service.workflow('m')).not.toThrow();
  });
});
