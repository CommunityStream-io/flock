import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { StepNavigationComponent } from '../step-navigation/step-navigation';

@Component({
  selector: 'shared-step-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, StepNavigationComponent],
  templateUrl: './step-layout.html',
  styleUrl: './step-layout.css'
})
export class StepLayoutComponent {}

