import { Environment } from './environment.interface';

export const environment: Environment = {
  production: false,
  apiBaseUrl: 'http://localhost:3000/api',
  blueskyApiUrl: 'https://bsky.social/xrpc',
  enableTestModes: true,
  vercelAnalytics: false
};
