import { Routes } from '@angular/router';
import { LandingPageComponent } from 'shared';

export const routes: Routes = [
  {
    path: '',
    component: LandingPageComponent,
    title: 'Bluesky Social Migrator'
  },
  {
    path: '',
    loadComponent: () => import('shared').then(m => m.StepLayoutComponent),
    children: [
      {
        path: 'upload',
        loadComponent: () => import('shared').then(m => m.UploadStepComponent),
        title: 'Upload Instagram Export',
        data: { prev: null, next: '/auth', description: 'Upload your Instagram export ZIP file to begin migration' }
      },
      {
        path: 'auth',
        loadComponent: () => import('shared').then(m => m.AuthStepComponent),
        title: 'Bluesky Authentication',
        data: { prev: '/upload', next: '/config', description: 'Connect your Bluesky account with credentials' }
      },
      {
        path: 'config',
        loadComponent: () => import('shared').then(m => m.ConfigStepComponent),
        title: 'Migration Settings',
        data: { prev: '/auth', next: '/execute', description: 'Configure migration options and preferences' }
      },
      {
        path: 'execute',
        loadComponent: () => import('shared').then(m => m.ExecuteStepComponent),
        title: 'Execute Migration',
        data: { prev: '/config', next: '/complete', description: 'Run the migration process with your settings' }
      },
      {
        path: 'complete',
        loadComponent: () => import('shared').then(m => m.CompleteStepComponent),
        title: 'Migration Complete',
        data: { prev: '/execute', next: null, description: 'Review results and download migration report' }
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
