import { Component, inject, Signal, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, ActivationEnd, Router, RouterModule } from '@angular/router';
import { LOGGER, Logger, StepRouteData, ConfigServiceImpl } from '../';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { filter, map, Observable, tap } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'shared-step-navigation',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButton, MatIcon],
  templateUrl: './step-navigation.html',
  styleUrl: './step-navigation.css',
})
export class StepNavigationComponent {
  // Route data parameters have next and previous properties
  private router = inject(Router);
  private logger = inject(LOGGER) as Logger;
  private configService = inject(ConfigServiceImpl);
  private currentRoute: Observable<StepRouteData> = this.router.events.pipe(
    filter((event): event is ActivationEnd => typeof event === 'object' && event instanceof ActivationEnd),
    // tap((event) => this.logger.log('Current route:', event)),
    // tap((event) => this.logger.log('Snapshot:', event.snapshot)),
    map((event) => event.snapshot.firstChild?.data as StepRouteData || { next: '', previous: '', description: '' }),
  );
  public childRouteData = this.currentRoute;
  public next = toSignal(
    this.childRouteData.pipe(
      map((data) => data.next || ''),
      // tap((next) => this.logger.log('Next route:', next))
    )
  ) as Signal<string>;
  public previous = toSignal(
    this.childRouteData.pipe(
      map((data) => data.previous || ''),
      // tap((next) => this.logger.log('Previous route:', next))
    )
  ) as Signal<string>;

  // Check if the current step's form is valid to enable Next button
  public isNextEnabled = computed(() => {
    const nextRoute = this.next();
    if (!nextRoute) return false;
    
    // For auth step, check if credentials are stored (form was valid)
    const currentUrl = this.router.url;
    if (currentUrl.includes('/step/auth')) {
      const credentials = this.configService.getBlueskyCredentials();
      return !!(credentials && credentials.username && credentials.password);
    }
    
    // For other steps, just check if next route exists
    return true;
  });

  ngOnInit() {
    this.childRouteData.subscribe();
    this.currentRoute.subscribe();
  }
}
