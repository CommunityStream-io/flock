import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, RouteReuseStrategy } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';

import { routes } from './app.routes';
import {
  FILE_PROCESSOR,
  LOGGER,
  BLUESKY,
  MIGRATION,
  StepReuseStrategy,
  Migration,
  RouterLoggingService,
  TEST_MODES_ENABLED
} from 'shared';
import { MurmurFileProcessor } from './service/murmur-file-processor/murmur-file-processor';
import { ConsoleLogger } from './service/console-logger/console-logger';
import { MurmurBluesky } from './service/bluesky/bluesky';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    {
      provide: RouteReuseStrategy,
      useClass: StepReuseStrategy,
    },
    provideAnimations(),
    provideHttpClient(),
    {
      provide: FILE_PROCESSOR,
      useClass: MurmurFileProcessor,
    },
    {
      provide: LOGGER,
      useClass: ConsoleLogger,
    },
    {
      provide: BLUESKY,
      useClass: MurmurBluesky,
    },
    { provide: MIGRATION, useExisting: Migration },
    RouterLoggingService,
    // Enable test modes in development
    { provide: TEST_MODES_ENABLED, useValue: !environment.production && !!environment.enableTestModes },
  ]
};
