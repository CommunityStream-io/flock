import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-execute',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './execute.html',
  styleUrl: './execute.scss'
})
export class ExecuteComponent {
  progress = 0;
  currentStatus = 'Initializing migration...';
  postsProcessed = 0;
  totalPosts = 150;
  mediaUploaded = 0;
  totalMedia = 75;
  timeRemaining = '2 hours 30 minutes';
  isPaused = false;
  
  logEntries = [
    { time: '10:30 AM', message: 'Migration started' },
    { time: '10:31 AM', message: 'Processing Instagram export file' },
    { time: '10:32 AM', message: 'Found 150 posts and 75 media files' }
  ];

  pauseMigration() {
    this.isPaused = !this.isPaused;
    this.currentStatus = this.isPaused ? 'Migration paused' : 'Migration resumed';
  }

  cancelMigration() {
    // TODO: Implement migration cancellation
    this.currentStatus = 'Migration cancelled';
  }
}
