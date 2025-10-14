import { SentryConfig } from 'shared';

export interface Environment {
  production: boolean;
  sentry?: SentryConfig;
}

