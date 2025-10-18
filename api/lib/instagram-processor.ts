import AdmZip from 'adm-zip';
import { 
  InstagramMediaProcessor,
  InstagramExportedPost,
  ProcessedPost,
  decodeUTF8,
  sortPostsByCreationTime,
  readJsonFile,
  Logger
} from '@straiforos/instagramtobluesky';
import path from 'path';
import os from 'os';
import fs from 'fs/promises';
import { createVercelLogger } from './vercel-logger';

/**
 * Instagram Archive Processor for Serverless Environment
 * Uses @straiforos/instagramtobluesky library with serverless adaptations
 */
export class InstagramArchiveProcessor {
  private sessionId: string;
  private archiveBuffer: Buffer;
  private logger: Logger;

  constructor(sessionId: string, archiveBuffer: Buffer) {
    this.sessionId = sessionId;
    this.archiveBuffer = archiveBuffer;
    this.logger = createVercelLogger('InstagramProcessor', sessionId);
  }

  /**
   * Extract and process Instagram archive using library
   * Adapts file-based library API to buffer-based serverless API
   */
  async extractAndProcessArchive(): Promise<ProcessedPost[]> {
    // Create temporary directory for extraction
    const tmpDir = path.join(os.tmpdir(), `instagram-${this.sessionId}`);
    await fs.mkdir(tmpDir, { recursive: true });

    try {
      this.logger.debug?.('[Instagram] Extracting archive to temp directory:', tmpDir);
      
      // Extract ZIP archive
      const zip = new AdmZip(this.archiveBuffer);
      zip.extractAllTo(tmpDir, true);

      // Find posts JSON file (different Instagram export formats)
      const postsJsonPath = await this.findPostsJson(tmpDir);
      const reelsJsonPath = await this.findReelsJson(tmpDir);

      this.logger.debug?.('[Instagram] Reading posts from:', postsJsonPath);

      // Read and parse posts using library utilities
      const postsData = readJsonFile(
        postsJsonPath, 
        'No posts found in archive. Check export format.'
      );
      
      // Read reels if available
      let reelsData: any[] = [];
      if (reelsJsonPath) {
        try {
          const reelsJson: any = readJsonFile(reelsJsonPath, 'No reels found');
          reelsData = reelsJson['ig_reels_media'] || [];
        } catch (error) {
          this.logger.warn?.('[Instagram] No reels found or error reading reels');
        }
      }

      // Decode and combine posts
      const allPosts: InstagramExportedPost[] = decodeUTF8([
        ...postsData,
        ...reelsData
      ]);

      this.logger.info?.(`[Instagram] Found ${allPosts.length} total posts`);

      // Sort by creation time
      const sortedPosts = allPosts.sort(sortPostsByCreationTime);

      // Use library's InstagramMediaProcessor with console logger
      const processor = new InstagramMediaProcessor(
        sortedPosts,
        tmpDir,
        undefined, // Use default MediaProcessorFactory
        this.logger
      );

      // Process posts using library logic
      const processedPosts = await processor.process();

      this.logger.info?.(`[Instagram] Processed ${processedPosts.length} posts successfully`);

      return processedPosts;
    } catch (error: any) {
      this.logger.error('[Instagram] Archive processing error:', error);
      throw new Error(`Failed to process archive: ${error.message}`);
    } finally {
      // Cleanup temp directory
      try {
        await fs.rm(tmpDir, { recursive: true, force: true });
        this.logger.debug?.('[Instagram] Cleaned up temp directory');
      } catch (cleanupError) {
        this.logger.warn?.('[Instagram] Failed to cleanup temp directory:', cleanupError);
      }
    }
  }

  /**
   * Find posts JSON in various Instagram export formats
   */
  private async findPostsJson(baseDir: string): Promise<string> {
    const possiblePaths = [
      path.join(baseDir, 'your_instagram_activity/content/posts_1.json'),
      path.join(baseDir, 'your_instagram_activity/media/posts_1.json'),
      path.join(baseDir, 'content/posts_1.json'),
      path.join(baseDir, 'posts_1.json'),
      path.join(baseDir, 'posts.json'),
    ];

    for (const filePath of possiblePaths) {
      try {
        await fs.access(filePath);
        return filePath;
      } catch {
        continue;
      }
    }

    throw new Error('Posts data not found in archive. Unsupported export format.');
  }

  /**
   * Find reels JSON in archive (optional)
   */
  private async findReelsJson(baseDir: string): Promise<string | null> {
    const possiblePaths = [
      path.join(baseDir, 'your_instagram_activity/content/reels.json'),
      path.join(baseDir, 'your_instagram_activity/media/reels.json'),
      path.join(baseDir, 'content/reels.json'),
      path.join(baseDir, 'reels.json'),
    ];

    for (const filePath of possiblePaths) {
      try {
        await fs.access(filePath);
        return filePath;
      } catch {
        continue;
      }
    }

    return null;
  }
}
