import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { CompletionSummary } from './completion-summary/completion-summary';

@Component({
  selector: 'shared-complete',
  standalone: true,
  imports: [CommonModule, CompletionSummary, MatButton, MatIcon],
  templateUrl: './complete.html',
  styleUrl: './complete.css'
})
export class Complete {
  shareOnSocial(): void {
    const shareText = 'I just migrated my Instagram memories to Bluesky using Flock! 🦋 Join me on the decentralized, open, and creator-owned Fediverse. Experience true freedom in social media! #Fediverse #Bluesky #OpenWeb';
    const shareUrl = 'https://bsky.app';
    
    // Check if Web Share API is available
    if (navigator.share) {
      navigator.share({
        title: 'Join the Fediverse!',
        text: shareText,
        url: shareUrl
      }).catch((error) => {
        // Fallback if share is cancelled or fails
        console.log('Share cancelled or failed', error);
        this.fallbackShare(shareText, shareUrl);
      });
    } else {
      // Fallback for browsers that don't support Web Share API
      this.fallbackShare(shareText, shareUrl);
    }
  }

  private fallbackShare(text: string, url: string): void {
    // Copy to clipboard as fallback
    const fullText = `${text}\n${url}`;
    navigator.clipboard.writeText(fullText).then(() => {
      alert('Share text copied to clipboard! You can now paste it on your favorite social media platform.');
    }).catch(() => {
      // If clipboard API also fails, show the text in an alert
      alert(`Share this message:\n\n${fullText}`);
    });
  }
}
