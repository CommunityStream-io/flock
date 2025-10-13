import { Routes } from '@angular/router';
import { LandingPage, Licenses } from 'shared';

export const routes: Routes = [
  {
    path: 'home',
    component: LandingPage,
    title: 'Flock - Bluesky Social Migrator',
  },
  {
    path: 'licenses',
    component: Licenses,
    title: 'Licenses & Attributions',
  },
  {
    path: '**',
    redirectTo: '/home'
  },
];
