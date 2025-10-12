import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PreflightSummary } from './preflight-summary/preflight-summary';

@Component({
  selector: 'shared-migrate',
  imports: [CommonModule, PreflightSummary],
  templateUrl: './migrate.html',
  styleUrl: './migrate.css'
})
export class Migrate {
  // Migration is triggered via route resolver; the progress panel is shown on splash
}
