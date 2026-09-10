import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { getEpisodeByNumber, listDramaEpisodes, listEpisodePosts } from '@/services/episodes';

export function useDramaEpisodes(dramaId: string) {
  return useQuery({
    queryKey: ['episodes', dramaId],
    queryFn: () => listDramaEpisodes(dramaId),
  });
}

export function useEpisode(dramaId: string, episodeNumber: number) {
  return useQuery({
    queryKey: ['episode', dramaId, episodeNumber],
    queryFn: () => getEpisodeByNumber(dramaId, episodeNumber),
  });
}

export function useEpisodePosts(episodeId: string, enabled = true) {
  return useInfiniteQuery({
    queryKey: ['episodePosts', episodeId],
    enabled,
    queryFn: ({ pageParam }) => listEpisodePosts(episodeId, { cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => (lastPage.ok ? lastPage.data.nextCursor : undefined),
  });
}
