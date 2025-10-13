import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faWarning } from '@fortawesome/free-solid-svg-icons';
import { LOGGER, Logger, SplashScreenLoading } from 'shared';
import { CLIService } from '../../service/cli/cli.service';

interface MigrationWarning {
  type: 'missing_file' | 'truncated_caption' | 'skipped_post' | 'upload_failure' | 'extraction_error' | 'rate_limit';
  message: string;
  details?: string;
}

@Component({
  selector: 'migration-progress',
  standalone: true,
  imports: [CommonModule, MatProgressBarModule, MatIconModule, MatButtonModule, FontAwesomeModule],
  templateUrl: './migration-progress.component.html',
  styleUrl: './migration-progress.component.css'
})
export class MigrationProgressComponent implements OnInit, OnDestroy {
  private cliService = inject(CLIService);
  private logger = inject<Logger>(LOGGER);
  private splashLoading = inject(SplashScreenLoading);
  private outputSubscription: any;

  // FontAwesome icons (keeping for warnings only)
  faWarning = faWarning;

  // State signals
  phase = signal<'starting' | 'migrating' | 'complete' | 'error'>('starting');
  postsCreated = signal<number>(0);
  totalPosts = signal<number | null>(null);
  lastPostUrl = signal<string | null>(null);
  mediaCount = signal<number>(0);
  warnings = signal<MigrationWarning[]>([]);
  showWarnings = signal<boolean>(false);
  
  // Track last media upload error reason to provide context for "No media uploaded" warnings
  private lastUploadErrorReason: string | null = null;
  
  // Fun messages
  private messages = [
    '✨ Sprinkling some Bluesky magic...',
    '📸 Packing up your memories...',
    '🦋 Your posts are taking flight...',
    '🎨 Painting your timeline...',
    '🌟 Making the social media universe a bit better...',
    '🚀 Launching posts into the Bluesky...',
    '💫 Transforming Instagram gold into Bluesky treasure...',
    '🎭 Your story is being retold...',
    '🌈 Adding color to the decentralized web...',
    '🔮 The algorithm-free future awaits...'
  ];

