import type { Result } from './core';
import { notConfigured } from './core';
import type { DramaSummary } from './dramas';
import type { ActorSummary } from './actors';
import type { ProfileSummary } from './profiles';
import type { Post } from './posts';

export type SearchEntity = 'all' | 'dramas' | 'actors' | 'users' | 'communities' | 'posts';

// Minimal community shape for search hits. The full Community type lives in
// the Phase 4 communities service, which extends this shape.
export interface CommunityHit {
  id: string;
  name: string;
  avatarUrl: string | null;
  memberCount: number;
}

export interface SearchResults {
  dramas: DramaSummary[];
  actors: ActorSummary[];
  users: ProfileSummary[];
  communities: CommunityHit[];
  posts: Post[];
}

export async function search(
  query: string,
  entity: SearchEntity,
): Promise<Result<SearchResults>> {
  void query;
  void entity;
  return notConfigured<SearchResults>('Search');
}
