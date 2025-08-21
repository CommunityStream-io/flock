import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { StepNavigationComponent } from '../';

/**
 * StepLayout component serves as a container for the step-based navigation
 */
@Component({
  selector: 'shared-step-layout',
  imports: [RouterOutlet, StepNavigationComponent],
  templateUrl: './step-layout.html',
  styleUrl: './step-layout.css'
})
export class StepLayout {

}
