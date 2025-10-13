import { Route, Routes } from '@angular/router';
import {
  Auth,
  Complete,
  Config,
  LandingPage,
  Licenses,
  Migrate,
  StepLayout,
  StepRoute,
  Support,
  uploadValidGuard,
  authDeactivateGuard,
  extractArchiveResolver,
  migrationResetResolver,
  DistroPage
} from 'shared';
import { NativeUpload } from './steps/upload/upload';
import { nativeMigrateRunResolver } from './resolvers/migrate-run.resolver';

export const routes: Routes = [
  {
    path: 'home',
    component: LandingPage,
    title: 'Flock Native - Bluesky Social Migrator',
  },
  {
    path: 'distro',
    component: DistroPage,
    title: 'Flock Native Downloads',
  },
  {
    path: 'licenses',
    component: Licenses,
    title: 'Licenses & Attributions',
  },
  {
    path: 'support',
    component: Support,
    title: 'Support Flock',
  },
  {
    path: 'step',
    component: StepLayout,
    children: [
      {
        path: 'upload',
        component: NativeUpload,
        title: 'Upload Data',
        data: { description: 'Upload Instagram archive with native file picker', next: 'auth' },
        canDeactivate: [uploadValidGuard],
      },
      {
        path: 'auth',
        component: Auth,
        title: 'Authenticate with Bluesky',
        data: {
          description: 'Enter credentials, use/create app password in bsky',
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
          migrate: nativeMigrateRunResolver
        }
      },
    ] as (StepRoute & Route)[],
  },
  {
    path: '**',
    redirectTo: '/home'
  },
];
