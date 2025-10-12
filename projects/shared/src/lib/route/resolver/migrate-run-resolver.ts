import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { SplashScreenLoading, MIGRATION, LOGGER, Logger } from '../../services';
import { MatSnackBar } from '@angular/material/snack-bar';
import type { MigrationService } from '../../services/interfaces/migration';
import { ProgressPanel } from '../../steps/migrate/progress-panel/progress-panel';

export const migrateRunResolver: ResolveFn<Promise<void>> = async () => {
  const loading = inject(SplashScreenLoading);
  const migration = inject<MigrationService>(MIGRATION);
  const logger = inject<Logger>(LOGGER);
  const snackBar = inject(MatSnackBar);
  // Show splash message and separate progress overlay
  loading.show('Migrating…');
  loading.setComponent(ProgressPanel);
  try {
    await migration.run(false);
    logger.workflow('Migration completed');
  } catch (error: any) {
    logger.error('Migration error', error);
    snackBar.open(error?.message || 'Migration failed', 'Close', { duration: 4000 });
  } finally {
    loading.hide();
    loading.setComponent(null);
  }
};


