import { TestBed } from '@angular/core/testing';
import { Bluesky } from './bluesky';
import { LOGGER, Logger } from 'shared';
import { PostRecordImpl } from '@straiforos/instagramtobluesky';

describe('Bluesky', () => {
  let service: Bluesky;
  let mockLogger: jasmine.SpyObj<Logger>;
  let consoleLogSpy: jasmine.Spy;
  let consoleErrorSpy: jasmine.Spy;

  beforeEach(() => {
    mockLogger = jasmine.createSpyObj('Logger', ['log', 'error']);
    consoleLogSpy = spyOn(console, 'log');
    consoleErrorSpy = spyOn(console, 'error');

    TestBed.configureTestingModule({
      providers: [
        Bluesky,
        { provide: LOGGER, useValue: mockLogger }
      ]
    });

    service = TestBed.inject(Bluesky);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('authenticate', () => {
    it('should validate credentials with @ prefix and two dots', async () => {
      const result = await service.authenticate({
        username: '@user.bsky.social',
        password: 'test-password'
      });

      expect(result.success).toBe(true);
      expect(result.message).toContain('Credentials validated');
      expect(mockLogger.log).toHaveBeenCalledWith('[BlueskyService] Validating Bluesky credentials format');
    });

    it('should reject credentials without @ prefix', async () => {
      const result = await service.authenticate({
        username: 'user.bsky.social',
        password: 'test-password'
      });

      expect(result.success).toBe(false);
      expect(result.message).toBe('@ prefix is required');
    });

    it('should reject credentials with less than two dots', async () => {
      const result = await service.authenticate({
        username: '@user.bsky',
        password: 'test-password'
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain('Username must contain at least two dots');
    });

    it('should reject empty password', async () => {
      const result = await service.authenticate({
        username: '@user.bsky.social',
        password: ''
      });

      expect(result.success).toBe(false);
      expect(result.message).toBe('Password is required');
    });

    it('should reject whitespace-only password', async () => {
      const result = await service.authenticate({
        username: '@user.bsky.social',
        password: '   '
      });

      expect(result.success).toBe(false);
      expect(result.message).toBe('Password is required');
    });

    it('should handle errors gracefully', async () => {
      // Force an error by making logger throw
      mockLogger.log.and.throwError('Test error');

      const result = await service.authenticate({
        username: '@user.bsky.social',
        password: 'test-password'
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain('Test error');
    });
  });

  describe('createPost', () => {
    it('should create a post', async () => {
      const mockPost: PostRecordImpl = {
        text: 'Test post',
        createdAt: new Date().toISOString()
      } as PostRecordImpl;

      const result = await service.createPost(mockPost);

      expect(result).toEqual(mockPost);
      expect(consoleLogSpy).toHaveBeenCalledWith('🦅 Creating Bluesky post:', mockPost);
    });

    it('should log post creation attempt', async () => {
      const mockPost: PostRecordImpl = {
        text: 'Another test post',
        createdAt: new Date().toISOString()
      } as PostRecordImpl;

      const result = await service.createPost(mockPost);

      expect(result).toEqual(mockPost);
      expect(consoleLogSpy).toHaveBeenCalledWith('🦅 Creating Bluesky post:', mockPost);
    });
  });

  describe('testConnection', () => {
    it('should return successful connection result', async () => {
      const result = await service.testConnection();

      expect(result.status).toBe('connected');
      expect(result.message).toBe('Successfully connected to Bluesky');
      expect(consoleLogSpy).toHaveBeenCalledWith('🦅 Testing Bluesky connection...');
    });
  });
});

