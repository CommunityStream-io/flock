import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { StepRouteData } from '../';
@Component({
  selector: 'shared-step-navigation',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './step-navigation.html',
  styleUrl: './step-navigation.css'
})
export class StepNavigationComponent {
  // Route data parameters have next and previous properties
  private activatedRoute = inject(ActivatedRoute);
  private routeData = this.activatedRoute.snapshot.data as StepRouteData;
  public next = this.routeData.next || '';
  public previous = this.routeData.previous || '';
}
