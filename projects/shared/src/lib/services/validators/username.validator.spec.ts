/**
 * BDD-Style Unit Tests for Username Validator
 * 
 * This demonstrates BDD methodology using Angular's native testing framework
 * following the project's validation approach with snackbar error handling.
 */
import { validateBlueskyUsername, validateBlueskyUsernameWithAt, UsernameValidationResult } from './username.validator';

describe('Feature: Bluesky Username Validation (BDD-Style)', () => {

  describe('Scenario: Valid username validation without @ symbol', () => {
    it('Given a valid username with two dots, When validating, Then validation passes', () => {
      // Given: Valid username format
      console.log('🔧 BDD: Setting up valid username with two dots');
      const validUsername = 'username.bksy.social';
      
      // When: Validating the username
      console.log('⚙️ BDD: Validating username without @ symbol');
      const result: UsernameValidationResult = validateBlueskyUsername(validUsername);
      
      // Then: Validation should pass
      console.log('✅ BDD: Verifying validation passes for valid username');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('Given a valid username with multiple dots, When validating, Then validation passes', () => {
      // Given: Valid username with more than two dots
      console.log('🔧 BDD: Setting up valid username with multiple dots');
      const validUsername = 'my.username.bksy.social';
      
      // When: Validating the username
      console.log('⚙️ BDD: Validating username with multiple dots');
      const result: UsernameValidationResult = validateBlueskyUsername(validUsername);
      
      // Then: Validation should pass
      console.log('✅ BDD: Verifying validation passes for username with multiple dots');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  describe('Scenario: Invalid username validation without @ symbol', () => {
    it('Given an empty username, When validating, Then validation fails with required error', () => {
      // Given: Empty username
      console.log('🔧 BDD: Setting up empty username');
      const emptyUsername = '';
      
      // When: Validating empty username
      console.log('⚙️ BDD: Validating empty username');
      const result: UsernameValidationResult = validateBlueskyUsername(emptyUsername);
      
      // Then: Validation should fail with required error
      console.log('✅ BDD: Verifying validation fails for empty username');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Username is required');
    });

    it('Given a username with @ symbol, When validating, Then validation fails with @ symbol error', () => {
      // Given: Username containing @ symbol
      console.log('🔧 BDD: Setting up username with @ symbol');
      const usernameWithAt = '@username.bksy.social';
      
      // When: Validating username with @ symbol
      console.log('⚙️ BDD: Validating username containing @ symbol');
      const result: UsernameValidationResult = validateBlueskyUsername(usernameWithAt);
      
      // Then: Validation should fail with @ symbol error
      console.log('✅ BDD: Verifying validation fails for username with @ symbol');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Do not include the @ symbol - it is automatically added');
    });

    it('Given a username with one dot, When validating, Then validation fails with dots error', () => {
      // Given: Username with insufficient dots
      console.log('🔧 BDD: Setting up username with only one dot');
      const usernameOneDot = 'username.social';
      
      // When: Validating username with one dot
      console.log('⚙️ BDD: Validating username with insufficient dots');
      const result: UsernameValidationResult = validateBlueskyUsername(usernameOneDot);
      
      // Then: Validation should fail with dots error
      console.log('✅ BDD: Verifying validation fails for username with insufficient dots');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Username must contain at least two dots (e.g., username.bksy.social)');
    });

    it('Given a username with no dots, When validating, Then validation fails with dots error', () => {
      // Given: Username with no dots
      console.log('🔧 BDD: Setting up username with no dots');
      const usernameNoDots = 'username';
      
      // When: Validating username with no dots
      console.log('⚙️ BDD: Validating username without dots');
      const result: UsernameValidationResult = validateBlueskyUsername(usernameNoDots);
      
      // Then: Validation should fail with dots error
      console.log('✅ BDD: Verifying validation fails for username without dots');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Username must contain at least two dots (e.g., username.bksy.social)');
    });
  });

  describe('Scenario: Valid username validation with @ symbol', () => {
    it('Given a valid username with @ and two dots, When validating, Then validation passes', () => {
      // Given: Valid username format with @ symbol
      console.log('🔧 BDD: Setting up valid username with @ symbol and two dots');
      const validUsernameWithAt = '@username.bksy.social';
      
      // When: Validating the username with @
      console.log('⚙️ BDD: Validating username with @ symbol');
      const result: UsernameValidationResult = validateBlueskyUsernameWithAt(validUsernameWithAt);
      
      // Then: Validation should pass
      console.log('✅ BDD: Verifying validation passes for valid username with @ symbol');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('Given a valid username with @ and multiple dots, When validating, Then validation passes', () => {
      // Given: Valid username with @ symbol and multiple dots
      console.log('🔧 BDD: Setting up valid username with @ symbol and multiple dots');
      const validUsernameWithAt = '@my.username.bksy.social';
      
      // When: Validating the username with multiple dots
      console.log('⚙️ BDD: Validating username with @ symbol and multiple dots');
      const result: UsernameValidationResult = validateBlueskyUsernameWithAt(validUsernameWithAt);
      
      // Then: Validation should pass
      console.log('✅ BDD: Verifying validation passes for username with @ symbol and multiple dots');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  describe('Scenario: Invalid username validation with @ symbol', () => {
    it('Given an empty username with @, When validating, Then validation fails with required error', () => {
      // Given: Empty username string
      console.log('🔧 BDD: Setting up empty username for @ validation');
      const emptyUsername = '';
      
      // When: Validating empty username with @ function
      console.log('⚙️ BDD: Validating empty username with @ function');
      const result: UsernameValidationResult = validateBlueskyUsernameWithAt(emptyUsername);
      
      // Then: Validation should fail with required error
      console.log('✅ BDD: Verifying validation fails for empty username with @ function');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Username is required');
    });

    it('Given a username without @, When validating with @ function, Then validation fails with @ required error', () => {
      // Given: Username without @ symbol
      console.log('🔧 BDD: Setting up username without @ symbol for @ validation');
      const usernameWithoutAt = 'username.bksy.social';
      
      // When: Validating username without @ using @ function
      console.log('⚙️ BDD: Validating username without @ symbol using @ function');
      const result: UsernameValidationResult = validateBlueskyUsernameWithAt(usernameWithoutAt);
      
      // Then: Validation should fail with @ required error
      console.log('✅ BDD: Verifying validation fails for username without @ symbol');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Username must start with @ symbol');
    });

    it('Given a username with @ but one dot, When validating with @ function, Then validation fails with dots error', () => {
      // Given: Username with @ but insufficient dots
      console.log('🔧 BDD: Setting up username with @ but one dot');
      const usernameAtOneDot = '@username.social';
      
      // When: Validating username with @ but insufficient dots
      console.log('⚙️ BDD: Validating username with @ but insufficient dots');
      const result: UsernameValidationResult = validateBlueskyUsernameWithAt(usernameAtOneDot);
      
      // Then: Validation should fail with dots error
      console.log('✅ BDD: Verifying validation fails for username with @ but insufficient dots');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Username must contain at least two dots');
    });

    it('Given a username with @ but no dots, When validating with @ function, Then validation fails with dots error', () => {
      // Given: Username with @ but no dots
      console.log('🔧 BDD: Setting up username with @ but no dots');
      const usernameAtNoDots = '@username';
      
      // When: Validating username with @ but no dots
      console.log('⚙️ BDD: Validating username with @ but no dots');
      const result: UsernameValidationResult = validateBlueskyUsernameWithAt(usernameAtNoDots);
      
      // Then: Validation should fail with dots error
      console.log('✅ BDD: Verifying validation fails for username with @ but no dots');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Username must contain at least two dots');
    });
  });

  describe('Scenario: Edge case username validation', () => {
    it('Given a null username, When validating, Then validation fails gracefully', () => {
      // Given: Null username (simulating potential runtime scenario)
      console.log('🔧 BDD: Setting up null username for edge case testing');
      const nullUsername = null as any;
      
      // When: Validating null username
      console.log('⚙️ BDD: Validating null username');
      const result: UsernameValidationResult = validateBlueskyUsername(nullUsername);
      
      // Then: Validation should fail gracefully
      console.log('✅ BDD: Verifying validation fails gracefully for null username');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Username is required');
    });

    it('Given an undefined username, When validating, Then validation fails gracefully', () => {
      // Given: Undefined username (simulating potential runtime scenario)
      console.log('🔧 BDD: Setting up undefined username for edge case testing');
      const undefinedUsername = undefined as any;
      
      // When: Validating undefined username
      console.log('⚙️ BDD: Validating undefined username');
      const result: UsernameValidationResult = validateBlueskyUsername(undefinedUsername);
      
      // Then: Validation should fail gracefully
      console.log('✅ BDD: Verifying validation fails gracefully for undefined username');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Username is required');
    });
  });
});