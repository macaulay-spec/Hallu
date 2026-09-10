import { buildCommentTree } from '@/lib/comments';
import type { Comment } from '@/services/comments';

function comment(partial: Partial<Comment> & { id: string }): Comment {
  return {
    postId: 'p1',
    author: { username: 'u', displayName: 'U', avatarUrl: null, verified: false },
    text: 't',
    parentId: null,
    depth: 1,
    createdAt: '2026-09-10T00:00:00Z',
    likeCount: 0,
    viewerLiked: false,
    replyCount: 0,
    ...partial,
  };
}

describe('buildCommentTree', () => {
  it('nests replies under parents', () => {
    const tree = buildCommentTree([
      comment({ id: 'a' }),
      comment({ id: 'b', parentId: 'a', depth: 2 }),
      comment({ id: 'c', parentId: 'b', depth: 3 }),
    ]);
    expect(tree).toHaveLength(1);
    expect(tree[0]?.replies).toHaveLength(1);
    expect(tree[0]?.replies[0]?.replies).toHaveLength(1);
  });

  it('treats orphans as roots', () => {
    const tree = buildCommentTree([comment({ id: 'x', parentId: 'missing', depth: 2 })]);
    expect(tree).toHaveLength(1);
    expect(tree[0]?.comment.id).toBe('x');
  });

  it('drops comments deeper than the supported max', () => {
    const tree = buildCommentTree([
      comment({ id: 'a' }),
      comment({ id: 'deep', parentId: 'a', depth: 4 }),
    ]);
    expect(tree).toHaveLength(1);
    expect(tree[0]?.replies).toHaveLength(0);
  });
});
