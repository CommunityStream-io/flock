import { Component, OnDestroy, OnInit, Signal, WritableSignal, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { StepNavigationComponent } from '../step-navigation/step-navigation';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Subscription } from 'rxjs';

@Component({
  selector: 'shared-step-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, StepNavigationComponent, MatButtonModule, MatIconModule],
  templateUrl: './step-layout.html',
  styleUrl: './step-layout.css'
})
export class StepLayoutComponent implements OnInit, OnDestroy {
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
    const url = this.prevUrl();
    if (url) this.router.navigateByUrl(url);
  }

  navigateNext(): void {
    const url = this.nextUrl();
    if (url) this.router.navigateByUrl(url);
  }

  private updateNavFromChild(): void {
    const child = this.route.firstChild?.snapshot;
    const data = child?.data ?? {};
    this.prevUrl.set((data['prev'] as string) ?? null);
    this.nextUrl.set((data['next'] as string) ?? null);
  }
}

