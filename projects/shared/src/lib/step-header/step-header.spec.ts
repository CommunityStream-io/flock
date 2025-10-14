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
    it('should extract title from route snapshot', (done) => {
      // Update the mock before component initialization
      Object.defineProperty(mockActivatedRoute, 'snapshot', {
        value: {
          title: 'Unit Test Title',
          data: { description: 'Unit Test Description' }
        },
        writable: true,
        configurable: true
      });

      component.ngOnInit();
      
      component.title$.subscribe(title => {
        expect(title).toBe('Unit Test Title');
        done();
      });
    });

    it('should extract description from route data', (done) => {
      // Update the mock before component initialization
      Object.defineProperty(mockActivatedRoute, 'snapshot', {
        value: {
          title: 'Unit Test Title',
          data: { description: 'Unit Test Description' }
        },
        writable: true,
        configurable: true
      });

      component.ngOnInit();

      component.description$.subscribe(description => {
        expect(description).toBe('Unit Test Description');
        done();
      });
    });

    it('should handle missing title gracefully', (done) => {
      // Update the mock before component initialization
      Object.defineProperty(mockActivatedRoute, 'snapshot', {
        value: {
          title: null,
          data: { description: 'Description Only' }
        },
        writable: true,
        configurable: true
      });

      component.ngOnInit();

      component.title$.subscribe(title => {
        expect(title).toBe('');
        done();
      });
    });

    it('should handle missing description gracefully', (done) => {
      // Update the mock before component initialization
      Object.defineProperty(mockActivatedRoute, 'snapshot', {
        value: {
          title: 'Title Only',
          data: {}
        },
        writable: true,
        configurable: true
      });

      component.ngOnInit();

      component.description$.subscribe(description => {
        expect(description).toBe('');
        done();
      });
    });

    it('should handle null data object gracefully', (done) => {
      // Update the mock before component initialization
      Object.defineProperty(mockActivatedRoute, 'snapshot', {
        value: {
          title: 'Title Only',
          data: null
        },
        writable: true,
        configurable: true
      });

      component.ngOnInit();

      component.description$.subscribe(description => {
        expect(description).toBe('');
        done();
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
      Object.defineProperty(mockActivatedRoute, 'snapshot', {
        value: {
          title: 'Parent Title',
          data: { description: 'Parent Description' }
        },
        writable: true,
        configurable: true
      });

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
    it('should update observables when NavigationEnd event fires', (done) => {
      component.ngOnInit();
      
      // Skip the initial value and wait for the NavigationEnd event
      let emitCount = 0;
      component.title$.subscribe(title => {
        emitCount++;
        if (emitCount === 2) {
          expect(title).toBe('Updated Title');
          done();
        }
      });

      // Update the route snapshot and trigger navigation
      Object.defineProperty(mockActivatedRoute, 'snapshot', {
        value: {
          title: 'Updated Title',
          data: { description: 'Updated Description' }
        },
        writable: true,
        configurable: true
      });

      routerEventsSubject.next(new NavigationEnd(1, '/test', '/test'));
    });

    it('should filter out non-NavigationEnd events', (done) => {
      const initialTitle = 'Test Title';
      Object.defineProperty(mockActivatedRoute, 'snapshot', {
        value: {
          title: initialTitle,
          data: { description: 'Initial Description' }
        },
        writable: true,
        configurable: true
      });

      component.ngOnInit();

      let emitCount = 0;
      component.title$.subscribe(title => {
        emitCount++;
        expect(title).toBe(initialTitle);
        
        // Only one emission should occur (the initial startWith, no emission from the other event)
        if (emitCount === 1) {
          // Send non-NavigationEnd event
          routerEventsSubject.next({ type: 'SomeOtherEvent' });
          
          // Wait a bit and verify no additional emissions
          setTimeout(() => {
            expect(emitCount).toBe(1);
            done();
          }, 100);
        }
      });
    });
  });

  describe('Template Rendering', () => {
    it('should render title and description in correct elements', () => {
      Object.defineProperty(mockActivatedRoute, 'snapshot', {
        value: {
          title: 'Rendered Title',
          data: { description: 'Rendered Description' }
        },
        writable: true,
        configurable: true
      });

      component.ngOnInit();
      fixture.detectChanges();

      const titleElement = fixture.debugElement.query(By.css('.step-title'));
      const descriptionElement = fixture.debugElement.query(By.css('.step-description'));

      expect(titleElement.nativeElement.textContent.trim()).toBe('Rendered Title');
      expect(descriptionElement.nativeElement.textContent.trim()).toBe('Rendered Description');
    });

    it('should use async pipe correctly for observables', () => {
      Object.defineProperty(mockActivatedRoute, 'snapshot', {
        value: {
          title: 'Async Title',
          data: { description: 'Async Description' }
        },
        writable: true,
        configurable: true
      });

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
      Object.defineProperty(mockActivatedRoute, 'snapshot', {
        value: undefined,
        writable: true,
        configurable: true
      });

      expect(() => {
        component.ngOnInit();
        fixture.detectChanges();
      }).not.toThrow();
    });

    it('should handle route with undefined title and data properties', (done) => {
      Object.defineProperty(mockActivatedRoute, 'snapshot', {
        value: {
          title: undefined,
          data: undefined
        },
        writable: true,
        configurable: true
      });

      component.ngOnInit();

      let checkedTitle = false;
      let checkedDescription = false;

      component.title$.subscribe(title => {
        expect(title).toBe('');
        checkedTitle = true;
        if (checkedTitle && checkedDescription) done();
      });

      component.description$.subscribe(description => {
        expect(description).toBe('');
        checkedDescription = true;
        if (checkedTitle && checkedDescription) done();
      });
    });

    it('should handle empty string values correctly', (done) => {
      Object.defineProperty(mockActivatedRoute, 'snapshot', {
        value: {
          title: '',
          data: { description: '' }
        },
        writable: true,
        configurable: true
      });

      component.ngOnInit();

      let checkedTitle = false;
      let checkedDescription = false;

      component.title$.subscribe(title => {
        expect(title).toBe('');
        checkedTitle = true;
        if (checkedTitle && checkedDescription) done();
      });

      component.description$.subscribe(description => {
        expect(description).toBe('');
        checkedDescription = true;
        if (checkedTitle && checkedDescription) done();
      });
    });
  });
});