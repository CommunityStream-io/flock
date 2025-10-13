import { TestBed } from '@angular/core/testing';
import { ExtractionProgressService } from './extraction-progress.service';
import { ElectronService } from '../electron/electron.service';
import { LOGGER, Logger } from 'shared';
import { ProgressData } from '../../types/electron';

describe('ExtractionProgressService', () => {
  let service: ExtractionProgressService;
  let mockLogger: jasmine.SpyObj<Logger>;
  let mockElectronService: jasmine.SpyObj<ElectronService>;
  let progressCallback: ((data: ProgressData) => void) | null = null;

  beforeEach(() => {
    mockLogger = jasmine.createSpyObj('Logger', ['log', 'error']);
    
    const mockUnsubscribe = jasmine.createSpy('unsubscribe');
    
    mockElectronService = jasmine.createSpyObj('ElectronService', ['isElectron', 'getAPI']);
    mockElectronService.isElectron.and.returnValue(true);
    mockElectronService.getAPI.and.returnValue({
      onProgress: (callback: (data: ProgressData) => void) => {
        progressCallback = callback;
        return mockUnsubscribe;
      }
    } as any);

    TestBed.configureTestingModule({
      providers: [
        ExtractionProgressService,
        { provide: ElectronService, useValue: mockElectronService },
        { provide: LOGGER, useValue: mockLogger }
      ]
    });

    service = TestBed.inject(ExtractionProgressService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should subscribe to Electron progress events on initialization', () => {
    expect(mockLogger.log).toHaveBeenCalledWith(jasmine.stringContaining('[ExtractionProgressService] Constructor called'));
    expect(mockLogger.log).toHaveBeenCalledWith(jasmine.stringContaining('[ExtractionProgressService] IS ELECTRON'));
    expect(mockLogger.log).toHaveBeenCalledWith(jasmine.stringContaining('[ExtractionProgressService] SUBSCRIBED to IPC events'));
  });

  it('should forward extraction progress events', (done) => {
    const progressData: ProgressData = {
      type: 'extraction',
      status: 'progress',
      message: 'Extracting files...',
      percentage: 50,
      filePath: 'test.zip'
    };

    service.progress$.subscribe((data) => {
      expect(data).toEqual(progressData);
      expect(mockLogger.log).toHaveBeenCalledWith(jasmine.stringContaining('[ExtractionProgressService] FORWARDING extraction event:'));
      done();
    });

    // Simulate progress event from Electron
    if (progressCallback) {
      progressCallback(progressData);
    }
  });

  it('should ignore non-extraction progress events', () => {
    const progressData: ProgressData = {
      type: 'migration',
      status: 'progress',
      message: 'Migrating posts...',
      percentage: 50
    };

    let eventReceived = false;
    service.progress$.subscribe(() => {
      eventReceived = true;
    });

    // Simulate progress event from Electron
    if (progressCallback) {
      progressCallback(progressData);
    }

    expect(eventReceived).toBe(false);
    expect(mockLogger.log).toHaveBeenCalledWith(jasmine.stringContaining('[ExtractionProgressService] Ignoring non-extraction event type:'));
  });

  it('should cleanup on destroy', () => {
    const unsubscribeSpy = jasmine.createSpy('unsubscribe');
    (service as any).unsubscribeProgress = unsubscribeSpy;

    service.ngOnDestroy();

    expect(unsubscribeSpy).toHaveBeenCalled();
    expect(mockLogger.log).toHaveBeenCalledWith(jasmine.stringContaining('[ExtractionProgressService] Cleaning up'));
  });
});

describe('ExtractionProgressService - Non-Electron Environment', () => {
  let service: ExtractionProgressService;
  let mockLogger: jasmine.SpyObj<Logger>;
  let mockElectronService: jasmine.SpyObj<ElectronService>;

  beforeEach(() => {
    mockLogger = jasmine.createSpyObj('Logger', ['log', 'error']);
    mockElectronService = jasmine.createSpyObj('ElectronService', ['isElectron']);
    mockElectronService.isElectron.and.returnValue(false);

    TestBed.configureTestingModule({
      providers: [
        ExtractionProgressService,
        { provide: ElectronService, useValue: mockElectronService },
        { provide: LOGGER, useValue: mockLogger }
      ]
    });

    service = TestBed.inject(ExtractionProgressService);
  });

  it('should handle non-Electron environment', () => {
    expect(service).toBeTruthy();
    expect(mockElectronService.isElectron).toHaveBeenCalled();
    expect(mockLogger.error).toHaveBeenCalledWith(jasmine.stringContaining('[ExtractionProgressService] NOT IN ELECTRON!'));
  });
});

