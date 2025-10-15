import { Environment } from './environment.interface';

export const environment: Environment = {
  production: true,
  enableTestModes: false,
  sentry: {
    dsn: '${NATIVE_SENTRY_DSN}', // Replaced at build time by CI/CD
    environment: 'electron-production',
    tracesSampleRate: 0.1 // 10% sampling in production to reduce costs
  }
};

