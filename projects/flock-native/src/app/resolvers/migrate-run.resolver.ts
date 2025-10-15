import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { LOGGER, Logger, SplashScreenLoading, ConfigServiceImpl } from 'shared';
import { catchError, finalize, from, Observable, of, tap } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CLIService } from '../service/cli/cli.service';
import { environment } from '../../environments/environment';
import { MigrationProgressComponent } from '../components/migration-progress/migration-progress.component';

/**
 * Parse migration statistics from CLI output
 */
function parseMigrationStats(output: string): {
  postsImported: number;
  mediaCount: number;
  duration: string;
  success: boolean;
} {
  // Example output: "imported 10 posts with 20 media"
  const importMatch = output.match(/imported (\d+) posts? with (\d+) media/i);
  
  // Example: "Total import time: 0 hours and 0 minutes"
  const timeMatch = output.match(/Total import time: (\d+) hours? and (\d+) minutes?/i);
  
  const postsImported = importMatch ? parseInt(importMatch[1], 10) : 0;
  const mediaCount = importMatch ? parseInt(importMatch[2], 10) : 0;
  
  let duration = 'Unknown';
  if (timeMatch) {
    const hours = parseInt(timeMatch[1], 10);
    const minutes = parseInt(timeMatch[2], 10);
    if (hours > 0) {
      duration = `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      duration = `${minutes}m`;
    } else {
      duration = '< 1m';
    }
  }
  
  return {
    postsImported,
    mediaCount,
    duration,
    success: postsImported > 0 || output.includes('Import finished')
  };
}

/**
 * Native migration resolver that executes the real CLI
 * This replaces the simulated migration with actual CLI execution
 */
export const nativeMigrateRunResolver: ResolveFn<Observable<boolean>> = () => {
  const logger = inject<Logger>(LOGGER);
  const splashScreenLoading = inject(SplashScreenLoading);
  const snackBar = inject(MatSnackBar);
  const configService = inject(ConfigServiceImpl);
  const cliService = inject(CLIService);
  
  logger.log('🦅 [MIGRATE] Starting native migration resolver');
  
  // Set migration progress component
  splashScreenLoading.setComponent(MigrationProgressComponent);
  splashScreenLoading.show('Starting Migration...');
  
  return from((async () => {
    try {
      logger.log('🦅 [MIGRATE] Loading configuration...');
      
      // Get configuration from config service
      const credentials = configService.getBlueskyCredentials();
      const testModesAllowed = !environment.production && !!environment.enableTestModes;
      const requestedTestMode = configService.testMode;
      const testMode = testModesAllowed ? requestedTestMode : 'none';
      const archivePath = configService.archivePath;
      
      logger.log('🦅 [MIGRATE] Test mode:', testMode);
      logger.log('🦅 [MIGRATE] Archive path:', archivePath || 'Not set');
      
      if (!credentials || !credentials.username || !credentials.password) {
        throw new Error('Bluesky credentials not found. Please authenticate first.');
      }

      // In production, require a real archive path (no test modes)
      if (environment.production && !archivePath) {
        throw new Error('Archive not extracted. Please return to upload step.');
      }
      
      logger.log('🦅 [MIGRATE] Configuration loaded');
      logger.log('🦅 [MIGRATE] Archive path:', archivePath || '(will be set by test mode)');
      logger.log(`🦅 [MIGRATE] Date range: ${configService.startDate || 'none'} to ${configService.endDate || 'none'}`);
      logger.log('🦅 [MIGRATE] Simulation mode:', configService.simulate ? 'ON' : 'OFF');
      logger.log('🦅 [MIGRATE] Test mode:', testMode);

          // Execute the migration CLI
          // Use archivePath if available, otherwise use placeholder (will be overridden by test mode)
          const processId = await cliService.executeMigration(archivePath || '/placeholder', {
            blueskyHandle: credentials.username,
            blueskyPassword: credentials.password,
            dateFrom: configService.startDate,
            dateTo: configService.endDate,
            simulate: configService.simulate,
            testMode: testMode
          });

      logger.log(`🦅 [MIGRATE] CLI process started: ${processId}`);
      
      // Wait for CLI to complete
      return new Promise<boolean>((resolve, reject) => {
        let allOutput = '';
        let postsCreated = 0;
        
        const outputSubscription = cliService.output$.subscribe((data) => {
          if (data.type === 'stdout' || data.type === 'stderr') {
            const output = data.data || '';
            allOutput += output;
            logger.log(`🦅 [CLI OUTPUT] ${output}`);
            
            // Track posts being created
            if (output.includes('Bluesky post created with url:')) {
              postsCreated++;
              logger.log(`🦅 [MIGRATE] Progress: ${postsCreated} posts created`);
            }
          } else if (data.type === 'exit') {
            // Unsubscribe from output
            outputSubscription.unsubscribe();
            
            if (data.code === 0) {
              logger.log('🦅 [MIGRATE] ✅ Migration completed successfully');
              
              // Parse final stats from output
              const stats = parseMigrationStats(allOutput);
              logger.log('🦅 [MIGRATE] Parsed stats:', JSON.stringify(stats));
              
              // Store results in config service
              configService.setMigrationResults(stats);
              
              snackBar.open('Migration completed successfully!', 'Close', { duration: 5000 });
              resolve(true);
            } else {
              logger.error(`🦅 [MIGRATE] ❌ Migration failed with exit code ${data.code}`);
              snackBar.open(`Migration failed (code ${data.code})`, 'Close', { duration: 5000 });
              
              // Store failure in results
              configService.setMigrationResults({
                postsImported: 0,
                mediaCount: 0,
                duration: '0',
                success: false
              });
              
              reject(new Error(`Migration failed with exit code ${data.code}`));
            }
          }
        });
      });
    } catch (error) {
      logger.error('🦅 [MIGRATE] Error starting migration:', error);
      throw error;
    }
  })()).pipe(
    tap((result) => {
      if (result) {
        logger.log('🦅 [MIGRATE] Migration resolver completed');
      }
    }),
    catchError((error) => {
      logger.error('🦅 [MIGRATE] Migration resolver error:', error);
      snackBar.open('Failed to start migration', 'Close', { duration: 3000 });
      return of(false);
    }),
    finalize(() => {
      // Reset component
      splashScreenLoading.setComponent(null);
      splashScreenLoading.hide();
    })
  );
};

