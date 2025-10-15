import { SentryConfig } from 'shared';

export interface Environment {
  production: boolean;
  archiveExtractDelay: number;
  sentry?: SentryConfig;
  /**
   * Controls availability of development-only test modes (video/mixed)
   * Must be false in production builds to avoid exposing dev tools
   */
  enableTestModes?: boolean;
}
