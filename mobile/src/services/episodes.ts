import type { Page, PageParams, Result } from './core';
import { notConfigured } from './core';
import type { Post } from './posts';

export interface EpisodeSummary {
  id: string;
  dramaId: string;
  number: number;
  title: string | null;
  airDate: string | null;
  discussionCount: number;
}

export interface Episode extends EpisodeSummary {
  synopsis: string | null;
}

// Episode lists are small (a drama has tens of episodes), so the full
// list is returned instead of a paged result.
export async function listDramaEpisodes(dramaId: string): Promise<Result<EpisodeSummary[]>> {
  void dramaId;
  return notConfigured<EpisodeSummary[]>('Episodes');
}

export async function getEpisodeByNumber(
  dramaId: string,
  episodeNumber: number,
): Promise<Result<Episode>> {
  void dramaId;
  void episodeNumber;
  return notConfigured<Episode>('Episode');
}

export async function listEpisodePosts(
  episodeId: string,
  params: PageParams,
): Promise<Result<Page<Post>>> {
  void episodeId;
  void params;
  return notConfigured<Page<Post>>('Episode discussion');
}
