import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { Logger, LOGGER } from '../../services';

/**
 * Handles initializing our logging instrumentation.
 * @returns A promise that resolves when the instrumentation is complete.
 * @deprecated Did not work, needed to be done in app component
 */
export const loggerInstrumentationResolver: ResolveFn<Promise<void>> = () => {
  const logger = inject<Logger>(LOGGER);
  return logger.instrument('AppName');
};
