import { TestBed } from '@angular/core/testing';
import { CLIService } from './cli.service';
import { ElectronService } from '../electron/electron.service';
import { LOGGER, Logger } from 'shared';
import { CLIOutputData } from '../../types/electron';

describe('CLIService', () => {
  let service: CLIService;
  let mockLogger: jasmine.SpyObj<Logger>;
  let mockElectronService: jasmine.SpyObj<ElectronService>;
  let consoleLogSpy: jasmine.Spy;
  let consoleErrorSpy: jasmine.Spy;
  let outputCallback: ((data: CLIOutputData) => void) | null = null;
  let errorCallback: ((data: CLIOutputData) => void) | null = null;

  beforeEach(() => {
    mockLogger = jasmine.createSpyObj('Logger', ['log', 'error']);
    consoleLogSpy = spyOn(console, 'log');
    consoleErrorSpy = spyOn(console, 'error');

    mockElectronService = jasmine.createSpyObj('ElectronService', ['isElectron', 'getAPI']);
    mockElectronService.isElectron.and.returnValue(true);
    mockElectronService.getAPI.and.returnValue({
      onCLIOutput: (callback: (data: CLIOutputData) => void) => {
        outputCallback = callback;
        return () => {};
      },
      onCLIError: (callback: (data: CLIOutputData) => void) => {
        errorCallback = callback;
        return () => {};
      },
      executeCLI: jasmine.createSpy('executeCLI'),
      cancelCLI: jasmine.createSpy('cancelCLI')
    } as any);

    TestBed.configureTestingModule({
      providers: [
        CLIService,
        { provide: ElectronService, useValue: mockElectronService },
        { provide: LOGGER, useValue: mockLogger }
      ]
    });

    service = TestBed.inject(CLIService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should setup listeners in Electron environment', () => {
    expect(consoleLogSpy).toHaveBeenCalledWith('🦅 CLI listeners registered');
  });

  describe('execute', () => {
    it('should execute CLI command successfully', async () => {
      const mockResult = {
        success: true,
        processId: 'process-123',
        pid: 1234
      };

      (mockElectronService.getAPI().executeCLI as jasmine.Spy).and.returnValue(Promise.resolve(mockResult));

      const options = { cwd: '/test/path', env: { TEST: 'value' } };
      const processId = await service.execute(options);

      expect(processId).toBe('process-123');
      expect(mockElectronService.getAPI().executeCLI).toHaveBeenCalledWith(options);
      expect(consoleLogSpy).toHaveBeenCalledWith('🦅 Executing Node.js script:', options);
      expect(consoleLogSpy).toHaveBeenCalledWith('🦅 CLI process started:', 'process-123', '(PID: 1234)');
    });

    it('should execute with default empty options', async () => {
      const mockResult = {
        success: true,
        processId: 'process-456',
        pid: 5678
      };

      (mockElectronService.getAPI().executeCLI as jasmine.Spy).and.returnValue(Promise.resolve(mockResult));

      const processId = await service.execute();

      expect(processId).toBe('process-456');
      expect(mockElectronService.getAPI().executeCLI).toHaveBeenCalledWith({});
      expect(consoleLogSpy).toHaveBeenCalledWith('🦅 Executing Node.js script:', {});
    });

    it('should throw error when CLI execution fails', async () => {
      const mockResult = {
        success: false,
        error: 'Command not found'
      };

      (mockElectronService.getAPI().executeCLI as jasmine.Spy).and.returnValue(Promise.resolve(mockResult));

      const options = { env: { INVALID: 'command' } };
      await expectAsync(service.execute(options)).toBeRejectedWithError('Command not found');
    });

    it('should handle missing processId in result', async () => {
      const mockResult = {
        success: true,
        processId: null
      };

      (mockElectronService.getAPI().executeCLI as jasmine.Spy).and.returnValue(Promise.resolve(mockResult));

      const options = { cwd: '/test' };
      await expectAsync(service.execute(options)).toBeRejectedWithError('Failed to execute CLI command');
    });

    it('should handle IPC execution exception', async () => {
      (mockElectronService.getAPI().executeCLI as jasmine.Spy).and.returnValue(Promise.reject(new Error('IPC error')));

      const options = { env: { TEST: 'value' } };
      await expectAsync(service.execute(options)).toBeRejectedWithError('IPC error');
      expect(consoleErrorSpy).toHaveBeenCalledWith('🦅 Error executing CLI:', jasmine.any(Error));
    });
  });

  describe('cancel', () => {
    it('should cancel CLI process successfully', async () => {
      const mockResult = {
        success: true
      };

      (mockElectronService.getAPI().cancelCLI as jasmine.Spy).and.returnValue(Promise.resolve(mockResult));

      const result = await service.cancel('process-123');

      expect(result).toBe(true);
      expect(mockElectronService.getAPI().cancelCLI).toHaveBeenCalledWith('process-123');
      expect(consoleLogSpy).toHaveBeenCalledWith('🦅 Canceling CLI process:', 'process-123');
      expect(consoleLogSpy).toHaveBeenCalledWith('🦅 CLI process canceled successfully');
    });

    it('should handle cancel failure', async () => {
      const mockResult = {
        success: false,
        error: 'Process not found'
      };

      (mockElectronService.getAPI().cancelCLI as jasmine.Spy).and.returnValue(Promise.resolve(mockResult));

      const result = await service.cancel('process-123');

      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith('🦅 Failed to cancel CLI process:', 'Process not found');
    });

    it('should handle cancel exception', async () => {
      (mockElectronService.getAPI().cancelCLI as jasmine.Spy).and.returnValue(Promise.reject(new Error('IPC error')));

      const result = await service.cancel('process-123');

      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe('executeMigration', () => {
    it('should execute migration with correct parameters', async () => {
      const mockResult = {
        success: true,
        processId: 'migration-123',
        pid: 5678
      };

      (mockElectronService.getAPI().executeCLI as jasmine.Spy).and.returnValue(Promise.resolve(mockResult));

      const processId = await service.executeMigration('/path/to/archive', {
        blueskyHandle: '@user.bsky.social',
        blueskyPassword: 'password123',
        simulate: false
      });

      expect(processId).toBe('migration-123');

      const callArgs = (mockElectronService.getAPI().executeCLI as jasmine.Spy).calls.mostRecent().args[0];
      expect(callArgs.env).toEqual({
        BLUESKY_USERNAME: 'user.bsky.social',  // @ prefix stripped
        BLUESKY_PASSWORD: 'password123',
        ARCHIVE_FOLDER: '/path/to/archive',
        SIMULATE: '0'
      });
    });

    it('should strip @ prefix from username', async () => {
      const mockResult = {
        success: true,
        processId: 'migration-123',
        pid: 5678
      };

      (mockElectronService.getAPI().executeCLI as jasmine.Spy).and.returnValue(Promise.resolve(mockResult));

      await service.executeMigration('/path/to/archive', {
        blueskyHandle: '@test.user.social',
        blueskyPassword: 'pass'
      });

      const env = (mockElectronService.getAPI().executeCLI as jasmine.Spy).calls.mostRecent().args[0].env;
      expect(env.BLUESKY_USERNAME).toBe('test.user.social');
    });

    it('should handle username without @ prefix', async () => {
      const mockResult = {
        success: true,
        processId: 'migration-123',
        pid: 5678
      };

      (mockElectronService.getAPI().executeCLI as jasmine.Spy).and.returnValue(Promise.resolve(mockResult));

      await service.executeMigration('/path/to/archive', {
        blueskyHandle: 'test.user.social',
        blueskyPassword: 'pass'
      });

      const env = (mockElectronService.getAPI().executeCLI as jasmine.Spy).calls.mostRecent().args[0].env;
      expect(env.BLUESKY_USERNAME).toBe('test.user.social');
    });

    it('should set simulate mode', async () => {
      const mockResult = {
        success: true,
        processId: 'migration-123',
        pid: 5678
      };

      (mockElectronService.getAPI().executeCLI as jasmine.Spy).and.returnValue(Promise.resolve(mockResult));

      await service.executeMigration('/path/to/archive', {
        blueskyHandle: '@user.bsky.social',
        blueskyPassword: 'pass',
        simulate: true
      });

      const env = (mockElectronService.getAPI().executeCLI as jasmine.Spy).calls.mostRecent().args[0].env;
      expect(env.SIMULATE).toBe('1');
    });

    it('should add date filters when provided', async () => {
      const mockResult = {
        success: true,
        processId: 'migration-123',
        pid: 5678
      };

      (mockElectronService.getAPI().executeCLI as jasmine.Spy).and.returnValue(Promise.resolve(mockResult));

      await service.executeMigration('/path/to/archive', {
        blueskyHandle: '@user.bsky.social',
        blueskyPassword: 'pass',
        dateFrom: '2024-01-01',
        dateTo: '2024-12-31'
      });

      const env = (mockElectronService.getAPI().executeCLI as jasmine.Spy).calls.mostRecent().args[0].env;
      expect(env.MIN_DATE).toBe('2024-01-01');
      expect(env.MAX_DATE).toBe('2024-12-31');
    });

    it('should handle video test mode', async () => {
      const mockResult = {
        success: true,
        processId: 'migration-123',
        pid: 5678
      };

      (mockElectronService.getAPI().executeCLI as jasmine.Spy).and.returnValue(Promise.resolve(mockResult));

      await service.executeMigration('/path/to/archive', {
        blueskyHandle: '@user.bsky.social',
        blueskyPassword: 'pass',
        testMode: 'video'
      });

      const env = (mockElectronService.getAPI().executeCLI as jasmine.Spy).calls.mostRecent().args[0].env;
      expect(env.ARCHIVE_FOLDER).toBe('projects/flock-native/transfer/test_video');
    });

    it('should handle mixed test mode', async () => {
      const mockResult = {
        success: true,
        processId: 'migration-123',
        pid: 5678
      };

      (mockElectronService.getAPI().executeCLI as jasmine.Spy).and.returnValue(Promise.resolve(mockResult));

      await service.executeMigration('/path/to/archive', {
        blueskyHandle: '@user.bsky.social',
        blueskyPassword: 'pass',
        testMode: 'mixed'
      });

      const env = (mockElectronService.getAPI().executeCLI as jasmine.Spy).calls.mostRecent().args[0].env;
      expect(env.ARCHIVE_FOLDER).toBe('projects/flock-native/transfer/test_mixed_media');
    });
  });

  describe('parseProgress', () => {
    it('should parse percentage from output', () => {
      const result = service.parseProgress('Uploading... 45%');

      expect(result).toEqual({
        percentage: 45,
        message: 'Uploading... 45%'
      });
    });

    it('should return null for output without percentage', () => {
      const result = service.parseProgress('Processing files...');

      expect(result).toBeNull();
    });

    it('should extract first percentage found', () => {
      const result = service.parseProgress('Progress: 75% (3 of 4 files)');

      expect(result).toEqual({
        percentage: 75,
        message: 'Progress: 75% (3 of 4 files)'
      });
    });
  });

  describe('CLI output streams', () => {
    it('should emit CLI output data', (done) => {
      const outputData: CLIOutputData = {
        processId: 'test-123',
        type: 'stdout',
        data: 'Test output'
      };

      service.output$.subscribe((data) => {
        expect(data).toEqual(outputData);
        expect(consoleLogSpy).toHaveBeenCalledWith('🦅 CLI Output:', outputData);
        done();
      });

      if (outputCallback) {
        outputCallback(outputData);
      }
    });

    it('should emit CLI error data', (done) => {
      const errorData: CLIOutputData = {
        processId: 'test-123',
        type: 'stderr',
        data: 'Test error'
      };

      service.error$.subscribe((data) => {
        expect(data).toEqual(errorData);
        expect(consoleErrorSpy).toHaveBeenCalledWith('🦅 CLI Error:', errorData);
        done();
      });

      if (errorCallback) {
        errorCallback(errorData);
      }
    });
  });
});

