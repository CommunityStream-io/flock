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
});
