import { Component, inject, Signal, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, ActivationEnd, Router, RouterModule } from '@angular/router';
import { LOGGER, Logger, StepRouteData, ConfigServiceImpl, SplashScreenLoading } from '../';
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
  private loading = inject(SplashScreenLoading);
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

  public isLoading = toSignal(this.loading.isLoading, { initialValue: false }) as Signal<boolean>;



  ngOnInit() {
    this.childRouteData.subscribe();
    this.currentRoute.subscribe();
  }
}
