import type { Page, PageParams, Result } from './core';
import { notConfigured } from './core';
import type { ProfileSummary } from './profiles';

// Safety: blocking hides both directions; muting hides them from you only
// and they are never told.

export async function blockUser(username: string): Promise<Result<null>> {
  void username;
  return notConfigured<null>('Block user');
}

export async function unblockUser(username: string): Promise<Result<null>> {
  void username;
  return notConfigured<null>('Unblock user');
}

export async function muteUser(username: string): Promise<Result<null>> {
  void username;
  return notConfigured<null>('Mute user');
}

export async function unmuteUser(username: string): Promise<Result<null>> {
  void username;
  return notConfigured<null>('Unmute user');
}

export async function listBlockedUsers(params: PageParams): Promise<Result<Page<ProfileSummary>>> {
  void params;
  return notConfigured<Page<ProfileSummary>>('Blocked accounts');
}

export async function listMutedUsers(params: PageParams): Promise<Result<Page<ProfileSummary>>> {
  void params;
  return notConfigured<Page<ProfileSummary>>('Muted accounts');
}
