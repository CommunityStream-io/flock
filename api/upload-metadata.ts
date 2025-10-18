import type { VercelRequest, VercelResponse } from '@vercel/node';
import { kv } from '@vercel/kv';

/**
 * Upload Metadata Handler - Stores metadata for client-side uploaded files
 * This endpoint only stores metadata, not the actual file data
 * The file is uploaded directly to Vercel Blob via client-side multipart upload
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
    console.log('[UploadMetadata] Metadata storage request received', {
      timestamp: new Date().toISOString()
    });

    const { sessionId, filename, size, mimetype, blobUrl, uploadedAt, status, isPublicBlob, securityNote } = req.body;

    // Validate required fields
    if (!sessionId || !filename || !blobUrl) {
      console.error('[UploadMetadata] Missing required fields');
      return res.status(400).json({ 
        error: 'Missing required fields: sessionId, filename, blobUrl' 
      });
    }

    console.log('[UploadMetadata] Storing metadata:', {
      sessionId,
      filename,
      size,
      blobUrl,
      isPublicBlob,
      securityNote
    });

    // Store metadata in KV (not the file data)
    await kv.set(`upload:${sessionId}`, {
      sessionId,
      filename,
      size,
      mimetype,
      blobUrl,
      uploadedAt,
      status,
      // Security information
      isPublicBlob: isPublicBlob || false,
      securityNote: securityNote || 'Standard upload',
      // Additional security: store access timestamp for monitoring
      lastAccessed: new Date().toISOString()
    }, {
      ex: 3600 // Expire in 1 hour
    });

    console.log('[UploadMetadata] Metadata stored in KV');

    return res.status(200).json({
      success: true,
      message: 'Metadata stored successfully'
    });
  } catch (error: any) {
    console.error('[UploadMetadata] Error storing metadata:', error);
    return res.status(500).json({
      error: 'Failed to store metadata',
      message: error.message
    });
  }
}
