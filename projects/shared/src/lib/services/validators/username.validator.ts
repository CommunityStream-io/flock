/**
 * Shared username validation utilities for Bluesky authentication
 */

export interface UsernameValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates a Bluesky username format
 * @param username - The username to validate (without @ symbol)
 * @returns Validation result with error message if invalid
 */
export function validateBlueskyUsername(username: string): UsernameValidationResult {
  if (!username) {
    return {
      isValid: false,
      error: 'Username is required'
    };
  }

  // Check if user entered @ symbol (which is discouraged)
  if (username.includes('@')) {
    return {
      isValid: false,
      error: 'Do not include the @ symbol - it is automatically added'
    };
  }

  // Check for at least two dots
  const dotCount = (username.match(/\./g) || []).length;
  if (dotCount < 2) {
    return {
      isValid: false,
      error: 'Username must contain at least two dots (e.g., username.bksy.social)'
    };
  }

  return {
    isValid: true
  };
}

/**
 * Validates a Bluesky username that already includes the @ symbol
 * @param usernameWithAt - The username to validate (with @ symbol)
 * @returns Validation result with error message if invalid
 */
export function validateBlueskyUsernameWithAt(usernameWithAt: string): UsernameValidationResult {
  if (!usernameWithAt) {
    return {
      isValid: false,
      error: 'Username is required'
    };
  }

  // Check if username starts with @ symbol
  if (!usernameWithAt.startsWith('@')) {
    return {
      isValid: false,
      error: 'Username must start with @ symbol'
    };
  }

  // Remove @ symbol for dot counting
  const usernameWithoutAt = usernameWithAt.substring(1);
  const dotCount = (usernameWithoutAt.match(/\./g) || []).length;
  if (dotCount < 2) {
    return {
      isValid: false,
      error: 'Username must contain at least two dots'
    };
  }

  return {
    isValid: true
  };
}
