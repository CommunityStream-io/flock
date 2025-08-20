import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';

interface MigrationStep {
  id: string;
  title: string;
  description: string;
  route: string;
  completed: boolean;
  current: boolean;
  disabled: boolean;
}

@Component({
  selector: 'shared-step-navigation',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatChipsModule, MatButtonModule, MatIconModule, MatBadgeModule],
  templateUrl: './step-navigation.html',
  styleUrl: './step-navigation.css'
})
export class StepNavigationComponent {
  // Stubbed steps for now - will be populated by service when implemented
  steps: MigrationStep[] = [
    {
      id: 'upload',
      title: 'Upload Instagram Export',
      description: 'Upload your Instagram export ZIP file to begin migration',
      route: '/upload',
      completed: false,
      current: true,
      disabled: false
    },
    {
      id: 'auth',
      title: 'Bluesky Authentication',
      description: 'Connect your Bluesky account with credentials',
      route: '/auth',
      completed: false,
      current: false,
      disabled: true
    },
    {
      id: 'config',
      title: 'Migration Settings',
      description: 'Configure migration options and preferences',
      route: '/config',
      completed: false,
      current: false,
      disabled: true
    },
    {
      id: 'execute',
      title: 'Execute Migration',
      description: 'Run the migration process with your settings',
      route: '/execute',
      completed: false,
      current: false,
      disabled: true
    },
    {
      id: 'complete',
      title: 'Migration Complete',
      description: 'Review results and download migration report',
      route: '/complete',
      completed: false,
      current: false,
      disabled: true
    }
  ];

  // TODO: Inject StepValidationService when implemented
  // TODO: Update step status based on service state
  // TODO: Handle step navigation and validation
}
