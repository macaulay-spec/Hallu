import type { Page, PageParams, Result } from './core';
import { notConfigured } from './core';
import type { ProfileSummary } from './profiles';

export interface Comment {
  id: string;
  postId: string;
  author: ProfileSummary;
  text: string;
  parentId: string | null;
  depth: number;
  createdAt: string;
  likeCount: number;
  viewerLiked: boolean;
  replyCount: number;
}

export interface CreateCommentInput {
  postId: string;
  parentId?: string;
  text: string;
}

export async function listComments(
  postId: string,
  params: PageParams,
): Promise<Result<Page<Comment>>> {
  void postId;
  void params;
  return notConfigured<Page<Comment>>('Comments');
}

export async function createComment(input: CreateCommentInput): Promise<Result<Comment>> {
  void input;
  return notConfigured<Comment>('Reply');
}

export async function deleteComment(commentId: string): Promise<Result<null>> {
  void commentId;
  return notConfigured<null>('Delete comment');
}
