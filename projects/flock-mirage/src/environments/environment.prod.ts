import { Environment } from './environment.interface';

export const environment: Environment = {
  production: true,
  archiveExtractDelay: 5000, // in ms
  sentry: {
    dsn: '${MIRAGE_SENTRY_DSN}', // Replaced at build time by CI/CD
    environment: 'production',
    tracesSampleRate: 0.1 // 10% sampling in production to reduce costs
  }
};
