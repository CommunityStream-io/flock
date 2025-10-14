import { Environment } from './environment.interface';

export const environment: Environment = {
  production: true,
  sentry: {
    dsn: null, // Set your production Sentry DSN here or via build-time replacement
    environment: 'electron-production',
    tracesSampleRate: 0.1 // 10% sampling in production to reduce costs
  }
};

