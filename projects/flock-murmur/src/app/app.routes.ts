import { Routes } from '@angular/router';
import {
  Auth,
  Complete,
  Config,
  LandingPage,
  Licenses,
  Migrate,
  Upload,
  StepLayout,
  Support,
  uploadValidGuard,
  authValidGuard,
  authDeactivateGuard,
  extractArchiveResolver,
  migrateRunResolver,
  migrationResetResolver
} from 'shared';

export const routes: Routes = [
  {
    path: 'home',
    component: LandingPage,
    title: 'Flock Murmur - Bluesky Social Migrator',
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
        component: Upload,
        title: 'Upload Data',
        data: { 
          description: 'Upload Instagram archive', 
          next: 'auth' 
        },
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
        canActivate: [authValidGuard],
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
        canActivate: [authValidGuard],
        resolve: {
          migrationRun: migrateRunResolver
        },
      },
      {
        path: 'complete',
        component: Complete,
        title: 'Migration Complete',
        data: {
          description: 'View migration results',
        },
        canActivate: [authValidGuard],
      },
      {
        path: '',
        redirectTo: 'upload',
        pathMatch: 'full'
      },
    ],
  },
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: '/home'
  },
];
