import { Routes } from '@angular/router';
import {
  AuthStepComponent,
  CompleteStepComponent,
  ConfigStepComponent,
  ExecuteStepComponent,
  LandingPageComponent,
  UploadStepComponent,
} from 'shared';

export const routes: Routes = [
  {
    path: 'landing',
    component: LandingPageComponent,
    title: 'Bluesky Social Migrator',
  },
  {
    path: 'step',
    children: [
      {
        path: 'upload',
        component: UploadStepComponent,
        title: 'Upload Instagram Export',
        data: {
          description:
            'Upload your Instagram export ZIP file to begin migration',
          prev: null,
          next: 'auth',
        },
      },
      {
        path: 'auth',
        component: AuthStepComponent,
        title: 'Bluesky Authentication',
        data: {
          description: 'Connect your Bluesky account with credentials',
          prev: 'upload',
          next: 'config',
        },
      },
      {
        path: 'config',
        component: ConfigStepComponent,
        title: 'Migration Settings',
        data: {
          description: 'Configure migration options and preferences',
          prev: 'auth',
          next: 'execute',
        },
      },
      {
        path: 'execute',
        component: ExecuteStepComponent,
        title: 'Execute Migration',
        data: {
          description: 'Run the migration process with your settings',
          prev: 'config',
          next: 'complete',
        },
      },
      {
        path: 'complete',
        component: CompleteStepComponent,
        title: 'Migration Complete',
        data: {
          description: 'Review results and download migration report',
          prev: 'execute',
          next: null,
        },
      },
    ],
  },
  { path: '**', redirectTo: 'landing' },
];
