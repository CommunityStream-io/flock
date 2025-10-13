import { TestBed } from '@angular/core/testing';
import { NativeFileProcessor } from './native-file-processor';
import { ElectronService } from '../electron/electron.service';
import { LOGGER, Logger, ConfigServiceImpl, SplashScreenLoading } from 'shared';

describe('NativeFileProcessor', () => {
  let service: NativeFileProcessor;
  let mockLogger: jasmine.SpyObj<Logger>;
  let mockElectronService: jasmine.SpyObj<ElectronService>;
  let mockConfigService: jasmine.SpyObj<ConfigServiceImpl>;
  let mockSplashScreenLoading: jasmine.SpyObj<SplashScreenLoading>;

  beforeEach(() => {
    mockLogger = jasmine.createSpyObj('Logger', ['log', 'error']);
    mockElectronService = jasmine.createSpyObj('ElectronService', ['getAPI']);
    mockConfigService = jasmine.createSpyObj('ConfigServiceImpl', ['setArchivePath']);
    mockSplashScreenLoading = jasmine.createSpyObj('SplashScreenLoading', 
      ['show', 'setComponent'], 
      {
        isLoading: { getValue: () => true },
        component: { getValue: () => null }
      }
    );

    TestBed.configureTestingModule({
      providers: [
        NativeFileProcessor,
        { provide: ElectronService, useValue: mockElectronService },
        { provide: LOGGER, useValue: mockLogger },
        { provide: ConfigServiceImpl, useValue: mockConfigService },
        { provide: SplashScreenLoading, useValue: mockSplashScreenLoading }
      ]
    });

    service = TestBed.inject(NativeFileProcessor);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('selectFile', () => {
    it('should select a file successfully', async () => {
      const mockResult = {
        success: true,
        canceled: false,
        filePath: '/path/to/file.zip',
        fileName: 'file.zip',
        fileSize: 1024000,
        lastModified: '2024-01-01T00:00:00.000Z'
      };

      mockElectronService.getAPI.and.returnValue({
        selectFile: jasmine.createSpy('selectFile').and.returnValue(Promise.resolve(mockResult))
      } as any);

      const file = await service.selectFile();

      expect(file).toBeTruthy();
      expect(file?.name).toBe('file.zip');
      expect(file?.size).toBe(1024000);
      expect(service.archivedFile).toBe(file);
      expect(mockLogger.log).toHaveBeenCalledWith(jasmine.stringContaining('[NativeFileProcessor] File selected:'));
    });

    it('should return null when selection is canceled', async () => {
      const mockResult = {
        success: true,
        canceled: true
      };

      mockElectronService.getAPI.and.returnValue({
        selectFile: jasmine.createSpy('selectFile').and.returnValue(Promise.resolve(mockResult))
      } as any);

      const file = await service.selectFile();

      expect(file).toBeNull();
      expect(mockLogger.log).toHaveBeenCalledWith(jasmine.stringContaining('File selection canceled or failed'));
    });

    it('should throw error for invalid selection result', async () => {
      const mockResult = {
        success: true,
        canceled: false,
        filePath: null
      };

      mockElectronService.getAPI.and.returnValue({
        selectFile: jasmine.createSpy('selectFile').and.returnValue(Promise.resolve(mockResult))
      } as any);

      await expectAsync(service.selectFile()).toBeRejectedWithError('Invalid file selection result');
    });

    it('should handle selection errors', async () => {
      mockElectronService.getAPI.and.returnValue({
        selectFile: jasmine.createSpy('selectFile').and.returnValue(Promise.reject(new Error('Selection failed')))
      } as any);

      await expectAsync(service.selectFile()).toBeRejectedWithError('Selection failed');
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('validateArchive', () => {
    it('should validate a valid archive', async () => {
      const mockFile = new File(['content'], 'test.zip', { type: 'application/zip' });
      Object.defineProperty(mockFile, '__nativePath', { value: '/path/to/test.zip' });

      const mockResult = {
        isValid: true,
        errors: [],
        warnings: [],
        timestamp: new Date()
      };

      mockElectronService.getAPI.and.returnValue({
        validateArchive: jasmine.createSpy('validateArchive').and.returnValue(Promise.resolve(mockResult))
      } as any);

      const result = await service.validateArchive(mockFile);

      expect(result.isValid).toBe(true);
      expect(result.errors.length).toBe(0);
      expect(mockLogger.log).toHaveBeenCalledWith(jasmine.stringContaining('✅ Valid'));
    });

    it('should validate an invalid archive', async () => {
      const mockFile = new File(['content'], 'test.zip', { type: 'application/zip' });
      Object.defineProperty(mockFile, '__nativePath', { value: '/path/to/test.zip' });

      const mockResult = {
        isValid: false,
        errors: ['Missing required files'],
        warnings: ['Old format detected'],
        timestamp: new Date()
      };

      mockElectronService.getAPI.and.returnValue({
        validateArchive: jasmine.createSpy('validateArchive').and.returnValue(Promise.resolve(mockResult))
      } as any);

      const result = await service.validateArchive(mockFile);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Missing required files');
      expect(result.warnings).toContain('Old format detected');
      expect(mockLogger.log).toHaveBeenCalledWith(jasmine.stringContaining('❌ Invalid'));
    });

    it('should handle validation errors', async () => {
      const mockFile = new File(['content'], 'test.zip', { type: 'application/zip' });
      Object.defineProperty(mockFile, '__nativePath', { value: '/path/to/test.zip' });

      mockElectronService.getAPI.and.returnValue({
        validateArchive: jasmine.createSpy('validateArchive').and.returnValue(Promise.reject(new Error('Validation error')))
      } as any);

      const result = await service.validateArchive(mockFile);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Validation error');
    });

    it('should return error when native path is not available', async () => {
      const mockFile = new File(['content'], 'test.zip', { type: 'application/zip' });

      const result = await service.validateArchive(mockFile);

      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('Native file path not available');
    });
  });

  describe('extractArchive', () => {
    it('should extract archive successfully', async () => {
      const mockFile = new File(['content'], 'test.zip', { type: 'application/zip' });
      Object.defineProperty(mockFile, '__nativePath', { value: '/path/to/test.zip' });
      Object.defineProperty(mockFile, 'size', { value: 1024000 });
      service.archivedFile = mockFile;

      const mockResult = {
        success: true,
        outputPath: '/path/to/extracted'
      };

      mockElectronService.getAPI.and.returnValue({
        extractArchive: jasmine.createSpy('extractArchive').and.returnValue(Promise.resolve(mockResult))
      } as any);

      const result = await service.extractArchive();

      expect(result).toBe(true);
      expect(service.getExtractedArchivePath()).toBe('/path/to/extracted');
      expect(mockConfigService.setArchivePath).toHaveBeenCalledWith('/path/to/extracted');
      expect(mockSplashScreenLoading.show).toHaveBeenCalledWith('Preparing extraction...');
    });

    it('should throw error when no file is selected', async () => {
      service.archivedFile = null;

      const result = await service.extractArchive();

      expect(result).toBe(false);
      expect(mockLogger.error).toHaveBeenCalledWith(jasmine.stringContaining('No archive file selected'));
    });

    it('should handle extraction failure', async () => {
      const mockFile = new File(['content'], 'test.zip', { type: 'application/zip' });
      Object.defineProperty(mockFile, '__nativePath', { value: '/path/to/test.zip' });
      Object.defineProperty(mockFile, 'size', { value: 1024000 });
      service.archivedFile = mockFile;

      const mockResult = {
        success: false,
        error: 'Extraction failed'
      };

      mockElectronService.getAPI.and.returnValue({
        extractArchive: jasmine.createSpy('extractArchive').and.returnValue(Promise.resolve(mockResult))
      } as any);

      const result = await service.extractArchive();

      expect(result).toBe(false);
      expect(mockLogger.error).toHaveBeenCalledWith(jasmine.stringContaining('Extraction failed'));
    });

    it('should handle extraction errors', async () => {
      const mockFile = new File(['content'], 'test.zip', { type: 'application/zip' });
      Object.defineProperty(mockFile, '__nativePath', { value: '/path/to/test.zip' });
      Object.defineProperty(mockFile, 'size', { value: 1024000 });
      service.archivedFile = mockFile;

      mockElectronService.getAPI.and.returnValue({
        extractArchive: jasmine.createSpy('extractArchive').and.returnValue(Promise.reject(new Error('API error')))
      } as any);

      const result = await service.extractArchive();

      expect(result).toBe(false);
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('getExtractedArchivePath', () => {
    it('should return null initially', () => {
      expect(service.getExtractedArchivePath()).toBeNull();
    });

    it('should return path after extraction', async () => {
      const mockFile = new File(['content'], 'test.zip', { type: 'application/zip' });
      Object.defineProperty(mockFile, '__nativePath', { value: '/path/to/test.zip' });
      Object.defineProperty(mockFile, 'size', { value: 1024000 });
      service.archivedFile = mockFile;

      mockElectronService.getAPI.and.returnValue({
        extractArchive: jasmine.createSpy('extractArchive').and.returnValue(Promise.resolve({
          success: true,
          outputPath: '/extracted/path'
        }))
      } as any);

      await service.extractArchive();
      expect(service.getExtractedArchivePath()).toBe('/extracted/path');
    });
  });
});

