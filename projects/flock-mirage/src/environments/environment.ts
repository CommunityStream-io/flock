import { Environment } from './environment.interface';

export const environment: Environment = {
  production: false,
  enableTestModes: true,
  archiveExtractDelay: 5000, // in ms
  sentry: {
    dsn: null, // Set via environment variable or replace with your DSN
    environment: 'development',
    tracesSampleRate: 1.0
  }
};
