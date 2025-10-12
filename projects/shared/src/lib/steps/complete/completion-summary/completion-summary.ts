import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Migration } from '../../../services/migration';

@Component({
  selector: 'shared-completion-summary',
  imports: [CommonModule],
  templateUrl: './completion-summary.html',
  styleUrl: './completion-summary.css'
})
export class CompletionSummary {
  private migration = inject(Migration);
  get count(): number | null {
    return this.migration.lastResult?.count ?? null;
  }
  get elapsed(): string | null {
    const ms = this.migration.lastResult?.elapsedMs;
    if (ms == null) return null;
    const seconds = Math.round(ms / 1000);
    return `${seconds}s`;
  }
}
