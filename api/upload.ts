import type { VercelRequest, VercelResponse } from '@vercel/node';
import { kv } from '@vercel/kv';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

/**
 * Upload Handler - Handles Instagram archive upload
 * Accepts multipart/form-data file upload and stores it temporarily
 * Returns a session ID for tracking the upload
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
    // Generate session ID
    const sessionId = `upload_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    // Parse form data
    const form = formidable({
      maxFileSize: 500 * 1024 * 1024, // 500MB max
      keepExtensions: true,
    });

    const [fields, files] = await form.parse(req);
    
    if (!files.archive || !files.archive[0]) {
      return res.status(400).json({ 
        error: 'No archive file provided' 
      });
    }

    const uploadedFile = files.archive[0];
    
    // Read the file
    const fileBuffer = await readFile(uploadedFile.filepath);
    
    // Store file metadata in KV
    await kv.set(`upload:${sessionId}`, {
      sessionId,
      filename: uploadedFile.originalFilename || 'archive.zip',
      size: uploadedFile.size,
      mimetype: uploadedFile.mimetype,
      uploadedAt: new Date().toISOString(),
      status: 'uploaded'
    }, {
      ex: 3600 // Expire in 1 hour
    });

    // Store file data (base64 encoded for KV storage)
    await kv.set(`upload:data:${sessionId}`, fileBuffer.toString('base64'), {
      ex: 3600 // Expire in 1 hour
    });

    return res.status(200).json({
      success: true,
      sessionId,
      filename: uploadedFile.originalFilename,
      size: uploadedFile.size,
      message: 'File uploaded successfully'
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return res.status(500).json({
      error: 'Upload failed',
      message: error.message
    });
  }
}
