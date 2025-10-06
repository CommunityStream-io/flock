import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LOGGER, Logger } from '../../../services';
import { Migration } from '../../../services/migration';

@Component({
  selector: 'shared-progress-panel',
  imports: [CommonModule],
  templateUrl: './progress-panel.html',
  styleUrl: './progress-panel.css'
})
export class ProgressPanel {
  private logger = inject(LOGGER) as Logger;
  private migration = inject(Migration);
  public percentComplete = this.migration.percentComplete;
  public currentOperation = this.migration.currentOperation;
  public elapsedSeconds = this.migration.elapsedSeconds;
}
