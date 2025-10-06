import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PreflightSummary } from './preflight-summary/preflight-summary';
import { ProgressPanel } from './progress-panel/progress-panel';
import { inject } from '@angular/core';
import { SplashScreenLoading } from '../../services';
import { Migration } from '../../services/migration';
import { Router } from '@angular/router';

@Component({
  selector: 'shared-migrate',
  imports: [CommonModule, PreflightSummary, ProgressPanel],
  templateUrl: './migrate.html',
  styleUrl: './migrate.css'
})
export class Migrate {
  private splash = inject(SplashScreenLoading);
  private migration = inject(Migration);
  private router = inject(Router);

  async start(): Promise<void> {
    this.splash.setComponent(ProgressPanel);
    this.splash.show('Migrating…');
    try {
      const result = await this.migration.run(false);
      this.splash.hide();
      await this.router.navigate(['step/complete']);
    } catch (err) {
      this.splash.hide();
      // Snackbar will be added in error handling task
    } finally {
      this.splash.setComponent(null);
    }
  }
}
