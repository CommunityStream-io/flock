import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExtractionProgressComponent } from './extraction-progress.component';
import { ExtractionProgressService } from '../../service/extraction-progress/extraction-progress.service';
import { LOGGER, Logger, SplashScreenLoading } from 'shared';
import { Subject } from 'rxjs';
import { ProgressData } from '../../types/electron';

describe('ExtractionProgressComponent', () => {
  let component: ExtractionProgressComponent;
  let fixture: ComponentFixture<ExtractionProgressComponent>;
  let mockLogger: jasmine.SpyObj<Logger>;
  let mockSplashScreenLoading: any;
  let progressSubject: Subject<ProgressData>;
  let mockProgressService: any;

  beforeEach(async () => {
    progressSubject = new Subject<ProgressData>();
    
    mockLogger = jasmine.createSpyObj('Logger', ['log', 'error']);
    
    mockSplashScreenLoading = {
      message: {
        next: jasmine.createSpy('next')
      }
    };

    mockProgressService = {
      progress$: progressSubject.asObservable()
    };

    await TestBed.configureTestingModule({
      imports: [ExtractionProgressComponent],
      providers: [
        { provide: ExtractionProgressService, useValue: mockProgressService },
        { provide: LOGGER, useValue: mockLogger },
        { provide: SplashScreenLoading, useValue: mockSplashScreenLoading }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ExtractionProgressComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.percentage()).toBe(0);
    expect(component.filesProcessed()).toBe(0);
    expect(component.totalFiles()).toBe(0);
    expect(component.message()).toBe('Starting extraction...');
    expect(component.status()).toBe('starting');
    expect(component.duration()).toBeNull();
    expect(component.outputPath()).toBeNull();
  });

  it('should log initialization on ngOnInit', () => {
    fixture.detectChanges(); // triggers ngOnInit

    expect(mockLogger.log).toHaveBeenCalledWith(jasmine.stringContaining('[ExtractionProgressComponent] ========== ngOnInit called =========='));
    expect(mockLogger.log).toHaveBeenCalledWith(jasmine.stringContaining('[ExtractionProgressComponent] Component is being initialized'));
    expect(mockLogger.log).toHaveBeenCalledWith(jasmine.stringContaining('[ExtractionProgressComponent] Subscribed to progress service'));
  });

  describe('Progress updates', () => {
    beforeEach(() => {
      fixture.detectChanges(); // Initialize component
    });

    it('should update status from progress data', () => {
      const progressData: ProgressData = {
        type: 'extraction',
        status: 'progress',
        message: 'Extracting files...',
        percentage: 50
      };

      progressSubject.next(progressData);

      expect(component.status()).toBe('progress');
      expect(component.message()).toBe('Extracting files...');
    });

    it('should update percentage from progress data', () => {
      const progressData: ProgressData = {
        type: 'extraction',
        status: 'progress',
        message: 'Extracting...',
        percentage: 75
      };

      progressSubject.next(progressData);

      expect(component.percentage()).toBe(75);
    });

    it('should round and clamp percentage values', () => {
      const progressData: ProgressData = {
        type: 'extraction',
        status: 'progress',
        message: 'Extracting...',
        percentage: 75.7
      };

      progressSubject.next(progressData);

      expect(component.percentage()).toBe(76); // Rounded
    });

    it('should clamp percentage to 0-100 range', () => {
      let progressData: ProgressData = {
        type: 'extraction',
        status: 'progress',
        message: 'Extracting...',
        percentage: 150
      };

      progressSubject.next(progressData);
      expect(component.percentage()).toBe(100); // Clamped to max

      progressData = {
        type: 'extraction',
        status: 'progress',
        message: 'Extracting...',
        percentage: -10
      };

      progressSubject.next(progressData);
      expect(component.percentage()).toBe(0); // Clamped to min
    });

    it('should update filesProcessed when provided', () => {
      const progressData: ProgressData = {
        type: 'extraction',
        status: 'progress',
        message: 'Extracting...',
        filesProcessed: 42
      };

      progressSubject.next(progressData);

      expect(component.filesProcessed()).toBe(42);
    });

    it('should update totalFiles when provided', () => {
      const progressData: ProgressData = {
        type: 'extraction',
        status: 'progress',
        message: 'Extracting...',
        totalFiles: 100
      };

      progressSubject.next(progressData);

      expect(component.totalFiles()).toBe(100);
    });

    it('should update duration when provided', () => {
      const progressData: ProgressData = {
        type: 'extraction',
        status: 'complete',
        message: 'Done',
        duration: '2m 30s'
      };

      progressSubject.next(progressData);

      expect(component.duration()).toBe('2m 30s');
    });

    it('should update outputPath when provided', () => {
      const progressData: ProgressData = {
        type: 'extraction',
        status: 'complete',
        message: 'Done',
        outputPath: '/path/to/extracted'
      };

      progressSubject.next(progressData);

      expect(component.outputPath()).toBe('/path/to/extracted');
    });

    it('should update multiple fields at once', () => {
      const progressData: ProgressData = {
        type: 'extraction',
        status: 'progress',
        message: 'Extracting files...',
        percentage: 60,
        filesProcessed: 60,
        totalFiles: 100
      };

      progressSubject.next(progressData);

      expect(component.status()).toBe('progress');
      expect(component.message()).toBe('Extracting files...');
      expect(component.percentage()).toBe(60);
      expect(component.filesProcessed()).toBe(60);
      expect(component.totalFiles()).toBe(100);
    });
  });

  describe('Splash screen message updates', () => {
    beforeEach(() => {
      fixture.detectChanges(); // Initialize component
    });

    it('should update splash message for starting status', () => {
      const progressData: ProgressData = {
        type: 'extraction',
        status: 'starting',
        message: 'Preparing...'
      };

      progressSubject.next(progressData);
      fixture.detectChanges();

      expect(mockSplashScreenLoading.message.next).toHaveBeenCalledWith('Preparing extraction...');
    });

    it('should update splash message for progress status with percentage', () => {
      const progressData: ProgressData = {
        type: 'extraction',
        status: 'progress',
        message: 'Extracting...',
        percentage: 45
      };

      progressSubject.next(progressData);
      fixture.detectChanges();

      expect(mockSplashScreenLoading.message.next).toHaveBeenCalledWith('Extracting files... 45%');
    });

    it('should update splash message for complete status', () => {
      const progressData: ProgressData = {
        type: 'extraction',
        status: 'complete',
        message: 'Done!'
      };

      progressSubject.next(progressData);
      fixture.detectChanges();

      expect(mockSplashScreenLoading.message.next).toHaveBeenCalledWith('✅ Extraction complete!');
    });

    it('should update splash message for error status', () => {
      const progressData: ProgressData = {
        type: 'extraction',
        status: 'error',
        message: 'Failed'
      };

      progressSubject.next(progressData);
      fixture.detectChanges();

      expect(mockSplashScreenLoading.message.next).toHaveBeenCalledWith('❌ Extraction failed');
    });
  });

  describe('formatNumber', () => {
    it('should format numbers with locale formatting', () => {
      expect(component.formatNumber(1000)).toBe('1,000');
      expect(component.formatNumber(1000000)).toBe('1,000,000');
      expect(component.formatNumber(42)).toBe('42');
    });
  });

  describe('Cleanup', () => {
    it('should unsubscribe on destroy', () => {
      fixture.detectChanges(); // Initialize component
      
      const subscription = (component as any).progressSubscription;
      spyOn(subscription, 'unsubscribe');

      component.ngOnDestroy();

      expect(subscription.unsubscribe).toHaveBeenCalled();
      expect(mockLogger.log).toHaveBeenCalledWith(jasmine.stringContaining('[ExtractionProgressComponent] Destroyed'));
    });
  });

  describe('Logging', () => {
    beforeEach(() => {
      fixture.detectChanges(); // Initialize component
    });

    it('should log progress updates with state information', () => {
      const progressData: ProgressData = {
        type: 'extraction',
        status: 'progress',
        message: 'Extracting...',
        percentage: 50,
        filesProcessed: 50,
        totalFiles: 100
      };

      progressSubject.next(progressData);

      expect(mockLogger.log).toHaveBeenCalledWith(jasmine.stringContaining('[ExtractionProgressComponent] Received event from service:'));
      expect(mockLogger.log).toHaveBeenCalledWith(jasmine.stringContaining('[ExtractionProgressComponent] Set percentage:'));
      expect(mockLogger.log).toHaveBeenCalledWith(jasmine.stringContaining('[ExtractionProgressComponent] Current state:'));
    });
  });
});

