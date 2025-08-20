import { Routes } from '@angular/router';
import { LandingPageComponent } from 'shared';

export const routes: Routes = [
  {
    path: '',
    component: LandingPageComponent,
    title: 'Bluesky Social Migrator'
  },
  {
    path: '**',
    redirectTo: ''
  }
];
