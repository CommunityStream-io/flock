import { TestBed } from '@angular/core/testing';

import { ConfigServiceImpl } from './config';
import { Credentials } from './interfaces/bluesky';

describe('Feature: Configuration Service', () => {
  let service: ConfigServiceImpl;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConfigServiceImpl);
  });

  describe('Scenario: Service initialization', () => {
    it('Given the service is created, When it initializes, Then it should be truthy', () => {
      // Given: Service is created
      console.log('🔧 BDD: Config service is created');
      
      // When: Service initializes
      console.log('⚙️ BDD: Service initializes');
      
      // Then: Should be truthy
      console.log('✅ BDD: Service is created successfully');
      expect(service).toBeTruthy();
    });
  });

  describe('Scenario: Archive path management', () => {
    it('Given the service is created, When archive path is set, Then it should return the correct path', () => {
      // Given: Service is created
      console.log('🔧 BDD: Config service is created');
      
      // When: Archive path is set
      console.log('⚙️ BDD: Setting archive path');
      const testPath = '/test/archive/path';
      service.setArchivePath(testPath);
      
      // Then: Should return the correct path
      console.log('✅ BDD: Archive path is set correctly');
      expect(service.archivePath).toBe(testPath);
    });

    it('Given the service is created, When archive path is not set, Then it should return empty string', () => {
      // Given: Service is created
      console.log('🔧 BDD: Config service is created');
      
      // When: Archive path is not set
      console.log('⚙️ BDD: Archive path is not set');
      
      // Then: Should return empty string
      console.log('✅ BDD: Archive path is empty by default');
      expect(service.archivePath).toBe('');
    });
  });

  describe('Scenario: Bluesky credentials management', () => {
    it('Given the service is created, When credentials are set, Then it should return the correct credentials', () => {
      // Given: Service is created
      console.log('🔧 BDD: Config service is created');
      
      // When: Credentials are set
      console.log('⚙️ BDD: Setting Bluesky credentials');
      const testCredentials: Credentials = {
        username: '@test.bksy.social',
        password: 'testpassword123'
      };
      service.setBlueskyCredentials(testCredentials);
      
      // Then: Should return the correct credentials
      console.log('✅ BDD: Credentials are set correctly');
      expect(service.blueskyCredentials).toEqual(testCredentials);
    });

    it('Given the service is created, When credentials are not set, Then it should return null', () => {
      // Given: Service is created
      console.log('🔧 BDD: Config service is created');
      
      // When: Credentials are not set
      console.log('⚙️ BDD: Credentials are not set');
      
      // Then: Should return null
      console.log('✅ BDD: Credentials are null by default');
      expect(service.blueskyCredentials).toBeNull();
    });
  });

  describe('Scenario: Simulation mode management', () => {
    it('Given the service is created, When simulation mode is set to true, Then it should return true', () => {
      // Given: Service is created
      console.log('🔧 BDD: Config service is created');
      
      // When: Simulation mode is set to true
      console.log('⚙️ BDD: Setting simulation mode to true');
      service.setSimulate(true);
      
      // Then: Should return true
      console.log('✅ BDD: Simulation mode is set to true');
      expect(service.simulate).toBe(true);
    });

    it('Given the service is created, When simulation mode is not set, Then it should return false', () => {
      // Given: Service is created
      console.log('🔧 BDD: Config service is created');
      
      // When: Simulation mode is not set
      console.log('⚙️ BDD: Simulation mode is not set');
      
      // Then: Should return false
      console.log('✅ BDD: Simulation mode is false by default');
      expect(service.simulate).toBe(false);
    });
  });

  describe('Scenario: Authentication state management', () => {
    it('Given the service is created, When authentication is set to true, Then it should return true', () => {
      // Given: Service is created
      console.log('🔧 BDD: Config service is created');
      
      // When: Authentication is set to true
      console.log('⚙️ BDD: Setting authentication to true');
      service.setAuthenticated(true);
      
      // Then: Should return true
      console.log('✅ BDD: Authentication is set to true');
      expect(service.isAuthenticated()).toBe(true);
    });

    it('Given the service is created, When authentication is not set, Then it should return false', () => {
      // Given: Service is created
      console.log('🔧 BDD: Config service is created');
      
      // When: Authentication is not set
      console.log('⚙️ BDD: Authentication is not set');
      
      // Then: Should return false
      console.log('✅ BDD: Authentication is false by default');
      expect(service.isAuthenticated()).toBe(false);
    });
  });

  describe('Scenario: Configuration validation', () => {
    it('Given all required config is set, When validateConfig is called, Then it should return true', async () => {
      // Given: All required config is set
      console.log('🔧 BDD: Setting all required configuration');
      service.setArchivePath('/test/path');
      service.setBlueskyCredentials({ username: '@test.bksy.social', password: 'test123' });
      service.setAuthenticated(true);
      
      // When: validateConfig is called
      console.log('⚙️ BDD: Validating configuration');
      const result = await service.validateConfig();
      
      // Then: Should return true
      console.log('✅ BDD: Configuration is valid');
      expect(result).toBe(true);
    });

    it('Given config is incomplete, When validateConfig is called, Then it should return false', async () => {
      // Given: Config is incomplete
      console.log('🔧 BDD: Configuration is incomplete');
      service.setArchivePath('/test/path');
      // Missing credentials and authentication
      
      // When: validateConfig is called
      console.log('⚙️ BDD: Validating configuration');
      const result = await service.validateConfig();
      
      // Then: Should return false
      console.log('✅ BDD: Configuration is invalid');
      expect(result).toBe(false);
    });
  });

  describe('Scenario: Configuration reset', () => {
    it('Given config is set, When resetConfig is called, Then all values should be reset', async () => {
      // Given: Config is set
      console.log('🔧 BDD: Setting configuration values');
      service.setArchivePath('/test/path');
      service.setBlueskyCredentials({ username: '@test.bksy.social', password: 'test123' });
      service.setSimulate(true);
      service.setAuthenticated(true);
      
      // When: resetConfig is called
      console.log('⚙️ BDD: Resetting configuration');
      await service.resetConfig();
      
      // Then: All values should be reset
      console.log('✅ BDD: Configuration is reset to defaults');
      expect(service.archivePath).toBe('');
      expect(service.blueskyCredentials).toBeNull();
      expect(service.simulate).toBe(false);
      expect(service.isAuthenticated()).toBe(false);
    });
  });

  describe('Scenario: Test video mode management', () => {
    it('Given the service is created, When test video mode is set to true, Then it should return true', () => {
      // Given: Service is created
      console.log('🔧 BDD: Config service is created');
      
      // When: Test video mode is set to true
      console.log('⚙️ BDD: Setting test video mode to true');
      service.setTestMode('video');
      
      // Then: Should return true
      console.log('✅ BDD: Test video mode is set to true');
      expect(service.testVideoMode).toBe(true);
    });

    it('Given the service is created, When test video mode is not set, Then it should return false', () => {
      // Given: Service is created
      console.log('🔧 BDD: Config service is created');
      
      // When: Test video mode is not set
      console.log('⚙️ BDD: Test video mode is not set');
      
      // Then: Should return false
      console.log('✅ BDD: Test video mode is false by default');
      expect(service.testVideoMode).toBe(false);
    });
  });

  describe('Scenario: Date range management', () => {
    it('Given the service is created, When start date is set, Then it should return the correct date', () => {
      // Given: Service is created
      console.log('🔧 BDD: Config service is created');
      
      // When: Start date is set
      console.log('⚙️ BDD: Setting start date');
      const testDate = '2023-01-01';
      service.setStartDate(testDate);
      
      // Then: Should return the correct date
      console.log('✅ BDD: Start date is set correctly');
      expect(service.startDate).toBe(testDate);
    });

    it('Given the service is created, When start date is not set, Then it should return empty string', () => {
      // Given: Service is created
      console.log('🔧 BDD: Config service is created');
      
      // When: Start date is not set
      console.log('⚙️ BDD: Start date is not set');
      
      // Then: Should return empty string
      console.log('✅ BDD: Start date is empty by default');
      expect(service.startDate).toBe('');
    });

    it('Given the service is created, When end date is set, Then it should return the correct date', () => {
      // Given: Service is created
      console.log('🔧 BDD: Config service is created');
      
      // When: End date is set
      console.log('⚙️ BDD: Setting end date');
      const testDate = '2023-12-31';
      service.setEndDate(testDate);
      
      // Then: Should return the correct date
      console.log('✅ BDD: End date is set correctly');
      expect(service.endDate).toBe(testDate);
    });

    it('Given the service is created, When end date is not set, Then it should return empty string', () => {
      // Given: Service is created
      console.log('🔧 BDD: Config service is created');
      
      // When: End date is not set
      console.log('⚙️ BDD: End date is not set');
      
      // Then: Should return empty string
      console.log('✅ BDD: End date is empty by default');
      expect(service.endDate).toBe('');
    });
  });

  describe('Scenario: Alternative credentials access', () => {
    it('Given the service is created, When getBlueskyCredentials is called, Then it should return the same as blueskyCredentials getter', () => {
      // Given: Service is created
      console.log('🔧 BDD: Config service is created');
      
      // When: Credentials are set and both methods are called
      console.log('⚙️ BDD: Setting credentials and calling both access methods');
      const testCredentials: Credentials = {
        username: '@test.bksy.social',
        password: 'testpassword123'
      };
      service.setBlueskyCredentials(testCredentials);
      
      // Then: Both methods should return the same value
      console.log('✅ BDD: Both credential access methods return the same value');
      expect(service.getBlueskyCredentials()).toEqual(testCredentials);
      expect(service.getBlueskyCredentials()).toEqual(service.blueskyCredentials);
    });
  });

  describe('Scenario: Authentication signal access', () => {
    it('Given the service is created, When getIsAuthenticatedSignal is called, Then it should return a readonly signal', () => {
      // Given: Service is created
      console.log('🔧 BDD: Config service is created');
      
      // When: getIsAuthenticatedSignal is called
      console.log('⚙️ BDD: Getting authentication signal');
      const authSignal = service.getIsAuthenticatedSignal();
      
      // Then: Should return a signal
      console.log('✅ BDD: Authentication signal is returned');
      expect(authSignal).toBeDefined();
      expect(typeof authSignal).toBe('function');
    });
  });
});
