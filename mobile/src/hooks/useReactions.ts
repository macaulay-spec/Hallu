import { useMutation, useQueryClient } from '@tanstack/react-query';
import { setCommentLiked, setPostReaction } from '@/services/reactions';
import type { ReactionKind } from '@/services/reactions';

export function useSetPostReaction(postId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (kind: ReactionKind | null) => setPostReaction(postId, kind),
    onSuccess: (result) => {
      if (result.ok) {
        void queryClient.invalidateQueries({ queryKey: ['post', postId] });
        void queryClient.invalidateQueries({ queryKey: ['feed'] });
        void queryClient.invalidateQueries({ queryKey: ['profilePosts'] });
      }
    },
  });
}

export function useToggleCommentLike(postId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ commentId, liked }: { commentId: string; liked: boolean }) =>
      setCommentLiked(commentId, liked),
    onSuccess: (result) => {
      if (result.ok) void queryClient.invalidateQueries({ queryKey: ['comments', postId] });
    },
  });
}
