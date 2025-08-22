import { Injectable } from '@angular/core';
import { Logger } from './interfaces/logger';

@Injectable({
  providedIn: 'root'
})
export class SentryLogger implements Logger {
  instrument(appName: string): Promise<void> {
    // TODO configure sentry
    throw new Error('Method not implemented.');
  }

  log(message: string): void {
    // Implement Sentry logging logic here
  }

  error(message: string): void {
    // Implement Sentry error logging logic here
  }

  warn(message: string): void {
    // Implement Sentry warning logging logic here
  }

  workflow(message: string): void {
    // Implement Sentry workflow logging logic here
  }

}
