import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { of, Subject } from 'rxjs';
import { By } from '@angular/platform-browser';
import { StepHeader } from './step-header';

/**
 * Unit Tests for StepHeader Component
 * 
 * These are basic unit tests focused on individual methods and component behavior.
 * For comprehensive BDD-style integration tests, see step-header-bdd.component.spec.ts
 */
describe('StepHeader Component Unit Tests', () => {
  let component: StepHeader;
  let fixture: ComponentFixture<StepHeader>;
  let mockActivatedRoute: jasmine.SpyObj<ActivatedRoute>;
  let mockRouter: jasmine.SpyObj<Router>;
  let routerEventsSubject: Subject<any>;

  beforeEach(async () => {
    routerEventsSubject = new Subject();
    
    const activatedRouteSpy = jasmine.createSpyObj('ActivatedRoute', [], {
      snapshot: {
        title: 'Test Title',
        data: { description: 'Test Description' }
      },
      firstChild: null
    });

    const routerSpy = jasmine.createSpyObj('Router', [], {
      events: routerEventsSubject.asObservable()
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

  describe('Component Initialization', () => {
    it('should create component successfully', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize observables on ngOnInit', () => {
      component.ngOnInit();
      
      expect(component.title$).toBeDefined();
      expect(component.description$).toBeDefined();
    });

    it('should have correct selector and host class', () => {
      const hostElement = fixture.debugElement.nativeElement;
      fixture.detectChanges();
      
      expect(hostElement.classList.contains('step-header')).toBe(true);
    });
  });

  describe('Route Data Extraction', () => {
    xit('should extract title from route snapshot', () => {
      mockActivatedRoute.snapshot = {
        title: 'Unit Test Title',
        data: { description: 'Unit Test Description' }
      } as any;

      component.ngOnInit();
      fixture.detectChanges();

      component.title$.subscribe(title => {
        expect(title).toBe('Unit Test Title');
      });
    });

    xit('should extract description from route data', () => {
      mockActivatedRoute.snapshot = {
        title: 'Unit Test Title',
        data: { description: 'Unit Test Description' }
      } as any;

      component.ngOnInit();
      fixture.detectChanges();

      component.description$.subscribe(description => {
        expect(description).toBe('Unit Test Description');
      });
    });

    xit('should handle missing title gracefully', () => {
      mockActivatedRoute.snapshot = {
        title: null,
        data: { description: 'Description Only' }
      } as any;

      component.ngOnInit();
      fixture.detectChanges();

      component.title$.subscribe(title => {
        expect(title).toBe('');
      });
    });

    xit('should handle missing description gracefully', () => {
      mockActivatedRoute.snapshot = {
        title: 'Title Only',
        data: {}
      } as any;

      component.ngOnInit();
      fixture.detectChanges();

      component.description$.subscribe(description => {
        expect(description).toBe('');
      });
    });

    xit('should handle null data object gracefully', () => {
      mockActivatedRoute.snapshot = {
        title: 'Title Only',
        data: null
      } as any;

      component.ngOnInit();
      fixture.detectChanges();

      component.description$.subscribe(description => {
        expect(description).toBe('');
      });
    });
  });

  describe('Nested Route Handling', () => {
    it('should get data from deepest child route when nested routes exist', () => {
      const childRoute = jasmine.createSpyObj('ActivatedRoute', [], {
        snapshot: {
          title: 'Child Title',
          data: { description: 'Child Description' }
        },
        firstChild: null
      });

      Object.defineProperty(mockActivatedRoute, 'firstChild', {
        value: childRoute,
        writable: true,
        configurable: true
      });
      mockActivatedRoute.snapshot = {
        title: 'Parent Title',
        data: { description: 'Parent Description' }
      } as any;

      component.ngOnInit();
      fixture.detectChanges();

      component.title$.subscribe(title => {
        expect(title).toBe('Child Title');
      });

      component.description$.subscribe(description => {
        expect(description).toBe('Child Description');
      });
    });

    it('should traverse multiple levels of nested routes', () => {
      const deepestChild = jasmine.createSpyObj('ActivatedRoute', [], {
        snapshot: {
          title: 'Deepest Title',
          data: { description: 'Deepest Description' }
        },
        firstChild: null
      });

      const middleChild = jasmine.createSpyObj('ActivatedRoute', [], {
        snapshot: {
          title: 'Middle Title',
          data: { description: 'Middle Description' }
        },
        firstChild: deepestChild
      });

      Object.defineProperty(mockActivatedRoute, 'firstChild', {
        value: middleChild,
        writable: true,
        configurable: true
      });

      component.ngOnInit();
      fixture.detectChanges();

      component.title$.subscribe(title => {
        expect(title).toBe('Deepest Title');
      });

      component.description$.subscribe(description => {
        expect(description).toBe('Deepest Description');
      });
    });
  });

  describe('Router Events Handling', () => {
    xit('should update observables when NavigationEnd event fires', () => {
      component.ngOnInit();
      fixture.detectChanges();

      mockActivatedRoute.snapshot = {
        title: 'Updated Title',
        data: { description: 'Updated Description' }
      } as any;

      routerEventsSubject.next(new NavigationEnd(1, '/test', '/test'));
      fixture.detectChanges();

      component.title$.subscribe(title => {
        expect(title).toBe('Updated Title');
      });

      component.description$.subscribe(description => {
        expect(description).toBe('Updated Description');
      });
    });

    xit('should filter out non-NavigationEnd events', () => {
      component.ngOnInit();
      fixture.detectChanges();

      const initialTitle = 'Initial Title';
      mockActivatedRoute.snapshot = {
        title: initialTitle,
        data: { description: 'Initial Description' }
      } as any;

      // Send non-NavigationEnd event
      routerEventsSubject.next({ type: 'SomeOtherEvent' });
      fixture.detectChanges();

      component.title$.subscribe(title => {
        expect(title).toBe(initialTitle);
      });
    });
  });

  describe('Template Rendering', () => {
    xit('should render title and description in correct elements', () => {
      mockActivatedRoute.snapshot = {
        title: 'Rendered Title',
        data: { description: 'Rendered Description' }
      } as any;

      component.ngOnInit();
      fixture.detectChanges();

      const titleElement = fixture.debugElement.query(By.css('.step-title'));
      const descriptionElement = fixture.debugElement.query(By.css('.step-description'));

      expect(titleElement.nativeElement.textContent.trim()).toBe('Rendered Title');
      expect(descriptionElement.nativeElement.textContent.trim()).toBe('Rendered Description');
    });

    xit('should use async pipe correctly for observables', () => {
      mockActivatedRoute.snapshot = {
        title: 'Async Title',
        data: { description: 'Async Description' }
      } as any;

      component.ngOnInit();
      fixture.detectChanges();

      // The async pipe should handle the observable subscription
      const compiled = fixture.nativeElement;
      expect(compiled.querySelector('.step-title').textContent).toContain('Async Title');
      expect(compiled.querySelector('.step-description').textContent).toContain('Async Description');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle undefined route snapshot gracefully', () => {
      mockActivatedRoute.snapshot = undefined as any;

      expect(() => {
        component.ngOnInit();
        fixture.detectChanges();
      }).not.toThrow();
    });

    xit('should handle route with undefined title and data properties', () => {
      mockActivatedRoute.snapshot = {
        title: undefined,
        data: undefined
      } as any;

      component.ngOnInit();
      fixture.detectChanges();

      component.title$.subscribe(title => {
        expect(title).toBe('');
      });

      component.description$.subscribe(description => {
        expect(description).toBe('');
      });
    });

    xit('should handle empty string values correctly', () => {
      mockActivatedRoute.snapshot = {
        title: '',
        data: { description: '' }
      } as any;

      component.ngOnInit();
      fixture.detectChanges();

      component.title$.subscribe(title => {
        expect(title).toBe('');
      });

      component.description$.subscribe(description => {
        expect(description).toBe('');
      });
    });
  });
});