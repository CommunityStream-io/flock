import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class NavigationService {
  readonly steps: string[] = ['/upload', '/auth', '/config', '/execute', '/complete'];

  currentIndex(routePath: string): number {
    return this.steps.findIndex(step => routePath.startsWith(step));
  }

  next(routePath: string): string | null {
    const idx = this.currentIndex(routePath);
    if (idx < 0) return this.steps[0] ?? null;
    return this.steps[idx + 1] ?? null;
  }

  prev(routePath: string): string | null {
    const idx = this.currentIndex(routePath);
    if (idx <= 0) return null;
    return this.steps[idx - 1] ?? null;
  }
}

