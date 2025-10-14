import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { MIGRATION, LOGGER, Logger } from '../../services';
import type { MigrationService } from '../../services/interfaces/migration';

/**
 * Resolver that resets migration state.
 * Should be applied to routes that need a clean migration state (e.g., config, auth, migrate steps).
 */
export const migrationResetResolver: ResolveFn<void> = () => {
  const migration = inject<MigrationService>(MIGRATION);
  const logger = inject<Logger>(LOGGER);
  
  logger.log('Resetting migration state via resolver');
  
  // Reset migration state
  migration.reset();
  
  return undefined;
};

