import { Route, Routes } from '@angular/router';
import {
  Auth,
  Complete,
  Config,
  LandingPage,
  Licenses,
  Migrate,
  Upload,
  StepLayout,
  StepRoute,
  uploadValidGuard,
  authValidGuard,
  extractArchiveResolver,
  authDeactivateGuard,
  migrateRunResolver,
  migrationResetResolver,
  loggerInstrumentationResolver
} from 'shared';

export const routes: Routes = [
  {
    path: 'home',
    component: LandingPage,
    title: 'Bluesky Social Migrator',
  },
  {
    path: 'licenses',
    component: Licenses,
    title: 'Licenses & Attributions',
  },
  {
    path: 'step',
    component: StepLayout,
    children: [
      {
        path: 'upload',
        component: Upload,
        title: 'Upload Data',
        data: { description: 'Upload instagram archive', next: 'auth' },
        canDeactivate: [uploadValidGuard],
      },
      {
        path: 'auth',
        component: Auth,
        title: 'Authenticate with Bluesky',
        data: {
          description: 'Authenticate with Bluesky to migrate',
          next: 'config',
          previous: 'upload',
        },
        canDeactivate: [authDeactivateGuard],
        resolve: {
          extractedArchive: extractArchiveResolver,
          migrationReset: migrationResetResolver
        },
      },
      {
        path: 'config',
        component: Config,
        title: 'Configuration',
        data: {
          description: 'Configure migration settings',
          next: 'migrate',
          previous: 'auth',
        },
        resolve: {
          migrationReset: migrationResetResolver
        },
      },
      {
        path: 'migrate',
        component: Migrate,
        title: 'Migrate Data',
        data: {
          description: 'Start the migration process',
          next: 'complete',
          previous: 'config',
        },
        resolve: {
          migrationReset: migrationResetResolver
        },
      },
      {
        path: 'complete',
        component: Complete,
        title: 'Migration Complete',
        data: {
          description: 'Migration completed successfully',
          previous: 'migrate',
        },
        resolve: {
          migrate: migrateRunResolver
        }
      },
    ] as (StepRoute & Route)[],
  },
  {
    path: '**',
    redirectTo: '/home'
  },
];
