import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { RouterModule } from '@angular/router';
import { StepNavigationComponent } from '../step-navigation/step-navigation';
import { isPlatformBrowser } from '@angular/common';

/**
 * StepLayout component serves as a container for the step-based navigation
 * Implements fixed viewport layout to prevent scrolling across all devices
 */
@Component({
  selector: 'shared-step-layout',
  imports: [RouterModule, StepNavigationComponent],
  templateUrl: './step-layout.html',
  styleUrl: './step-layout.css',
  host: {
    class: 'step-layout'
  },
})
export class StepLayout implements OnInit, OnDestroy {
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      // Add class to body to prevent scrolling
      document.body.classList.add('step-layout-active');
    }
  }

  ngOnDestroy() {
    if (isPlatformBrowser(this.platformId)) {
      // Remove class from body to restore scrolling
      document.body.classList.remove('step-layout-active');
    }
  }
}
