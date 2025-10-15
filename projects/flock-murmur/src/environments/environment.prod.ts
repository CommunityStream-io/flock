import { Environment } from './environment.interface';

export const environment: Environment = {
  production: true,
  apiBaseUrl: '/api',
  blueskyApiUrl: 'https://bsky.social/xrpc',
  enableTestModes: false,
  vercelAnalytics: true
};
