import type { Page, PageParams, Result } from './core';
import { notConfigured } from './core';
import type { Post, PostCategory } from './posts';

export type DramaStatus = 'airing' | 'upcoming' | 'completed';

export interface DramaSummary {
  id: string;
  title: string;
  koreanTitle: string | null;
  posterUrl: string | null;
  status: DramaStatus;
  year: number | null;
}

export interface Drama extends DramaSummary {
  backdropUrl: string | null;
  synopsis: string;
  genres: string[];
  episodeCount: number;
  followerCount: number;
  watchingCount: number;
  viewerFollowing: boolean;
}

export interface ListDramasParams extends PageParams {
  status?: DramaStatus;
  query?: string;
}

export async function listDramas(params: ListDramasParams): Promise<Result<Page<DramaSummary>>> {
  void params;
  return notConfigured<Page<DramaSummary>>('Dramas');
}

export async function getDrama(dramaId: string): Promise<Result<Drama>> {
  void dramaId;
  return notConfigured<Drama>('Drama');
}

export async function followDrama(dramaId: string): Promise<Result<{ following: boolean }>> {
  void dramaId;
  return notConfigured<{ following: boolean }>('Follow drama');
}

export async function unfollowDrama(dramaId: string): Promise<Result<{ following: boolean }>> {
  void dramaId;
  return notConfigured<{ following: boolean }>('Unfollow drama');
}

export async function listDramaPosts(
  dramaId: string,
  category: PostCategory | null,
  params: PageParams,
): Promise<Result<Page<Post>>> {
  void dramaId;
  void category;
  void params;
  return notConfigured<Page<Post>>('Drama posts');
}
