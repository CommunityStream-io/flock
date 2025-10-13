import { Injectable, inject } from '@angular/core';
import { Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Logger } from './interfaces';
import { LOGGER } from './injection-tokens';

@Injectable({
  providedIn: 'root'
})
export class RouterLoggingService {
  private logger = inject<Logger>(LOGGER);

  constructor(private router: Router) {
    this.setupRouterLogging();
  }

  private setupRouterLogging() {
    // Log navigation start
    this.router.events
      .pipe(filter((event): event is NavigationStart => event instanceof NavigationStart))
      .subscribe((event: NavigationStart) => {
        this.logger.log('🧭 ROUTER: Navigation started', {
          url: event.url,
          navigationId: event.id,
          trigger: event.navigationTrigger,
          restoredState: event.restoredState
        });
      });

    // Log navigation end
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.logger.log('✅ ROUTER: Navigation completed', {
          url: event.url,
          urlAfterRedirects: event.urlAfterRedirects,
          navigationId: event.id
        });
      });

    // Log navigation cancel
    this.router.events
      .pipe(filter((event): event is NavigationCancel => event instanceof NavigationCancel))
      .subscribe((event: NavigationCancel) => {
        this.logger.warn('⚠️ ROUTER: Navigation cancelled', {
          url: event.url,
          reason: event.reason,
          navigationId: event.id
        });
      });

    // Log navigation error
    this.router.events
      .pipe(filter((event): event is NavigationError => event instanceof NavigationError))
      .subscribe((event: NavigationError) => {
        this.logger.error('❌ ROUTER: Navigation error', {
          url: event.url,
          error: event.error,
          navigationId: event.id
        });
      });
  }
}

