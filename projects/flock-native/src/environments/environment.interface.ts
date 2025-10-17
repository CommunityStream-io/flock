import { SentryConfig } from 'shared';

export interface Environment {
  production: boolean;
  sentry?: SentryConfig;
  /**
   * Controls availability of development-only test modes (video/mixed)
   * Must be false in production builds to avoid exposing dev tools
   */
  enableTestModes?: boolean;
  /**
   * Application version - can be set via environment variable in CI/CD
   */
  version?: string;
}

