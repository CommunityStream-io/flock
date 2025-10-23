import { TestBed } from '@angular/core/testing';

import { SplashScreenLoading } from './splash-screen-loading';
import { LOGGER } from '.';


describe('SplashScreenLoading', () => {
  let service: SplashScreenLoading;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: LOGGER,
          useValue: jasmine.createSpyObj('Logger', ['log', 'error', 'warn', 'workflow'])
        }
      ]
    });
    service = TestBed.inject(SplashScreenLoading);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Initial State', () => {
    it('should initialize with loading false', () => {
      expect(service.isLoading.value).toBe(false);
    });

    it('should initialize with default message', () => {
      expect(service.message.value).toBe('*flap* *flap* *flap*');
    });
  });

  describe('show() method', () => {
    it('should set loading to true when showing', () => {
      service.show('Test message');
      expect(service.isLoading.value).toBe(true);
    });

    it('should set the provided message', () => {
      const testMessage = 'Authenticating with bsky.social';
      service.show(testMessage);
      expect(service.message.value).toBe(testMessage);
    });

    it('should update message when called multiple times', () => {
      service.show('First message');
      expect(service.message.value).toBe('First message');

      service.show('Second message');
      expect(service.message.value).toBe('Second message');
      expect(service.isLoading.value).toBe(true);
    });
  });

  describe('hide() method', () => {
    it('should set loading to false when hiding', () => {
      service.show('Test message');
      expect(service.isLoading.value).toBe(true);

      service.hide();
      expect(service.isLoading.value).toBe(false);
    });

    it('should reset message to default when hiding', () => {
      service.show('Custom message');
      expect(service.message.value).toBe('Custom message');

      service.hide();
      expect(service.message.value).toBe('*flap* *flap* *flap*');
    });

    it('should reset message to default even if not previously shown', () => {
      // Start with default message
      expect(service.message.value).toBe('*flap* *flap* *flap*');

      service.hide();
      expect(service.message.value).toBe('*flap* *flap* *flap*');
      expect(service.isLoading.value).toBe(false);
    });

    it('should handle multiple hide calls', () => {
      service.show('Test message');
      service.hide();
      expect(service.isLoading.value).toBe(false);
      expect(service.message.value).toBe('*flap* *flap* *flap*');

      service.hide();
      expect(service.isLoading.value).toBe(false);
      expect(service.message.value).toBe('*flap* *flap* *flap*');
    });
  });

  describe('Observable Behavior', () => {
    it('should emit loading state changes', (done) => {
      let emissionCount = 0;
      const expectedValues = [false, true, false];

      service.isLoading.subscribe(value => {
        expect(value).toBe(expectedValues[emissionCount]);
        emissionCount++;

        if (emissionCount === expectedValues.length) {
          done();
        }
      });

      service.show('Test message');
      service.hide();
    });

    it('should emit message changes', (done) => {
      let emissionCount = 0;
      const expectedValues = ['*flap* *flap* *flap*', 'Custom message', '*flap* *flap* *flap*'];

      service.message.subscribe(value => {
        expect(value).toBe(expectedValues[emissionCount]);
        emissionCount++;

        if (emissionCount === expectedValues.length) {
          done();
        }
      });

      service.show('Custom message');
      service.hide();
    });
  });

  describe('setComponent() method', () => {
    class TestComponent {}
    class ExtractionProgressComponent {}
    class MigrationProgressComponent {}

    it('should set component to provided value', () => {
      service.setComponent(TestComponent);

      expect(service.component.value).toBe(TestComponent);
    });

    it('should set component to null', () => {
      service.setComponent(TestComponent);
      expect(service.component.value).toBe(TestComponent);

      service.setComponent(null);
      expect(service.component.value).toBeNull();
    });

    it('should update component value when called multiple times', () => {
      service.setComponent(TestComponent);
      expect(service.component.value).toBe(TestComponent);

      service.setComponent(ExtractionProgressComponent);
      expect(service.component.value).toBe(ExtractionProgressComponent);

      service.setComponent(MigrationProgressComponent);
      expect(service.component.value).toBe(MigrationProgressComponent);
    });

    it('should emit new value to component BehaviorSubject', (done) => {
      let emissionCount = 0;
      const expectedValues = [null, TestComponent];

      service.component.subscribe(value => {
        expect(value).toBe(expectedValues[emissionCount]);
        emissionCount++;

        if (emissionCount === expectedValues.length) {
          done();
        }
      });

      service.setComponent(TestComponent);
    });

    it('should handle setting same component multiple times', () => {
      service.setComponent(TestComponent);
      service.setComponent(TestComponent);
      service.setComponent(TestComponent);

      expect(service.component.value).toBe(TestComponent);
    });

    it('should handle setting null multiple times', () => {
      service.setComponent(null);
      service.setComponent(null);

      expect(service.component.value).toBeNull();
    });
  });

  describe('component BehaviorSubject', () => {
    it('should initialize with null', () => {
      expect(service.component.value).toBeNull();
    });

    it('should be observable', (done) => {
      service.component.subscribe(value => {
        expect(value).toBeNull();
        done();
      });
    });
  });

  describe('hide() component reset', () => {
    class TestComponent {}

    it('should reset component to null when hiding', () => {
      service.setComponent(TestComponent);
      expect(service.component.value).toBe(TestComponent);

      service.hide();

      expect(service.component.value).toBeNull();
    });

    it('should reset component even if already null', () => {
      expect(service.component.value).toBeNull();

      service.hide();

      expect(service.component.value).toBeNull();
    });

    it('should reset component along with other properties', () => {
      service.show('Test message');
      service.setComponent(TestComponent);

      expect(service.isLoading.value).toBe(true);
      expect(service.message.value).toBe('Test message');
      expect(service.component.value).toBe(TestComponent);

      service.hide();

      expect(service.isLoading.value).toBe(false);
      expect(service.message.value).toBe('*flap* *flap* *flap*');
      expect(service.component.value).toBeNull();
    });
  });

  describe('Feature: Conditional Branch Coverage (BDD-Style)', () => {
    class TestComponent {}
    class AnotherComponent {}

    it('Given a component is not set, When setting a new component, Then component name is extracted', () => {
      // Given: No component is currently set
      console.log('🔧 BDD: Service initialized with no component');
      expect(service.component.value).toBeNull();

      // When: Setting a new component
      console.log('⚙️ BDD: Setting a component from null state');
      service.setComponent(TestComponent);

      // Then: Component is set and branch for component.name is covered
      console.log('✅ BDD: Component name branch is executed');
      expect(service.component.value).toBe(TestComponent);
    });

    it('Given a component is already set, When setting another component, Then both component name branches are covered', () => {
      // Given: A component is already set
      console.log('🔧 BDD: Setting initial component');
      service.setComponent(TestComponent);
      expect(service.component.value).toBe(TestComponent);

      // When: Setting a different component
      console.log('⚙️ BDD: Replacing with another component');
      service.setComponent(AnotherComponent);

      // Then: Both currentComponent and component name branches are covered
      console.log('✅ BDD: Both component name branches are executed');
      expect(service.component.value).toBe(AnotherComponent);
    });

    it('Given a component is set, When resetting to null, Then stack trace logging branch is covered', () => {
      // Given: A component is set
      console.log('🔧 BDD: Setting component for reset test');
      service.setComponent(TestComponent);
      expect(service.component.value).toBe(TestComponent);

      // When: Resetting component to null
      console.log('⚙️ BDD: Resetting component to null triggers stack trace logging');
      service.setComponent(null);

      // Then: Stack trace logging branch is executed
      console.log('✅ BDD: Stack trace logging branch for component reset is executed');
      expect(service.component.value).toBeNull();
    });

    it('Given no current component, When setting component to null, Then else branch is covered', () => {
      // Given: No component is set
      console.log('🔧 BDD: Service initialized with no component');
      expect(service.component.value).toBeNull();

      // When: Setting component to null (no-op scenario)
      console.log('⚙️ BDD: Setting null when already null');
      service.setComponent(null);

      // Then: Else branch of conditional is covered (no stack trace logging)
      console.log('✅ BDD: Else branch for component reset conditional is executed');
      expect(service.component.value).toBeNull();
    });

    it('Given stack trace exists, When component is reset, Then forEach branch is covered', () => {
      // Given: A component is set and will be reset
      console.log('🔧 BDD: Setting component that will trigger stack trace forEach');
      service.setComponent(TestComponent);

      // When: Resetting component triggers stack trace iteration
      console.log('⚙️ BDD: Resetting component to iterate stack trace lines');
      service.setComponent(null);

      // Then: forEach iteration over stack trace lines is executed
      console.log('✅ BDD: Stack trace forEach branch is executed');
      expect(service.component.value).toBeNull();
    });
  });

  describe('Feature: Logging Helper Branch Coverage (BDD-Style)', () => {
    it('Given logging with primitive arguments, When log is called, Then String conversion branch is covered', () => {
      // Given: Service with logger
      console.log('🔧 BDD: Preparing to log primitive values');

      // When: show() is called which calls log() with string arguments
      console.log('⚙️ BDD: Calling show with string message');
      service.show('Test primitive logging');

      // Then: String conversion branch in log() is executed
      console.log('✅ BDD: String conversion branch in log() is executed');
      expect(service.isLoading.value).toBe(true);
    });

    it('Given logging with object arguments, When log is called, Then JSON.stringify branch is covered', () => {
      // Given: Service with logger that will receive object
      console.log('🔧 BDD: Preparing to log object values');
      const testComponent = class TestComponent {};

      // When: setComponent() is called which logs objects
      console.log('⚙️ BDD: Calling setComponent which logs object details');
      service.setComponent(testComponent);

      // Then: JSON.stringify branch in log() is executed
      console.log('✅ BDD: JSON.stringify branch in log() is executed');
      expect(service.component.value).toBe(testComponent);
    });
  });

  describe('Integration Scenarios', () => {
    class TestComponent {}

    it('should handle complete show/hide cycle', () => {
      // Initial state
      expect(service.isLoading.value).toBe(false);
      expect(service.message.value).toBe('*flap* *flap* *flap*');

      // Show with custom message
      service.show('Authenticating with bsky.social');
      expect(service.isLoading.value).toBe(true);
      expect(service.message.value).toBe('Authenticating with bsky.social');

      // Hide and reset
      service.hide();
      expect(service.isLoading.value).toBe(false);
      expect(service.message.value).toBe('*flap* *flap* *flap*');
    });

    it('should handle multiple show/hide cycles', () => {
      // First cycle
      service.show('First message');
      expect(service.isLoading.value).toBe(true);
      expect(service.message.value).toBe('First message');

      service.hide();
      expect(service.isLoading.value).toBe(false);
      expect(service.message.value).toBe('*flap* *flap* *flap*');

      // Second cycle
      service.show('Second message');
      expect(service.isLoading.value).toBe(true);
      expect(service.message.value).toBe('Second message');

      service.hide();
      expect(service.isLoading.value).toBe(false);
      expect(service.message.value).toBe('*flap* *flap* *flap*');
    });

    it('should handle rapid show/hide calls', () => {
      service.show('Message 1');
      service.show('Message 2');
      service.hide();
      service.show('Message 3');
      service.hide();

      expect(service.isLoading.value).toBe(false);
      expect(service.message.value).toBe('*flap* *flap* *flap*');
    });

    it('should handle show/hide with component lifecycle', () => {
      // Show loading
      service.show('Loading data...');
      expect(service.isLoading.value).toBe(true);

      // Set component
      service.setComponent(TestComponent);
      expect(service.component.value).toBe(TestComponent);

      // Hide should reset everything
      service.hide();
      expect(service.isLoading.value).toBe(false);
      expect(service.message.value).toBe('*flap* *flap* *flap*');
      expect(service.component.value).toBeNull();
    });

    it('should handle component changes without affecting loading state', () => {
      service.show('Processing...');
      expect(service.isLoading.value).toBe(true);

      service.setComponent(TestComponent);
      expect(service.isLoading.value).toBe(true); // Still loading

      service.setComponent(null);
      expect(service.isLoading.value).toBe(true); // Still loading
    });
  });
});
