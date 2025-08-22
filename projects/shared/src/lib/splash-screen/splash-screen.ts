import { Component, inject, ViewEncapsulation } from '@angular/core';
import { SplashScreenLoading } from '../services';
import { AsyncPipe } from '@angular/common';

/**
 * Butterfly splash screen
 * TODO ask for permission to use their work
 * @link https://codepen.io/dazulu/pen/aOzqvz
 */
@Component({
  selector: 'shared-splash-screen',
  imports: [AsyncPipe],
  templateUrl: './splash-screen.html',
  styleUrl: './splash-screen.scss',
  host: { class: 'splash-screen' },
  encapsulation: ViewEncapsulation.None
})
export class SplashScreen {
  // *flap* *flap* *flap*
  splashScreenLoading = inject(SplashScreenLoading);
  public message = this.splashScreenLoading.message.asObservable();
}
