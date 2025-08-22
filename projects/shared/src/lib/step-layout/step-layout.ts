import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { StepNavigationComponent } from '../step-navigation/step-navigation';

/**
 * StepLayout component serves as a container for the step-based navigation
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
export class StepLayout {}
