import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter, map, startWith } from 'rxjs/operators';
import { Observable } from 'rxjs';

/**
 * StepHeader component displays the title and description from router data
 * Reads title from route.title and description from route.data.description
 */
@Component({
  selector: 'shared-step-header',
  imports: [CommonModule],
  templateUrl: './step-header.html',
  styleUrl: './step-header.css',
  host: {
    class: 'step-header'
  },
})
export class StepHeader implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // Reactive properties for title and description
  title$!: Observable<string>;
  description$!: Observable<string>;

  ngOnInit() {
    // Initialize observables with current route data and listen for navigation changes
    this.title$ = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => this.getRouteData().title),
      startWith(this.getRouteData().title)
    );

    this.description$ = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => this.getRouteData().description),
      startWith(this.getRouteData().description)
    );
  }

  private getRouteData(): { title: string; description: string } {
    let route = this.route;
    
    // Navigate to the deepest child route to get the actual route data
    while (route.firstChild) {
      route = route.firstChild;
    }

    // Handle undefined snapshot gracefully
    if (!route.snapshot) {
      return { title: '', description: '' };
    }

    const title = route.snapshot.title || '';
    const description = route.snapshot.data?.['description'] || '';
    
    return { title, description };
  }
}