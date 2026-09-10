import type { Page, PageParams, Result } from './core';
import { notConfigured } from './core';
import type { ProfileSummary } from './profiles';

export interface FollowRow extends ProfileSummary {
  bio: string;
  following: boolean;
}

export async function followUser(username: string): Promise<Result<{ following: boolean }>> {
  void username;
  return notConfigured<{ following: boolean }>('Follow');
}

export async function unfollowUser(username: string): Promise<Result<{ following: boolean }>> {
  void username;
  return notConfigured<{ following: boolean }>('Unfollow');
}

export async function listFollowers(
  username: string,
  params: PageParams,
): Promise<Result<Page<FollowRow>>> {
  void username;
  void params;
  return notConfigured<Page<FollowRow>>('Followers');
}

export async function listFollowing(
  username: string,
  params: PageParams,
): Promise<Result<Page<FollowRow>>> {
  void username;
  void params;
  return notConfigured<Page<FollowRow>>('Following list');
}
