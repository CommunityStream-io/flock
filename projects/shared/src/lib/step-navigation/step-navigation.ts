import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, NavigationEnd, Route, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { Subscription } from 'rxjs';

interface MigrationStep {
  id: string;
  title: string;
  description: string;
  route: string; // step id
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
  private readonly route = inject(ActivatedRoute);
  private subscription: Subscription | null = null;

  private readonly defaultSteps: MigrationStep[] = [
    { id: 'upload', title: 'Upload Instagram Export', description: 'Upload your Instagram export ZIP file to begin migration', route: 'upload', completed: false, current: false, disabled: false },
    { id: 'auth', title: 'Bluesky Authentication', description: 'Connect your Bluesky account with credentials', route: 'auth', completed: false, current: false, disabled: true },
    { id: 'config', title: 'Migration Settings', description: 'Configure migration options and preferences', route: 'config', completed: false, current: false, disabled: true },
    { id: 'execute', title: 'Execute Migration', description: 'Run the migration process with your settings', route: 'execute', completed: false, current: false, disabled: true },
    { id: 'complete', title: 'Migration Complete', description: 'Review results and download migration report', route: 'complete', completed: false, current: false, disabled: true }
  ];

  steps: MigrationStep[] = this.defaultSteps;

  ngOnInit(): void {
    this.rebuildStepsFromRouteConfig();
    this.updateStepsForUrl(this.router.url);
    this.subscription = this.router.events.subscribe(evt => {
      if (evt instanceof NavigationEnd) {
        this.rebuildStepsFromRouteConfig();
        this.updateStepsForUrl(evt.urlAfterRedirects);
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  private updateStepsForUrl(url: string): void {
    const idx = this.steps.findIndex(s => url.includes(`(step:${s.route}`));
    this.steps = this.steps.map((step, i) => ({
      ...step,
      current: i === idx,
      disabled: idx >= 0 ? i > idx : i > 0,
      completed: idx >= 0 ? i < idx : false
    }));
  }

  private rebuildStepsFromRouteConfig(): void {
    const stepRoutes = this.router.config.filter(r => r.outlet === 'step');
    if (!stepRoutes || stepRoutes.length === 0) {
      this.steps = this.defaultSteps;
      return;
    }

    const mapped: MigrationStep[] = stepRoutes
      .filter((r: Route) => !!r.path)
      .map((r: Route) => {
        const id = r.path as string;
        const title = (r.title as string) ?? id;
        const description = (r.data && (r.data['description'] as string)) || '';
        return {
          id,
          title,
          description,
          route: id,
          completed: false,
          current: false,
          disabled: id !== 'upload'
        } as MigrationStep;
      });

    if (mapped.length > 0) {
      this.steps = mapped;
    } else {
      this.steps = this.defaultSteps;
    }
  }
}
