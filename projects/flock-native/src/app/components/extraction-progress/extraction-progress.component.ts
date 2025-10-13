import { Component, inject, OnInit, OnDestroy, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { signal } from '@angular/core';
import { LOGGER, Logger, SplashScreenLoading } from 'shared';
import { ExtractionProgressService } from '../../service/extraction-progress/extraction-progress.service';

@Component({
  selector: 'extraction-progress',
  standalone: true,
  imports: [CommonModule, MatProgressBarModule, MatIconModule],
  templateUrl: './extraction-progress.component.html',
  styleUrl: './extraction-progress.component.css'
})
export class ExtractionProgressComponent implements OnInit, OnDestroy {
  private progressService = inject(ExtractionProgressService);
  private logger = inject<Logger>(LOGGER);
  private splashScreenLoading = inject(SplashScreenLoading);
  private progressSubscription: any;

  // Progress signals
  private percentageRaw = signal<number>(0);
  filesProcessed = signal<number>(0);
  totalFiles = signal<number>(0);
  message = signal<string>('Starting extraction...');
  status = signal<'starting' | 'progress' | 'complete' | 'error'>('starting');
  duration = signal<string | null>(null);
  outputPath = signal<string | null>(null);

  // Computed percentage - rounded and clamped for stability
  percentage = computed(() => {
    const raw = this.percentageRaw();
    // Round to whole number and clamp between 0-100
    return Math.min(Math.max(Math.round(raw), 0), 100);
  });

  constructor() {
    // Update splash screen message whenever progress changes
    effect(() => {
      const status = this.status();
      const percentage = this.percentage();
      
      let message = '';
      
      if (status === 'complete') {
        message = '✅ Extraction complete!';
      } else if (status === 'error') {
        message = '❌ Extraction failed';
      } else if (status === 'starting') {
        message = 'Preparing extraction...';
      } else {
        // Progress status - show percentage only
        message = `Extracting files... ${percentage}%`;
      }
      
      this.splashScreenLoading.message.next(message);
    });
  }

  ngOnInit(): void {
    this.log('========== ngOnInit called ==========');
    this.log('Component is being initialized');
    this.log('Progress service:', this.progressService);
    
    // Subscribe to progress service (similar to migration component)
    this.progressSubscription = this.progressService.progress$.subscribe((data) => {
      this.log('Received event from service:', data);
      
      this.status.set(data.status);
      this.message.set(data.message);
      
      if (data.percentage !== undefined) {
        this.percentageRaw.set(data.percentage);
        this.log('Set percentage:', data.percentage, '→ rounded:', this.percentage());
      }
      if (data.filesProcessed !== undefined) {
        this.filesProcessed.set(data.filesProcessed);
        this.log('Set filesProcessed:', data.filesProcessed);
      }
      if (data.totalFiles !== undefined) {
        this.totalFiles.set(data.totalFiles);
        this.log('Set totalFiles:', data.totalFiles);
      }
      if (data.duration !== undefined) {
        this.duration.set(data.duration);
      }
      if (data.outputPath !== undefined) {
        this.outputPath.set(data.outputPath);
      }
      
      this.log('Current state:', {
        status: this.status(),
        message: this.message(),
        percentage: this.percentage(),
        filesProcessed: this.filesProcessed(),
        totalFiles: this.totalFiles()
      });
    });
    
    this.log('Subscribed to progress service');
  }

  ngOnDestroy(): void {
    this.log('Destroyed');
    if (this.progressSubscription) {
      this.progressSubscription.unsubscribe();
    }
  }

  /**
   * Logging helper with component prefix
   */
  private log(...args: any[]): void {
    const message = args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
    ).join(' ');
    this.logger.log(`[ExtractionProgressComponent] ${message}`);
  }

  formatNumber(value: number): string {
    return value.toLocaleString();
  }
}

