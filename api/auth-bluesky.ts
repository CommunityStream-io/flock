import type { VercelRequest, VercelResponse } from '@vercel/node';
import { BlueskyClient, consoleLogger } from '@straiforos/instagramtobluesky';

/**
 * Bluesky Authentication Handler
 * 
 * Validates Bluesky credentials before migration starts
 * Uses @straiforos/instagramtobluesky BlueskyClient for authentication
 * 
 * This provides early validation and better user experience by catching
 * authentication errors before the migration process begins.
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { username, password } = req.body;

    console.log('[Auth] Authentication request received', {
      username,
      hasPassword: !!password,
      timestamp: new Date().toISOString()
    });

    // Validate required fields
    if (!username || !password) {
      console.error('[Auth] Missing credentials');
      return res.status(400).json({ 
        error: 'Missing credentials',
        details: 'Both username and password are required'
      });
    }

    // Attempt authentication using library's BlueskyClient
    try {
      const client = new BlueskyClient(username, password, consoleLogger);
      await client.login();

      console.log('[Auth] Authentication successful', {
        username,
        timestamp: new Date().toISOString()
      });

      return res.status(200).json({
        success: true,
        message: 'Authentication successful',
        username
      });
    } catch (authError: any) {
      console.error('[Auth] Authentication failed', {
        username,
        error: authError.message,
        timestamp: new Date().toISOString()
      });

      // Check for common authentication errors
      const errorMessage = authError.message || 'Authentication failed';
      const isInvalidCredentials = 
        errorMessage.includes('Invalid identifier or password') ||
        errorMessage.includes('AuthenticationRequired') ||
        errorMessage.includes('AccountTakedown');

      return res.status(401).json({
        error: 'Authentication failed',
        details: isInvalidCredentials 
          ? 'Invalid username or password'
          : errorMessage,
        username
      });
    }
  } catch (error: any) {
    console.error('[Auth] Unexpected error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message || 'An unexpected error occurred'
    });
  }
}

/**
 * Vercel Function Configuration
 * Set appropriate limits for authentication requests
 */
export const config = {
  maxDuration: 10, // Authentication should be fast (10 seconds max)
  memory: 256, // Minimal memory needed
};

