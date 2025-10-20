/**
 * Environment configuration interface for Flock Murmur
 */
export interface Environment {
  production: boolean;
  apiBaseUrl: string;
  blueskyApiUrl: string;
  enableTestModes?: boolean;
  vercelAnalytics?: boolean;
}
