import { Injectable, signal } from '@angular/core';
import type { MigrationService } from './interfaces/migration';

@Injectable({
  providedIn: 'root'
})
export class Migration implements MigrationService {
  public percentComplete = signal(0);
  public currentOperation = signal('');
  public elapsedSeconds = signal(0);
  public lastResult: { count: number; elapsedMs: number } | null = null;

  reset(): void {
    this.percentComplete.set(0);
    this.currentOperation.set('');
    this.elapsedSeconds.set(0);
  }

  async run(simulate: boolean): Promise<{ count: number; elapsedMs: number }> {
    this.percentComplete.set(0);
    this.currentOperation.set(simulate ? 'Dry run starting' : 'Migration starting');
    this.elapsedSeconds.set(0);

    const start = Date.now();
    // Simple mock progression
    const totalSteps = 50;
    for (let step = 1; step <= totalSteps; step++) {
      await new Promise((r) => setTimeout(r, 50));
      const percent = Math.round((step / totalSteps) * 100);
      this.percentComplete.set(percent);
      this.currentOperation.set(percent < 100 ? 'Processing…' : 'Finalizing');
      const elapsed = Math.floor((Date.now() - start) / 1000);
      this.elapsedSeconds.set(elapsed);
    }

    const elapsedMs = Date.now() - start;
    this.currentOperation.set('Completed');
    if (!simulate && Math.random() < 0.0) {
      // placeholder for future error cases
      throw new Error('Migration failed');
    }
    this.lastResult = { count: 42, elapsedMs };
    return this.lastResult;
  }
}
