import type { Result } from './core';
import { notConfigured } from './core';

export type ReactionKind = 'like' | 'love' | 'laugh' | 'sad' | 'angry';

export async function setPostReaction(
  postId: string,
  kind: ReactionKind | null,
): Promise<Result<null>> {
  void postId;
  void kind;
  return notConfigured<null>('Reaction');
}

export async function setCommentLiked(
  commentId: string,
  liked: boolean,
): Promise<Result<null>> {
  void commentId;
  void liked;
  return notConfigured<null>('Comment like');
}
