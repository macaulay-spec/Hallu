import type { Page, PageParams, Result } from './core';
import { notConfigured } from './core';
import type { Post } from './posts';

export interface HashtagInfo {
  tag: string;
  postCount: number;
  followerCount: number;
  description: string;
}

export async function getHashtag(tag: string): Promise<Result<HashtagInfo>> {
  void tag;
  return notConfigured<HashtagInfo>('Hashtag');
}

export async function listHashtagPosts(
  tag: string,
  params: PageParams,
): Promise<Result<Page<Post>>> {
  void tag;
  void params;
  return notConfigured<Page<Post>>('Hashtag feed');
}

export async function listRelatedHashtags(tag: string): Promise<Result<string[]>> {
  void tag;
  return notConfigured<string[]>('Related topics');
}
