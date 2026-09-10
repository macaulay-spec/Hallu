import { useInfiniteQuery } from '@tanstack/react-query';
import { listFollowingFeed, listForYou } from '@/services/discovery';

export function useForYou() {
  return useInfiniteQuery({
    queryKey: ['feed', 'forYou'],
    queryFn: ({ pageParam }) => listForYou({ cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => (lastPage.ok ? lastPage.data.nextCursor : undefined),
  });
}

export function useFollowingFeed() {
  return useInfiniteQuery({
    queryKey: ['feed', 'following'],
    queryFn: ({ pageParam }) => listFollowingFeed({ cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => (lastPage.ok ? lastPage.data.nextCursor : undefined),
  });
}
