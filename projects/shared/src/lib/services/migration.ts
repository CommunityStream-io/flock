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

  /**
   * Internal flag for testing error scenarios
   * @internal
   */
  private _forceError = false;

  reset(): void {
    this.percentComplete.set(0);
    this.currentOperation.set('');
    this.elapsedSeconds.set(0);
    this._forceError = false;
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
    if (!simulate && this._forceError) {
      // Error case for testing and future error scenarios
      throw new Error('Migration failed');
    }
    this.lastResult = { count: 42, elapsedMs };
    return this.lastResult;
  }

  /**
   * Set error flag for testing purposes
   * @internal
   */
  setForceError(value: boolean): void {
    this._forceError = value;
  }
}