  /**
   * Logging helper with component prefix
   */
  private log(...args: any[]): void {
    const message = args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
    ).join(' ');
    this.logger.log(`[MigrationProgressComponent] ${message}`);
  }

  ngOnInit(): void {
    this.log('========== ngOnInit called ==========');
    this.log('Component is being initialized');
    
    // Set initial message
    this.splashLoading.show('🚀 Starting your Instagram to Bluesky migration...');
    
    // Subscribe to CLI output
    this.outputSubscription = this.cliService.output$.subscribe((data) => {
      this.log('Received CLI output:', data);
      
      if (data.type === 'stdout' || data.type === 'stderr') {
        this.handleOutput(data.data || '');
      } else if (data.type === 'exit') {
        if (data.code === 0) {
          this.phase.set('complete');
          this.splashLoading.show('🎉 Migration complete! Welcome to Bluesky!');
        } else {
          this.phase.set('error');
          this.splashLoading.show('❌ Migration encountered an error');
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.log('Destroyed');
    if (this.outputSubscription) {
      this.outputSubscription.unsubscribe();
    }
  }

  /**
   * Strip ANSI escape codes from CLI output
   * ANSI codes can interfere with URL parsing and other regex matches
   */
  private stripAnsiCodes(text: string): string {
    // eslint-disable-next-line no-control-regex
    return text.replace(/\x1B\[[0-9;]*m/g, '');
  }

  private handleOutput(output: string): void {
    // Strip ANSI color codes from output to prevent them from being captured in URLs
    const cleanOutput = this.stripAnsiCodes(output);
    
    // Detect extraction phase
    if (cleanOutput.includes('[EXTRACT]')) {
      if (cleanOutput.includes('Progress:')) {
        this.phase.set('starting');
        this.splashLoading.show('📦 Extracting your Instagram archive...');
      } else if (cleanOutput.includes('Extraction completed')) {
        this.splashLoading.show('✅ Archive extracted! Starting migration...');
      }
      return;
    }

    // Detect import start
    if (cleanOutput.includes('Import started')) {
      this.phase.set('migrating');
      this.splashLoading.show(this.getRandomMessage());
    }

    // Detect total posts (from final import message) - Note: This pattern may not exist in real logs
    const importMatch = cleanOutput.match(/imported (\d+) posts? with (\d+) media/i);
    if (importMatch) {
      this.totalPosts.set(parseInt(importMatch[1], 10));
      this.mediaCount.set(parseInt(importMatch[2], 10));
    }

    // Detect post creation
    if (cleanOutput.includes('Bluesky post created with url:')) {
      const urlMatch = cleanOutput.match(/https:\/\/bsky\.app\/profile\/[^\s]+/);
      if (urlMatch) {
        this.lastPostUrl.set(urlMatch[0]);
      }
      
      const newCount = this.postsCreated() + 1;
      this.postsCreated.set(newCount);
      
      // Update message every few posts
      if (newCount % 3 === 0) {
        this.splashLoading.show(this.getRandomMessage());
      } else {
        this.splashLoading.show(`📤 Uploading post ${newCount}...`);
      }
    }

    // Detect import finish
    if (cleanOutput.includes('Import finished')) {
      this.phase.set('complete');
      const posts = this.postsCreated();
      const media = this.mediaCount();
      this.splashLoading.show(
        `🎉 Successfully migrated ${posts} post${posts !== 1 ? 's' : ''} with ${media} media file${media !== 1 ? 's' : ''}!`
      );
    }

    // Detect missing files
    if (cleanOutput.includes('Failed to read media file:')) {
      const fileMatch = cleanOutput.match(/Failed to read media file: (.+)/);
      if (fileMatch) {
        const filePath = fileMatch[1];
        // Extract just the filename from the full path
        const filename = filePath.split(/[/\\]/).pop() || filePath;
        this.warnings.update(warnings => [...warnings, {
          type: 'missing_file',
          message: `Missing media file: ${filename}`,
          details: filePath
        }]);
      }
    }

    // Detect truncated captions
    if (cleanOutput.includes('Truncating image caption')) {
      const truncateMatch = cleanOutput.match(/Truncating image caption from (\d+) to (\d+) characters/);
      if (truncateMatch) {
        this.warnings.update(warnings => [...warnings, {
          type: 'truncated_caption',
          message: `Caption truncated from ${truncateMatch[1]} to ${truncateMatch[2]} characters`
        }]);
      }
    }

    // Detect rate limit errors (most critical - need to slow down)
    if (cleanOutput.includes('Rate Limit Exceeded')) {
      this.lastUploadErrorReason = 'Rate limit exceeded';
      this.warnings.update(warnings => [...warnings, {
        type: 'rate_limit',
        message: '⚠️ Rate limit exceeded - Bluesky is throttling uploads',
        details: 'The migration will continue but may need more time. Consider pausing and resuming later.'
      }]);
      // Update splash message to inform user
      this.splashLoading.show('⏳ Rate limited - slowing down uploads...');
    }

    // Extract specific error reason from "Failed to upload media: [reason]"
    if (cleanOutput.includes('Failed to upload media:') && !cleanOutput.includes('Rate Limit Exceeded')) {
      const errorMatch = cleanOutput.match(/Failed to upload media:\s*(.+?)(?:\n|$)/);
      if (errorMatch && errorMatch[1]) {
        this.lastUploadErrorReason = errorMatch[1].trim();
      } else {
        this.lastUploadErrorReason = 'Unknown error';
      }
    }

    // Detect "No media uploaded" and use the last captured error reason
    if (cleanOutput.includes('No media uploaded! Check Error logs')) {
      const errorReason = this.lastUploadErrorReason || 'Unknown error';
      this.warnings.update(warnings => [...warnings, {
        type: 'upload_failure',
        message: `Media upload failed: ${errorReason}`,
        details: 'Post was created without the image attachment'
      }]);
      // Reset the error reason after using it
      this.lastUploadErrorReason = null;
    }

    // Detect errors
    if (cleanOutput.includes('ERROR') || cleanOutput.includes('Error')) {
      // Don't set error phase for missing files or upload failures - they're warnings
      if (!cleanOutput.includes('Failed to read media file') && 
          !cleanOutput.includes('Failed to get image aspect ratio') &&
          !cleanOutput.includes('Failed to upload media')) {
        this.phase.set('error');
        this.splashLoading.show('⚠️ Encountered an issue during migration');
      }
    }

    // Detect skipped posts
    if (cleanOutput.includes('Skipping post')) {
      this.splashLoading.show('⏭️ Skipping incompatible post...');
      this.warnings.update(warnings => [...warnings, {
        type: 'skipped_post',
        message: 'Skipped incompatible post'
      }]);
    }
  }

  private getRandomMessage(): string {
    return this.messages[Math.floor(Math.random() * this.messages.length)];
  }

  progressPercentage = (): number => {
    const total = this.totalPosts();
    if (!total || total === 0) {
      // Indeterminate progress
      return 0;
    }
    return Math.min((this.postsCreated() / total) * 100, 100);
  }

  progressMode = (): 'determinate' | 'indeterminate' => {
    return this.totalPosts() !== null ? 'determinate' : 'indeterminate';
  }

  toggleWarnings(): void {
    this.showWarnings.update(show => !show);
  }

  warningCount = (): number => {
    return this.warnings().length;
  }
}

