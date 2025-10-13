import { Component, inject, ViewEncapsulation, OnInit, OnDestroy, DOCUMENT } from '@angular/core';
import { SplashScreenLoading, LOGGER, Logger } from '../services';
import { AsyncPipe, NgComponentOutlet } from '@angular/common';
import { tap } from 'rxjs';

/**
 * Butterfly splash screen
 * TODO ask for permission to use their work
 * @link https://codepen.io/dazulu/pen/aOzqvz
 */
@Component({
  selector: 'shared-splash-screen',
  imports: [AsyncPipe, NgComponentOutlet],
  templateUrl: './splash-screen.html',
  styleUrl: './splash-screen.scss',
  host: { class: 'splash-screen' },
  encapsulation: ViewEncapsulation.None
})
export class SplashScreen implements OnInit, OnDestroy {
  // *flap* *flap* *flap*
  private logger = inject<Logger>(LOGGER);
  private document = inject(DOCUMENT);
  splashScreenLoading = inject(SplashScreenLoading);
  
  // Store original overflow values to restore later
  private originalBodyOverflow: string = '';
  private originalHtmlOverflow: string = '';
  
  public message = this.splashScreenLoading.message.asObservable();
  public component = this.splashScreenLoading.component.asObservable().pipe(
    tap(cmp => {
      const componentName = cmp ? cmp.name : 'null';
      this.logger.log(`[SplashScreen] Component changed to: ${componentName}`);
    })
  );

  ngOnInit(): void {
    this.logger.log('[SplashScreen] Component initialized - preventing scrollbars');
    
    // Store original overflow values
    this.originalBodyOverflow = this.document.body.style.overflow;
    this.originalHtmlOverflow = this.document.documentElement.style.overflow;
    
    // Prevent scrolling on both html and body elements
    this.document.body.style.overflow = 'hidden';
    this.document.documentElement.style.overflow = 'hidden';
  }

  ngOnDestroy(): void {
    this.logger.log('[SplashScreen] Component destroyed - restoring scrollbars');
    
    // Restore original overflow values
    this.document.body.style.overflow = this.originalBodyOverflow;
    this.document.documentElement.style.overflow = this.originalHtmlOverflow;
  }
}
