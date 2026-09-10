import type { Result } from './core';
import { notConfigured } from './core';

export interface ProfileSummary {
  username: string;
  displayName: string;
  avatarUrl: string | null;
  verified: boolean;
}

export interface Profile extends ProfileSummary {
  id: string;
  bio: string;
  followerCount: number;
  followingCount: number;
  likesCount: number;
  createdAt: string;
}

export interface UpdateProfileInput {
  displayName?: string;
  bio?: string;
  avatarUrl?: string | null;
}

export async function getProfile(username: string): Promise<Result<Profile>> {
  void username;
  return notConfigured<Profile>('Profile');
}

export async function getOwnProfile(): Promise<Result<Profile>> {
  return notConfigured<Profile>('Own profile');
}

export async function updateProfile(input: UpdateProfileInput): Promise<Result<Profile>> {
  void input;
  return notConfigured<Profile>('Update profile');
}
