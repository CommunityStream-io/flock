import { Component, Inject, ViewEncapsulation } from '@angular/core';
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
  styleUrl: './help-dialog.css',
  encapsulation: ViewEncapsulation.None
})
export class ConfigHelpDialog {

  constructor(
    public dialogRef: MatDialogRef<ConfigHelpDialog>,
    @Inject(MAT_DIALOG_DATA) public data: HelpDialogData
  ) {}

  onClose(): void {
    this.dialogRef.close();
  }

}