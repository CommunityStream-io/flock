import { Routes } from '@angular/router';
import { LandingPageComponent, StepLayoutComponent } from 'shared';

export const routes: Routes = [
  { path: '', component: LandingPageComponent, title: 'Bluesky Social Migrator' },
  {
    path: '',
    loadComponent: () => import('shared').then(m => m.StepLayoutComponent),
    children: [
      { path: 'upload', loadComponent: () => import('shared').then(m => m.UploadStepComponent), title: 'Upload Instagram Export', data: { description: 'Upload your Instagram export ZIP file to begin migration', prev: null, next: 'auth' } },
      { path: 'auth',   loadComponent: () => import('shared').then(m => m.AuthStepComponent),   title: 'Bluesky Authentication', data: { description: 'Connect your Bluesky account with credentials', prev: 'upload', next: 'config' } },
      { path: 'config', loadComponent: () => import('shared').then(m => m.ConfigStepComponent), title: 'Migration Settings',    data: { description: 'Configure migration options and preferences', prev: 'auth',   next: 'execute' } },
      { path: 'execute',loadComponent: () => import('shared').then(m => m.ExecuteStepComponent),title: 'Execute Migration',     data: { description: 'Run the migration process with your settings', prev: 'config', next: 'complete' } },
      { path: 'complete',loadComponent: () => import('shared').then(m => m.CompleteStepComponent),title: 'Migration Complete',   data: { description: 'Review results and download migration report', prev: 'execute', next: null } }
    ]
  },
  { path: '**', redirectTo: '' }
];
