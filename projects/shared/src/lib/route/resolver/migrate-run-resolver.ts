import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { SplashScreenLoading, MIGRATION, LOGGER, Logger } from '../../services';
import { MatSnackBar } from '@angular/material/snack-bar';
import type { MigrationService } from '../../services/interfaces/migration';
import { ProgressPanel } from '../../steps/migrate/progress-panel/progress-panel';

/**
 * Resolver that runs the migration process and displays progress.
 * This resolver handles:
 * - Setting up the ProgressPanel component for visual feedback
 * - Running the migration
 * - Cleaning up loading state after completion
 * 
 * Applied to the 'complete' route to trigger migration when navigating to completion screen.
 */
export const migrateRunResolver: ResolveFn<Promise<void>> = async () => {
  const loading = inject(SplashScreenLoading);
  const migration = inject<MigrationService>(MIGRATION);
  const logger = inject<Logger>(LOGGER);
  const snackBar = inject(MatSnackBar);
  
  // Set up progress panel component for migration feedback
  loading.setComponent(ProgressPanel);
  
  // Show splash message with progress overlay
  loading.show('Migrating…');
  
  try {
    await migration.run(false);
    logger.workflow('Migration completed');
  } catch (error: any) {
    logger.error('Migration error', error);
    snackBar.open(error?.message || 'Migration failed', 'Close', { duration: 4000 });
  } finally {
    loading.hide();
    // Note: ProgressPanel component is cleared by migrationResetResolver on next navigation
  }
};


