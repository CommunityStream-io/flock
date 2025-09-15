// Local type definitions for @straiforos/instagramtobluesky
// These types are used for build-time compilation only
// The actual package is installed at runtime in the Docker container

export interface PostRecordImpl {
  text: string;
  createdAt: string;
  [key: string]: any;
}

export interface MediaProcessResult {
  success: boolean;
  mediaUrl?: string;
  error?: string;
  [key: string]: any;
}
