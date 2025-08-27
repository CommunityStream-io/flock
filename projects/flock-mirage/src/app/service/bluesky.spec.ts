import { TestBed } from '@angular/core/testing';

import { Bluesky } from './bluesky';

describe('Bluesky', () => {
  let service: Bluesky;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Bluesky);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
