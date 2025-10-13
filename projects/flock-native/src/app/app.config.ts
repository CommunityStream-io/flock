import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import {
  provideRouter,
  RouteReuseStrategy,
  withRouterConfig,
} from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';

import { routes } from './app.routes';
import {
  FILE_PROCESSOR,
  LOGGER,
  BLUESKY,
  MIGRATION,
  SplashScreenLoading,
  StepReuseStrategy,
  Migration,
  RouterLoggingService
} from 'shared';
import { NativeFileProcessor } from './service/native-file-processor/native-file-processor';
import { ConsoleLogger } from './service/console-logger/console-logger';
import { Bluesky } from './service/bluesky/bluesky';
import { ExtractionProgressService } from './service/extraction-progress/extraction-progress.service';

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
      useClass: NativeFileProcessor,
    },
    {
      provide: LOGGER,
      useClass: ConsoleLogger,
    },
    {
      provide: BLUESKY,
      useClass: Bluesky,
    },
    SplashScreenLoading,
    { provide: MIGRATION, useExisting: Migration },
    RouterLoggingService,
    ExtractionProgressService,
  ],
};
