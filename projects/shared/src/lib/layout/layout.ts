import { Component, OnDestroy, OnInit, WritableSignal, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { HeaderComponent } from '../header/header';
import { StepNavigationComponent } from '../step-navigation/step-navigation';
import { StepControlsComponent } from '../step-controls/step-controls';
import { Subscription } from 'rxjs';

@Component({
  selector: 'shared-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, MatSidenavModule, MatToolbarModule, MatIconModule, MatButtonModule, HeaderComponent, StepNavigationComponent, StepControlsComponent],
  templateUrl: './layout.html',
  styleUrl: './layout.css'
})
export class LayoutComponent {
  private readonly router = inject(Router);
  private subscription: Subscription | null = null;

  readonly activeStepId: WritableSignal<string | null> = signal<string | null>(null);
  readonly showStepUi = computed<boolean>(() => {
    const current = this.activeStepId();
    return !!current && current !== 'landing';
  });

  ngOnInit(): void {
    this.updateFromRouterState();
    this.subscription = this.router.events.subscribe(evt => {
      if (evt instanceof NavigationEnd) {
        this.updateFromRouterState();
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  private updateFromRouterState(): void {
    const stepChild = this.router.routerState.root.children.find(c => c.outlet === 'step');
    const id = stepChild?.snapshot.routeConfig?.path ?? null;
    this.activeStepId.set(id);
  }
}
