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
        data: { prev: null, next: '/auth' }
      },
      {
        path: 'auth',
        loadComponent: () => import('shared').then(m => m.AuthStepComponent),
        title: 'Bluesky Authentication',
        data: { prev: '/upload', next: '/config' }
      },
      {
        path: 'config',
        loadComponent: () => import('shared').then(m => m.ConfigStepComponent),
        title: 'Migration Settings',
        data: { prev: '/auth', next: '/execute' }
      },
      {
        path: 'execute',
        loadComponent: () => import('shared').then(m => m.ExecuteStepComponent),
        title: 'Execute Migration',
        data: { prev: '/config', next: '/complete' }
      },
      {
        path: 'complete',
        loadComponent: () => import('shared').then(m => m.CompleteStepComponent),
        title: 'Migration Complete',
        data: { prev: '/execute', next: null }
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
