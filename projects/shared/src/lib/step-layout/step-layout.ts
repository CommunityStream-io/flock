import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { StepNavigationComponent } from '../step-navigation/step-navigation';
import { StepControlsComponent } from '../step-controls/step-controls';

@Component({
  selector: 'shared-step-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, StepNavigationComponent, StepControlsComponent],
  templateUrl: './step-layout.html',
  styleUrl: './step-layout.css'
})
export class StepLayoutComponent {}

