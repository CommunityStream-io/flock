import { Component, OnDestroy, OnInit, WritableSignal, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Subscription } from 'rxjs';

@Component({
  selector: 'shared-step-controls',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './step-controls.html',
  styleUrl: './step-controls.css'
})
export class StepControlsComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private subscription: Subscription | null = null;

  readonly prevUrl: WritableSignal<string | null> = signal<string | null>(null);
  readonly nextUrl: WritableSignal<string | null> = signal<string | null>(null);

  ngOnInit(): void {
    this.updateNavFromChild();
    this.subscription = this.router.events.subscribe(evt => {
      if (evt instanceof NavigationEnd) {
        this.updateNavFromChild();
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  navigatePrev(): void {
    const step = this.prevUrl();
    if (step) this.router.navigate([{ outlets: { step } }]);
  }

  navigateNext(): void {
    const step = this.nextUrl();
    if (step) this.router.navigate([{ outlets: { step } }]);
  }

  private updateNavFromChild(): void {
    const stepChild = this.router.routerState.root.children.find(c => c.outlet === 'step');
    const data = stepChild?.snapshot.data ?? {};
    this.prevUrl.set((data['prev'] as string) ?? null);
    this.nextUrl.set((data['next'] as string) ?? null);
  }
}