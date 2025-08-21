import { Component, inject, Signal, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, ActivationEnd, Router, RouterModule } from '@angular/router';
import { StepRouteData } from '../';
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
  private currentRoute: Observable<StepRouteData> = this.router.events.pipe(
    filter((event): event is ActivationEnd => typeof event === 'object' && event instanceof ActivationEnd),
    tap((event) => console.log('Current route:', event)),
    tap((event) => console.log('Snapshot:', event.snapshot)),
    map((event) => event.snapshot.firstChild?.data as StepRouteData || { next: '', previous: '', description: '' }),
  );
  public childRouteData = this.currentRoute;
  public next = toSignal(
    this.childRouteData.pipe(
      map((data) => data.next || ''),
      tap((next) => console.log('Next route:', next))
    )
  ) as Signal<string>;
  public previous = toSignal(
    this.childRouteData.pipe(
      map((data) => data.previous || ''),
      tap((next) => console.log('Previous route:', next))
    )
  ) as Signal<string>;

  ngOnInit() {
    this.childRouteData.subscribe((data) => {
      console.log('Child route data:', data);
    });
    this.currentRoute.subscribe();
  }
}
