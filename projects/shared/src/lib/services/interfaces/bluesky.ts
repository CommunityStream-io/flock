
import { PostRecordImpl } from '@straiforos/instagramtobluesky';

export interface Credentials {
  username: string;
  password: string;
}
export interface AuthResult {
  success: boolean;
  message: string;
}
export interface PostData {
  content: string;
  tags?: string[];
}

export interface ConnectionResult {
  status: string;
  message: string;
}

export interface BlueSkyService {
  authenticate(credentials: Credentials): Promise<AuthResult>;
  createPost(post: PostRecordImpl): Promise<PostRecordImpl>;
  testConnection(): Promise<ConnectionResult>;
}
