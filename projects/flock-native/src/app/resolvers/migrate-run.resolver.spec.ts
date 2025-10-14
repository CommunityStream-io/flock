import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { nativeMigrateRunResolver } from './migrate-run.resolver';
import { LOGGER, Logger, SplashScreenLoading, ConfigServiceImpl } from 'shared';
import { CLIService } from '../service/cli/cli.service';
import { MigrationProgressComponent } from '../components/migration-progress/migration-progress.component';
import { Subject } from 'rxjs';
import { CLIOutputData } from '../types/electron';

describe('nativeMigrateRunResolver', () => {
  let mockLogger: jasmine.SpyObj<Logger>;
  let mockSplashScreenLoading: jasmine.SpyObj<SplashScreenLoading>;
  let mockSnackBar: jasmine.SpyObj<MatSnackBar>;
  let mockConfigService: jasmine.SpyObj<ConfigServiceImpl>;
  let mockCLIService: any;
  let outputSubject: Subject<CLIOutputData>;

  beforeEach(() => {
    outputSubject = new Subject<CLIOutputData>();

    mockLogger = jasmine.createSpyObj('Logger', ['log', 'error']);
    mockSplashScreenLoading = jasmine.createSpyObj('SplashScreenLoading', 
      ['setComponent', 'show', 'hide']
    );
    mockSnackBar = jasmine.createSpyObj('MatSnackBar', ['open']);
    mockConfigService = jasmine.createSpyObj('ConfigServiceImpl', 
      ['getBlueskyCredentials', 'setMigrationResults'],
      {
        testMode: 'none',
        archivePath: '/path/to/archive',
        startDate: undefined,
        endDate: undefined,
        simulate: false
      }
    );
    
    mockCLIService = {
      output$: outputSubject.asObservable(),
      executeMigration: jasmine.createSpy('executeMigration').and.returnValue(Promise.resolve('process-123'))
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: LOGGER, useValue: mockLogger },
        { provide: SplashScreenLoading, useValue: mockSplashScreenLoading },
        { provide: MatSnackBar, useValue: mockSnackBar },
        { provide: ConfigServiceImpl, useValue: mockConfigService },
        { provide: CLIService, useValue: mockCLIService }
      ]
    });
  });

  const executeResolver = (): Promise<any> => {
    const resolver: ResolveFn<any> = nativeMigrateRunResolver;
    const route = {} as ActivatedRouteSnapshot;
    const state = {} as RouterStateSnapshot;
    return new Promise((resolve, reject) => {
      TestBed.runInInjectionContext(() => {
        const result = resolver(route, state);
        result.subscribe({
          next: (value: any) => resolve(value),
          error: (error: any) => reject(error)
        });
      });
    });
  };

  it('should initialize splash screen with migration component', (done) => {
    mockConfigService.getBlueskyCredentials.and.returnValue({
      username: '@user.bsky.social',
      password: 'test-password'
    });

    executeResolver().catch(() => {
      // Resolver will hang waiting for CLI output, but we can verify initialization
    });

    // Give async operations time to start
    setTimeout(() => {
      expect(mockSplashScreenLoading.setComponent).toHaveBeenCalledWith(MigrationProgressComponent);
      expect(mockSplashScreenLoading.show).toHaveBeenCalledWith('Starting Migration...');
      done();
    }, 50);
  });

  describe('Configuration validation', () => {
    it('should return false when credentials are missing', async () => {
      mockConfigService.getBlueskyCredentials.and.returnValue(null);

      const result = await executeResolver();
      
      expect(result).toBe(false);
      expect(mockLogger.error).toHaveBeenCalledWith(jasmine.stringContaining('Error starting migration'), jasmine.anything());
    });

    it('should return false when username is missing', async () => {
      mockConfigService.getBlueskyCredentials.and.returnValue({
        username: '',
        password: 'test-password'
      });

      const result = await executeResolver();
      
      expect(result).toBe(false);
      expect(mockLogger.error).toHaveBeenCalledWith(jasmine.stringContaining('Error starting migration'), jasmine.anything());
    });

    it('should return false when password is missing', async () => {
      mockConfigService.getBlueskyCredentials.and.returnValue({
        username: '@user.bsky.social',
        password: ''
      });

      const result = await executeResolver();
      
      expect(result).toBe(false);
      expect(mockLogger.error).toHaveBeenCalledWith(jasmine.stringContaining('Error starting migration'), jasmine.anything());
    });

    it('should return false when archive path is missing in normal mode', async () => {
      mockConfigService.getBlueskyCredentials.and.returnValue({
        username: '@user.bsky.social',
        password: 'test-password'
      });
      Object.defineProperty(mockConfigService, 'testMode', { 
        value: 'none', 
        writable: true,
        configurable: true 
      });
      Object.defineProperty(mockConfigService, 'archivePath', { 
        value: null, 
        writable: true,
        configurable: true 
      });

      const result = await executeResolver();
      
      expect(result).toBe(false);
      expect(mockLogger.error).toHaveBeenCalledWith(jasmine.stringContaining('Error starting migration'), jasmine.anything());
    });

    it('should allow missing archive path in test mode', (done) => {
      mockConfigService.getBlueskyCredentials.and.returnValue({
        username: '@user.bsky.social',
        password: 'test-password'
      });
      Object.defineProperty(mockConfigService, 'testMode', { value: 'video', configurable: true });
      Object.defineProperty(mockConfigService, 'archivePath', { value: null, configurable: true });

      executeResolver().catch(() => {});

      setTimeout(() => {
        expect(mockCLIService.executeMigration).toHaveBeenCalled();
        done();
      }, 50);
    });
  });

  describe('CLI execution', () => {
    beforeEach(() => {
      mockConfigService.getBlueskyCredentials.and.returnValue({
        username: '@user.bsky.social',
        password: 'test-password'
      });
    });

    it('should execute migration with correct parameters', (done) => {
      executeResolver().catch(() => {});

      setTimeout(() => {
        expect(mockCLIService.executeMigration).toHaveBeenCalledWith('/path/to/archive', {
          blueskyHandle: '@user.bsky.social',
          blueskyPassword: 'test-password',
          dateFrom: undefined,
          dateTo: undefined,
          simulate: false,
          testMode: 'none'
        });
        done();
      }, 50);
    });

    it('should pass date range to CLI', (done) => {
      Object.defineProperty(mockConfigService, 'startDate', { value: '2024-01-01', configurable: true });
      Object.defineProperty(mockConfigService, 'endDate', { value: '2024-12-31', configurable: true });

      executeResolver().catch(() => {});

      // Wait for CLI to be called
      setTimeout(() => {
        expect(mockCLIService.executeMigration).toHaveBeenCalledWith('/path/to/archive', {
          blueskyHandle: '@user.bsky.social',
          blueskyPassword: 'test-password',
          dateFrom: '2024-01-01',
          dateTo: '2024-12-31',
          simulate: false,
          testMode: 'none'
        });
        done();
      }, 50);
    });

    it('should pass simulate mode to CLI', (done) => {
      Object.defineProperty(mockConfigService, 'simulate', { value: true, configurable: true });

      executeResolver().catch(() => {});

      // Wait for CLI to be called
      setTimeout(() => {
        expect(mockCLIService.executeMigration).toHaveBeenCalledWith('/path/to/archive', {
          blueskyHandle: '@user.bsky.social',
          blueskyPassword: 'test-password',
          dateFrom: undefined,
          dateTo: undefined,
          simulate: true,
          testMode: 'none'
        });
        done();
      }, 50);
    });

    it('should pass test mode to CLI', (done) => {
      Object.defineProperty(mockConfigService, 'testMode', { value: 'video', configurable: true });

      executeResolver().catch(() => {});

      // Wait for CLI to be called
      setTimeout(() => {
        expect(mockCLIService.executeMigration).toHaveBeenCalledWith('/path/to/archive', {
          blueskyHandle: '@user.bsky.social',
          blueskyPassword: 'test-password',
          dateFrom: undefined,
          dateTo: undefined,
          simulate: false,
          testMode: 'video'
        });
        done();
      }, 50);
    });
  });

  describe('Output monitoring', () => {
    beforeEach(() => {
      mockConfigService.getBlueskyCredentials.and.returnValue({
        username: '@user.bsky.social',
        password: 'test-password'
      });
    });

    it('should track posts being created', (done) => {
      const resolverPromise = executeResolver();

      setTimeout(() => {
        outputSubject.next({
          processId: 'process-123',
          type: 'stdout',
          data: 'Bluesky post created with url: https://bsky.app/profile/user/post/1'
        });

        setTimeout(() => {
          expect(mockLogger.log).toHaveBeenCalledWith(jasmine.stringContaining('1 posts created'));
          
          outputSubject.next({
            processId: 'process-123',
            type: 'stdout',
            data: 'Bluesky post created with url: https://bsky.app/profile/user/post/2'
          });

          setTimeout(() => {
            expect(mockLogger.log).toHaveBeenCalledWith(jasmine.stringContaining('2 posts created'));
            done();
          }, 50);
        }, 50);
      }, 50);
    });

    it('should resolve with true on successful exit', async () => {
      const resolverPromise = executeResolver();

      setTimeout(() => {
        outputSubject.next({
          processId: 'process-123',
          type: 'stdout',
          data: 'imported 5 posts with 10 media'
        });

        outputSubject.next({
          processId: 'process-123',
          type: 'stdout',
          data: 'Total import time: 0 hours and 5 minutes'
        });

        outputSubject.next({
          processId: 'process-123',
          type: 'exit',
          code: 0
        });
      }, 50);

      const result = await resolverPromise;
      expect(result).toBe(true);
      expect(mockSnackBar.open).toHaveBeenCalledWith('Migration completed successfully!', 'Close', jasmine.any(Object));
      expect(mockConfigService.setMigrationResults).toHaveBeenCalledWith({
        postsImported: 5,
        mediaCount: 10,
        duration: '5m',
        success: true
      });
    });

    it('should return false on exit with error code', async () => {
      const resolverPromise = executeResolver();

      setTimeout(() => {
        outputSubject.next({
          processId: 'process-123',
          type: 'exit',
          code: 1
        });
      }, 50);

      const result = await resolverPromise;
      
      expect(result).toBe(false);
      expect(mockLogger.error).toHaveBeenCalledWith(jasmine.stringContaining('Migration failed with exit code 1'));
      expect(mockSnackBar.open).toHaveBeenCalledWith('Migration failed (code 1)', 'Close', jasmine.any(Object));
      expect(mockConfigService.setMigrationResults).toHaveBeenCalledWith({
        postsImported: 0,
        mediaCount: 0,
        duration: '0',
        success: false
      });
    });
  });

  describe('Statistics parsing', () => {
    beforeEach(() => {
      mockConfigService.getBlueskyCredentials.and.returnValue({
        username: '@user.bsky.social',
        password: 'test-password'
      });
    });

    it('should parse posts and media count', async () => {
      const resolverPromise = executeResolver();

      setTimeout(() => {
        outputSubject.next({
          processId: 'process-123',
          type: 'stdout',
          data: 'imported 42 posts with 128 media'
        });

        outputSubject.next({
          processId: 'process-123',
          type: 'exit',
          code: 0
        });
      }, 50);

      await resolverPromise;

      expect(mockConfigService.setMigrationResults).toHaveBeenCalledWith(
        jasmine.objectContaining({
          postsImported: 42,
          mediaCount: 128
        })
      );
    });

    it('should parse duration in hours and minutes', async () => {
      const resolverPromise = executeResolver();

      setTimeout(() => {
        outputSubject.next({
          processId: 'process-123',
          type: 'stdout',
          data: 'Total import time: 2 hours and 30 minutes'
        });

        outputSubject.next({
          processId: 'process-123',
          type: 'exit',
          code: 0
        });
      }, 50);

      await resolverPromise;

      expect(mockConfigService.setMigrationResults).toHaveBeenCalledWith(
        jasmine.objectContaining({
          duration: '2h 30m'
        })
      );
    });

    it('should parse duration in minutes only', async () => {
      const resolverPromise = executeResolver();

      setTimeout(() => {
        outputSubject.next({
          processId: 'process-123',
          type: 'stdout',
          data: 'Total import time: 0 hours and 15 minutes'
        });

        outputSubject.next({
          processId: 'process-123',
          type: 'exit',
          code: 0
        });
      }, 50);

      await resolverPromise;

      expect(mockConfigService.setMigrationResults).toHaveBeenCalledWith(
        jasmine.objectContaining({
          duration: '15m'
        })
      );
    });

    it('should show < 1m for very short durations', async () => {
      const resolverPromise = executeResolver();

      setTimeout(() => {
        outputSubject.next({
          processId: 'process-123',
          type: 'stdout',
          data: 'Total import time: 0 hours and 0 minutes'
        });

        outputSubject.next({
          processId: 'process-123',
          type: 'exit',
          code: 0
        });
      }, 50);

      await resolverPromise;

      expect(mockConfigService.setMigrationResults).toHaveBeenCalledWith(
        jasmine.objectContaining({
          duration: '< 1m'
        })
      );
    });

    it('should handle singular post and media', async () => {
      const resolverPromise = executeResolver();

      setTimeout(() => {
        outputSubject.next({
          processId: 'process-123',
          type: 'stdout',
          data: 'imported 1 post with 1 media'
        });

        outputSubject.next({
          processId: 'process-123',
          type: 'exit',
          code: 0
        });
      }, 50);

      await resolverPromise;

      expect(mockConfigService.setMigrationResults).toHaveBeenCalledWith(
        jasmine.objectContaining({
          postsImported: 1,
          mediaCount: 1
        })
      );
    });
  });

  describe('Error handling', () => {
    it('should handle CLI execution errors', async () => {
      mockConfigService.getBlueskyCredentials.and.returnValue({
        username: '@user.bsky.social',
        password: 'test-password'
      });
      mockCLIService.executeMigration.and.returnValue(Promise.reject(new Error('CLI failed')));

      const result = await executeResolver();

      expect(result).toBe(false);
      expect(mockLogger.error).toHaveBeenCalledWith(jasmine.stringContaining('Error starting migration'), jasmine.any(Error));
      expect(mockSnackBar.open).toHaveBeenCalledWith('Failed to start migration', 'Close', jasmine.any(Object));
    });

    it('should return false on configuration errors', async () => {
      mockConfigService.getBlueskyCredentials.and.returnValue(null);

      const result = await executeResolver();

      expect(result).toBe(false);
      expect(mockSnackBar.open).toHaveBeenCalledWith('Failed to start migration', 'Close', jasmine.any(Object));
    });
  });

  describe('Cleanup', () => {
    beforeEach(() => {
      mockConfigService.getBlueskyCredentials.and.returnValue({
        username: '@user.bsky.social',
        password: 'test-password'
      });
    });

    it('should reset component and hide splash on success', async () => {
      const resolverPromise = executeResolver();

      setTimeout(() => {
        outputSubject.next({
          processId: 'process-123',
          type: 'exit',
          code: 0
        });
      }, 50);

      await resolverPromise;

      expect(mockSplashScreenLoading.setComponent).toHaveBeenCalledWith(null);
      expect(mockSplashScreenLoading.hide).toHaveBeenCalled();
    });

    it('should reset component and hide splash on error', async () => {
      const resolverPromise = executeResolver();

      setTimeout(() => {
        outputSubject.next({
          processId: 'process-123',
          type: 'exit',
          code: 1
        });
      }, 50);

      try {
        await resolverPromise;
      } catch {
        // Expected
      }

      expect(mockSplashScreenLoading.setComponent).toHaveBeenCalledWith(null);
      expect(mockSplashScreenLoading.hide).toHaveBeenCalled();
    });

    it('should reset component and hide splash on configuration error', async () => {
      mockConfigService.getBlueskyCredentials.and.returnValue(null);

      await executeResolver();

      expect(mockSplashScreenLoading.setComponent).toHaveBeenCalledWith(null);
      expect(mockSplashScreenLoading.hide).toHaveBeenCalled();
    });
  });

  describe('Logging', () => {
    beforeEach(() => {
      mockConfigService.getBlueskyCredentials.and.returnValue({
        username: '@user.bsky.social',
        password: 'test-password'
      });
    });

    it('should log configuration details', (done) => {
      executeResolver().catch(() => {});

      setTimeout(() => {
        expect(mockLogger.log).toHaveBeenCalledWith(jasmine.stringContaining('[MIGRATE] Starting native migration resolver'));
        expect(mockLogger.log).toHaveBeenCalledWith(jasmine.stringContaining('[MIGRATE] Loading configuration'));
        expect(mockLogger.log).toHaveBeenCalledWith(jasmine.stringContaining('[MIGRATE] Configuration loaded'));
        done();
      }, 50);
    });

    it('should log CLI output', (done) => {
      executeResolver().catch(() => {});

      setTimeout(() => {
        outputSubject.next({
          processId: 'process-123',
          type: 'stdout',
          data: 'Test output line'
        });

        setTimeout(() => {
          expect(mockLogger.log).toHaveBeenCalledWith(jasmine.stringContaining('[CLI OUTPUT] Test output line'));
          done();
        }, 50);
      }, 50);
    });
  });
});

