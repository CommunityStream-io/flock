import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';

import { routes } from './app.routes';
import { FILE_PROCESSOR, LOGGER, SentryLogger } from 'shared';
import { FileProcessor } from './service/file-processor';
import { ConsoleLogger } from './service/console-logger';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimations(),
    provideHttpClient(),
    {
      provide: FILE_PROCESSOR,
      useClass: FileProcessor
    },
    {
      provide: LOGGER,
      useClass: ConsoleLogger
    }
  ]
};
