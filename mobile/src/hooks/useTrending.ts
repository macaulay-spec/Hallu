import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { listTrendingHashtags, listTrendingPosts } from '@/services/discovery';

export function useTrendingPosts() {
  return useInfiniteQuery({
    queryKey: ['trending', 'posts'],
    queryFn: ({ pageParam }) => listTrendingPosts({ cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => (lastPage.ok ? lastPage.data.nextCursor : undefined),
  });
}

export function useTrendingHashtags(limit = 10) {
  return useQuery({
    queryKey: ['trending', 'hashtags', limit],
    queryFn: () => listTrendingHashtags(limit),
  });
}
