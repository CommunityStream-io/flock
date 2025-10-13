import { Component, inject, ViewEncapsulation } from '@angular/core';
import { SplashScreenLoading, LOGGER, Logger } from '../services';
import { AsyncPipe, NgComponentOutlet } from '@angular/common';
import { tap } from 'rxjs';
import { Butterfly } from '../butterfly/butterfly';

/**
 * Butterfly splash screen
 * Uses the Butterfly component created by dazulu
 * @link https://codepen.io/dazulu/pen/aOzqvz
 */
@Component({
  selector: 'shared-splash-screen',
  imports: [AsyncPipe, NgComponentOutlet, Butterfly],
  templateUrl: './splash-screen.html',
  styleUrl: './splash-screen.scss',
  host: { class: 'splash-screen' },
  encapsulation: ViewEncapsulation.None
})
export class SplashScreen {
  // *flap* *flap* *flap*
  private logger = inject<Logger>(LOGGER);
  splashScreenLoading = inject(SplashScreenLoading);
  public message = this.splashScreenLoading.message.asObservable();
  public component = this.splashScreenLoading.component.asObservable().pipe(
    tap(cmp => {
      const componentName = cmp ? cmp.name : 'null';
      this.logger.log(`[SplashScreen] Component changed to: ${componentName}`);
    })
  );
}
