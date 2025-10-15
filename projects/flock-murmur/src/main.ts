import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { inject } from '@vercel/analytics';
import { injectSpeedInsights } from '@vercel/speed-insights';

// Initialize Vercel Analytics and Speed Insights
if (typeof window !== 'undefined') {
  inject();
  injectSpeedInsights();
}

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
