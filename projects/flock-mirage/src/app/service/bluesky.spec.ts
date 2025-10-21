import { TestBed } from '@angular/core/testing';
import { PostRecordImpl } from '@straiforos/instagramtobluesky';

import { Bluesky } from './bluesky';
import { environment } from '../../environments/environment';

describe('Feature: Bluesky Integration (BDD-Style)', () => {
  let service: Bluesky;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Bluesky);
  });

  describe('Scenario: Service Initialization', () => {
    it('Given a bluesky service, When service is created, Then service is available', () => {
      // Given: Service is created
      console.log('🔧 BDD: Service is created');

      // When: Service is injected
      console.log('⚙️ BDD: Service is injected');

      // Then: Service is available
      console.log('✅ BDD: Service is available');
      expect(service).toBeTruthy();
    });
  });

  describe('Scenario: Authentication Success', () => {
    it('Given valid credentials, When authenticating, Then authentication succeeds', async () => {
      // Given: Valid credentials and successful auth configuration
      console.log('🔧 BDD: Setting up valid credentials');
      const credentials = {
        username: '@test.example.com',
        password: 'validpassword'
      };

      // When: Authentication is performed
      console.log('⚙️ BDD: Authenticating with valid credentials');
      const result = await service.authenticate(credentials);

      // Then: Authentication succeeds
      console.log('✅ BDD: Verifying authentication success');
      expect(result.success).toBe(true);
      expect(result.message).toBe('Authentication successful');
    });
  });

  describe('Scenario: Authentication Failure - Invalid Username Format', () => {
    it('Given credentials without @ prefix, When authenticating, Then authentication fails', async () => {
      // Given: Invalid credentials without @ prefix
      console.log('🔧 BDD: Setting up invalid credentials without @ prefix');
      const credentials = {
        username: 'test.example.com',
        password: 'validpassword'
      };

      // When: Authentication is performed
      console.log('⚙️ BDD: Authenticating with invalid username format');
      const result = await service.authenticate(credentials);

      // Then: Authentication fails with specific error
      console.log('✅ BDD: Verifying authentication failure');
      expect(result.success).toBe(false);
      expect(result.message).toBe('@ prefix is required');
    });
  });

  describe('Scenario: Authentication Failure - Insufficient Dots', () => {
    it('Given credentials with insufficient dots, When authenticating, Then authentication fails', async () => {
      // Given: Invalid credentials with insufficient dots
      console.log('🔧 BDD: Setting up invalid credentials with insufficient dots');
      const credentials = {
        username: '@test.com',
        password: 'validpassword'
      };

      // When: Authentication is performed
      console.log('⚙️ BDD: Authenticating with insufficient dots');
      const result = await service.authenticate(credentials);

      // Then: Authentication fails with specific error
      console.log('✅ BDD: Verifying authentication failure');
      expect(result.success).toBe(false);
      expect(result.message).toBe('Username must contain at least two dots');
    });
  });

  describe('Scenario: Authentication Failure - Empty Password', () => {
    it('Given credentials with empty password, When authenticating, Then authentication fails', async () => {
      // Given: Invalid credentials with empty password
      console.log('🔧 BDD: Setting up invalid credentials with empty password');
      const credentials = {
        username: '@test.example.com',
        password: ''
      };

      // When: Authentication is performed
      console.log('⚙️ BDD: Authenticating with empty password');
      const result = await service.authenticate(credentials);

      // Then: Authentication fails with specific error
      console.log('✅ BDD: Verifying authentication failure');
      expect(result.success).toBe(false);
      expect(result.message).toBe('Password is required');
    });
  });

  describe('Scenario: Authentication Failure - Whitespace Password', () => {
    it('Given credentials with whitespace-only password, When authenticating, Then authentication fails', async () => {
      // Given: Invalid credentials with whitespace-only password
      console.log('🔧 BDD: Setting up invalid credentials with whitespace-only password');
      const credentials = {
        username: '@test.example.com',
        password: '   '
      };

      // When: Authentication is performed
      console.log('⚙️ BDD: Authenticating with whitespace-only password');
      const result = await service.authenticate(credentials);

      // Then: Authentication fails with specific error
      console.log('✅ BDD: Verifying authentication failure');
      expect(result.success).toBe(false);
      expect(result.message).toBe('Password is required');
    });
  });

  describe('Scenario: Post Creation', () => {
    it('Given a post record, When creating a post, Then post is created successfully', async () => {
      // Given: Valid post record
      console.log('🔧 BDD: Setting up valid post record');
      const post: PostRecordImpl = {
        text: 'Test post content',
        createdAt: new Date().toISOString()
      } as PostRecordImpl;

      // When: Post creation is performed
      console.log('⚙️ BDD: Creating post');
      const result = await service.createPost(post);

      // Then: Post is created successfully
      console.log('✅ BDD: Verifying post creation');
      expect(result).toBe(post);
    });
  });

  describe('Scenario: Network Delay Fallback', () => {
    it('Given environment.archiveExtractDelay is undefined, When performing operations, Then fallback delay is used', async () => {
      // Given: Environment delay is undefined (fallback scenario)
      console.log('🔧 BDD: Setting up environment with undefined delay');
      const originalDelay = (environment as any).archiveExtractDelay;
      (environment as any).archiveExtractDelay = undefined;

      const credentials = {
        username: '@test.example.com',
        password: 'validpassword'
      };

      // When: Authentication is performed (which uses the fallback delay)
      console.log('⚙️ BDD: Authenticating with fallback delay');
      const startTime = Date.now();
      const result = await service.authenticate(credentials);
      const endTime = Date.now();

      // Then: Authentication succeeds and fallback delay is used
      console.log('✅ BDD: Verifying authentication success with fallback delay');
      expect(result.success).toBe(true);
      expect(result.message).toBe('Authentication successful');
      expect(endTime - startTime).toBeGreaterThanOrEqual(1000); // Should use 1000ms fallback

      // Restore original delay
      (environment as any).archiveExtractDelay = originalDelay;
    });
  });

  describe('Scenario: Connection Test Success', () => {
    it('Given successful connection configuration, When testing connection, Then connection succeeds', async () => {
      // Given: Service with mocked successful connection
      console.log('🔧 BDD: Setting up service with mocked successful connection');
      spyOn(service as any, 'shouldConnectionFail').and.returnValue(false);
      spyOn(service as any, 'simulateNetworkDelay').and.returnValue(Promise.resolve());

      // When: Connection test is performed
      console.log('⚙️ BDD: Testing connection');
      const result = await service.testConnection();

      // Then: Connection succeeds
      console.log('✅ BDD: Verifying connection success');
      expect(result.status).toBe('connected');
      expect(result.message).toBe('Successfully connected to Bluesky');
    });
  });

  describe('Scenario: Connection Test Failure', () => {
    it('Given failed connection configuration, When testing connection, Then connection fails', async () => {
      // Given: Service with mocked failed connection
      console.log('🔧 BDD: Setting up service with mocked failed connection');
      spyOn(service as any, 'shouldConnectionFail').and.returnValue(true);
      spyOn(service as any, 'simulateNetworkDelay').and.returnValue(Promise.resolve());

      // When: Connection test is performed
      console.log('⚙️ BDD: Testing connection');
      const result = await service.testConnection();

      // Then: Connection fails
      console.log('✅ BDD: Verifying connection failure');
      expect(result.status).toBe('error');
      expect(result.message).toBe('Failed to connect to Bluesky');
    });
  });

  describe('Scenario: Authentication with URLSearchParams - Success', () => {
    it('Given valid credentials and no authFailed query param, When authenticating, Then authentication succeeds', async () => {
      // Given: Valid credentials and mocked successful authentication
      console.log('🔧 BDD: Setting up valid credentials with mocked successful authentication');
      const credentials = {
        username: '@test.example.com',
        password: 'validpassword'
      };
      spyOn(service as any, 'shouldAuthenticationFail').and.returnValue(false);
      spyOn(service as any, 'simulateNetworkDelay').and.returnValue(Promise.resolve());

      // When: Authentication is performed
      console.log('⚙️ BDD: Authenticating with valid credentials');
      const result = await service.authenticate(credentials);

      // Then: Authentication succeeds
      console.log('✅ BDD: Verifying authentication success');
      expect(result.success).toBe(true);
      expect(result.message).toBe('Authentication successful');
    });
  });

  describe('Scenario: Authentication with URLSearchParams - Failure', () => {
    it('Given valid credentials but authFailed=true query param, When authenticating, Then authentication fails', async () => {
      // Given: Valid credentials but mocked failed authentication
      console.log('🔧 BDD: Setting up valid credentials with mocked failed authentication');
      const credentials = {
        username: '@test.example.com',
        password: 'validpassword'
      };
      spyOn(service as any, 'shouldAuthenticationFail').and.returnValue(true);
      spyOn(service as any, 'simulateNetworkDelay').and.returnValue(Promise.resolve());

      // When: Authentication is performed
      console.log('⚙️ BDD: Authenticating with valid credentials but mocked failure');
      const result = await service.authenticate(credentials);

      // Then: Authentication fails
      console.log('✅ BDD: Verifying authentication failure');
      expect(result.success).toBe(false);
      expect(result.message).toBe('Invalid Bluesky credentials');
    });
  });

  describe('Scenario: Network Delay Helper Method', () => {
    it('Given environment.archiveExtractDelay is undefined, When getting network delay, Then fallback delay is returned', () => {
      // Given: Environment delay is undefined (fallback scenario)
      console.log('🔧 BDD: Setting up environment with undefined delay');
      const originalDelay = (environment as any).archiveExtractDelay;
      (environment as any).archiveExtractDelay = undefined;

      // When: Network delay is retrieved
      console.log('⚙️ BDD: Getting network delay');
      const delay = service.getNetworkDelay();

      // Then: Fallback delay is returned
      console.log('✅ BDD: Verifying fallback delay is returned');
      expect(delay).toBe(1000); // Should use 1000ms fallback

      // Restore original delay
      (environment as any).archiveExtractDelay = originalDelay;
    });
  });

  describe('Scenario: URL Search Parameters Helper', () => {
    it('Given URL search parameters, When getting search params, Then correct parameters are returned', () => {
      // Given: URL search parameters helper method
      console.log('🔧 BDD: Testing URL search parameters helper method');

      // When: URL search parameters are retrieved
      console.log('⚙️ BDD: Getting URL search parameters');
      const searchParams = service.getUrlSearchParams();

      // Then: Search parameters are returned
      console.log('✅ BDD: Verifying URL search parameters');
      expect(searchParams).toBeInstanceOf(URLSearchParams);
      expect(typeof searchParams.get).toBe('function');
    });
  });
});
