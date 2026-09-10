import type { Result } from './core';
import { notConfigured } from './core';

export async function repost(postId: string): Promise<Result<null>> {
  void postId;
  return notConfigured<null>('Repost');
}

export async function unrepost(postId: string): Promise<Result<null>> {
  void postId;
  return notConfigured<null>('Undo repost');
}
