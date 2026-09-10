import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createPost, deletePost, getPost, listProfilePosts } from '@/services/posts';
import type { CreatePostInput } from '@/services/posts';

export function usePost(postId: string) {
  return useQuery({
    queryKey: ['post', postId],
    queryFn: () => getPost(postId),
  });
}

export function useProfilePosts(username: string) {
  return useInfiniteQuery({
    queryKey: ['profilePosts', username],
    queryFn: ({ pageParam }) => listProfilePosts(username, { cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => (lastPage.ok ? lastPage.data.nextCursor : undefined),
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreatePostInput) => createPost(input),
    onSuccess: (result) => {
      if (result.ok) {
        void queryClient.invalidateQueries({ queryKey: ['profilePosts'] });
        void queryClient.invalidateQueries({ queryKey: ['feed'] });
      }
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (postId: string) => deletePost(postId),
    onSuccess: (result) => {
      if (result.ok) {
        void queryClient.invalidateQueries({ queryKey: ['profilePosts'] });
        void queryClient.invalidateQueries({ queryKey: ['feed'] });
      }
    },
  });
}
