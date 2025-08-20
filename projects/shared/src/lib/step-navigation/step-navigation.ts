import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { NavigationService } from '../core/navigation.service';
import { Subscription } from 'rxjs';

interface MigrationStep {
  id: string;
  title: string;
  description: string;
  route: string;
  completed: boolean;
  current: boolean;
  disabled: boolean;
}

@Component({
  selector: 'shared-step-navigation',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatChipsModule, MatButtonModule, MatIconModule, MatBadgeModule],
  templateUrl: './step-navigation.html',
  styleUrl: './step-navigation.css'
})
export class StepNavigationComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly navigationService = inject(NavigationService);
  private subscription: Subscription | null = null;

  steps: MigrationStep[] = [
    {
      id: 'upload',
      title: 'Upload Instagram Export',
      description: 'Upload your Instagram export ZIP file to begin migration',
      route: '/upload',
      completed: false,
      current: false,
      disabled: false
    },
    {
      id: 'auth',
      title: 'Bluesky Authentication',
      description: 'Connect your Bluesky account with credentials',
      route: '/auth',
      completed: false,
      current: false,
      disabled: true
    },
    {
      id: 'config',
      title: 'Migration Settings',
      description: 'Configure migration options and preferences',
      route: '/config',
      completed: false,
      current: false,
      disabled: true
    },
    {
      id: 'execute',
      title: 'Execute Migration',
      description: 'Run the migration process with your settings',
      route: '/execute',
      completed: false,
      current: false,
      disabled: true
    },
    {
      id: 'complete',
      title: 'Migration Complete',
      description: 'Review results and download migration report',
      route: '/complete',
      completed: false,
      current: false,
      disabled: true
    }
  ];

  ngOnInit(): void {
    this.updateStepsForUrl(this.router.url);
    this.subscription = this.router.events.subscribe(evt => {
      if (evt instanceof NavigationEnd) {
        this.updateStepsForUrl(evt.urlAfterRedirects);
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  private updateStepsForUrl(url: string): void {
    const idx = this.navigationService.currentIndex(url);
    this.steps = this.steps.map((step, i) => ({
      ...step,
      current: i === idx,
      disabled: idx >= 0 ? i > idx : i > 0,
      completed: idx >= 0 ? i < idx : false
    }));
  }
}
