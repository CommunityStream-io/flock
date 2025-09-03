import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { StartButton } from './start-button';

describe('StartButton', () => {
  let component: StartButton;
  let fixture: ComponentFixture<StartButton>;
  let mockActivatedRoute: jasmine.SpyObj<ActivatedRoute>;

  beforeEach(async () => {
    mockActivatedRoute = jasmine.createSpyObj('ActivatedRoute', [], {
      snapshot: { url: [] }
    });

    await TestBed.configureTestingModule({
      imports: [StartButton],
      providers: [
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StartButton);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
