import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getWatchProgress, listWatching, setWatchedThrough, setWatching } from '@/services/watching';
import type { WatchingStatus } from '@/services/watching';

export function useWatching() {
  return useQuery({ queryKey: ['watching'], queryFn: listWatching });
}

export function useWatchProgress(dramaId: string) {
  return useQuery({
    queryKey: ['watchProgress', dramaId],
    queryFn: () => getWatchProgress(dramaId),
  });
}

export function useSetWatching(dramaId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (status: WatchingStatus | null) => setWatching(dramaId, status),
    onSuccess: (result) => {
      if (result.ok) {
        void queryClient.invalidateQueries({ queryKey: ['watching'] });
        void queryClient.invalidateQueries({ queryKey: ['watchProgress', dramaId] });
        void queryClient.invalidateQueries({ queryKey: ['drama', dramaId] });
      }
    },
  });
}

export function useSetWatchedThrough(dramaId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (episode: number) => setWatchedThrough(dramaId, episode),
    onSuccess: (result) => {
      if (result.ok) {
        void queryClient.invalidateQueries({ queryKey: ['watching'] });
        void queryClient.invalidateQueries({ queryKey: ['watchProgress', dramaId] });
      }
    },
  });
}
