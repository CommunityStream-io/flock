import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';
import { LOGGER, SplashScreenLoading, RouterLoggingService } from 'shared';
import { BehaviorSubject } from 'rxjs';

describe('App', () => {
  const mockLogger = {
    log: jasmine.createSpy('log'),
    error: jasmine.createSpy('error'),
    warn: jasmine.createSpy('warn'),
    workflow: jasmine.createSpy('workflow'),
    instrument: jasmine.createSpy('instrument').and.returnValue(Promise.resolve()),
  };

  const mockSplashScreen = {
    isLoading: new BehaviorSubject(false),
    message: new BehaviorSubject('Loading...'),
    show: jasmine.createSpy('show'),
    hide: jasmine.createSpy('hide')
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        { provide: LOGGER, useValue: mockLogger },
        { provide: SplashScreenLoading, useValue: mockSplashScreen },
        RouterLoggingService
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the shared layout', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('shared-layout')).toBeTruthy();
  });
});
