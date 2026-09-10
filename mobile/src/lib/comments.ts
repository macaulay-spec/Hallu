import type { Comment } from '@/services/comments';

export const MAX_COMMENT_DEPTH = 3;

export interface CommentNode {
  comment: Comment;
  replies: CommentNode[];
}

// Nests a flat comment list by parentId. Defensive: comments deeper than
// the supported max are dropped from display (the server enforces depth).
export function buildCommentTree(comments: Comment[]): CommentNode[] {
  const nodes = new Map<string, CommentNode>();
  for (const comment of comments) {
    if (comment.depth > MAX_COMMENT_DEPTH) continue;
    nodes.set(comment.id, { comment, replies: [] });
  }
  const roots: CommentNode[] = [];
  for (const node of nodes.values()) {
    const parentId = node.comment.parentId;
    const parent = parentId ? nodes.get(parentId) : undefined;
    if (parent) {
      parent.replies.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}
