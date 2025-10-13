import { Injectable, inject, OnDestroy } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { LOGGER, Logger } from 'shared';
import { ElectronService } from '../electron/electron.service';
import { ProgressData } from '../../types/electron';

@Injectable({
  providedIn: 'root'
})
export class ExtractionProgressService implements OnDestroy {
  private electronService = inject(ElectronService);
  private logger = inject<Logger>(LOGGER);
  
  private progressSubject = new Subject<ProgressData>();
  public progress$: Observable<ProgressData> = this.progressSubject.asObservable();
  
  private unsubscribeProgress: (() => void) | null = null;

  constructor() {
    this.log('Constructor called');
    
    // Subscribe to Electron progress events once when service is created
    if (this.electronService.isElectron()) {
      this.log('IS ELECTRON');
      const api = this.electronService.getAPI();
      this.log('Got API', api);
      
      this.unsubscribeProgress = api.onProgress((data: ProgressData) => {
        this.log('RAW IPC EVENT:', data);
        if (data.type === 'extraction') {
          this.log('FORWARDING extraction event:', data);
          // Forward to components via Subject
          this.progressSubject.next(data);
        } else {
          this.log('Ignoring non-extraction event type:', data.type);
        }
      });
      
      this.log('SUBSCRIBED to IPC events');
    } else {
      this.error('NOT IN ELECTRON!');
    }
  }

  ngOnDestroy(): void {
    this.log('Cleaning up');
    if (this.unsubscribeProgress) {
      this.unsubscribeProgress();
    }
  }

  /**
   * Logging helpers with service prefix
   */
  private log(...args: any[]): void {
    const message = args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
    ).join(' ');
    this.logger.log(`[ExtractionProgressService] ${message}`);
  }

  private error(...args: any[]): void {
    const message = args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
    ).join(' ');
    this.logger.error(`[ExtractionProgressService] ${message}`);
  }
}

