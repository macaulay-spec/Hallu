import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  followActor,
  getActor,
  listActorFilmography,
  listActors,
  listDramaCast,
  unfollowActor,
} from '@/services/actors';

export function useActors(query?: string) {
  return useInfiniteQuery({
    queryKey: ['actors', query ?? ''],
    queryFn: ({ pageParam }) => listActors({ query, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => (lastPage.ok ? lastPage.data.nextCursor : undefined),
  });
}

export function useActor(actorId: string) {
  return useQuery({
    queryKey: ['actor', actorId],
    queryFn: () => getActor(actorId),
  });
}

export function useDramaCast(dramaId: string) {
  return useQuery({
    queryKey: ['cast', dramaId],
    queryFn: () => listDramaCast(dramaId),
  });
}

export function useActorFilmography(actorId: string) {
  return useQuery({
    queryKey: ['filmography', actorId],
    queryFn: () => listActorFilmography(actorId),
  });
}

export function useActorFollowToggle(actorId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (following: boolean) =>
      following ? unfollowActor(actorId) : followActor(actorId),
    onSuccess: (result) => {
      if (result.ok) void queryClient.invalidateQueries({ queryKey: ['actor', actorId] });
    },
  });
}
