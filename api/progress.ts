import type { VercelRequest, VercelResponse } from '@vercel/node';
import { kv } from '@vercel/kv';

/**
 * Progress Handler - Tracks migration progress
 * Returns current progress for a given session ID
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

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { sessionId } = req.query;

    if (!sessionId || typeof sessionId !== 'string') {
      return res.status(400).json({ 
        error: 'Session ID is required' 
      });
    }

    // Get progress from KV
    const progress = await kv.get(`progress:${sessionId}`);

    if (!progress) {
      return res.status(404).json({ 
        error: 'Progress not found',
        message: 'No progress found for this session'
      });
    }

    return res.status(200).json({
      success: true,
      progress
    });
  } catch (error: any) {
    console.error('Progress retrieval error:', error);
    return res.status(500).json({
      error: 'Failed to retrieve progress',
      message: error.message
    });
  }
}
