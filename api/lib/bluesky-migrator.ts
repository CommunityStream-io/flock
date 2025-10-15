import { kv } from '@vercel/kv';

/**
 * Bluesky Migrator
 * Handles authentication and migration to Bluesky
 * Integrates with @straiforos/instagramtobluesky patterns
 */
export class BlueskyMigrator {
  private credentials: { username: string; password: string };
  private sessionId: string;
  private config: any;
  private agent: any;
  private apiUrl: string;

  constructor(
    credentials: { username: string; password: string },
    sessionId: string,
    config: any
  ) {
    this.credentials = credentials;
    this.sessionId = sessionId;
    this.config = config;
    this.apiUrl = process.env.BLUESKY_API_URL || 'https://bsky.social/xrpc';
  }

  /**
   * Authenticate with Bluesky
   */
  async authenticate(): Promise<void> {
    try {
      const response = await fetch(`${this.apiUrl}/com.atproto.server.createSession`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier: this.credentials.username,
          password: this.credentials.password,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Authentication failed: ${error.message || response.statusText}`);
      }

      const session = await response.json();
      this.agent = {
        did: session.did,
        accessJwt: session.accessJwt,
        refreshJwt: session.refreshJwt,
      };

      console.log('Authenticated with Bluesky:', session.handle);
    } catch (error: any) {
      console.error('Bluesky authentication error:', error);
      throw new Error(`Failed to authenticate with Bluesky: ${error.message}`);
    }
  }

  /**
   * Migrate posts to Bluesky
   */
  async migratePosts(posts: any[]): Promise<{
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

    console.log(`Starting migration of ${totalPosts} posts...`);

    for (let i = 0; i < filteredPosts.length; i++) {
      const post = filteredPosts[i];
      
      try {
        // Update progress
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
          console.log(`[SIMULATION] Would migrate post ${i + 1}:`, post.caption?.substring(0, 50));
          successCount++;
          totalMedia += post.media?.length || 0;
        } else {
          await this.createBlueskyPost(post);
          successCount++;
          totalMedia += post.media?.length || 0;
        }

        // Rate limiting: wait 3 seconds between posts
        if (i < filteredPosts.length - 1) {
          await this.delay(3000);
        }
      } catch (error: any) {
        console.error(`Failed to migrate post ${i + 1}:`, error);
        failedCount++;
        
        // Continue with next post even if one fails
        if (this.config.stopOnError) {
          throw error;
        }
      }
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    
    return {
      success: successCount,
      failed: failedCount,
      mediaCount: totalMedia,
      duration: `${duration}s`
    };
  }

  /**
   * Filter posts by configured date range
   */
  private filterPostsByDate(posts: any[]): any[] {
    if (!this.config.startDate && !this.config.endDate) {
      return posts;
    }

    const startDate = this.config.startDate ? new Date(this.config.startDate) : null;
    const endDate = this.config.endDate ? new Date(this.config.endDate) : null;

    return posts.filter(post => {
      const postDate = post.createdAt;
      
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
   * Create a post on Bluesky
   */
  private async createBlueskyPost(post: any): Promise<void> {
    try {
      // Upload media first
      const mediaBlobs = await this.uploadMedia(post.media || []);

      // Group images in chunks of 4, videos individually
      const mediaPosts = this.groupMedia(post.media || [], mediaBlobs);

      // Create post(s) with media
      for (const mediaGroup of mediaPosts) {
        await this.createPostWithMedia(post.caption, mediaGroup, post.createdAt);
      }
    } catch (error: any) {
      console.error('Error creating Bluesky post:', error);
      throw error;
    }
  }

  /**
   * Upload media to Bluesky
   */
  private async uploadMedia(media: any[]): Promise<any[]> {
    const blobs: any[] = [];

    for (const mediaItem of media) {
      try {
        const response = await fetch(`${this.apiUrl}/com.atproto.repo.uploadBlob`, {
          method: 'POST',
          headers: {
            'Content-Type': mediaItem.type === 'video' ? 'video/mp4' : 'image/jpeg',
            'Authorization': `Bearer ${this.agent.accessJwt}`,
          },
          body: mediaItem.buffer,
        });

        if (!response.ok) {
          throw new Error(`Media upload failed: ${response.statusText}`);
        }

        const result = await response.json();
        blobs.push(result.blob);
      } catch (error) {
        console.error('Error uploading media:', error);
        // Continue with other media
      }
    }

    return blobs;
  }

  /**
   * Group media for posting (images in chunks of 4, videos individually)
   */
  private groupMedia(media: any[], blobs: any[]): any[][] {
    const groups: any[][] = [];
    const images: any[] = [];
    
    for (let i = 0; i < media.length; i++) {
      const mediaItem = media[i];
      const blob = blobs[i];
      
      if (!blob) continue;

      if (mediaItem.type === 'video') {
        // Videos go in their own post
        groups.push([{ ...mediaItem, blob }]);
      } else {
        // Collect images
        images.push({ ...mediaItem, blob });
      }
    }

    // Group images in chunks of 4
    for (let i = 0; i < images.length; i += 4) {
      groups.push(images.slice(i, i + 4));
    }

    return groups;
  }

  /**
   * Create a post with media on Bluesky
   */
  private async createPostWithMedia(
    caption: string,
    mediaGroup: any[],
    createdAt: Date
  ): Promise<void> {
    try {
      const embed = {
        $type: 'app.bsky.embed.images',
        images: mediaGroup.map(media => ({
          image: media.blob,
          alt: caption || 'Migrated from Instagram'
        }))
      };

      const record = {
        $type: 'app.bsky.feed.post',
        text: caption || '',
        createdAt: createdAt.toISOString(),
        embed: mediaGroup.length > 0 ? embed : undefined
      };

      const response = await fetch(`${this.apiUrl}/com.atproto.repo.createRecord`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.agent.accessJwt}`,
        },
        body: JSON.stringify({
          repo: this.agent.did,
          collection: 'app.bsky.feed.post',
          record
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Post creation failed: ${error.message || response.statusText}`);
      }

      console.log('Post created successfully');
    } catch (error: any) {
      console.error('Error creating post with media:', error);
      throw error;
    }
  }

  /**
   * Update migration progress
   */
  private async updateProgress(update: any): Promise<void> {
    try {
      const current = await kv.get(`progress:${this.sessionId}`) || {};
      await kv.set(`progress:${this.sessionId}`, {
        ...current,
        ...update,
        updatedAt: new Date().toISOString()
      }, {
        ex: 7200
      });
    } catch (error) {
      console.error('Error updating progress:', error);
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
