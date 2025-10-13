import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SplashScreen } from './splash-screen';
import { LOGGER, Logger } from '../services';
import { skip, take } from 'rxjs';

describe('SplashScreen', () => {
  let component: SplashScreen;
  let fixture: ComponentFixture<SplashScreen>;
  let loggerSpy: jasmine.SpyObj<Logger>;

  beforeEach(async () => {
    loggerSpy = jasmine.createSpyObj('Logger', [
      'log',
      'error',
      'warn',
      'workflow',
    ]);

    await TestBed.configureTestingModule({
      imports: [SplashScreen],
      providers: [
        {
          provide: LOGGER,
          useValue: loggerSpy,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SplashScreen);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should log when component observable emits', (done) => {
    loggerSpy.log.calls.reset();

    // Skip the initial BehaviorSubject emission and take only the next one
    component.component.pipe(skip(1), take(1)).subscribe(() => {
      expect(loggerSpy.log).toHaveBeenCalledWith(
        jasmine.stringMatching(/\[SplashScreen\] Component changed to:/)
      );
      done();
    });

    // Trigger the observable by setting a component
    component.splashScreenLoading.component.next(null);
  });

  it('should log "null" when component is null', (done) => {
    loggerSpy.log.calls.reset();

    // Skip the initial BehaviorSubject emission and take only the next one
    component.component.pipe(skip(1), take(1)).subscribe(() => {
      expect(loggerSpy.log).toHaveBeenCalledWith(
        '[SplashScreen] Component changed to: null'
      );
      done();
    });

    component.splashScreenLoading.component.next(null);
  });

  it('should log component name when component is provided', (done) => {
    loggerSpy.log.calls.reset();

    // Define a named class for testing
    class TestComponent {}

    // Skip the initial BehaviorSubject emission and take only the next one
    component.component.pipe(skip(1), take(1)).subscribe(() => {
      expect(loggerSpy.log).toHaveBeenCalledWith(
        '[SplashScreen] Component changed to: TestComponent'
      );
      done();
    });

    component.splashScreenLoading.component.next(TestComponent as any);
  });
});
