import { kv } from '@vercel/kv';
import { 
  BlueskyClient,
  uploadMediaAndEmbed,
  ProcessedPost,
  MediaProcessResult,
  Logger
} from '@straiforos/instagramtobluesky';
import { createVercelLogger } from './vercel-logger';

/**
 * Bluesky Migrator for Serverless Environment
 * Uses @straiforos/instagramtobluesky library with Vercel KV progress tracking
 */
export class BlueskyMigrator {
  private credentials: { username: string; password: string };
  private sessionId: string;
  private config: any;
  private blueskyClient: BlueskyClient;
  private logger: Logger;

  constructor(
    credentials: { username: string; password: string },
    sessionId: string,
    config: any
  ) {
    this.credentials = credentials;
    this.sessionId = sessionId;
    this.config = config;
    
    // Initialize Vercel logger with session context
    this.logger = createVercelLogger('BlueskyMigrator', sessionId);
    
    // Initialize library's BlueskyClient with Vercel logger
    this.blueskyClient = new BlueskyClient(
      credentials.username,
      credentials.password,
      this.logger
    );
  }

  /**
   * Authenticate with Bluesky using library client
   */
  async authenticate(): Promise<void> {
    try {
      this.logger.info?.('[Bluesky] Authenticating with Bluesky...');
      await this.blueskyClient.login();
      this.logger.info?.('[Bluesky] Authentication successful');
    } catch (error: any) {
      this.logger.error('[Bluesky] Authentication error:', error);
      throw new Error(`Failed to authenticate with Bluesky: ${error.message}`);
    }
  }

  /**
   * Migrate processed posts to Bluesky with progress tracking
   */
  async migratePosts(posts: ProcessedPost[]): Promise<{
    success: number;
    failed: number;
    mediaCount: number;
    duration: string;
  }> {
    const startTime = Date.now();
    let successCount = 0;
    let failedCount = 0;
    let totalMedia = 0;

    // Apply date filters if configured
    const filteredPosts = this.filterPostsByDate(posts);
    const totalPosts = filteredPosts.length;

    this.logger.info?.(`[Bluesky] Starting migration of ${totalPosts} posts...`);

    for (let i = 0; i < filteredPosts.length; i++) {
      const post = filteredPosts[i];
      
      try {
        // Update progress in KV
        const percentage = 40 + Math.floor((i / totalPosts) * 50);
        await this.updateProgress({
          status: 'processing',
          phase: 'migration',
          message: `Migrating post ${i + 1} of ${totalPosts}...`,
          percentage,
          currentPost: i + 1,
          totalPosts
        });

        // Check simulation mode
        if (this.config.simulate) {
          this.logger.info?.(`[Bluesky] [SIMULATION] Would migrate post ${i + 1}:`, 
            post.postText?.substring(0, 50));
          successCount++;
          totalMedia += post.embeddedMedia?.length || 0;
        } else {
          // Use library's upload and post creation
          await this.migratePost(post);
          successCount++;
          totalMedia += post.embeddedMedia?.length || 0;
        }

        // Rate limiting: 3 seconds between posts (Bluesky API requirement)
        if (i < filteredPosts.length - 1) {
          await this.delay(3000);
        }
      } catch (error: any) {
        this.logger.error(`[Bluesky] Failed to migrate post ${i + 1}:`, error);
        failedCount++;
        
        // Continue with next post unless stopOnError configured
        if (this.config.stopOnError) {
          throw error;
        }
      }
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    
    this.logger.info?.(`[Bluesky] Migration complete: ${successCount} success, ${failedCount} failed`);
    
    return {
      success: successCount,
      failed: failedCount,
      mediaCount: totalMedia,
      duration: `${duration}s`
    };
  }

  /**
   * Migrate a single post using library utilities
   */
  private async migratePost(post: ProcessedPost): Promise<void> {
    try {
      const { postDate, postText, embeddedMedia } = post;

      if (!postDate) {
        throw new Error('Post missing creation date');
      }

      if (!embeddedMedia || embeddedMedia.length === 0) {
        this.logger.warn?.('[Bluesky] Post has no media, skipping');
        return;
      }

      // Use library's uploadMediaAndEmbed function
      const { uploadedMedia, importedMediaCount } = await uploadMediaAndEmbed(
        postText,
        embeddedMedia,
        this.blueskyClient,
        this.logger
      );

      if (!uploadedMedia) {
        throw new Error('Failed to upload media');
      }

      // Use library's createPost method
      const postUrl = await this.blueskyClient.createPost(
        postDate,
        postText,
        uploadedMedia
      );

      if (postUrl) {
        this.logger.info?.(`[Bluesky] Post created: ${postUrl}`);
      } else {
        throw new Error('Failed to create post - no URL returned');
      }
    } catch (error: any) {
      this.logger.error('[Bluesky] Error migrating post:', error);
      throw error;
    }
  }

  /**
   * Filter posts by configured date range
   */
  private filterPostsByDate(posts: ProcessedPost[]): ProcessedPost[] {
    if (!this.config.startDate && !this.config.endDate) {
      return posts;
    }

    const startDate = this.config.startDate ? new Date(this.config.startDate) : null;
    const endDate = this.config.endDate ? new Date(this.config.endDate) : null;

    return posts.filter(post => {
      const postDate = post.postDate;
      
      if (!postDate) return false;
      
      if (startDate && postDate < startDate) {
        return false;
      }
      
      if (endDate && postDate > endDate) {
        return false;
      }
      
      return true;
    });
  }

  /**
   * Update migration progress in Vercel KV
   */
  private async updateProgress(update: any): Promise<void> {
    try {
      const current = await kv.get(`progress:${this.sessionId}`) || {};
      await kv.set(`progress:${this.sessionId}`, {
        ...current,
        ...update,
        updatedAt: new Date().toISOString()
      }, {
        ex: 7200 // Expire in 2 hours
      });
    } catch (error) {
      this.logger.error('[Progress] Error updating progress:', error);
      // Don't throw - progress updates shouldn't stop migration
    }
  }

  /**
   * Delay helper for rate limiting
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
