import { Route, Routes } from '@angular/router';
import {
  Auth,
  Complete,
  Config,
  LandingPage,
  Migrate,
  Upload,
  StepLayout,
  StepRoute,
  uploadValidGuard,
  extractArchiveResolver,
  authDeactivateGuard
} from 'shared';

export const routes: Routes = [
  {
    path: 'home',
    component: LandingPage,
    title: 'Bluesky Social Migrator',
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
          extractedArchive: extractArchiveResolver
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
      },
      {
        path: 'migrate',
        component: Migrate,
        title: 'Migrate Data',
        data: {
          description: 'Start the migration process',
          next: 'complete',
          previous: 'config',
        }
      },
      {
        path: 'complete',
        component: Complete,
        title: 'Migration Complete',
        data: {
          description: 'Migration completed successfully',
          previous: 'migrate',
        },
      },
    ] as (StepRoute & Route)[],
  },
  {
    path: '**',
    redirectTo: '/home'
  },
];
