import { TestBed } from '@angular/core/testing';
import { ElectronService } from './electron.service';
import { ElectronAPI } from '../../types/electron';

describe('ElectronService', () => {
  let service: ElectronService;
  let originalElectronAPI: ElectronAPI | undefined;
  let consoleWarnSpy: jasmine.Spy;
  let consoleLogSpy: jasmine.Spy;

  beforeEach(() => {
    // Save original electronAPI
    originalElectronAPI = (window as any).electronAPI;
    
    consoleWarnSpy = spyOn(console, 'warn');
    consoleLogSpy = spyOn(console, 'log');
  });

  afterEach(() => {
    // Restore original electronAPI
    (window as any).electronAPI = originalElectronAPI;
  });

  describe('with Electron environment', () => {
    beforeEach(() => {
      // Mock Electron API
      (window as any).electronAPI = {
        isElectron: true,
        platform: 'win32',
        arch: 'x64',
        selectDirectory: jasmine.createSpy('selectDirectory'),
        runMigration: jasmine.createSpy('runMigration'),
        extractZip: jasmine.createSpy('extractZip')
      };

      TestBed.configureTestingModule({
        providers: [ElectronService]
      });

      service = TestBed.inject(ElectronService);
    });

    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should log successful initialization', () => {
      expect(consoleLogSpy).toHaveBeenCalledWith('🦅 ElectronService: Electron API initialized');
      expect(consoleLogSpy).toHaveBeenCalledWith('📦 Platform: win32');
      expect(consoleLogSpy).toHaveBeenCalledWith('🔧 Architecture: x64');
    });

    it('should detect Electron environment', () => {
      expect(service.isElectron()).toBe(true);
    });

    it('should return Electron API', () => {
      const api = service.getAPI();
      expect(api).toBeDefined();
      expect(api.isElectron).toBe(true);
    });

    it('should return platform', () => {
      expect(service.getPlatform()).toBe('win32');
    });

    it('should return architecture', () => {
      expect(service.getArch()).toBe('x64');
    });

    it('should execute API calls safely', async () => {
      const mockResult = { success: true };
      const apiCall = jasmine.createSpy('apiCall').and.returnValue(Promise.resolve(mockResult));

      const result = await service.safeExecute(apiCall, 'Test operation');

      expect(apiCall).toHaveBeenCalled();
      expect(result).toEqual(mockResult);
    });

    it('should handle API call errors', async () => {
      const error = new Error('API call failed');
      const apiCall = jasmine.createSpy('apiCall').and.returnValue(Promise.reject(error));
      const consoleErrorSpy = spyOn(console, 'error');

      await expectAsync(service.safeExecute(apiCall, 'Test operation')).toBeRejectedWith(error);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Test operation:', error);
    });
  });

  describe('without Electron environment', () => {
    beforeEach(() => {
      // Remove Electron API
      delete (window as any).electronAPI;

      TestBed.configureTestingModule({
        providers: [ElectronService]
      });

      service = TestBed.inject(ElectronService);
    });

    it('should warn when not in Electron environment', () => {
      expect(consoleWarnSpy).toHaveBeenCalledWith('⚠️ ElectronService: Not running in Electron environment');
    });

    it('should detect non-Electron environment', () => {
      expect(service.isElectron()).toBe(false);
    });

    it('should throw error when getting API', () => {
      expect(() => service.getAPI()).toThrowError('Not running in Electron environment. ElectronAPI is not available.');
    });

    it('should return unknown for platform', () => {
      expect(service.getPlatform()).toBe('unknown');
    });

    it('should return unknown for architecture', () => {
      expect(service.getArch()).toBe('unknown');
    });

    it('should throw error when executing API calls', async () => {
      const apiCall = jasmine.createSpy('apiCall');

      await expectAsync(service.safeExecute(apiCall, 'Test operation'))
        .toBeRejectedWithError('Test operation: Not running in Electron environment');
      
      expect(apiCall).not.toHaveBeenCalled();
    });
  });
});

