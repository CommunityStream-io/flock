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
  CONFIG,
  ConfigServiceImpl,
  StepReuseStrategy,
  RouterLoggingService,
  TEST_MODES_ENABLED
} from 'shared';
import {
  MurmurFileProcessor,
  ConsoleLogger,
  MurmurBluesky,
  MurmurMigration
} from './service';
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
      provide: CONFIG,
      useClass: ConfigServiceImpl,
    },
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
    {
      provide: MIGRATION,
      useClass: MurmurMigration,
    },
    RouterLoggingService,
    // Enable test modes in development
    { provide: TEST_MODES_ENABLED, useValue: !environment.production && !!environment.enableTestModes },
  ]
};
