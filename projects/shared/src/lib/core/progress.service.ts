import { Injectable, Signal, WritableSignal, signal } from '@angular/core';

export type ProgressStatus = 'idle' | 'running' | 'done' | 'error';

export interface ProgressSnapshot {
  status: ProgressStatus;
  percent: number;
  log: string[];
}

@Injectable({ providedIn: 'root' })
export class ProgressService {
  private readonly _status: WritableSignal<ProgressStatus> = signal<ProgressStatus>('idle');
  private readonly _percent: WritableSignal<number> = signal<number>(0);
  private readonly _log: WritableSignal<string[]> = signal<string[]>([]);

  status(): Signal<ProgressStatus> {
    return this._status.asReadonly();
  }

  percent(): Signal<number> {
    return this._percent.asReadonly();
  }

  log(): Signal<string[]> {
    return this._log.asReadonly();
  }

  setStatus(status: ProgressStatus): void {
    this._status.set(status);
  }

  setPercent(percent: number): void {
    const clamped = Math.min(100, Math.max(0, Math.floor(percent)));
    this._percent.set(clamped);
  }

  appendLog(entry: string): void {
    const next = [...this._log(), entry];
    this._log.set(next);
  }

  reset(): void {
    this._status.set('idle');
    this._percent.set(0);
    this._log.set([]);
  }
}

