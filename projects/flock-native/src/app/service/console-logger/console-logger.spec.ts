import { ConsoleLogger } from './console-logger';

describe('ConsoleLogger', () => {
  let logger: ConsoleLogger;
  let consoleLogSpy: jasmine.Spy;
  let consoleErrorSpy: jasmine.Spy;
  let consoleWarnSpy: jasmine.Spy;

  beforeEach(() => {
    logger = new ConsoleLogger();
    consoleLogSpy = spyOn(console, 'log');
    consoleErrorSpy = spyOn(console, 'error');
    consoleWarnSpy = spyOn(console, 'warn');
  });

  it('should create', () => {
    expect(logger).toBeTruthy();
  });

  describe('log', () => {
    it('should log with eagle emoji prefix', () => {
      logger.log('test message');
      expect(consoleLogSpy).toHaveBeenCalledWith('🦅 LOG:', 'test message', undefined);
    });

    it('should log with object', () => {
      const obj = { key: 'value' };
      logger.log('test message', obj);
      expect(consoleLogSpy).toHaveBeenCalledWith('🦅 LOG:', 'test message', obj);
    });

    it('should add router log when message contains ROUTER:', () => {
      logger.log('ROUTER: navigation started');
      expect(consoleLogSpy).toHaveBeenCalledWith('🦅 LOG:', 'ROUTER: navigation started', undefined);
      expect(consoleLogSpy).toHaveBeenCalledWith('🧭 ROUTER LOG:', 'ROUTER: navigation started', undefined);
    });
  });

  describe('error', () => {
    it('should log error with eagle emoji prefix', () => {
      logger.error('error message');
      expect(consoleErrorSpy).toHaveBeenCalledWith('🦅 ERROR:', 'error message', undefined);
    });

    it('should log error with object', () => {
      const err = { error: 'details' };
      logger.error('error message', err);
      expect(consoleErrorSpy).toHaveBeenCalledWith('🦅 ERROR:', 'error message', err);
    });

    it('should add router error when message contains ROUTER:', () => {
      logger.error('ROUTER: navigation failed');
      expect(consoleErrorSpy).toHaveBeenCalledWith('🦅 ERROR:', 'ROUTER: navigation failed', undefined);
      expect(consoleErrorSpy).toHaveBeenCalledWith('❌ ROUTER ERROR:', 'ROUTER: navigation failed', undefined);
    });
  });

  describe('warn', () => {
    it('should log warning with eagle emoji prefix', () => {
      logger.warn('warning message');
      expect(consoleWarnSpy).toHaveBeenCalledWith('🦅 WARN:', 'warning message', undefined);
    });

    it('should log warning with object', () => {
      const warn = { warning: 'details' };
      logger.warn('warning message', warn);
      expect(consoleWarnSpy).toHaveBeenCalledWith('🦅 WARN:', 'warning message', warn);
    });

    it('should add router warning when message contains ROUTER:', () => {
      logger.warn('ROUTER: navigation cancelled');
      expect(consoleWarnSpy).toHaveBeenCalledWith('🦅 WARN:', 'ROUTER: navigation cancelled', undefined);
      expect(consoleWarnSpy).toHaveBeenCalledWith('⚠️ ROUTER WARN:', 'ROUTER: navigation cancelled', undefined);
    });
  });

  describe('workflow', () => {
    it('should log workflow with eagle emoji prefix', () => {
      logger.workflow('workflow step');
      expect(consoleLogSpy).toHaveBeenCalledWith('🦅 WORKFLOW:', 'workflow step', undefined);
    });

    it('should log workflow with object', () => {
      const obj = { step: 1 };
      logger.workflow('workflow step', obj);
      expect(consoleLogSpy).toHaveBeenCalledWith('🦅 WORKFLOW:', 'workflow step', obj);
    });
  });

  describe('instrument', () => {
    it('should log instrumentation with app name', async () => {
      await logger.instrument('Flock Native');
      
      expect(consoleLogSpy).toHaveBeenCalledWith('🦅 INSTRUMENT:', 'Flock Native');
      expect(consoleLogSpy).toHaveBeenCalledWith('📊 Native Electron environment detected');
      expect(consoleLogSpy).toHaveBeenCalledWith('🏔️ Eagle soaring with full desktop power');
    });

    it('should return a resolved promise', async () => {
      const result = await logger.instrument('Test App');
      expect(result).toBeUndefined();
    });
  });
});

