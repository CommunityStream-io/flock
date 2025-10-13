import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { StepNavigationComponent } from '../step-navigation/step-navigation';
import { StepHeader } from '../step-header/step-header';

/**
 * StepLayout component serves as a container for the step-based navigation
 */
@Component({
  selector: 'shared-step-layout',
  imports: [RouterModule, StepNavigationComponent, StepHeader],
  templateUrl: './step-layout.html',
  styleUrl: './step-layout.css',
  host: {
    class: 'step-layout'
  },
})
export class StepLayout {}
