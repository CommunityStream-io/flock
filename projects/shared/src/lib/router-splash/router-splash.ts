import { Component, inject } from '@angular/core';
import {
  NavigationCancel,
  NavigationEnd,
  NavigationStart,
  Router,
  RouterModule,
  RouterOutlet,
} from '@angular/router';
import { delay, filter, map, tap } from 'rxjs';
import { SplashScreen } from '../splash-screen/splash-screen';
import { CommonModule } from '@angular/common';
import { LOGGER, Logger } from '../services';

@Component({
  selector: 'shared-router-splash',
  imports: [SplashScreen, RouterModule, RouterOutlet, CommonModule],
  templateUrl: './router-splash.html',
  styleUrl: './router-splash.css',
})
export class RouterSplash {
  logger = inject<Logger>(LOGGER);
  router = inject(Router);
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
    map((e) => e instanceof NavigationStart)
  );
}
