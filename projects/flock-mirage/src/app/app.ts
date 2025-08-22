import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LayoutComponent, Logger, LOGGER, SplashScreen } from 'shared';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, LayoutComponent, SplashScreen],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class AppComponent {
  title = 'flock-mirage';
  constructor() {
    const logger = inject<Logger>(LOGGER);
    logger.instrument('Dodo bird ready to flap!');
  }
}
