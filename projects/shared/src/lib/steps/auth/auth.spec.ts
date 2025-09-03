import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { Auth } from './auth';
import { LOGGER, Bluesky, ConfigServiceImpl, Logger } from '../../services';

describe('Auth', () => {
  let component: Auth;
  let fixture: ComponentFixture<Auth>;

  const mockLogger: Logger = {
    log: jasmine.createSpy('log'),
    error: jasmine.createSpy('error'),
    warn: jasmine.createSpy('warn'),
    workflow: jasmine.createSpy('workflow'),
    instrument: jasmine.createSpy('instrument').and.returnValue(Promise.resolve())
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Auth, NoopAnimationsModule],
      providers: [
        { provide: LOGGER, useValue: mockLogger },
        { provide: Bluesky, useClass: Bluesky },
        { provide: ConfigServiceImpl, useClass: ConfigServiceImpl },
        { provide: Router, useValue: { navigate: jasmine.createSpy('navigate') } },
        { provide: MatDialog, useValue: { open: jasmine.createSpy('open') } }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Auth);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
