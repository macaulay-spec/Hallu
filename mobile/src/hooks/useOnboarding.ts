import { useMutation } from '@tanstack/react-query';
import { completeOnboarding, saveInterests } from '@/services/onboarding';

export function useSaveInterests() {
  return useMutation({
    mutationFn: (genres: string[]) => saveInterests(genres),
  });
}

export function useCompleteOnboarding() {
  return useMutation({
    mutationFn: () => completeOnboarding(),
  });
}
