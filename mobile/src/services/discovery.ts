import type { Page, PageParams, Result } from './core';
import { notConfigured } from './core';
import type { Post } from './posts';

export interface TrendingHashtag {
  tag: string;
  postCount: number;
  participantCount: number;
  score: number;
}

export async function listForYou(params: PageParams): Promise<Result<Page<Post>>> {
  void params;
  return notConfigured<Page<Post>>('For You feed');
}

export async function listFollowingFeed(params: PageParams): Promise<Result<Page<Post>>> {
  void params;
  return notConfigured<Page<Post>>('Following feed');
}

export async function listTrendingPosts(params: PageParams): Promise<Result<Page<Post>>> {
  void params;
  return notConfigured<Page<Post>>('Trending posts');
}

export async function listTrendingHashtags(limit: number): Promise<Result<TrendingHashtag[]>> {
  void limit;
  return notConfigured<TrendingHashtag[]>('Trending hashtags');
}
