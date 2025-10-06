import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PreflightSummary } from './preflight-summary/preflight-summary';
import { ProgressPanel } from './progress-panel/progress-panel';

@Component({
  selector: 'shared-migrate',
  imports: [CommonModule, PreflightSummary, ProgressPanel],
  templateUrl: './migrate.html',
  styleUrl: './migrate.css'
})
export class Migrate {
  // Migration is triggered via route resolver; the progress panel is shown on splash
}
