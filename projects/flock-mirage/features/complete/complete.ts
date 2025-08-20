import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-complete',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './complete.html',
  styleUrl: './complete.scss'
})
export class CompleteComponent {
  totalPosts = 150;
  totalMedia = 75;
  successRate = 98;
  totalTime = '2h 15m';
  startTime = '10:30 AM';
  endTime = '12:45 PM';
  blueskyAccount = '@yourname.bsky.social';
  dateRange = 'Jan 2020 - Dec 2023';

  downloadReport() {
    // TODO: Implement report download functionality
    console.log('Downloading migration report...');
  }
}
