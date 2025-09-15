import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { FileProcessor } from './file-processor';

describe('FileProcessor', () => {
  let service: FileProcessor;
  let mockActivatedRoute: jasmine.SpyObj<ActivatedRoute>;

  beforeEach(() => {
    mockActivatedRoute = jasmine.createSpyObj('ActivatedRoute', [], {
      snapshot: {
        queryParams: {}
      }
    });

    TestBed.configureTestingModule({
      providers: [
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    });
    service = TestBed.inject(FileProcessor);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
