import type { Page, PageParams, Result } from './core';
import { notConfigured } from './core';
import type { Post } from './posts';

export type CommunityVisibility = 'public' | 'private';
export type CommunityRole = 'member' | 'moderator' | 'owner';

export interface CommunitySummary {
  id: string;
  name: string;
  description: string;
  avatarUrl: string | null;
  memberCount: number;
  visibility: CommunityVisibility;
  viewerRole: CommunityRole | null;
}

export interface Community extends CommunitySummary {
  bannerUrl: string | null;
  rulesCount: number;
  createdAt: string;
}

export interface CommunityMember {
  username: string;
  displayName: string;
  avatarUrl: string | null;
  role: CommunityRole;
}

export interface CommunityRule {
  id: string;
  position: number;
  text: string;
}

export interface JoinRequest {
  username: string;
  displayName: string;
  avatarUrl: string | null;
  createdAt: string;
}

export interface CommunityPost {
  post: Post;
  pinned: boolean;
}

export interface CreateCommunityInput {
  name: string;
  description: string;
  visibility: CommunityVisibility;
}

export interface ListCommunitiesParams extends PageParams {
  query?: string;
  joinedOnly?: boolean;
}

export async function listCommunities(
  params: ListCommunitiesParams,
): Promise<Result<Page<CommunitySummary>>> {
  void params;
  return notConfigured<Page<CommunitySummary>>('Communities');
}

export async function getCommunity(communityId: string): Promise<Result<Community>> {
  void communityId;
  return notConfigured<Community>('Community');
}

export async function createCommunity(input: CreateCommunityInput): Promise<Result<Community>> {
  void input;
  return notConfigured<Community>('Create community');
}

export async function joinCommunity(communityId: string): Promise<Result<{ role: CommunityRole }>> {
  void communityId;
  return notConfigured<{ role: CommunityRole }>('Join community');
}

export async function requestJoin(communityId: string): Promise<Result<null>> {
  void communityId;
  return notConfigured<null>('Request to join');
}

export async function leaveCommunity(communityId: string): Promise<Result<null>> {
  void communityId;
  return notConfigured<null>('Leave community');
}

export async function listCommunityPosts(
  communityId: string,
  params: PageParams,
): Promise<Result<Page<CommunityPost>>> {
  void communityId;
  void params;
  return notConfigured<Page<CommunityPost>>('Community feed');
}

export async function pinPost(
  communityId: string,
  postId: string,
  pinned: boolean,
): Promise<Result<null>> {
  void communityId;
  void postId;
  void pinned;
  return notConfigured<null>('Pin post');
}

export async function removePostFromCommunity(
  communityId: string,
  postId: string,
): Promise<Result<null>> {
  void communityId;
  void postId;
  return notConfigured<null>('Remove post');
}

export async function listMembers(
  communityId: string,
  params: PageParams,
): Promise<Result<Page<CommunityMember>>> {
  void communityId;
  void params;
  return notConfigured<Page<CommunityMember>>('Members');
}

export async function setMemberRole(
  communityId: string,
  username: string,
  role: 'member' | 'moderator',
): Promise<Result<null>> {
  void communityId;
  void username;
  void role;
  return notConfigured<null>('Change role');
}

export async function banMember(
  communityId: string,
  username: string,
): Promise<Result<null>> {
  void communityId;
  void username;
  return notConfigured<null>('Ban member');
}

export async function unbanMember(
  communityId: string,
  username: string,
): Promise<Result<null>> {
  void communityId;
  void username;
  return notConfigured<null>('Unban member');
}

export async function listRules(communityId: string): Promise<Result<CommunityRule[]>> {
  void communityId;
  return notConfigured<CommunityRule[]>('Community rules');
}

export async function addRule(communityId: string, text: string): Promise<Result<CommunityRule>> {
  void communityId;
  void text;
  return notConfigured<CommunityRule>('Add rule');
}

export async function deleteRule(communityId: string, ruleId: string): Promise<Result<null>> {
  void communityId;
  void ruleId;
  return notConfigured<null>('Delete rule');
}

export async function listJoinRequests(communityId: string): Promise<Result<JoinRequest[]>> {
  void communityId;
  return notConfigured<JoinRequest[]>('Join requests');
}

export async function resolveJoinRequest(
  communityId: string,
  username: string,
  approve: boolean,
): Promise<Result<null>> {
  void communityId;
  void username;
  void approve;
  return notConfigured<null>('Resolve request');
}
