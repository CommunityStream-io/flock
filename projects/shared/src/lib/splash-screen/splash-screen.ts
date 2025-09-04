import { Component, inject, ViewEncapsulation, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { SplashScreenLoading } from '../services';
import { AsyncPipe, isPlatformBrowser } from '@angular/common';

/**
 * Butterfly splash screen
 * TODO ask for permission to use their work
 * @link https://codepen.io/dazulu/pen/aOzqvz
 * 
 * Implements body scroll prevention during splash screen display
 */
@Component({
  selector: 'shared-splash-screen',
  imports: [AsyncPipe],
  templateUrl: './splash-screen.html',
  styleUrl: './splash-screen.scss',
  host: { class: 'splash-screen' },
  encapsulation: ViewEncapsulation.None
})
export class SplashScreen implements OnInit, OnDestroy {
  // *flap* *flap* *flap*
  splashScreenLoading = inject(SplashScreenLoading);
  public message = this.splashScreenLoading.message.asObservable();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      // Prevent body scroll when splash screen is shown
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    }
  }

  ngOnDestroy() {
    if (isPlatformBrowser(this.platformId)) {
      // Restore body scroll when splash screen is hidden
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }
  }
}
