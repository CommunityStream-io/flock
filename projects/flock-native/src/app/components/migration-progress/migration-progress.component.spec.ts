import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MigrationProgressComponent } from './migration-progress.component';
import { CLIService } from '../../service/cli/cli.service';
import { LOGGER, Logger, SplashScreenLoading } from 'shared';
import { Subject } from 'rxjs';
import { CLIOutputData } from '../../types/electron';

describe('MigrationProgressComponent', () => {
  let component: MigrationProgressComponent;
  let fixture: ComponentFixture<MigrationProgressComponent>;
  let mockLogger: jasmine.SpyObj<Logger>;
  let mockSplashLoading: jasmine.SpyObj<SplashScreenLoading>;
  let outputSubject: Subject<CLIOutputData>;
  let mockCLIService: any;

  beforeEach(async () => {
    outputSubject = new Subject<CLIOutputData>();
    
    mockLogger = jasmine.createSpyObj('Logger', ['log', 'error']);
    mockSplashLoading = jasmine.createSpyObj('SplashScreenLoading', ['show', 'hide']);

    mockCLIService = {
      output$: outputSubject.asObservable()
    };

    await TestBed.configureTestingModule({
      imports: [MigrationProgressComponent],
      providers: [
        { provide: CLIService, useValue: mockCLIService },
        { provide: LOGGER, useValue: mockLogger },
        { provide: SplashScreenLoading, useValue: mockSplashLoading }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MigrationProgressComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.phase()).toBe('starting');
    expect(component.postsCreated()).toBe(0);
    expect(component.totalPosts()).toBeNull();
    expect(component.lastPostUrl()).toBeNull();
    expect(component.mediaCount()).toBe(0);
    expect(component.warnings()).toEqual([]);
    expect(component.showWarnings()).toBe(false);
  });

  it('should have Font Awesome icons defined', () => {
    expect(component.faHourglass).toBeDefined();
    expect(component.faRocket).toBeDefined();
    expect(component.faCheckCircle).toBeDefined();
    expect(component.faExclamationTriangle).toBeDefined();
    expect(component.faWarning).toBeDefined();
    expect(component.faFeather).toBeDefined();
  });

  it('should log initialization on ngOnInit', () => {
    fixture.detectChanges(); // triggers ngOnInit

    expect(mockLogger.log).toHaveBeenCalledWith(jasmine.stringContaining('[MigrationProgressComponent] ========== ngOnInit called =========='));
    expect(mockLogger.log).toHaveBeenCalledWith(jasmine.stringContaining('[MigrationProgressComponent] Component is being initialized'));
    expect(mockSplashLoading.show).toHaveBeenCalledWith(jasmine.stringContaining('Starting your Instagram to Bluesky migration'));
  });

  describe('CLI Output Handling', () => {
    beforeEach(() => {
      fixture.detectChanges(); // Initialize component
    });

    it('should handle import start message', () => {
      const outputData: CLIOutputData = {
        processId: 'test-123',
        type: 'stdout',
        data: 'Import started'
      };

      outputSubject.next(outputData);

      expect(component.phase()).toBe('migrating');
      expect(mockSplashLoading.show).toHaveBeenCalled();
    });

    it('should detect total posts and media from import message', () => {
      const outputData: CLIOutputData = {
        processId: 'test-123',
        type: 'stdout',
        data: 'imported 42 posts with 128 media'
      };

      outputSubject.next(outputData);

      expect(component.totalPosts()).toBe(42);
      expect(component.mediaCount()).toBe(128);
    });

    it('should handle single post import message', () => {
      const outputData: CLIOutputData = {
        processId: 'test-123',
        type: 'stdout',
        data: 'imported 1 post with 3 media'
      };

      outputSubject.next(outputData);

      expect(component.totalPosts()).toBe(1);
      expect(component.mediaCount()).toBe(3);
    });

    it('should detect post creation with URL', () => {
      const outputData: CLIOutputData = {
        processId: 'test-123',
        type: 'stdout',
        data: 'Bluesky post created with url: https://bsky.app/profile/user.bsky.social/post/abc123'
      };

      outputSubject.next(outputData);

      expect(component.postsCreated()).toBe(1);
      expect(component.lastPostUrl()).toBe('https://bsky.app/profile/user.bsky.social/post/abc123');
    });

    it('should increment posts created counter', () => {
      const outputData: CLIOutputData = {
        processId: 'test-123',
        type: 'stdout',
        data: 'Bluesky post created with url: https://bsky.app/profile/user.bsky.social/post/1'
      };

      outputSubject.next(outputData);
      expect(component.postsCreated()).toBe(1);

      outputData.data = 'Bluesky post created with url: https://bsky.app/profile/user.bsky.social/post/2';
      outputSubject.next(outputData);
      expect(component.postsCreated()).toBe(2);

      outputData.data = 'Bluesky post created with url: https://bsky.app/profile/user.bsky.social/post/3';
      outputSubject.next(outputData);
      expect(component.postsCreated()).toBe(3);
    });

    it('should update splash message every 3 posts', () => {
      spyOn<any>(component, 'getRandomMessage').and.returnValue('Random message');

      for (let i = 1; i <= 6; i++) {
        const outputData: CLIOutputData = {
          processId: 'test-123',
          type: 'stdout',
          data: `Bluesky post created with url: https://bsky.app/profile/user.bsky.social/post/${i}`
        };
        outputSubject.next(outputData);
      }

      expect(mockSplashLoading.show).toHaveBeenCalledWith('Random message');
      expect((component as any).getRandomMessage).toHaveBeenCalledTimes(2); // At posts 3 and 6
    });

    it('should handle import finish message', () => {
      // Set up some posts first
      component.postsCreated.set(5);
      component.mediaCount.set(15);

      const outputData: CLIOutputData = {
        processId: 'test-123',
        type: 'stdout',
        data: 'Import finished'
      };

      outputSubject.next(outputData);

      expect(component.phase()).toBe('complete');
      expect(mockSplashLoading.show).toHaveBeenCalledWith(jasmine.stringContaining('Successfully migrated 5 posts with 15 media files'));
    });

    it('should handle singular post and media in finish message', () => {
      component.postsCreated.set(1);
      component.mediaCount.set(1);

      const outputData: CLIOutputData = {
        processId: 'test-123',
        type: 'stdout',
        data: 'Import finished'
      };

      outputSubject.next(outputData);

      expect(mockSplashLoading.show).toHaveBeenCalledWith(jasmine.stringContaining('1 post with 1 media file'));
    });

    it('should detect errors in output', () => {
      const outputData: CLIOutputData = {
        processId: 'test-123',
        type: 'stdout',
        data: 'ERROR: Something went wrong'
      };

      outputSubject.next(outputData);

      expect(component.phase()).toBe('error');
      expect(mockSplashLoading.show).toHaveBeenCalledWith(jasmine.stringContaining('Encountered an issue'));
    });

    it('should detect errors with lowercase "error"', () => {
      const outputData: CLIOutputData = {
        processId: 'test-123',
        type: 'stdout',
        data: 'Error processing post'
      };

      outputSubject.next(outputData);

      expect(component.phase()).toBe('error');
    });

    it('should not set error phase for missing file errors', () => {
      const outputData: CLIOutputData = {
        processId: 'test-123',
        type: 'stdout',
        data: 'ERROR: Failed to read media file: /path/to/missing.jpg'
      };

      outputSubject.next(outputData);

      expect(component.phase()).not.toBe('error');
      expect(component.warnings().length).toBe(1);
    });

    it('should handle skipped posts', () => {
      const outputData: CLIOutputData = {
        processId: 'test-123',
        type: 'stdout',
        data: 'Skipping post - incompatible format'
      };

      outputSubject.next(outputData);

      expect(mockSplashLoading.show).toHaveBeenCalledWith(jasmine.stringContaining('Skipping incompatible post'));
      expect(component.warnings().length).toBe(1);
      expect(component.warnings()[0].type).toBe('skipped_post');
    });

    it('should handle stderr output', () => {
      const outputData: CLIOutputData = {
        processId: 'test-123',
        type: 'stderr',
        data: 'Bluesky post created with url: https://bsky.app/profile/test/post/1'
      };

      outputSubject.next(outputData);

      expect(component.postsCreated()).toBe(1);
    });

    it('should handle exit with success code', () => {
      const outputData: CLIOutputData = {
        processId: 'test-123',
        type: 'exit',
        code: 0
      };

      outputSubject.next(outputData);

      expect(component.phase()).toBe('complete');
      expect(mockSplashLoading.show).toHaveBeenCalledWith(jasmine.stringContaining('Migration complete! Welcome to Bluesky!'));
    });

    it('should handle exit with error code', () => {
      const outputData: CLIOutputData = {
        processId: 'test-123',
        type: 'exit',
        code: 1
      };

      outputSubject.next(outputData);

      expect(component.phase()).toBe('error');
      expect(mockSplashLoading.show).toHaveBeenCalledWith(jasmine.stringContaining('Migration encountered an error'));
    });
  });

  describe('Progress Calculation', () => {
    it('should return 0 when total posts is null', () => {
      component.totalPosts.set(null);
      component.postsCreated.set(5);

      expect(component.progressPercentage()).toBe(0);
    });

    it('should return 0 when total posts is 0', () => {
      component.totalPosts.set(0);
      component.postsCreated.set(5);

      expect(component.progressPercentage()).toBe(0);
    });

    it('should calculate percentage correctly', () => {
      component.totalPosts.set(100);
      component.postsCreated.set(25);

      expect(component.progressPercentage()).toBe(25);
    });

    it('should not exceed 100%', () => {
      component.totalPosts.set(10);
      component.postsCreated.set(15); // More created than total

      expect(component.progressPercentage()).toBe(100);
    });

    it('should handle partial percentages', () => {
      component.totalPosts.set(3);
      component.postsCreated.set(1);

      expect(component.progressPercentage()).toBeCloseTo(33.33, 2);
    });
  });

  describe('Progress Mode', () => {
    it('should return indeterminate when total posts is null', () => {
      component.totalPosts.set(null);

      expect(component.progressMode()).toBe('indeterminate');
    });

    it('should return determinate when total posts is set', () => {
      component.totalPosts.set(10);

      expect(component.progressMode()).toBe('determinate');
    });
  });

  describe('Random Messages', () => {
    it('should return a message from the array', () => {
      const message = (component as any).getRandomMessage();

      expect(typeof message).toBe('string');
      expect(message.length).toBeGreaterThan(0);
      expect((component as any).messages).toContain(message);
    });

    it('should return different messages on multiple calls', () => {
      const messages = new Set<string>();
      
      // Call multiple times to get different messages
      for (let i = 0; i < 20; i++) {
        messages.add((component as any).getRandomMessage());
      }

      // Should have gotten at least 2 different messages in 20 attempts
      expect(messages.size).toBeGreaterThan(1);
    });
  });

  describe('Warnings Handling', () => {
    beforeEach(() => {
      fixture.detectChanges(); // Initialize component
    });

    it('should collect missing file warnings', () => {
      const outputData: CLIOutputData = {
        processId: 'test-123',
        type: 'stdout',
        data: 'Failed to read media file: /path/to/archive/media/posts/202201/missing.jpg'
      };

      outputSubject.next(outputData);

      expect(component.warnings().length).toBe(1);
      expect(component.warnings()[0].type).toBe('missing_file');
      expect(component.warnings()[0].message).toContain('missing.jpg');
      expect(component.warnings()[0].details).toContain('media/posts/202201/missing.jpg');
    });

    it('should collect truncated caption warnings', () => {
      const outputData: CLIOutputData = {
        processId: 'test-123',
        type: 'stdout',
        data: 'Truncating image caption from 500 to 300 characters'
      };

      outputSubject.next(outputData);

      expect(component.warnings().length).toBe(1);
      expect(component.warnings()[0].type).toBe('truncated_caption');
      expect(component.warnings()[0].message).toContain('500 to 300');
    });

    it('should collect multiple warnings', () => {
      const outputs: CLIOutputData[] = [
        {
          processId: 'test-123',
          type: 'stdout',
          data: 'Failed to read media file: /path/file1.jpg'
        },
        {
          processId: 'test-123',
          type: 'stdout',
          data: 'Truncating image caption from 400 to 300 characters'
        },
        {
          processId: 'test-123',
          type: 'stdout',
          data: 'Skipping post - incompatible'
        }
      ];

      outputs.forEach(output => outputSubject.next(output));

      expect(component.warnings().length).toBe(3);
      expect(component.warnings()[0].type).toBe('missing_file');
      expect(component.warnings()[1].type).toBe('truncated_caption');
      expect(component.warnings()[2].type).toBe('skipped_post');
    });

    it('should toggle warnings visibility', () => {
      expect(component.showWarnings()).toBe(false);

      component.toggleWarnings();
      expect(component.showWarnings()).toBe(true);

      component.toggleWarnings();
      expect(component.showWarnings()).toBe(false);
    });

    it('should return correct warning count', () => {
      expect(component.warningCount()).toBe(0);

      component.warnings.set([
        { type: 'missing_file', message: 'test1' },
        { type: 'truncated_caption', message: 'test2' }
      ]);

      expect(component.warningCount()).toBe(2);
    });
  });

  describe('Cleanup', () => {
    it('should unsubscribe on destroy', () => {
      fixture.detectChanges(); // Initialize component
      
      const subscription = (component as any).outputSubscription;
      spyOn(subscription, 'unsubscribe');

      component.ngOnDestroy();

      expect(subscription.unsubscribe).toHaveBeenCalled();
      expect(mockLogger.log).toHaveBeenCalledWith(jasmine.stringContaining('[MigrationProgressComponent] Destroyed'));
    });
  });

  describe('Logging', () => {
    beforeEach(() => {
      fixture.detectChanges(); // Initialize component
    });

    it('should log CLI output received', () => {
      const outputData: CLIOutputData = {
        processId: 'test-123',
        type: 'stdout',
        data: 'Test output'
      };

      outputSubject.next(outputData);

      expect(mockLogger.log).toHaveBeenCalledWith(jasmine.stringContaining('[MigrationProgressComponent] Received CLI output:'));
    });
  });
});

