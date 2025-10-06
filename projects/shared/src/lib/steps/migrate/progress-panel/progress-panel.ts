import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LOGGER, Logger } from '../../../services';

@Component({
  selector: 'shared-progress-panel',
  imports: [CommonModule],
  templateUrl: './progress-panel.html',
  styleUrl: './progress-panel.css'
})
export class ProgressPanel {
  private logger = inject(LOGGER) as Logger;
  // Phase 1: simple placeholders; will wire to Migration service in next task
  public percentComplete = signal(0);
  public currentOperation = signal('Waiting to start');
  public elapsedSeconds = signal(0);
}
