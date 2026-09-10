import type { Result } from './core';
import { notConfigured } from './core';
import type { Post } from './posts';
import type { DramaSummary } from './dramas';

// Gemini features are SERVER-SIDE ONLY: prompts, keys, and generation never
// touch the client. These stubs light up once the backend links them.

export interface MemeRemix {
  imageUrl: string;
  prompt: string;
}

export interface RemixInput {
  postId: string;
  prompt?: string;
}

export interface PostRemixInput {
  sourcePostId: string;
  imageUrl: string;
  caption: string;
}

export async function remixMeme(input: RemixInput): Promise<Result<MemeRemix>> {
  void input;
  return notConfigured<MemeRemix>('Remix a meme');
}

export async function postRemix(input: PostRemixInput): Promise<Result<Post>> {
  void input;
  return notConfigured<Post>('Post remix');
}

export async function getRecommendations(limit: number): Promise<Result<DramaSummary[]>> {
  void limit;
  return notConfigured<DramaSummary[]>('Recommendations');
}
