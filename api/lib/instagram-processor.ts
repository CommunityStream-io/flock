import AdmZip from 'adm-zip';
import { kv } from '@vercel/kv';

/**
 * Instagram Archive Processor
 * Processes Instagram archive data in a serverless environment
 * Integrates with @straiforos/instagramtobluesky patterns
 */
export class InstagramArchiveProcessor {
  private sessionId: string;
  private archiveBuffer: Buffer;

  constructor(sessionId: string, archiveBuffer: Buffer) {
    this.sessionId = sessionId;
    this.archiveBuffer = archiveBuffer;
  }

  /**
   * Extract and process Instagram archive
   * Returns array of processed posts ready for migration
   */
  async extractAndProcessArchive(): Promise<any[]> {
    try {
      // Extract ZIP archive
      const zip = new AdmZip(this.archiveBuffer);
      const zipEntries = zip.getEntries();

      // Find posts JSON file
      const postsEntry = zipEntries.find(
        entry => entry.entryName.includes('posts_1.json') || 
                 entry.entryName.includes('content/posts_1.json')
      );

      if (!postsEntry) {
        throw new Error('Posts data not found in archive');
      }

      // Parse posts data
      const postsData = JSON.parse(postsEntry.getData().toString('utf8'));
      
      // Process media files
      const posts = await this.processPosts(postsData, zip);

      return posts;
    } catch (error: any) {
      console.error('Archive processing error:', error);
      throw new Error(`Failed to process archive: ${error.message}`);
    }
  }

  /**
   * Process posts and extract media
   */
  private async processPosts(postsData: any, zip: AdmZip): Promise<any[]> {
    const posts: any[] = [];

    // Handle different Instagram export formats
    const postsArray = Array.isArray(postsData) ? postsData : postsData.posts || [];

    for (const post of postsArray) {
      try {
        const processedPost = await this.processPost(post, zip);
        if (processedPost) {
          posts.push(processedPost);
        }
      } catch (error) {
        console.error('Error processing post:', error);
        // Continue with other posts
      }
    }

    return posts;
  }

  /**
   * Process individual post
   */
  private async processPost(post: any, zip: AdmZip): Promise<any | null> {
    try {
      // Extract post data
      const caption = this.extractCaption(post);
      const createdAt = this.extractTimestamp(post);
      const media = await this.extractMedia(post, zip);

      if (!media || media.length === 0) {
        return null; // Skip posts without media
      }

      return {
        caption,
        createdAt,
        media,
        originalPost: post
      };
    } catch (error) {
      console.error('Error processing individual post:', error);
      return null;
    }
  }

  /**
   * Extract caption from post
   */
  private extractCaption(post: any): string {
    if (post.title) {
      return post.title;
    }
    if (post.caption) {
      return post.caption;
    }
    if (post.media?.[0]?.title) {
      return post.media[0].title;
    }
    return '';
  }

  /**
   * Extract timestamp from post
   */
  private extractTimestamp(post: any): Date {
    if (post.creation_timestamp) {
      return new Date(post.creation_timestamp * 1000);
    }
    if (post.taken_at) {
      return new Date(post.taken_at * 1000);
    }
    if (post.media?.[0]?.creation_timestamp) {
      return new Date(post.media[0].creation_timestamp * 1000);
    }
    return new Date();
  }

  /**
   * Extract media files from post
   */
  private async extractMedia(post: any, zip: AdmZip): Promise<any[]> {
    const mediaFiles: any[] = [];
    const mediaArray = post.media || [];

    for (const mediaItem of mediaArray) {
      try {
        const mediaPath = mediaItem.uri;
        if (!mediaPath) continue;

        // Find media file in ZIP
        const mediaEntry = zip.getEntries().find(
          entry => entry.entryName.includes(mediaPath) || 
                   entry.entryName.endsWith(mediaPath)
        );

        if (mediaEntry) {
          const mediaBuffer = mediaEntry.getData();
          const mediaType = this.getMediaType(mediaPath);

          mediaFiles.push({
            buffer: mediaBuffer,
            type: mediaType,
            path: mediaPath,
            size: mediaBuffer.length
          });
        }
      } catch (error) {
        console.error('Error extracting media:', error);
      }
    }

    return mediaFiles;
  }

  /**
   * Determine media type from file path
   */
  private getMediaType(path: string): 'image' | 'video' {
    const ext = path.toLowerCase().split('.').pop();
    const videoExtensions = ['mp4', 'mov', 'avi', 'webm'];
    return videoExtensions.includes(ext || '') ? 'video' : 'image';
  }
}
