import { Routes } from '@angular/router';
import { LandingPage, Licenses, Support, DistroPage } from 'shared';

export const routes: Routes = [
  {
    path: 'home',
    component: LandingPage,
    title: 'Flock - Bluesky Social Migrator',
  },
  {
    path: 'distro',
    component: DistroPage,
    title: 'Flock Native Downloads',
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
    path: '**',
    redirectTo: '/home'
  },
];
