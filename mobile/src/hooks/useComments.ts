import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createComment, deleteComment, listComments } from '@/services/comments';
import type { CreateCommentInput } from '@/services/comments';

export function useComments(postId: string) {
  return useInfiniteQuery({
    queryKey: ['comments', postId],
    queryFn: ({ pageParam }) => listComments(postId, { cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => (lastPage.ok ? lastPage.data.nextCursor : undefined),
  });
}

export function useCreateComment(postId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateCommentInput) => createComment(input),
    onSuccess: (result) => {
      if (result.ok) {
        void queryClient.invalidateQueries({ queryKey: ['comments', postId] });
        void queryClient.invalidateQueries({ queryKey: ['post', postId] });
      }
    },
  });
}

export function useDeleteComment(postId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (commentId: string) => deleteComment(commentId),
    onSuccess: (result) => {
      if (result.ok) {
        void queryClient.invalidateQueries({ queryKey: ['comments', postId] });
        void queryClient.invalidateQueries({ queryKey: ['post', postId] });
      }
    },
  });
}
