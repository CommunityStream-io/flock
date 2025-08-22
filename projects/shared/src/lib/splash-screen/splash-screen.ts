import { Component, ViewEncapsulation } from '@angular/core';

/**
 * Butterfly splash screen
 * TODO ask for permission to use their work
 * @link https://codepen.io/dazulu/pen/aOzqvz
 */
@Component({
  selector: 'shared-splash-screen',
  imports: [],
  templateUrl: './splash-screen.html',
  styleUrl: './splash-screen.scss',
  host: { class: 'splash-screen' },
  encapsulation: ViewEncapsulation.None
})
export class SplashScreen {
  // *flap* *flap* *flap*
}
