import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { LOGGER, Logger, SplashScreenLoading, RouterLoggingService } from 'shared';
import { BehaviorSubject } from 'rxjs';
import { provideRouter } from '@angular/router';

describe('App', () => {
  let mockLogger: jasmine.SpyObj<Logger>;

  beforeEach(async () => {
    mockLogger = jasmine.createSpyObj('Logger', ['instrument', 'log', 'error', 'warn', 'workflow']);

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        { provide: LOGGER, useValue: mockLogger },
        { 
          provide: SplashScreenLoading, 
          useValue: { 
            isLoading: new BehaviorSubject(false),
            message: new BehaviorSubject('*flap* *flap* *flap*'),
            show: jasmine.createSpy('show'),
            hide: jasmine.createSpy('hide')
          } 
        },
        RouterLoggingService
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render title', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app.title).toBe('flock-mirage');
  });
});
