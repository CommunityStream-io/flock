import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';
import { LOGGER } from 'shared';

describe('App', () => {
  const mockLogger = {
    log: jasmine.createSpy('log'),
    error: jasmine.createSpy('error'),
    warn: jasmine.createSpy('warn'),
    workflow: jasmine.createSpy('workflow'),
    instrument: jasmine.createSpy('instrument').and.returnValue(Promise.resolve()),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        { provide: LOGGER, useValue: mockLogger }
      ]
    }).compileComponents();
  });

  xit('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  xit('should render the shared layout', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('shared-layout')).toBeTruthy();
  });
});
