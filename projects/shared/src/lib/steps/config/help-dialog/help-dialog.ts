import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

export interface HelpDialogData {
  title: string;
  content: string;
  type: 'date-range' | 'testing-options' | 'general';
}

@Component({
  selector: 'shared-config-help-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './help-dialog.html',
  styleUrl: './help-dialog.css'
})
export class ConfigHelpDialog {

  constructor(
    public dialogRef: MatDialogRef<ConfigHelpDialog>,
    @Inject(MAT_DIALOG_DATA) public data: HelpDialogData
  ) {}

  onClose(): void {
    this.dialogRef.close();
  }

  getHelpContent(): string {
    switch (this.data.type) {
      case 'date-range':
        return this.getDateRangeHelp();
      case 'testing-options':
        return this.getTestingOptionsHelp();
      case 'general':
      default:
        return this.getGeneralHelp();
    }
  }

  private getDateRangeHelp(): string {
    return `
      <h3>Date Range Filtering</h3>
      <p>Use date range filtering to migrate only posts from specific time periods:</p>
      <ul>
        <li><strong>Start Date:</strong> The earliest date for posts to include (format: YYYY-MM-DD)</li>
        <li><strong>End Date:</strong> The latest date for posts to include (format: YYYY-MM-DD)</li>
        <li><strong>Both dates are optional</strong> - leave empty to include all posts</li>
        <li><strong>Date format:</strong> Use YYYY-MM-DD format (e.g., 2023-01-01)</li>
      </ul>
      <p class="note">
        <mat-icon>info</mat-icon>
        Only posts created between the start and end dates will be migrated. Future dates are not allowed.
      </p>
    `;
  }

  private getTestingOptionsHelp(): string {
    return `
      <h3>Testing Options</h3>
      <p>Use these options to safely test your migration without posting to Bluesky:</p>
      <ul>
        <li><strong>Test Video Mode:</strong> Process videos for testing without uploading them</li>
        <li><strong>Simulation Mode:</strong> Run the entire migration in simulation mode - no actual posts will be created</li>
        <li><strong>Both modes can be enabled together</strong> for comprehensive testing</li>
      </ul>
      <p class="note">
        <mat-icon>info</mat-icon>
        These options are perfect for testing your migration settings before running the actual migration.
      </p>
    `;
  }

  private getGeneralHelp(): string {
    return `
      <h3>Configuration Help</h3>
      <p>Configure your migration settings to customize how your Instagram posts are migrated to Bluesky:</p>
      <ul>
        <li><strong>Date Range:</strong> Filter posts by creation date</li>
        <li><strong>Testing Options:</strong> Test your migration safely</li>
        <li><strong>All settings are optional</strong> - you can proceed with default settings</li>
      </ul>
      <p class="note">
        <mat-icon>info</mat-icon>
        Changes are automatically saved as you make them. You can always come back to modify these settings.
      </p>
    `;
  }
}