import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { LOGGER, Logger, SplashScreenLoading } from 'shared';
import { of, BehaviorSubject } from 'rxjs';
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
        }
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
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Hello, flock-mirage');
  });
});
