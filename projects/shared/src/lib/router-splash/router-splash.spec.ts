import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RouterSplash } from './router-splash';
import { LOGGER, Logger } from '../services';

describe('RouterSplash', () => {
  let component: RouterSplash;
  let fixture: ComponentFixture<RouterSplash>;
  let mockLogger: jasmine.SpyObj<Logger>;

  beforeEach(async () => {
    mockLogger = jasmine.createSpyObj('Logger', ['log', 'error', 'warn', 'workflow', 'instrument']);

    await TestBed.configureTestingModule({
      imports: [RouterSplash],
      providers: [
        { provide: LOGGER, useValue: mockLogger }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RouterSplash);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
