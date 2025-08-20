import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, Routes } from '@angular/router';
import { Location } from '@angular/common';
import { LandingPageComponent } from 'shared';

const testRoutes: Routes = [
  { path: '', component: LandingPageComponent },
  {
    path: '',
    loadComponent: () => import('shared').then(m => m.StepLayoutComponent),
    children: [
      { path: 'upload', loadComponent: () => import('shared').then(m => m.UploadStepComponent) },
      { path: 'auth', loadComponent: () => import('shared').then(m => m.AuthStepComponent) },
      { path: 'config', loadComponent: () => import('shared').then(m => m.ConfigStepComponent) },
      { path: 'execute', loadComponent: () => import('shared').then(m => m.ExecuteStepComponent) },
      { path: 'complete', loadComponent: () => import('shared').then(m => m.CompleteStepComponent) }
    ]
  }
];

describe('Feature: Route workflow rendering', () => {
  let router: Router;
  let location: Location;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideRouter(testRoutes)]
    }).compileComponents();
    router = TestBed.inject(Router);
    location = TestBed.inject(Location);
    await router.navigateByUrl('/');
  });

  it('Given upload route, When navigating, Then upload step should load', async () => {
    console.log('🔧 BDD: Initialize router');
    await router.navigateByUrl('/upload');
    console.log('⚙️ BDD: Navigate to /upload');
    expect(location.path()).toBe('/upload');
    console.log('✅ BDD: Upload route active');
  });
});

