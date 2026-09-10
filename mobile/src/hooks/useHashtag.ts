import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { getHashtag, listHashtagPosts } from '@/services/hashtags';

export function useHashtag(tag: string) {
  return useQuery({
    queryKey: ['hashtag', tag],
    queryFn: () => getHashtag(tag),
  });
}

export function useHashtagPosts(tag: string) {
  return useInfiniteQuery({
    queryKey: ['hashtagPosts', tag],
    queryFn: ({ pageParam }) => listHashtagPosts(tag, { cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => (lastPage.ok ? lastPage.data.nextCursor : undefined),
  });
}
