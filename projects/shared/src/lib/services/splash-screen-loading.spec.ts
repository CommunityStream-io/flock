import { TestBed } from '@angular/core/testing';

import { SplashScreenLoading } from './splash-screen-loading';

describe('SplashScreenLoading', () => {
  let service: SplashScreenLoading;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SplashScreenLoading);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
