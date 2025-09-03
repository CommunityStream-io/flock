import { TestBed } from '@angular/core/testing';

import { Bluesky } from './bluesky';
import { Credentials } from './interfaces/bluesky';

describe('Feature: Bluesky Service', () => {
  let service: Bluesky;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Bluesky);
  });

  describe('Scenario: Service initialization', () => {
    it('Given the service is created, When it initializes, Then it should be truthy', () => {
      // Given: Service is created
      console.log('🔧 BDD: Bluesky service is created');
      
      // When: Service initializes
      console.log('⚙️ BDD: Service initializes');
      
      // Then: Should be truthy
      console.log('✅ BDD: Service is created successfully');
      expect(service).toBeTruthy();
    });
  });

  describe('Scenario: Connection testing', () => {
    it('Given the service is created, When testConnection is called, Then it should return success', async () => {
      // Given: Service is created
      console.log('🔧 BDD: Bluesky service is created');
      
      // When: testConnection is called
      console.log('⚙️ BDD: Testing connection to Bluesky');
      const result = await service.testConnection();
      
      // Then: Should return success
      console.log('✅ BDD: Connection test returns success');
      expect(result.status).toBe('connected');
      expect(result.message).toBe('Successfully connected to Bluesky');
    });
  });

  describe('Scenario: Authentication with valid credentials', () => {
    it('Given valid test credentials, When authenticate is called, Then it should return success', async () => {
      // Given: Valid test credentials
      console.log('🔧 BDD: Setting up valid test credentials');
      const credentials: Credentials = {
        username: '@test.bksy.social',
        password: 'testpassword123'
      };
      
      // When: authenticate is called
      console.log('⚙️ BDD: Authenticating with valid credentials');
      const result = await service.authenticate(credentials);
      
      // Then: Should return success
      console.log('✅ BDD: Authentication succeeds');
      expect(result.success).toBe(true);
      expect(result.message).toBe('Authentication successful');
    });
  });

  describe('Scenario: Authentication with invalid credentials', () => {
    it('Given invalid credentials, When authenticate is called, Then it should return failure', async () => {
      // Given: Invalid credentials
      console.log('🔧 BDD: Setting up invalid credentials');
      const credentials: Credentials = {
        username: '@invalid.user.name',
        password: 'wrongpassword'
      };
      
      // When: authenticate is called
      console.log('⚙️ BDD: Authenticating with invalid credentials');
      const result = await service.authenticate(credentials);
      
      // Then: Should return failure
      console.log('✅ BDD: Authentication fails');
      expect(result.success).toBe(false);
      expect(result.message).toBe('Invalid Bluesky credentials');
    });
  });

  describe('Scenario: Authentication validation - username format', () => {
    it('Given username without @ symbol, When authenticate is called, Then it should return validation error', async () => {
      // Given: Username without @ symbol
      console.log('🔧 BDD: Setting up username without @ symbol');
      const credentials: Credentials = {
        username: 'invalid.username',
        password: 'testpassword123'
      };
      
      // When: authenticate is called
      console.log('⚙️ BDD: Authenticating with invalid username format');
      const result = await service.authenticate(credentials);
      
      // Then: Should return validation error
      console.log('✅ BDD: Username validation fails');
      expect(result.success).toBe(false);
      expect(result.message).toBe('Username must start with @ symbol');
    });

    it('Given username with insufficient dots, When authenticate is called, Then it should return validation error', async () => {
      // Given: Username with insufficient dots
      console.log('🔧 BDD: Setting up username with insufficient dots');
      const credentials: Credentials = {
        username: '@invalid',
        password: 'testpassword123'
      };
      
      // When: authenticate is called
      console.log('⚙️ BDD: Authenticating with username having insufficient dots');
      const result = await service.authenticate(credentials);
      
      // Then: Should return validation error
      console.log('✅ BDD: Username dot validation fails');
      expect(result.success).toBe(false);
      expect(result.message).toBe('Username must contain at least two dots');
    });
  });

  describe('Scenario: Authentication validation - password', () => {
    it('Given empty password, When authenticate is called, Then it should return validation error', async () => {
      // Given: Empty password
      console.log('🔧 BDD: Setting up empty password');
      const credentials: Credentials = {
        username: '@test.bksy.social',
        password: ''
      };
      
      // When: authenticate is called
      console.log('⚙️ BDD: Authenticating with empty password');
      const result = await service.authenticate(credentials);
      
      // Then: Should return validation error
      console.log('✅ BDD: Password validation fails');
      expect(result.success).toBe(false);
      expect(result.message).toBe('Password is required');
    });

    it('Given whitespace-only password, When authenticate is called, Then it should return validation error', async () => {
      // Given: Whitespace-only password
      console.log('🔧 BDD: Setting up whitespace-only password');
      const credentials: Credentials = {
        username: '@test.bksy.social',
        password: '   '
      };
      
      // When: authenticate is called
      console.log('⚙️ BDD: Authenticating with whitespace-only password');
      const result = await service.authenticate(credentials);
      
      // Then: Should return validation error
      console.log('✅ BDD: Password whitespace validation fails');
      expect(result.success).toBe(false);
      expect(result.message).toBe('Password is required');
    });
  });
});
