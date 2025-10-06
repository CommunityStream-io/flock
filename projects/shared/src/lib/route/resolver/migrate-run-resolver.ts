import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { SplashScreenLoading, MIGRATION, LOGGER, Logger } from '../../services';
import { MatSnackBar } from '@angular/material/snack-bar';
import type { MigrationService } from '../../services/interfaces/migration';

export const migrateRunResolver: ResolveFn<Promise<void>> = async () => {
  const loading = inject(SplashScreenLoading);
  const migration = inject<MigrationService>(MIGRATION);
  const logger = inject<Logger>(LOGGER);
  const snackBar = inject(MatSnackBar);
  // Show splash and set progress component via service
  // Component is set where we navigate, here we ensure loading is visible
  loading.show('Migrating…');
  try {
    await migration.run(false);
    logger.workflow('Migration completed');
  } catch (error: any) {
    logger.error('Migration error', error);
    snackBar.open(error?.message || 'Migration failed', 'Close', { duration: 4000 });
  } finally {
    loading.hide();
  }
};


