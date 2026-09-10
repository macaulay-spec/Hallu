import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  followActor,
  getActor,
  listActorFilmography,
  listDramaCast,
  unfollowActor,
} from '@/services/actors';

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
