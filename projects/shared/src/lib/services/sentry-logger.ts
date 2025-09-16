import { Injectable } from '@angular/core';
import { Logger } from './interfaces/logger';

@Injectable({
  providedIn: 'root'
})
export class SentryLogger implements Logger {
  instrument(appName: string): Promise<void> {
    // TODO configure sentry
    void appName;
    throw new Error('Method not implemented.');
  }

  log(message: string, _object?: unknown): void {
    // Implement Sentry logging logic here
    void message;
    void _object;
  }

  error(message: string, _object?: unknown): void {
    // Implement Sentry error logging logic here
    void message;
    void _object;
  }

  warn(message: string, _object?: unknown): void {
    // Implement Sentry warning logging logic here
    void message;
    void _object;
  }

  workflow(message: string, _object?: unknown): void {
    // Implement Sentry workflow logging logic here
    void message;
    void _object;
  }

}
