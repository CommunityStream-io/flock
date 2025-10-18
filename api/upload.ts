import type { VercelRequest, VercelResponse } from '@vercel/node';
import { put } from '@vercel/blob';
import { kv } from '@vercel/kv';
import formidable from 'formidable';
import fs from 'fs';
import { promisify } from 'util';

const readFile = promisify(fs.readFile);

/**
 * Upload Handler - Handles Instagram archive upload
 * Accepts multipart/form-data file upload and stores it in Vercel Blob
 * Returns a session ID for tracking the upload
 * 
 * Uses Vercel Blob for large file storage instead of KV:
 * - Blob: Optimized for large files (supports up to 500MB)
 * - KV: Used only for metadata and session tracking
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
    console.log('[Upload] Upload request received', {
      timestamp: new Date().toISOString()
    });

    // Generate session ID
    const sessionId = `upload_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    console.log('[Upload] Session ID generated:', sessionId);

    // Parse form data
    const form = formidable({
      maxFileSize: 4.5 * 1024 * 1024, // 4.5MB max (Vercel platform limit)
      keepExtensions: true,
    });

    const [fields, files] = await form.parse(req);
    
    if (!files.archive || !files.archive[0]) {
      console.error('[Upload] No archive file provided');
      return res.status(400).json({ 
        error: 'No archive file provided' 
      });
    }

    const uploadedFile = files.archive[0];
    
    console.log('[Upload] File received:', {
      filename: uploadedFile.originalFilename,
      size: uploadedFile.size,
      mimetype: uploadedFile.mimetype
    });

    // Read the file
    const fileBuffer = await readFile(uploadedFile.filepath);
    
    console.log('[Upload] File read into buffer, uploading to Blob storage...');

    // Upload to Vercel Blob
    const blob = await put(`archives/${sessionId}/${uploadedFile.originalFilename || 'archive.zip'}`, fileBuffer, {
      access: 'public',
      addRandomSuffix: false,
    });

    console.log('[Upload] File uploaded to Blob storage:', {
      url: blob.url,
      size: fileBuffer.length
    });
    
    // Store metadata in KV (not the file data)
    await kv.set(`upload:${sessionId}`, {
      sessionId,
      filename: uploadedFile.originalFilename || 'archive.zip',
      size: uploadedFile.size,
      mimetype: uploadedFile.mimetype,
      blobUrl: blob.url,
      uploadedAt: new Date().toISOString(),
      status: 'uploaded'
    }, {
      ex: 3600 // Expire in 1 hour
    });

    console.log('[Upload] Metadata stored in KV');

    return res.status(200).json({
      success: true,
      sessionId,
      filename: uploadedFile.originalFilename,
      size: uploadedFile.size,
      message: 'File uploaded successfully to Blob storage'
    });
  } catch (error: any) {
    console.error('[Upload] Upload error:', error);
    return res.status(500).json({
      error: 'Upload failed',
      message: error.message
    });
  }
}
