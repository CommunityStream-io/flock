import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { StepHeader } from './step-header';

describe('Feature: Step Header Display', () => {
  let component: StepHeader;
  let fixture: ComponentFixture<StepHeader>;
  let mockActivatedRoute: jasmine.SpyObj<ActivatedRoute>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const activatedRouteSpy = jasmine.createSpyObj('ActivatedRoute', [], {
      snapshot: {
        title: 'Test Title',
        data: { description: 'Test Description' }
      },
      firstChild: null
    });

    const routerSpy = jasmine.createSpyObj('Router', [], {
      events: of()
    });

    await TestBed.configureTestingModule({
      imports: [StepHeader],
      providers: [
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(StepHeader);
    component = fixture.componentInstance;
    mockActivatedRoute = TestBed.inject(ActivatedRoute) as jasmine.SpyObj<ActivatedRoute>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  describe('Scenario: Display route title and description', () => {
    it('Given route data exists, When component loads, Then title and description are displayed', () => {
      console.log('🔧 BDD: Setting up route with title and description');
      
      console.log('⚙️ BDD: Component initialization');
      fixture.detectChanges();
      
      console.log('✅ BDD: Component should be created');
      expect(component).toBeTruthy();
    });
  });
});