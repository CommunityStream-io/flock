import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PreflightSummary } from './preflight-summary';
import { FILE_PROCESSOR } from '../../../services';
import type { FileService } from '../../../services/interfaces/file';
import { ConfigServiceImpl } from '../../../services/config';

describe('Feature: Preflight Summary Component (BDD-Style)', () => {
  let component: PreflightSummary;
  let fixture: ComponentFixture<PreflightSummary>;
  let mockFileService: jasmine.SpyObj<FileService>;
  let mockConfigService: jasmine.SpyObj<ConfigServiceImpl>;

  beforeEach(async () => {
    mockFileService = jasmine.createSpyObj('FileService', ['validateArchive', 'extractArchive'], {
      archivedFile: null
    });

    mockConfigService = jasmine.createSpyObj('ConfigServiceImpl', [
      'setArchivePath', 'setBlueskyCredentials', 'setSimulate', 'setStartDate', 'setEndDate', 'getBlueskyCredentials'
    ], {
      archivePath: null,
      simulate: false,
      startDate: null,
      endDate: null
    });

    await TestBed.configureTestingModule({
      imports: [PreflightSummary],
      providers: [
        { provide: FILE_PROCESSOR, useValue: mockFileService },
        { provide: ConfigServiceImpl, useValue: mockConfigService },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(PreflightSummary);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Scenario: Component creation and basic functionality', () => {
    it('Given component is created, When initialized, Then component is available', () => {
      // Given: Component is created
      console.log('🔧 BDD: Component is created');

      // When: Component is initialized
      console.log('⚙️ BDD: Component is initialized');

      // Then: Component is available
      console.log('✅ BDD: Component is available');
      expect(component).toBeTruthy();
    });
  });

  describe('Feature: Conditional Branch Coverage (BDD-Style)', () => {
    describe('Scenario: Username getter with credentials', () => {
      it('Given credentials with username, When getting username, Then username is returned', () => {
        // Given: Credentials with username
        console.log('🔧 BDD: Setting up credentials with username');
        mockConfigService.getBlueskyCredentials.and.returnValue({ username: 'testuser', password: 'testpass' });

        // When: Getting username
        console.log('⚙️ BDD: Getting username');
        const username = component.username;

        // Then: Username is returned (creds?.username branch)
        console.log('✅ BDD: Username branch is executed');
        expect(username).toBe('testuser');
      });

      it('Given credentials without username, When getting username, Then empty string is returned', () => {
        // Given: Credentials without username
        console.log('🔧 BDD: Setting up credentials without username');
        mockConfigService.getBlueskyCredentials.and.returnValue({ username: null as any, password: 'testpass' });

        // When: Getting username
        console.log('⚙️ BDD: Getting username');
        const username = component.username;

        // Then: Empty string is returned (?? '' branch)
        console.log('✅ BDD: Username fallback branch is executed');
        expect(username).toBe('');
      });

      it('Given null credentials, When getting username, Then empty string is returned', () => {
        // Given: Null credentials
        console.log('🔧 BDD: Setting up null credentials');
        mockConfigService.getBlueskyCredentials.and.returnValue(null);

        // When: Getting username
        console.log('⚙️ BDD: Getting username');
        const username = component.username;

        // Then: Empty string is returned (creds?.username ?? '' branch)
        console.log('✅ BDD: Null credentials fallback branch is executed');
        expect(username).toBe('');
      });
    });

    describe('Scenario: Archive name getter with file', () => {
      it('Given archived file exists, When getting archive name, Then file name is returned', () => {
        // Given: Archived file exists
        console.log('🔧 BDD: Setting up archived file');
        const mockFile = { name: 'test-archive.zip' };
        Object.defineProperty(mockFileService, 'archivedFile', {
          get: () => mockFile
        });

        // When: Getting archive name
        console.log('⚙️ BDD: Getting archive name');
        const archiveName = component.archiveName;

        // Then: File name is returned (if (file) branch)
        console.log('✅ BDD: File name branch is executed');
        expect(archiveName).toBe('test-archive.zip');
      });

      it('Given no archived file but archive path exists, When getting archive name, Then path filename is returned', () => {
        // Given: No archived file but archive path exists
        console.log('🔧 BDD: Setting up archive path without file');
        Object.defineProperty(mockFileService, 'archivedFile', {
          get: () => null
        });
        Object.defineProperty(mockConfigService, 'archivePath', {
          get: () => '/path/to/archive.zip'
        });

        // When: Getting archive name
        console.log('⚙️ BDD: Getting archive name');
        const archiveName = component.archiveName;

        // Then: Path filename is returned (path ? path.split(/[\\/]/).pop() branch)
        console.log('✅ BDD: Path filename branch is executed');
        expect(archiveName).toBe('archive.zip');
      });

      it('Given no archived file and no archive path, When getting archive name, Then empty string is returned', () => {
        // Given: No archived file and no archive path
        console.log('🔧 BDD: Setting up no file and no path');
        Object.defineProperty(mockFileService, 'archivedFile', {
          get: () => null
        });
        Object.defineProperty(mockConfigService, 'archivePath', {
          get: () => null
        });

        // When: Getting archive name
        console.log('⚙️ BDD: Getting archive name');
        const archiveName = component.archiveName;

        // Then: Empty string is returned (path ? ... : '' branch)
        console.log('✅ BDD: No path fallback branch is executed');
        expect(archiveName).toBe('');
      });

      it('Given archive path with Windows separators, When getting archive name, Then filename is extracted', () => {
        // Given: Archive path with Windows separators
        console.log('🔧 BDD: Setting up Windows path');
        Object.defineProperty(mockFileService, 'archivedFile', {
          get: () => null
        });
        Object.defineProperty(mockConfigService, 'archivePath', {
          get: () => 'C:\\Users\\test\\archive.zip'
        });

        // When: Getting archive name
        console.log('⚙️ BDD: Getting archive name');
        const archiveName = component.archiveName;

        // Then: Filename is extracted (path.split(/[\\/]/).pop() branch)
        console.log('✅ BDD: Windows path split branch is executed');
        expect(archiveName).toBe('archive.zip');
      });

      it('Given archive path with Unix separators, When getting archive name, Then filename is extracted', () => {
        // Given: Archive path with Unix separators
        console.log('🔧 BDD: Setting up Unix path');
        Object.defineProperty(mockFileService, 'archivedFile', {
          get: () => null
        });
        Object.defineProperty(mockConfigService, 'archivePath', {
          get: () => '/home/user/archive.zip'
        });

        // When: Getting archive name
        console.log('⚙️ BDD: Getting archive name');
        const archiveName = component.archiveName;

        // Then: Filename is extracted (path.split(/[\\/]/).pop() branch)
        console.log('✅ BDD: Unix path split branch is executed');
        expect(archiveName).toBe('archive.zip');
      });
    });

    describe('Scenario: Date range getter with various date combinations', () => {
      it('Given no start date and no end date, When getting date range, Then "All time" is returned', () => {
        // Given: No start date and no end date
        console.log('🔧 BDD: Setting up no dates');
        Object.defineProperty(mockConfigService, 'startDate', {
          get: () => null
        });
        Object.defineProperty(mockConfigService, 'endDate', {
          get: () => null
        });

        // When: Getting date range
        console.log('⚙️ BDD: Getting date range');
        const dateRange = component.dateRange;

        // Then: "All time" is returned (!start && !end branch)
        console.log('✅ BDD: No dates branch is executed');
        expect(dateRange).toBe('All time');
      });

      it('Given both start date and end date, When getting date range, Then range is returned', () => {
        // Given: Both start date and end date
        console.log('🔧 BDD: Setting up both dates');
        Object.defineProperty(mockConfigService, 'startDate', {
          get: () => '2024-01-01'
        });
        Object.defineProperty(mockConfigService, 'endDate', {
          get: () => '2024-12-31'
        });

        // When: Getting date range
        console.log('⚙️ BDD: Getting date range');
        const dateRange = component.dateRange;

        // Then: Range is returned (start && end branch)
        console.log('✅ BDD: Both dates branch is executed');
        expect(dateRange).toBe('2024-01-01 → 2024-12-31');
      });

      it('Given only start date, When getting date range, Then start to now is returned', () => {
        // Given: Only start date
        console.log('🔧 BDD: Setting up only start date');
        Object.defineProperty(mockConfigService, 'startDate', {
          get: () => '2024-01-01'
        });
        Object.defineProperty(mockConfigService, 'endDate', {
          get: () => null
        });

        // When: Getting date range
        console.log('⚙️ BDD: Getting date range');
        const dateRange = component.dateRange;

        // Then: Start to now is returned (start branch)
        console.log('✅ BDD: Start date only branch is executed');
        expect(dateRange).toBe('2024-01-01 → now');
      });

      it('Given only end date, When getting date range, Then until end is returned', () => {
        // Given: Only end date
        console.log('🔧 BDD: Setting up only end date');
        Object.defineProperty(mockConfigService, 'startDate', {
          get: () => null
        });
        Object.defineProperty(mockConfigService, 'endDate', {
          get: () => '2024-12-31'
        });

        // When: Getting date range
        console.log('⚙️ BDD: Getting date range');
        const dateRange = component.dateRange;

        // Then: Until end is returned (return `until ${end}` branch)
        console.log('✅ BDD: End date only branch is executed');
        expect(dateRange).toBe('until 2024-12-31');
      });
    });

    describe('Scenario: Simulate getter', () => {
      it('Given simulate is true, When getting simulate, Then true is returned', () => {
        // Given: Simulate is true
        console.log('🔧 BDD: Setting up simulate as true');
        Object.defineProperty(mockConfigService, 'simulate', {
          get: () => true
        });

        // When: Getting simulate
        console.log('⚙️ BDD: Getting simulate');
        const simulate = component.simulate;

        // Then: True is returned
        console.log('✅ BDD: Simulate true branch is executed');
        expect(simulate).toBe(true);
      });

      it('Given simulate is false, When getting simulate, Then false is returned', () => {
        // Given: Simulate is false
        console.log('🔧 BDD: Setting up simulate as false');
        Object.defineProperty(mockConfigService, 'simulate', {
          get: () => false
        });

        // When: Getting simulate
        console.log('⚙️ BDD: Getting simulate');
        const simulate = component.simulate;

        // Then: False is returned
        console.log('✅ BDD: Simulate false branch is executed');
        expect(simulate).toBe(false);
      });
    });
  });
});
