import { Signal } from '@angular/core';

export interface MigrationService {
  /** 0-100 percent complete */
  percentComplete: Signal<number>;
  /** current operation description */
  currentOperation: Signal<string>;
  /** elapsed seconds since start */
  elapsedSeconds: Signal<number>;

  /**
   * Resets the migration state to initial values
   */
  reset(): void;

  /**
   * Runs the migration (or simulation when simulate=true) and resolves with a summary
   */
  run(simulate: boolean): Promise<{ count: number; elapsedMs: number }>;
}