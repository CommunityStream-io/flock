import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CompletionSummary } from './completion-summary/completion-summary';

@Component({
  selector: 'shared-complete',
  standalone: true,
  imports: [CommonModule, CompletionSummary],
  templateUrl: './complete.html',
  styleUrl: './complete.css'
})
export class Complete {

}
