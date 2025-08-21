import { Routes } from '@angular/router';
import { LandingPageComponent, Upload } from 'shared';

export const routes: Routes = [
  {
    path: '',
    component: LandingPageComponent,
    title: 'Bluesky Social Migrator',
  },
  {
    path: 'upload',
    component: Upload,
    title: 'Upload Data',
    data: { description: 'Upload instagram archive', next: 'auth' },
  },
  {
    path: '**',
    redirectTo: '',
  },
];
