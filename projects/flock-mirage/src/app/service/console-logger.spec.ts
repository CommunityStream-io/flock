import { TestBed } from '@angular/core/testing';

import { ConsoleLogger } from './console-logger';

describe('Feature: Console Logging (BDD-Style)', () => {
  let service: ConsoleLogger;
  let consoleSpy: jasmine.Spy;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConsoleLogger);

    // Spy on console methods
    spyOn(console, 'log');
    spyOn(console, 'error');
    spyOn(console, 'warn');
  });

  describe('Scenario: Service Initialization', () => {
    it('Given a console logger service, When service is created, Then service is available', () => {
      // Given: Service is created
      console.log('🔧 BDD: Service is created');

      // When: Service is injected
      console.log('⚙️ BDD: Service is injected');

      // Then: Service is available
      console.log('✅ BDD: Service is available');
      expect(service).toBeTruthy();
    });
  });

  describe('Scenario: Basic Logging', () => {
    it('Given a console logger service, When logging a message, Then message is logged', () => {
      // Given: Service and test message
      console.log('🔧 BDD: Setting up test message');
      const message = 'Test log message';
      const testObject = { key: 'value' };

      // When: Log message is called
      console.log('⚙️ BDD: Logging message');
      service.log(message, testObject);

      // Then: Message is logged with correct format
      console.log('✅ BDD: Verifying log output');
      expect(console.log).toHaveBeenCalledWith('LOG:', message, testObject);
    });

    it('Given a console logger service, When logging without object, Then message is logged without object', () => {
      // Given: Service and test message without object
      console.log('🔧 BDD: Setting up test message without object');
      const message = 'Test log message only';

      // When: Log message is called without object
      console.log('⚙️ BDD: Logging message without object');
      service.log(message);

      // Then: Message is logged without object
      console.log('✅ BDD: Verifying log output without object');
      expect(console.log).toHaveBeenCalledWith('LOG:', message, undefined);
    });
  });

  describe('Scenario: Error Logging', () => {
    it('Given a console logger service, When logging an error, Then error is logged', () => {
      // Given: Service and error message
      console.log('🔧 BDD: Setting up error message');
      const message = 'Test error message';
      const errorObject = { error: 'details' };

      // When: Error log is called
      console.log('⚙️ BDD: Logging error');
      service.error(message, errorObject);

      // Then: Error is logged with correct format
      console.log('✅ BDD: Verifying error log output');
      expect(console.error).toHaveBeenCalledWith('ERROR:', message, errorObject);
    });

    it('Given a console logger service, When logging error without object, Then error is logged without object', () => {
      // Given: Service and error message without object
      console.log('🔧 BDD: Setting up error message without object');
      const message = 'Test error message only';

      // When: Error log is called without object
      console.log('⚙️ BDD: Logging error without object');
      service.error(message);

      // Then: Error is logged without object
      console.log('✅ BDD: Verifying error log output without object');
      expect(console.error).toHaveBeenCalledWith('ERROR:', message, undefined);
    });
  });

  describe('Scenario: Warning Logging', () => {
    it('Given a console logger service, When logging a warning, Then warning is logged', () => {
      // Given: Service and warning message
      console.log('🔧 BDD: Setting up warning message');
      const message = 'Test warning message';
      const warningObject = { warning: 'details' };

      // When: Warning log is called
      console.log('⚙️ BDD: Logging warning');
      service.warn(message, warningObject);

      // Then: Warning is logged with correct format
      console.log('✅ BDD: Verifying warning log output');
      expect(console.warn).toHaveBeenCalledWith('WARN:', message, warningObject);
    });

    it('Given a console logger service, When logging warning without object, Then warning is logged without object', () => {
      // Given: Service and warning message without object
      console.log('🔧 BDD: Setting up warning message without object');
      const message = 'Test warning message only';

      // When: Warning log is called without object
      console.log('⚙️ BDD: Logging warning without object');
      service.warn(message);

      // Then: Warning is logged without object
      console.log('✅ BDD: Verifying warning log output without object');
      expect(console.warn).toHaveBeenCalledWith('WARN:', message, undefined);
    });
  });

  describe('Scenario: Router Logging', () => {
    it('Given a console logger service, When logging router message, Then special router format is used', () => {
      // Given: Service and router message
      console.log('🔧 BDD: Setting up router message');
      const message = 'ROUTER: Navigation started';
      const routerObject = { route: '/test' };

      // When: Router log is called
      console.log('⚙️ BDD: Logging router message');
      service.log(message, routerObject);

      // Then: Router message is logged with special format
      console.log('✅ BDD: Verifying router log output');
      expect(console.log).toHaveBeenCalledWith('LOG:', message, routerObject);
      expect(console.log).toHaveBeenCalledWith('🧭 ROUTER LOG:', message, routerObject);
    });

    it('Given a console logger service, When logging router error, Then special router error format is used', () => {
      // Given: Service and router error message
      console.log('🔧 BDD: Setting up router error message');
      const message = 'ROUTER: Navigation failed';
      const errorObject = { error: 'route not found' };

      // When: Router error log is called
      console.log('⚙️ BDD: Logging router error');
      service.error(message, errorObject);

      // Then: Router error is logged with special format
      console.log('✅ BDD: Verifying router error log output');
      expect(console.error).toHaveBeenCalledWith('ERROR:', message, errorObject);
      expect(console.error).toHaveBeenCalledWith('❌ ROUTER ERROR:', message, errorObject);
    });

    it('Given a console logger service, When logging router warning, Then special router warning format is used', () => {
      // Given: Service and router warning message
      console.log('🔧 BDD: Setting up router warning message');
      const message = 'ROUTER: Navigation timeout';
      const warningObject = { timeout: 5000 };

      // When: Router warning log is called
      console.log('⚙️ BDD: Logging router warning');
      service.warn(message, warningObject);

      // Then: Router warning is logged with special format
      console.log('✅ BDD: Verifying router warning log output');
      expect(console.warn).toHaveBeenCalledWith('WARN:', message, warningObject);
      expect(console.warn).toHaveBeenCalledWith('⚠️ ROUTER WARN:', message, warningObject);
    });
  });

  describe('Scenario: Workflow Logging', () => {
    it('Given a console logger service, When logging workflow message, Then workflow format is used', () => {
      // Given: Service and workflow message
      console.log('🔧 BDD: Setting up workflow message');
      const message = 'Workflow step completed';
      const workflowObject = { step: 'validation' };

      // When: Workflow log is called
      console.log('⚙️ BDD: Logging workflow message');
      service.workflow(message, workflowObject);

      // Then: Workflow message is logged with correct format
      console.log('✅ BDD: Verifying workflow log output');
      expect(console.log).toHaveBeenCalledWith('WORKFLOW:', message, workflowObject);
    });

    it('Given a console logger service, When logging workflow without object, Then workflow is logged without object', () => {
      // Given: Service and workflow message without object
      console.log('🔧 BDD: Setting up workflow message without object');
      const message = 'Workflow started';

      // When: Workflow log is called without object
      console.log('⚙️ BDD: Logging workflow message without object');
      service.workflow(message);

      // Then: Workflow message is logged without object
      console.log('✅ BDD: Verifying workflow log output without object');
      expect(console.log).toHaveBeenCalledWith('WORKFLOW:', message, undefined);
    });
  });

  describe('Scenario: Instrumentation', () => {
    it('Given a console logger service, When instrumenting app, Then instrumentation is logged', async () => {
      // Given: Service and app name
      console.log('🔧 BDD: Setting up app name for instrumentation');
      const appName = 'TestApp';

      // When: Instrumentation is called
      console.log('⚙️ BDD: Instrumenting app');
      await service.instrument(appName);

      // Then: Instrumentation is logged
      console.log('✅ BDD: Verifying instrumentation log output');
      expect(console.log).toHaveBeenCalledWith('INSTRUMENT:', appName);
    });
  });
});
