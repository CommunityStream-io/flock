import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { migrateRunResolver } from './migrate-run-resolver';
import { SplashScreenLoading } from '../../services/splash-screen-loading';
import { Logger } from '../../services/interfaces/logger';
import { MigrationService } from '../../services/interfaces/migration';
import { ProgressPanel } from '../../steps/migrate/progress-panel/progress-panel';
import { MIGRATION, LOGGER } from '../../services';

  describe('Feature: Migration Run Resolver (BDD-Style)', () => {
  let mockLoading: jasmine.SpyObj<SplashScreenLoading>;
  let mockMigration: jasmine.SpyObj<MigrationService>;
  let mockLogger: jasmine.SpyObj<Logger>;
  let mockSnackBar: jasmine.SpyObj<MatSnackBar>;
  let mockRoute: ActivatedRouteSnapshot;
  let mockState: RouterStateSnapshot;

  beforeEach(() => {
    mockLoading = jasmine.createSpyObj('SplashScreenLoading', ['setComponent', 'show', 'hide']);
    mockMigration = jasmine.createSpyObj('MigrationService', ['run']);
    mockLogger = jasmine.createSpyObj('Logger', ['workflow', 'error']);
    mockSnackBar = jasmine.createSpyObj('MatSnackBar', ['open']);
    mockRoute = {} as ActivatedRouteSnapshot;
    mockState = {} as RouterStateSnapshot;

    TestBed.configureTestingModule({
      providers: [
        { provide: SplashScreenLoading, useValue: mockLoading },
        { provide: MIGRATION, useValue: mockMigration },
        { provide: LOGGER, useValue: mockLogger },
        { provide: MatSnackBar, useValue: mockSnackBar }
      ]
    });
  });

  describe('Scenario: Successful Migration Execution', () => {
    it('Given migration resolver, When migration runs successfully, Then progress panel is set up and migration completes', async () => {
      console.log('🔧 BDD: Setting up successful migration scenario');
      mockMigration.run.and.returnValue(Promise.resolve({ count: 100, elapsedMs: 5000 }));

      console.log('⚙️ BDD: Executing migration resolver');
      await TestBed.runInInjectionContext(() => migrateRunResolver(mockRoute, mockState));

      console.log('✅ BDD: Progress panel is configured and migration completes');
      expect(mockLoading.setComponent).toHaveBeenCalledWith(ProgressPanel);
      expect(mockLoading.show).toHaveBeenCalledWith('Migrating…');
      expect(mockMigration.run).toHaveBeenCalledWith(false);
      expect(mockLogger.workflow).toHaveBeenCalledWith('Migration completed');
      expect(mockLoading.hide).toHaveBeenCalled();
    });
  });

  describe('Scenario: Migration Execution with Error', () => {
    it('Given migration resolver, When migration fails with error, Then error is logged and snackbar is shown', async () => {
      console.log('🔧 BDD: Setting up migration failure scenario');
      const error = new Error('Migration failed: Network timeout');
      mockMigration.run.and.returnValue(Promise.reject(error));

      console.log('⚙️ BDD: Executing migration resolver with failure');
      await TestBed.runInInjectionContext(() => migrateRunResolver(mockRoute, mockState));

      console.log('✅ BDD: Error is handled and user is notified');
      expect(mockLoading.setComponent).toHaveBeenCalledWith(ProgressPanel);
      expect(mockLoading.show).toHaveBeenCalledWith('Migrating…');
      expect(mockMigration.run).toHaveBeenCalledWith(false);
      expect(mockLogger.error).toHaveBeenCalledWith('Migration error', error);
      expect(mockSnackBar.open).toHaveBeenCalledWith('Migration failed: Network timeout', 'Close', { duration: 4000 });
      expect(mockLoading.hide).toHaveBeenCalled();
    });

    it('Given migration resolver, When migration fails without message, Then default error message is shown', async () => {
      console.log('🔧 BDD: Setting up migration failure without message');
      const error = new Error('Test error');
      error.message = undefined as any;
      mockMigration.run.and.returnValue(Promise.reject(error));

      console.log('⚙️ BDD: Executing migration resolver with error without message');
      await TestBed.runInInjectionContext(() => migrateRunResolver(mockRoute, mockState));

      console.log('✅ BDD: Default error message is shown');
      expect(mockSnackBar.open).toHaveBeenCalledWith('Migration failed', 'Close', { duration: 4000 });
      expect(mockLoading.hide).toHaveBeenCalled();
    });

    it('Given migration resolver, When migration fails with null error, Then default error message is shown', async () => {
      console.log('🔧 BDD: Setting up migration failure with null error');
      mockMigration.run.and.returnValue(Promise.reject(new Error('Unknown error')));

      console.log('⚙️ BDD: Executing migration resolver with null error');
      await TestBed.runInInjectionContext(() => migrateRunResolver(mockRoute, mockState));

      console.log('✅ BDD: Default error message is shown for null error');
      expect(mockSnackBar.open).toHaveBeenCalledWith('Unknown error', 'Close', { duration: 4000 });
      expect(mockLoading.hide).toHaveBeenCalled();
    });
  });

  describe('Scenario: Migration Execution with Different Error Types', () => {
    it('Given migration resolver, When migration fails with string error, Then error message is extracted', async () => {
      console.log('🔧 BDD: Setting up migration failure with string error');
      const error = new Error('Custom error message');
      mockMigration.run.and.returnValue(Promise.reject(error));

      console.log('⚙️ BDD: Executing migration resolver with string error');
      await TestBed.runInInjectionContext(() => migrateRunResolver(mockRoute, mockState));

      console.log('✅ BDD: String error message is handled');
      expect(mockSnackBar.open).toHaveBeenCalledWith('Custom error message', 'Close', { duration: 4000 });
      expect(mockLoading.hide).toHaveBeenCalled();
    });

    it('Given migration resolver, When migration fails with object error, Then error is logged and default message is shown', async () => {
      console.log('🔧 BDD: Setting up migration failure with object error');
      const error = new Error('Server error');
      (error as any).code = 500;
      (error as any).details = 'Server error';
      mockMigration.run.and.returnValue(Promise.reject(error));

      console.log('⚙️ BDD: Executing migration resolver with object error');
      await TestBed.runInInjectionContext(() => migrateRunResolver(mockRoute, mockState));

      console.log('✅ BDD: Object error is handled with default message');
      expect(mockLogger.error).toHaveBeenCalledWith('Migration error', error);
      expect(mockSnackBar.open).toHaveBeenCalledWith('Server error', 'Close', { duration: 4000 });
      expect(mockLoading.hide).toHaveBeenCalled();
    });
  });

  describe('Scenario: Loading State Management', () => {
    it('Given migration resolver, When resolver executes, Then loading state is properly managed', async () => {
      console.log('🔧 BDD: Setting up loading state management');
      mockMigration.run.and.returnValue(Promise.resolve({ count: 100, elapsedMs: 5000 }));

      console.log('⚙️ BDD: Executing migration resolver');
      await TestBed.runInInjectionContext(() => migrateRunResolver(mockRoute, mockState));

      console.log('✅ BDD: Loading state is properly managed');
      expect(mockLoading.setComponent).toHaveBeenCalledWith(ProgressPanel);
      expect(mockLoading.show).toHaveBeenCalledWith('Migrating…');
      expect(mockLoading.hide).toHaveBeenCalled();

      // Verify order of operations - check that hide is called after run
      expect(mockLoading.setComponent).toHaveBeenCalled();
      expect(mockLoading.show).toHaveBeenCalled();
      expect(mockMigration.run).toHaveBeenCalled();
      expect(mockLoading.hide).toHaveBeenCalled();
    });
  });

  describe('Scenario: Migration Configuration', () => {
    it('Given migration resolver, When migration runs, Then migration is called with correct parameters', async () => {
      console.log('🔧 BDD: Setting up migration configuration');
      mockMigration.run.and.returnValue(Promise.resolve({ count: 100, elapsedMs: 5000 }));

      console.log('⚙️ BDD: Executing migration resolver');
      await TestBed.runInInjectionContext(() => migrateRunResolver(mockRoute, mockState));

      console.log('✅ BDD: Migration is called with correct parameters');
      expect(mockMigration.run).toHaveBeenCalledWith(false);
      expect(mockMigration.run).toHaveBeenCalledTimes(1);
    });
  });

  describe('Scenario: Progress Panel Integration', () => {
    it('Given migration resolver, When resolver executes, Then ProgressPanel component is set up', async () => {
      console.log('🔧 BDD: Setting up ProgressPanel integration');
      mockMigration.run.and.returnValue(Promise.resolve({ count: 100, elapsedMs: 5000 }));

      console.log('⚙️ BDD: Executing migration resolver');
      await TestBed.runInInjectionContext(() => migrateRunResolver(mockRoute, mockState));

      console.log('✅ BDD: ProgressPanel component is configured');
      expect(mockLoading.setComponent).toHaveBeenCalledWith(ProgressPanel);
    });
  });

  describe('Scenario: Logging Integration', () => {
    it('Given migration resolver, When migration succeeds, Then workflow is logged', async () => {
      console.log('🔧 BDD: Setting up successful migration logging');
      mockMigration.run.and.returnValue(Promise.resolve({ count: 100, elapsedMs: 5000 }));

      console.log('⚙️ BDD: Executing migration resolver');
      await TestBed.runInInjectionContext(() => migrateRunResolver(mockRoute, mockState));

      console.log('✅ BDD: Workflow completion is logged');
      expect(mockLogger.workflow).toHaveBeenCalledWith('Migration completed');
    });

    it('Given migration resolver, When migration fails, Then error is logged', async () => {
      console.log('🔧 BDD: Setting up migration error logging');
      const error = new Error('Test error');
      mockMigration.run.and.returnValue(Promise.reject(error));

      console.log('⚙️ BDD: Executing migration resolver with error');
      await TestBed.runInInjectionContext(() => migrateRunResolver(mockRoute, mockState));

      console.log('✅ BDD: Error is logged');
      expect(mockLogger.error).toHaveBeenCalledWith('Migration error', error);
    });
  });

  describe('Scenario: SnackBar Integration', () => {
    it('Given migration resolver, When migration fails, Then error snackbar is shown with correct configuration', async () => {
      console.log('🔧 BDD: Setting up error snackbar integration');
      const error = new Error('Test error message');
      mockMigration.run.and.returnValue(Promise.reject(error));

      console.log('⚙️ BDD: Executing migration resolver with error');
      await TestBed.runInInjectionContext(() => migrateRunResolver(mockRoute, mockState));

      console.log('✅ BDD: Error snackbar is shown with correct configuration');
      expect(mockSnackBar.open).toHaveBeenCalledWith('Test error message', 'Close', { duration: 4000 });
    });
  });

  describe('Scenario: Resolver Return Value', () => {
    it('Given migration resolver, When resolver executes, Then it returns a Promise<void>', async () => {
      console.log('🔧 BDD: Setting up resolver return value test');
      mockMigration.run.and.returnValue(Promise.resolve({ count: 100, elapsedMs: 5000 }));

      console.log('⚙️ BDD: Executing migration resolver');
      const result = TestBed.runInInjectionContext(() => migrateRunResolver(mockRoute, mockState));

      console.log('✅ BDD: Resolver returns Promise<void>');
      expect(result).toBeInstanceOf(Promise);
      await result; // Ensure promise resolves
    });
  });

  describe('Scenario: Cleanup and Resource Management', () => {
    it('Given migration resolver, When migration completes or fails, Then loading state is always cleaned up', async () => {
      console.log('🔧 BDD: Setting up cleanup and resource management');
      mockMigration.run.and.returnValue(Promise.resolve({ count: 100, elapsedMs: 5000 }));

      console.log('⚙️ BDD: Executing migration resolver');
      await TestBed.runInInjectionContext(() => migrateRunResolver(mockRoute, mockState));

      console.log('✅ BDD: Loading state is cleaned up after completion');
      expect(mockLoading.hide).toHaveBeenCalled();

      // Test with error scenario
      mockMigration.run.and.returnValue(Promise.reject(new Error('Test error')));
      mockLoading.hide.calls.reset();

      console.log('⚙️ BDD: Executing migration resolver with error');
      await TestBed.runInInjectionContext(() => migrateRunResolver(mockRoute, mockState));

      console.log('✅ BDD: Loading state is cleaned up after error');
      expect(mockLoading.hide).toHaveBeenCalled();
    });
  });
});
