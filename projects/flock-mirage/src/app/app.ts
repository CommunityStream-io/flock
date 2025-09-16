import { Component, inject } from '@angular/core';
import { LayoutComponent, Logger, LOGGER, RouterSplash, SplashScreenLoading } from 'shared';
import { RouterLoggingService } from './service/router-logging';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [LayoutComponent, RouterSplash],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  title = 'flock-mirage';
  constructor() {
    const logger = inject<Logger>(LOGGER);
    logger.instrument('Dodo bird ready to flap!');
    
    // Initialize router logging
    inject(RouterLoggingService);
  }
  isLoading = inject(SplashScreenLoading).isLoading.asObservable();
}
