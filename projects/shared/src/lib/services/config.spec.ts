import { TestBed } from '@angular/core/testing';

import { ConfigServiceImpl } from './config';

describe('Config', () => {
  let service: ConfigServiceImpl;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConfigServiceImpl);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
