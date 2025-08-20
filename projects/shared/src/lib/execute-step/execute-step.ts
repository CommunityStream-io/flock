import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatListModule } from '@angular/material/list';
import { ProgressService } from '../core/progress.service';

@Component({
  selector: 'shared-execute-step',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule, MatProgressBarModule, MatListModule],
  templateUrl: './execute-step.html',
  styleUrl: './execute-step.css'
})
export class ExecuteStepComponent {
  private readonly progressService = inject(ProgressService);

  readonly status = computed(() => this.progressService.status()());
  readonly percent = computed(() => this.progressService.percent()());
  readonly log = computed(() => this.progressService.log()());
}

