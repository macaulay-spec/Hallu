import type { Page, PageParams, Result } from './core';
import { notConfigured } from './core';
import type { ProfileSummary } from './profiles';
import type { ReactionKind } from './reactions';

export type PostCategory =
  | 'Reaction'
  | 'Discussion'
  | 'Theory'
  | 'Recommendation'
  | 'Meme'
  | 'News'
  | 'Question'
  | 'Fan content';

export interface DramaTag {
  dramaId: string;
  title: string;
}

export interface EpisodeTag {
  episodeId: string;
  dramaId: string;
  number: number;
}

export interface Post {
  id: string;
  author: ProfileSummary;
  text: string;
  mediaUrls: string[];
  category: PostCategory;
  dramaTag: DramaTag | null;
  episodeTag: EpisodeTag | null;
  spoilerEpisode: number | null;
  hashtags: string[];
  createdAt: string;
  reactionCounts: Record<ReactionKind, number>;
  commentCount: number;
  repostCount: number;
  viewerReaction: ReactionKind | null;
  viewerReposted: boolean;
  viewerBookmarked: boolean;
}

export interface CreatePostInput {
  text: string;
  category: PostCategory;
  mediaLocalUris: string[];
  dramaId?: string;
  episodeId?: string;
  communityId?: string;
  spoiler: boolean;
}

export async function createPost(input: CreatePostInput): Promise<Result<Post>> {
  void input;
  return notConfigured<Post>('Publish post');
}

export async function getPost(postId: string): Promise<Result<Post>> {
  void postId;
  return notConfigured<Post>('Post');
}

export async function deletePost(postId: string): Promise<Result<null>> {
  void postId;
  return notConfigured<null>('Delete post');
}

export async function listProfilePosts(
  username: string,
  params: PageParams,
): Promise<Result<Page<Post>>> {
  void username;
  void params;
  return notConfigured<Page<Post>>('Profile posts');
}
