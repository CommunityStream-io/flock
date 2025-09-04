import { Component, inject } from '@angular/core';
import {
  NavigationCancel,
  NavigationEnd,
  NavigationStart,
  Router,
  RouterModule,
  RouterOutlet,
} from '@angular/router';
import { delay, filter, map, tap, combineLatest, switchMap, timer, of, startWith, distinctUntilChanged } from 'rxjs';
import { SplashScreen } from '../splash-screen/splash-screen';
import { CommonModule } from '@angular/common';
import { LOGGER, Logger, SplashScreenLoading } from '../services';

@Component({
  selector: 'shared-router-splash',
  imports: [SplashScreen, RouterModule, RouterOutlet, CommonModule],
  templateUrl: './router-splash.html',
  styleUrl: './router-splash.css',
})
export class RouterSplash {
  logger = inject<Logger>(LOGGER);
  router = inject(Router);
  splashScreenLoading = inject(SplashScreenLoading);
  
  // Minimum splash screen display time for better UX (500ms)
  private readonly MIN_SPLASH_DURATION = 500;
  
  isNavigating = this.router.events.pipe(
    delay(100),
    tap((e) => this.logger.log('Router event', e)),
    filter(
      (e) =>
        e instanceof NavigationStart ||
        e instanceof NavigationEnd ||
        e instanceof NavigationCancel
    ),
    tap((e) => this.logger.log('Router navigation', e)),
    map((e) => e instanceof NavigationStart),
    startWith(false), // Start with navigation not active
    distinctUntilChanged() // Only emit when the value changes
  );
  
  // Enhanced splash screen logic with minimum display duration
  shouldShowSplash = combineLatest([
    this.isNavigating,
    this.splashScreenLoading.isLoading
  ]).pipe(
    switchMap(([isNavigating, isLoading]) => {
      if (isNavigating || isLoading) {
        // Show splash screen immediately when navigation starts or loading is active
        this.logger.log('Splash screen shown - navigation or loading active');
        return of(true);
      } else {
        // When navigation ends, ensure minimum display time
        this.logger.log('Navigation ended, ensuring minimum splash duration');
        return timer(this.MIN_SPLASH_DURATION).pipe(
          map(() => false),
          startWith(true) // Keep showing splash during the delay
        );
      }
    })
  );
}
