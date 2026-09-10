import { useMutation, useQuery } from '@tanstack/react-query';
import { getRecommendations, postRemix, remixMeme } from '@/services/ai';
import type { PostRemixInput, RemixInput } from '@/services/ai';

export function useRecommendations(limit: number) {
  return useQuery({
    queryKey: ['recommendations', limit],
    queryFn: () => getRecommendations(limit),
    staleTime: 5 * 60_000,
  });
}

export function useRemixMeme() {
  return useMutation({
    mutationFn: (input: RemixInput) => remixMeme(input),
  });
}

export function usePostRemix() {
  return useMutation({
    mutationFn: (input: PostRemixInput) => postRemix(input),
  });
}
