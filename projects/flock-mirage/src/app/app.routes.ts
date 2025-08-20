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
        title: 'Upload Instagram Export'
      },
      {
        path: 'auth',
        loadComponent: () => import('shared').then(m => m.AuthStepComponent),
        title: 'Bluesky Authentication'
      },
      {
        path: 'config',
        loadComponent: () => import('shared').then(m => m.ConfigStepComponent),
        title: 'Migration Settings'
      },
      {
        path: 'execute',
        loadComponent: () => import('shared').then(m => m.ExecuteStepComponent),
        title: 'Execute Migration'
      },
      {
        path: 'complete',
        loadComponent: () => import('shared').then(m => m.CompleteStepComponent),
        title: 'Migration Complete'
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
