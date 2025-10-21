import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { FileProcessor } from './file-processor';

describe('Feature: File Processing (BDD-Style)', () => {
  let service: FileProcessor;
  let mockActivatedRoute: jasmine.SpyObj<ActivatedRoute>;

  beforeEach(() => {
    mockActivatedRoute = jasmine.createSpyObj('ActivatedRoute', [], {
      snapshot: {
        queryParams: {}
      }
    });

    TestBed.configureTestingModule({
      providers: [
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    });
    service = TestBed.inject(FileProcessor);

    // Increase timeout for async tests
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
  });

  describe('Scenario: Service Initialization', () => {
    it('Given a file processor service, When service is created, Then service is available', () => {
      // Given: Service is created
      console.log('🔧 BDD: Service is created');

      // When: Service is injected
      console.log('⚙️ BDD: Service is injected');

      // Then: Service is available
      console.log('✅ BDD: Service is available');
      expect(service).toBeTruthy();
    });
  });

  describe('Scenario: Archive Validation', () => {
    it('Given a file processor service, When validating an archive, Then validation succeeds', async () => {
      // Given: Service and test file are available
      console.log('🔧 BDD: Setting up test file for validation');
      const testFile = new File(['test content'], 'test.zip', { type: 'application/zip' });

      // When: Archive validation is performed
      console.log('⚙️ BDD: Validating archive file');
      const result = await service.validateArchive(testFile);

      // Then: Validation succeeds with correct data
      console.log('✅ BDD: Verifying validation result');
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
      expect(result.warnings).toEqual([]);
      expect(result.timestamp).toBeInstanceOf(Date);
      expect(result.field).toBeUndefined();
      expect(result.value).toBeUndefined();
      expect(service.archivedFile).toBe(testFile);
    });
  });

  describe('Scenario: Archive Extraction Success', () => {
    it('Given a file processor service with successful extraction, When extracting archive, Then extraction succeeds', async () => {
      // Given: Service is configured for successful extraction
      console.log('🔧 BDD: Setting up service for successful extraction');
      mockActivatedRoute.snapshot.queryParams = {};

      // When: Archive extraction is performed
      console.log('⚙️ BDD: Extracting archive');
      const result = await service.extractArchive();

      // Then: Extraction succeeds
      console.log('✅ BDD: Verifying extraction success');
      expect(result).toBe(true);
    });
  });

  describe('Scenario: Archive Extraction Failure', () => {
    it('Given a file processor service with failed extraction, When extracting archive, Then extraction fails', async () => {
      // Given: Service is configured for failed extraction
      console.log('🔧 BDD: Setting up service for failed extraction');
      mockActivatedRoute.snapshot.queryParams = { extractionFailed: 'true' };

      // When: Archive extraction is performed
      console.log('⚙️ BDD: Extracting archive');

      // Then: Extraction fails with error
      console.log('✅ BDD: Verifying extraction failure');
      await expectAsync(service.extractArchive()).toBeRejectedWithError('Extraction failed');
    });
  });

  describe('Scenario: File Storage', () => {
    it('Given a file processor service, When validating a file, Then file is stored', async () => {
      // Given: Service and test file are available
      console.log('🔧 BDD: Setting up test file for storage');
      const testFile = new File(['test content'], 'test.zip', { type: 'application/zip' });

      // When: File validation is performed
      console.log('⚙️ BDD: Validating file to trigger storage');
      await service.validateArchive(testFile);

      // Then: File is stored in service
      console.log('✅ BDD: Verifying file is stored');
      expect(service.archivedFile).toBe(testFile);
    });
  });
});
