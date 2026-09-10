import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { followUser, listFollowers, listFollowing, unfollowUser } from '@/services/follows';

export function useFollowList(username: string, mode: 'followers' | 'following') {
  return useInfiniteQuery({
    queryKey: [mode, username],
    queryFn: ({ pageParam }) =>
      mode === 'followers'
        ? listFollowers(username, { cursor: pageParam })
        : listFollowing(username, { cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => (lastPage.ok ? lastPage.data.nextCursor : undefined),
  });
}

export function useFollowToggle(username: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (following: boolean) =>
      following ? unfollowUser(username) : followUser(username),
    onSuccess: (result) => {
      if (result.ok) {
        void queryClient.invalidateQueries({ queryKey: ['followers'] });
        void queryClient.invalidateQueries({ queryKey: ['following'] });
        void queryClient.invalidateQueries({ queryKey: ['profile', username] });
      }
    },
  });
}
