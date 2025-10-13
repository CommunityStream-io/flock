import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { MIGRATION, LOGGER, Logger, SplashScreenLoading } from '../../services';
import type { MigrationService } from '../../services/interfaces/migration';

/**
 * Resolver that resets migration state and clears the progress panel component.
 * Should be applied to routes that need a clean migration state (e.g., config, auth, migrate steps).
 * 
 * NOTE: Only clears the component if it's NOT an extraction in progress.
 * The extraction resolver manages its own component lifecycle.
 */
export const migrationResetResolver: ResolveFn<void> = () => {
  const migration = inject<MigrationService>(MIGRATION);
  const loading = inject(SplashScreenLoading);
  const logger = inject<Logger>(LOGGER);
  
  logger.log('Resetting migration state via resolver');
  
  // Reset migration state
  migration.reset();
  
  // Only clear component if we're not currently showing extraction progress
  // Extraction has its own lifecycle managed by extractArchiveResolver
  const currentComponent = loading.component.getValue();
  const isExtractionComponent = currentComponent?.name?.includes('ExtractionProgress');
  
  if (!isExtractionComponent) {
    logger.log('Clearing component (not extraction)');
    loading.setComponent(null);
  } else {
    logger.log('Skipping component clear - extraction in progress');
  }
  
  return undefined;
};

