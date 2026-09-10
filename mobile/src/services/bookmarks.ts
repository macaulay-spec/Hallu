import type { Page, PageParams, Result } from './core';
import { notConfigured } from './core';
import type { Post } from './posts';

export type BookmarkFilter = 'all' | 'posts' | 'dramas' | 'episodes';

export async function addBookmark(postId: string): Promise<Result<null>> {
  void postId;
  return notConfigured<null>('Save post');
}

export async function removeBookmark(postId: string): Promise<Result<null>> {
  void postId;
  return notConfigured<null>('Unsave post');
}

export async function listBookmarks(
  filter: BookmarkFilter,
  params: PageParams,
): Promise<Result<Page<Post>>> {
  void filter;
  void params;
  return notConfigured<Page<Post>>('Saved posts');
}
