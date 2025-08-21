
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
export interface PostResult {
  postId: string;
  success: boolean;
  message: string;
}

export interface ConnectionResult {
  status: string;
  message: string;
}

export interface BlueSkyService {
  authenticate(credentials: Credentials): Promise<AuthResult>;
  createPost(post: PostData): Promise<PostResult>;
  testConnection(): Promise<ConnectionResult>;
}
