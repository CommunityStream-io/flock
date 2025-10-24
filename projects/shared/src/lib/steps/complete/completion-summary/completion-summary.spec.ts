import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CompletionSummary } from './completion-summary';
import { Migration } from '../../../services/migration';
import { ConfigServiceImpl } from '../../../services/config';

describe('CompletionSummary', () => {
  let component: CompletionSummary;
  let fixture: ComponentFixture<CompletionSummary>;
  let mockMigration: jasmine.SpyObj<Migration>;
  let mockConfigService: jasmine.SpyObj<ConfigServiceImpl>;

  beforeEach(async () => {
    mockMigration = jasmine.createSpyObj('Migration', ['reset', 'run'], {
      lastResult: null
    });

    mockConfigService = jasmine.createSpyObj('ConfigServiceImpl', ['getConfig'], {
      migrationResults: null
    });

    await TestBed.configureTestingModule({
      imports: [CompletionSummary],
      providers: [
        { provide: Migration, useValue: mockMigration },
        { provide: ConfigServiceImpl, useValue: mockConfigService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompletionSummary);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('migrationResults getter', () => {
    it('should return null when no migration results are available', () => {
      expect(component.migrationResults).toBeNull();
    });

    it('should return migration results from config service', () => {
      const mockResults = {
        success: true,
        postsImported: 150,
        mediaCount: 300,
        duration: '2m 30s',
        timestamp: new Date().toISOString()
      };

      Object.defineProperty(mockConfigService, 'migrationResults', {
        get: () => mockResults
      });

      expect(component.migrationResults).toEqual(mockResults);
    });

    it('should return undefined when config service returns undefined', () => {
      Object.defineProperty(mockConfigService, 'migrationResults', {
        get: () => undefined
      });

      expect(component.migrationResults).toBeUndefined();
    });
  });

  describe('count getter', () => {
    it('should return null when no results are available', () => {
      expect(component.count).toBeNull();
    });

    it('should return count from native migration results', () => {
      const mockResults = {
        success: true,
        postsImported: 125,
        mediaCount: 250,
        duration: '1m 45s',
        timestamp: new Date().toISOString()
      };

      Object.defineProperty(mockConfigService, 'migrationResults', {
        get: () => mockResults
      });

      expect(component.count).toBe(125);
    });

    it('should return count from migration service lastResult when no native results', () => {
      Object.defineProperty(mockMigration, 'lastResult', {
        get: () => ({ count: 42, elapsedMs: 5000 })
      });

      expect(component.count).toBe(42);
    });

    it('should prefer native results over migration service results', () => {
      const mockResults = {
        success: true,
        postsImported: 100,
        mediaCount: 200,
        duration: '1m',
        timestamp: new Date().toISOString()
      };

      Object.defineProperty(mockConfigService, 'migrationResults', {
        get: () => mockResults
      });

      Object.defineProperty(mockMigration, 'lastResult', {
        get: () => ({ count: 42, elapsedMs: 5000 })
      });

      expect(component.count).toBe(100);
    });

    it('should return null when migration service lastResult is null', () => {
      Object.defineProperty(mockMigration, 'lastResult', {
        get: () => null
      });

      expect(component.count).toBeNull();
    });

    it('should return null when migration service lastResult has undefined count', () => {
      Object.defineProperty(mockMigration, 'lastResult', {
        get: () => ({ count: undefined, elapsedMs: 5000 })
      });

      expect(component.count).toBeNull();
    });

    it('should return 0 when migration service lastResult has count of 0', () => {
      Object.defineProperty(mockMigration, 'lastResult', {
        get: () => ({ count: 0, elapsedMs: 5000 })
      });

      expect(component.count).toBe(0);
    });

    it('should return null when migration service lastResult has null count', () => {
      Object.defineProperty(mockMigration, 'lastResult', {
        get: () => ({ count: null, elapsedMs: 5000 })
      });

      expect(component.count).toBeNull();
    });
  });

  describe('mediaCount getter', () => {
    it('should return null when no native results are available', () => {
      expect(component.mediaCount).toBeNull();
    });

    it('should return null when only migration service results are available', () => {
      Object.defineProperty(mockMigration, 'lastResult', {
        get: () => ({ count: 42, elapsedMs: 5000 })
      });

      expect(component.mediaCount).toBeNull();
    });

    it('should return media count from native results', () => {
      const mockResults = {
        success: true,
        postsImported: 100,
        mediaCount: 250,
        duration: '2m',
        timestamp: new Date().toISOString()
      };

      Object.defineProperty(mockConfigService, 'migrationResults', {
        get: () => mockResults
      });

      expect(component.mediaCount).toBe(250);
    });

    it('should return 0 when native results have 0 media count', () => {
      const mockResults = {
        success: true,
        postsImported: 10,
        mediaCount: 0,
        duration: '30s',
        timestamp: new Date().toISOString()
      };

      Object.defineProperty(mockConfigService, 'migrationResults', {
        get: () => mockResults
      });

      expect(component.mediaCount).toBe(0);
    });

    it('should return null when native results have null media count', () => {
      const mockResults = {
        success: true,
        postsImported: 10,
        mediaCount: null,
        duration: '30s',
        timestamp: new Date().toISOString()
      };

      Object.defineProperty(mockConfigService, 'migrationResults', {
        get: () => mockResults
      });

      expect(component.mediaCount).toBeNull();
    });

    it('should return null when native results have undefined media count', () => {
      const mockResults = {
        success: true,
        postsImported: 10,
        mediaCount: undefined,
        duration: '30s',
        timestamp: new Date().toISOString()
      };

      Object.defineProperty(mockConfigService, 'migrationResults', {
        get: () => mockResults
      });

      expect(component.mediaCount).toBeUndefined();
    });
  });

  describe('elapsed getter', () => {
    it('should return null when no results are available', () => {
      expect(component.elapsed).toBeNull();
    });

    it('should return duration from native results', () => {
      const mockResults = {
        success: true,
        postsImported: 100,
        mediaCount: 200,
        duration: '3m 45s',
        timestamp: new Date().toISOString()
      };

      Object.defineProperty(mockConfigService, 'migrationResults', {
        get: () => mockResults
      });

      expect(component.elapsed).toBe('3m 45s');
    });

    it('should format elapsed time from migration service in seconds', () => {
      Object.defineProperty(mockMigration, 'lastResult', {
        get: () => ({ count: 42, elapsedMs: 5000 })
      });

      expect(component.elapsed).toBe('5s');
    });

    it('should prefer native results over migration service results', () => {
      const mockResults = {
        success: true,
        postsImported: 100,
        mediaCount: 200,
        duration: '2m 15s',
        timestamp: new Date().toISOString()
      };

      Object.defineProperty(mockConfigService, 'migrationResults', {
        get: () => mockResults
      });

      Object.defineProperty(mockMigration, 'lastResult', {
        get: () => ({ count: 42, elapsedMs: 10000 })
      });

      expect(component.elapsed).toBe('2m 15s');
    });

    it('should return null when migration service lastResult is null', () => {
      Object.defineProperty(mockMigration, 'lastResult', {
        get: () => null
      });

      expect(component.elapsed).toBeNull();
    });

    it('should round milliseconds to nearest second', () => {
      Object.defineProperty(mockMigration, 'lastResult', {
        get: () => ({ count: 42, elapsedMs: 1234 })
      });

      expect(component.elapsed).toBe('1s');
    });

    it('should round up when milliseconds >= 500', () => {
      Object.defineProperty(mockMigration, 'lastResult', {
        get: () => ({ count: 42, elapsedMs: 1600 })
      });

      expect(component.elapsed).toBe('2s');
    });

    it('should handle 0 elapsed time', () => {
      Object.defineProperty(mockMigration, 'lastResult', {
        get: () => ({ count: 42, elapsedMs: 0 })
      });

      expect(component.elapsed).toBe('0s');
    });

    it('should return null when migration service lastResult has undefined elapsedMs', () => {
      Object.defineProperty(mockMigration, 'lastResult', {
        get: () => ({ count: 42, elapsedMs: undefined })
      });

      expect(component.elapsed).toBeNull();
    });

    it('should return null when migration service lastResult has null elapsedMs', () => {
      Object.defineProperty(mockMigration, 'lastResult', {
        get: () => ({ count: 42, elapsedMs: null })
      });

      expect(component.elapsed).toBeNull();
    });
  });

  describe('success getter', () => {
    it('should return false when no results are available', () => {
      expect(component.success).toBe(false);
    });

    it('should return true when native results indicate success', () => {
      const mockResults = {
        success: true,
        postsImported: 100,
        mediaCount: 200,
        duration: '2m',
        timestamp: new Date().toISOString()
      };

      Object.defineProperty(mockConfigService, 'migrationResults', {
        get: () => mockResults
      });

      expect(component.success).toBe(true);
    });

    it('should return false when native results indicate failure', () => {
      const mockResults = {
        success: false,
        postsImported: 0,
        mediaCount: 0,
        duration: '0s',
        timestamp: new Date().toISOString()
      };

      Object.defineProperty(mockConfigService, 'migrationResults', {
        get: () => mockResults
      });

      expect(component.success).toBe(false);
    });

    it('should return true when migration service has lastResult', () => {
      Object.defineProperty(mockMigration, 'lastResult', {
        get: () => ({ count: 42, elapsedMs: 5000 })
      });

      expect(component.success).toBe(true);
    });

    it('should return false when migration service lastResult is null', () => {
      Object.defineProperty(mockMigration, 'lastResult', {
        get: () => null
      });

      expect(component.success).toBe(false);
    });

    it('should prefer native results over migration service results', () => {
      const mockResults = {
        success: false,
        postsImported: 0,
        mediaCount: 0,
        duration: '0s',
        timestamp: new Date().toISOString()
      };

      Object.defineProperty(mockConfigService, 'migrationResults', {
        get: () => mockResults
      });

      Object.defineProperty(mockMigration, 'lastResult', {
        get: () => ({ count: 42, elapsedMs: 5000 })
      });

      // Should use native result (false) not migration service (true)
      expect(component.success).toBe(false);
    });

    it('should return true when migration service lastResult is not null (truthy object)', () => {
      Object.defineProperty(mockMigration, 'lastResult', {
        get: () => ({ count: 0, elapsedMs: 0 }) // Even with 0 values, object is truthy
      });

      expect(component.success).toBe(true);
    });

    it('should return false when migration service lastResult is null', () => {
      Object.defineProperty(mockMigration, 'lastResult', {
        get: () => null
      });

      expect(component.success).toBe(false);
    });
  });

  describe('Template rendering scenarios', () => {
    it('should render success message when migration is successful', () => {
      const mockResults = {
        success: true,
        postsImported: 100,
        mediaCount: 200,
        duration: '2m',
        timestamp: new Date().toISOString()
      };

      Object.defineProperty(mockConfigService, 'migrationResults', {
        get: () => mockResults
      });

      fixture.detectChanges();
      const compiled = fixture.nativeElement;

      expect(compiled.querySelector('ul')).toBeTruthy();
      expect(compiled.querySelector('.error-message')).toBeFalsy();
      expect(compiled.textContent).toContain('Posts migrated: 100');
      expect(compiled.textContent).toContain('Media files: 200');
      expect(compiled.textContent).toContain('Duration: 2m');
    });

    it('should render error message when migration failed', () => {
      const mockResults = {
        success: false,
        postsImported: 0,
        mediaCount: 0,
        duration: '0s',
        timestamp: new Date().toISOString()
      };

      Object.defineProperty(mockConfigService, 'migrationResults', {
        get: () => mockResults
      });

      fixture.detectChanges();
      const compiled = fixture.nativeElement;

      expect(compiled.querySelector('ul')).toBeFalsy();
      expect(compiled.querySelector('.error-message')).toBeTruthy();
      expect(compiled.textContent).toContain('Migration did not complete successfully');
    });

    it('should render N/A for null count and elapsed values when success is true', () => {
      // Set up native results with success=true but null values
      const mockResults = {
        success: true,
        postsImported: null,
        mediaCount: null,
        duration: null,
        timestamp: new Date().toISOString()
      };

      Object.defineProperty(mockConfigService, 'migrationResults', {
        get: () => mockResults
      });

      fixture.detectChanges();
      const compiled = fixture.nativeElement;

      expect(compiled.textContent).toContain('Posts migrated: N/A');
      expect(compiled.textContent).toContain('Duration: N/A');
    });

    it('should hide media count when it is null', () => {
      Object.defineProperty(mockMigration, 'lastResult', {
        get: () => ({ count: 50, elapsedMs: 3000 })
      });

      fixture.detectChanges();
      const compiled = fixture.nativeElement;

      expect(compiled.textContent).not.toContain('Media files:');
    });

    it('should show media count when it is not null', () => {
      const mockResults = {
        success: true,
        postsImported: 100,
        mediaCount: 150,
        duration: '2m',
        timestamp: new Date().toISOString()
      };

      Object.defineProperty(mockConfigService, 'migrationResults', {
        get: () => mockResults
      });

      fixture.detectChanges();
      const compiled = fixture.nativeElement;

      expect(compiled.textContent).toContain('Media files: 150');
    });

    it('should show media count when it is 0', () => {
      const mockResults = {
        success: true,
        postsImported: 100,
        mediaCount: 0,
        duration: '2m',
        timestamp: new Date().toISOString()
      };

      Object.defineProperty(mockConfigService, 'migrationResults', {
        get: () => mockResults
      });

      fixture.detectChanges();
      const compiled = fixture.nativeElement;

      expect(compiled.textContent).toContain('Media files: 0');
    });
  });

  describe('Integration scenarios', () => {
    it('should handle native app results', () => {
      const mockResults = {
        success: true,
        postsImported: 150,
        mediaCount: 300,
        duration: '3m 20s',
        timestamp: new Date().toISOString()
      };

      Object.defineProperty(mockConfigService, 'migrationResults', {
        get: () => mockResults
      });

      expect(component.count).toBe(150);
      expect(component.mediaCount).toBe(300);
      expect(component.elapsed).toBe('3m 20s');
      expect(component.success).toBe(true);
    });

    it('should handle web app results (migration service only)', () => {
      Object.defineProperty(mockMigration, 'lastResult', {
        get: () => ({ count: 75, elapsedMs: 8500 })
      });

      expect(component.count).toBe(75);
      expect(component.mediaCount).toBeNull(); // Not available in web app
      expect(component.elapsed).toBe('9s'); // Rounded from 8.5s
      expect(component.success).toBe(true);
    });

    it('should handle no results scenario', () => {
      expect(component.count).toBeNull();
      expect(component.mediaCount).toBeNull();
      expect(component.elapsed).toBeNull();
      expect(component.success).toBe(false);
    });

    it('should prioritize native results when both are available', () => {
      const mockResults = {
        success: true,
        postsImported: 200,
        mediaCount: 400,
        duration: '5m',
        timestamp: new Date().toISOString()
      };

      Object.defineProperty(mockConfigService, 'migrationResults', {
        get: () => mockResults
      });

      Object.defineProperty(mockMigration, 'lastResult', {
        get: () => ({ count: 50, elapsedMs: 3000 })
      });

      // All values should come from native results
      expect(component.count).toBe(200);
      expect(component.mediaCount).toBe(400);
      expect(component.elapsed).toBe('5m');
      expect(component.success).toBe(true);
    });
  });
});
