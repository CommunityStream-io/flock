import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { ConfigService } from '../core/config.service';

@Component({
  selector: 'shared-complete-step',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule, MatListModule],
  templateUrl: './complete-step.html',
  styleUrl: './complete-step.css'
})
export class CompleteStepComponent {
  private readonly configService = inject(ConfigService);
  readonly config = this.configService.config();
}

