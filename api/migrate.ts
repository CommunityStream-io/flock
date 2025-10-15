import type { VercelRequest, VercelResponse } from '@vercel/node';
import { kv } from '@vercel/kv';
import { InstagramArchiveProcessor } from './lib/instagram-processor';
import { BlueskyMigrator } from './lib/bluesky-migrator';

/**
 * Migration Handler - Processes Instagram archive and migrates to Bluesky
 * This is a long-running function that handles the entire migration process
 * 
 * TODO: Current limits are constrained by Vercel free tier (Hobby plan)
 * - maxDuration: 300s (5 min) - Upgrade to Pro for 900s (15 min)
 * - memory: 2048MB - Upgrade to Pro for up to 3008MB
 * Large archives with many posts may timeout or run out of memory on free tier
 * Consider upgrading to Pro plan or using Flock Native for large archives
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
    const { sessionId, config } = req.body;
    
    // Log migration start
    console.log('[Migrate] Migration request received', {
      sessionId,
      hasConfig: !!config,
      hasCredentials: !!config?.blueskyCredentials,
      timestamp: new Date().toISOString()
    });

    if (!sessionId) {
      console.error('[Migrate] Missing session ID');
      return res.status(400).json({ error: 'Session ID is required' });
    }

    if (!config?.blueskyCredentials) {
      console.error('[Migrate] Missing Bluesky credentials');
      return res.status(400).json({ error: 'Bluesky credentials are required' });
    }

    // Validate upload exists
    console.log('[Migrate] Validating upload for session:', sessionId);
    const uploadMeta = await kv.get(`upload:${sessionId}`);
    if (!uploadMeta) {
      console.error('[Migrate] Upload not found for session:', sessionId);
      return res.status(404).json({ 
        error: 'Upload not found',
        message: 'No upload found for this session. Please upload an archive first.'
      });
    }

    // Get uploaded file data
    console.log('[Migrate] Retrieving file data for session:', sessionId);
    const fileData = await kv.get(`upload:data:${sessionId}`);
    if (!fileData || typeof fileData !== 'string') {
      console.error('[Migrate] Upload data not found or corrupted');
      return res.status(404).json({ 
        error: 'Upload data not found',
        message: 'Upload data is missing or corrupted.'
      });
    }

    // Initialize progress tracking
    console.log('[Migrate] Initializing progress tracking');
    await kv.set(`progress:${sessionId}`, {
      status: 'starting',
      phase: 'initialization',
      message: 'Starting migration...',
      percentage: 0,
      startedAt: new Date().toISOString()
    }, {
      ex: 7200 // Expire in 2 hours
    });

    // Decode file data
    console.log('[Migrate] Decoding archive buffer');
    const archiveBuffer = Buffer.from(fileData, 'base64');

    // Process archive
    const processor = new InstagramArchiveProcessor(sessionId, archiveBuffer);
    
    await updateProgress(sessionId, {
      status: 'processing',
      phase: 'extraction',
      message: 'Extracting Instagram archive...',
      percentage: 10
    });

    const posts = await processor.extractAndProcessArchive();

    await updateProgress(sessionId, {
      status: 'processing',
      phase: 'migration',
      message: `Found ${posts.length} posts. Starting migration...`,
      percentage: 30,
      totalPosts: posts.length
    });

    // Migrate to Bluesky
    const migrator = new BlueskyMigrator(
      config.blueskyCredentials,
      sessionId,
      config
    );

    await migrator.authenticate();

    await updateProgress(sessionId, {
      status: 'processing',
      phase: 'migration',
      message: 'Authenticated with Bluesky. Starting post migration...',
      percentage: 40
    });

    const results = await migrator.migratePosts(posts);

    // Update final progress
    await updateProgress(sessionId, {
      status: 'complete',
      phase: 'complete',
      message: 'Migration completed successfully!',
      percentage: 100,
      results: {
        postsImported: results.success,
        postsFailed: results.failed,
        mediaCount: results.mediaCount,
        duration: results.duration
      }
    });

    // Cleanup uploaded file data to save space
    await kv.del(`upload:data:${sessionId}`);

    return res.status(200).json({
      success: true,
      results: {
        postsImported: results.success,
        postsFailed: results.failed,
        mediaCount: results.mediaCount,
        duration: results.duration,
        sessionId
      }
    });
  } catch (error: any) {
    console.error('Migration error:', error);
    
    // Update progress with error
    if (req.body.sessionId) {
      await updateProgress(req.body.sessionId, {
        status: 'error',
        phase: 'error',
        message: `Migration failed: ${error.message}`,
        percentage: 0,
        error: error.message
      }).catch(console.error);
    }

    return res.status(500).json({
      error: 'Migration failed',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

/**
 * Update progress in KV store
 */
async function updateProgress(sessionId: string, progress: any): Promise<void> {
  const current = await kv.get(`progress:${sessionId}`) || {};
  await kv.set(`progress:${sessionId}`, {
    ...current,
    ...progress,
    updatedAt: new Date().toISOString()
  }, {
    ex: 7200
  });
}
