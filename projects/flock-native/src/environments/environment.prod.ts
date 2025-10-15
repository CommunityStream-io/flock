import { Environment } from './environment.interface';

export const environment: Environment = {
  production: true,
  enableTestModes: false,
  sentry: {
    dsn: 'https://c525bad84d7baf7a00631c940b44a980@o4506526838620160.ingest.us.sentry.io/4510187648712704', // Hardcoded for proof-of-life testing
    environment: 'electron-production',
    tracesSampleRate: 0.1 // 10% sampling in production to reduce costs
  }
};

