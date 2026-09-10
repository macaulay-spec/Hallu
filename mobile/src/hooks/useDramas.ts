import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  followDrama,
  getDrama,
  listDramaPosts,
  listDramas,
  unfollowDrama,
} from '@/services/dramas';
import type { DramaStatus } from '@/services/dramas';
import type { PostCategory } from '@/services/posts';

export interface DramaListFilter {
  status?: DramaStatus;
  query?: string;
}

export function useDramas(filter: DramaListFilter) {
  return useInfiniteQuery({
    queryKey: ['dramas', filter.status ?? 'all', filter.query ?? ''],
    queryFn: ({ pageParam }) =>
      listDramas({ status: filter.status, query: filter.query, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => (lastPage.ok ? lastPage.data.nextCursor : undefined),
  });
}

export function useDrama(dramaId: string) {
  return useQuery({
    queryKey: ['drama', dramaId],
    queryFn: () => getDrama(dramaId),
  });
}

export function useDramaPosts(dramaId: string, category: PostCategory | null) {
  return useInfiniteQuery({
    queryKey: ['dramaPosts', dramaId, category ?? 'all'],
    queryFn: ({ pageParam }) => listDramaPosts(dramaId, category, { cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => (lastPage.ok ? lastPage.data.nextCursor : undefined),
  });
}

export function useDramaFollowToggle(dramaId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (following: boolean) =>
      following ? unfollowDrama(dramaId) : followDrama(dramaId),
    onSuccess: (result) => {
      if (result.ok) void queryClient.invalidateQueries({ queryKey: ['drama', dramaId] });
    },
  });
}
