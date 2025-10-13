import { TestBed } from '@angular/core/testing';
import { Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';
import { Subject } from 'rxjs';
import { RouterLoggingService } from './router-logging';
import { Logger } from './interfaces';
import { LOGGER } from './injection-tokens';

describe('RouterLoggingService', () => {
  let service: RouterLoggingService;
  let mockLogger: jasmine.SpyObj<Logger>;
  let mockRouter: { events: Subject<any> };

  beforeEach(() => {
    mockLogger = jasmine.createSpyObj('Logger', ['log', 'warn', 'error']);
    mockRouter = {
      events: new Subject()
    };

    TestBed.configureTestingModule({
      providers: [
        RouterLoggingService,
        { provide: LOGGER, useValue: mockLogger },
        { provide: Router, useValue: mockRouter }
      ]
    });

    service = TestBed.inject(RouterLoggingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Navigation Start', () => {
    it('should log navigation start events', () => {
      const event = new NavigationStart(1, '/test', 'imperative');
      
      mockRouter.events.next(event);

      expect(mockLogger.log).toHaveBeenCalledWith('🧭 ROUTER: Navigation started', {
        url: '/test',
        navigationId: 1,
        trigger: 'imperative',
        restoredState: null
      });
    });

    it('should log navigation start with restored state', () => {
      const restoredState = { navigationId: 0 };
      const event = new NavigationStart(2, '/back', 'popstate', restoredState);
      
      mockRouter.events.next(event);

      expect(mockLogger.log).toHaveBeenCalledWith('🧭 ROUTER: Navigation started', {
        url: '/back',
        navigationId: 2,
        trigger: 'popstate',
        restoredState
      });
    });

    it('should log multiple navigation start events', () => {
      const event1 = new NavigationStart(1, '/first', 'imperative');
      const event2 = new NavigationStart(2, '/second', 'imperative');
      
      mockRouter.events.next(event1);
      mockRouter.events.next(event2);

      expect(mockLogger.log).toHaveBeenCalledTimes(2);
      expect(mockLogger.log).toHaveBeenCalledWith('🧭 ROUTER: Navigation started', jasmine.objectContaining({
        url: '/first'
      }));
      expect(mockLogger.log).toHaveBeenCalledWith('🧭 ROUTER: Navigation started', jasmine.objectContaining({
        url: '/second'
      }));
    });
  });

  describe('Navigation End', () => {
    it('should log navigation end events', () => {
      const event = new NavigationEnd(1, '/test', '/test');
      
      mockRouter.events.next(event);

      expect(mockLogger.log).toHaveBeenCalledWith('✅ ROUTER: Navigation completed', {
        url: '/test',
        urlAfterRedirects: '/test',
        navigationId: 1
      });
    });

    it('should log navigation end with redirects', () => {
      const event = new NavigationEnd(2, '/old', '/new');
      
      mockRouter.events.next(event);

      expect(mockLogger.log).toHaveBeenCalledWith('✅ ROUTER: Navigation completed', {
        url: '/old',
        urlAfterRedirects: '/new',
        navigationId: 2
      });
    });

    it('should log multiple navigation end events', () => {
      const event1 = new NavigationEnd(1, '/first', '/first');
      const event2 = new NavigationEnd(2, '/second', '/second-redirect');
      
      mockRouter.events.next(event1);
      mockRouter.events.next(event2);

      expect(mockLogger.log).toHaveBeenCalledTimes(2);
    });
  });

  describe('Navigation Cancel', () => {
    it('should log navigation cancel events', () => {
      const event = new NavigationCancel(1, '/test', 'guard rejected');
      
      mockRouter.events.next(event);

      expect(mockLogger.warn).toHaveBeenCalledWith('⚠️ ROUTER: Navigation cancelled', {
        url: '/test',
        reason: 'guard rejected',
        navigationId: 1
      });
    });

    it('should log navigation cancel with empty reason', () => {
      const event = new NavigationCancel(2, '/blocked', '');
      
      mockRouter.events.next(event);

      expect(mockLogger.warn).toHaveBeenCalledWith('⚠️ ROUTER: Navigation cancelled', {
        url: '/blocked',
        reason: '',
        navigationId: 2
      });
    });

    it('should log multiple cancel events', () => {
      const event1 = new NavigationCancel(1, '/first', 'guard1');
      const event2 = new NavigationCancel(2, '/second', 'guard2');
      
      mockRouter.events.next(event1);
      mockRouter.events.next(event2);

      expect(mockLogger.warn).toHaveBeenCalledTimes(2);
    });
  });

  describe('Navigation Error', () => {
    it('should log navigation error events', () => {
      const error = new Error('Navigation failed');
      const event = new NavigationError(1, '/test', error);
      
      mockRouter.events.next(event);

      expect(mockLogger.error).toHaveBeenCalledWith('❌ ROUTER: Navigation error', {
        url: '/test',
        error: error,
        navigationId: 1
      });
    });

    it('should log navigation error with custom error object', () => {
      const error = { message: 'Custom error', code: 404 };
      const event = new NavigationError(2, '/missing', error);
      
      mockRouter.events.next(event);

      expect(mockLogger.error).toHaveBeenCalledWith('❌ ROUTER: Navigation error', {
        url: '/missing',
        error: error,
        navigationId: 2
      });
    });

    it('should log multiple error events', () => {
      const error1 = new Error('Error 1');
      const error2 = new Error('Error 2');
      const event1 = new NavigationError(1, '/first', error1);
      const event2 = new NavigationError(2, '/second', error2);
      
      mockRouter.events.next(event1);
      mockRouter.events.next(event2);

      expect(mockLogger.error).toHaveBeenCalledTimes(2);
    });
  });

  describe('Event filtering', () => {
    it('should not log non-navigation events', () => {
      const nonNavigationEvent = { type: 'SomeOtherEvent' };
      
      mockRouter.events.next(nonNavigationEvent);

      expect(mockLogger.log).not.toHaveBeenCalled();
      expect(mockLogger.warn).not.toHaveBeenCalled();
      expect(mockLogger.error).not.toHaveBeenCalled();
    });

    it('should filter and log only relevant navigation events', () => {
      const startEvent = new NavigationStart(1, '/start', 'imperative');
      const nonNavEvent = { type: 'CustomEvent' };
      const endEvent = new NavigationEnd(1, '/start', '/start');
      
      mockRouter.events.next(startEvent);
      mockRouter.events.next(nonNavEvent);
      mockRouter.events.next(endEvent);

      expect(mockLogger.log).toHaveBeenCalledTimes(2); // Start and End only
      expect(mockLogger.warn).not.toHaveBeenCalled();
      expect(mockLogger.error).not.toHaveBeenCalled();
    });
  });

  describe('Complete navigation lifecycle', () => {
    it('should log complete successful navigation', () => {
      const startEvent = new NavigationStart(1, '/page', 'imperative');
      const endEvent = new NavigationEnd(1, '/page', '/page');
      
      mockRouter.events.next(startEvent);
      mockRouter.events.next(endEvent);

      expect(mockLogger.log).toHaveBeenCalledTimes(2);
      expect(mockLogger.log).toHaveBeenCalledWith('🧭 ROUTER: Navigation started', jasmine.any(Object));
      expect(mockLogger.log).toHaveBeenCalledWith('✅ ROUTER: Navigation completed', jasmine.any(Object));
    });

    it('should log navigation that gets cancelled', () => {
      const startEvent = new NavigationStart(1, '/blocked', 'imperative');
      const cancelEvent = new NavigationCancel(1, '/blocked', 'guard');
      
      mockRouter.events.next(startEvent);
      mockRouter.events.next(cancelEvent);

      expect(mockLogger.log).toHaveBeenCalledWith('🧭 ROUTER: Navigation started', jasmine.any(Object));
      expect(mockLogger.warn).toHaveBeenCalledWith('⚠️ ROUTER: Navigation cancelled', jasmine.any(Object));
    });

    it('should log navigation that fails', () => {
      const startEvent = new NavigationStart(1, '/error', 'imperative');
      const errorEvent = new NavigationError(1, '/error', new Error('Failed'));
      
      mockRouter.events.next(startEvent);
      mockRouter.events.next(errorEvent);

      expect(mockLogger.log).toHaveBeenCalledWith('🧭 ROUTER: Navigation started', jasmine.any(Object));
      expect(mockLogger.error).toHaveBeenCalledWith('❌ ROUTER: Navigation error', jasmine.any(Object));
    });
  });

  describe('Subscription lifecycle', () => {
    it('should setup logging on service creation', () => {
      // Service is already created in beforeEach
      // Emit an event to verify subscriptions are active
      const event = new NavigationStart(1, '/test', 'imperative');
      mockRouter.events.next(event);

      expect(mockLogger.log).toHaveBeenCalled();
    });
  });
});

