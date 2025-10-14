import { Environment } from './environment.interface';

export const environment: Environment = {
  production: false,
  sentry: {
    dsn: 'https://c525bad84d7baf7a00631c940b44a980@o4506526838620160.ingest.us.sentry.io/4510187648712704', // Set via SENTRY_DSN environment variable or replace with your DSN
    environment: 'electron-development',
    tracesSampleRate: 1.0
  }
};

